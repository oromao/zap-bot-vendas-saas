import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiCpu,
  FiGitBranch,
  FiHelpCircle,
  FiMessageSquare,
} from "react-icons/fi";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeProps,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { supabase } from "@/integrations/supabase/client";
import { ThemeContext } from "../theme/ThemeContext";
import { NodeEditPanel } from "./WorkflowNodeEditPanel";
import { SidebarBlock } from "./WorkflowSidebar";
import { WorkflowTestModal } from "./WorkflowTestModal";

interface WorkflowBuilderProps {
  nodes?: Node[];
  edges?: Edge[];
  initialName?: string;
  workflowId?: string;
}

// Helper to create nodeTypes object for ReactFlow
export const NODE_TYPES = [
  {
    type: "mensagem",
    label: "Mensagem",
    color: "#38bdf8",
    icon: <FiMessageSquare />,
  },
  {
    type: "pergunta",
    label: "Pergunta",
    color: "#a78bfa",
    icon: <FiHelpCircle />,
  },
  {
    type: "condicao",
    label: "Condição",
    color: "#fbbf24",
    icon: <FiGitBranch />,
  },
  { type: "ia", label: "IA", color: "#34d399", icon: <FiCpu /> },
  {
    type: "aguardar",
    label: "Aguardar",
    color: "#f472b6",
    icon: <span>⏳</span>,
  },
  {
    type: "webhook",
    label: "Webhook",
    color: "#f87171",
    icon: <span>🌐</span>,
  },
  {
    type: "codigo",
    label: "Executar Código",
    color: "#facc15",
    icon: <span>💻</span>,
  },
  {
    type: "banco",
    label: "Banco de Dados",
    color: "#60a5fa",
    icon: <span>🗄️</span>,
  },
  {
    type: "email",
    label: "Enviar E-mail",
    color: "#6366f1",
    icon: <span>✉️</span>,
  },
  {
    type: "variavel",
    label: "Setar Variável",
    color: "#10b981",
    icon: <span>🔧</span>,
  },
  {
    type: "arquivo",
    label: "Enviar Arquivo",
    color: "#f59e42",
    icon: <span>📎</span>,
  },
  { type: "http", label: "Ação HTTP", color: "#f43f5e", icon: <span>🔗</span> },
  {
    type: "encerrar",
    label: "Encerrar",
    color: "#64748b",
    icon: <span>⏹️</span>,
  },
];

const initialNodes: Node[] = [
  {
    id: "1",
    type: "mensagem",
    data: { label: "Início", text: "Bem-vindo!", nodeType: "mensagem" },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

const getNodeColor = (type: string, theme: string) => {
  const found = NODE_TYPES.find((n) => n.type === type);
  if (!found) return theme === "dark" ? "#27272a" : "#f3f4f6";
  return found.color;
};

const CustomNode = memo(
  ({
    id,
    data,
    type,
    selected,
    handleDuplicateNode,
    handleDeleteNode,
  }: {
    id: string;
    data: Record<string, unknown>;
    type: string;
    selected: boolean;
    handleDuplicateNode: (id: string) => void;
    handleDeleteNode: (id: string) => void;
  }) => {
    const { theme } = useContext(ThemeContext);
    const nodeType = NODE_TYPES.find((n) => n.type === type);
    const color = nodeType?.color || "#38bdf8";
    const icon = nodeType?.icon;
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(data.label || data.text || "");

    useEffect(() => {
      setValue(data.label || data.text || "");
    }, [data.label, data.text]);

    // Função para atualizar o node no ReactFlow
    const updateNode = (newData: Record<string, unknown>) => {
      if (data.onChange) {
        console.log("updateNode called for", id, newData);
        data.onChange(newData);
      }
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Double click: edit node", id);
      setEditing(true);
    };
    const handleBlur = () => {
      setEditing(false);
      console.log("Blur: saving node", id, value);
      if (data.label !== undefined && data.label !== value)
        updateNode({ label: value });
      if (data.text !== undefined && data.text !== value)
        updateNode({ text: value });
    };
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleBlur();
    };

    const placeholder = nodeType?.label || type;
    const content = data.label || data.text;

    return (
      <div
        className={cn(
          "relative group flex flex-col items-stretch min-w-[180px] max-w-[260px] bg-white border border-gray-200 rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer",
          theme === "dark"
            ? "bg-zinc-800 border-zinc-700"
            : "bg-white border-zinc-200",
          selected ? "ring-2 ring-primary scale-[1.04]" : "hover:shadow-2xl"
        )}
        style={{ borderLeftColor: color }}
        title={content || placeholder}
        onDoubleClick={handleEdit}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: color,
            width: 18,
            height: 18,
            borderRadius: 9,
            border: "2px solid #fff",
            zIndex: 2,
          }}
        />
        <div className="flex flex-col items-center justify-center">
          <span style={{ fontSize: 38, color }}>{icon}</span>
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-bold text-lg mb-1 truncate" style={{ color }}>
            {placeholder}
          </span>
          {editing ? (
            <input
              autoFocus
              className="text-base text-foreground/80 rounded border border-border px-2 py-1 mt-1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              style={{ minWidth: 80 }}
            />
          ) : (
            <span
              className="text-base text-foreground/80 whitespace-pre-line truncate max-h-[3.5em] leading-snug cursor-pointer"
              title="Clique duas vezes para editar"
            >
              {content || (
                <span className="opacity-50">Clique para editar…</span>
              )}
            </span>
          )}
        </div>
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: color,
            width: 18,
            height: 18,
            borderRadius: 9,
            border: "2px solid #fff",
            zIndex: 2,
          }}
        />
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-transparent hover:bg-red-100 text-red-600 rounded-full p-1 transition"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Delete node", id);
            handleDeleteNode(id);
          }}
          title="Deletar bloco"
          style={{ border: "none", outline: "none" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10"
              cy="10"
              r="9"
              fill="#fff"
              stroke="#F87171"
              strokeWidth="2"
            />
            <path
              d="M7 7L13 13M13 7L7 13"
              stroke="#F87171"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    );
  }
);

function saveWorkflow(nodes: Node[], edges: Edge[]) {
  localStorage.setItem("workflow_nodes", JSON.stringify(nodes));
  localStorage.setItem("workflow_edges", JSON.stringify(edges));
}

// Helper: retorna possíveis outputs de um node para seleção
export function getNodeOutputs(node?: Node): string[] {
  if (!node) return [];
  switch (node.type) {
    case "mensagem":
      return ["Mensagem enviada"];
    case "pergunta":
      return node.data.options
        ? node.data.options.split(",").map((o: string) => o.trim())
        : ["Sim", "Não"];
    case "condicao":
      return [node.data.condition || "Condição"];
    case "ia":
      return ["Resposta IA"];
    case "aguardar":
      return ["Aguardou"];
    case "webhook":
      return ["Webhook recebido"];
    case "codigo":
      return ["Execução concluída"];
    case "banco":
      return ["Consulta OK"];
    case "email":
      return ["E-mail enviado"];
    case "variavel":
      return ["Variável setada"];
    case "arquivo":
      return ["Arquivo enviado"];
    case "http":
      return ["HTTP 200", "HTTP 4xx/5xx"];
    case "encerrar":
      return ["Fim"];
    default:
      return ["Output"];
  }
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    props.nodes && props.nodes.length > 0 ? props.nodes : initialNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    props.edges && props.edges.length > 0 ? props.edges : initialEdges
  );
  const [name, setName] = useState("");
  const [type, setType] = useState("atendimento");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editNodeId, setEditNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [workflowName, setWorkflowName] = useState(props.initialName || "");
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testSteps, setTestSteps] = useState<string[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReturnType<
    typeof useReactFlow
  > | null>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useContext(ThemeContext);

  // Stable handlers for nodeTypes
  const handleDuplicateNodeFactory =
    (setNodes: React.Dispatch<React.SetStateAction<Node[]>>) =>
    (id: string) => {
      setNodes((nds: Node[]) => {
        const node = nds.find((n) => n.id === id);
        if (!node) return nds;
        const newId = (nds.length + 1).toString();
        return [
          ...nds,
          {
            ...node,
            id: newId,
            position: { x: node.position.x + 80, y: node.position.y + 80 },
          },
        ];
      });
    };
  const handleDeleteNodeFactory =
    (
      setNodes: React.Dispatch<React.SetStateAction<Node[]>>,
      setEdges: React.Dispatch<React.SetStateAction<Edge[]>>
    ) =>
    (id: string) => {
      setNodes((nds: Node[]) => nds.filter((n) => n.id !== id));
      setEdges((eds: Edge[]) =>
        eds.filter((e) => e.source !== id && e.target !== id)
      );
    };

  // Memoize nodeTypes only once
  const nodeTypes = React.useMemo(() => {
    const handleDuplicateNode = handleDuplicateNodeFactory(setNodes);
    const handleDeleteNode = handleDeleteNodeFactory(setNodes, setEdges);
    return NODE_TYPES.reduce((acc, nt) => {
      acc[nt.type] = (props) => (
        <CustomNode
          {...props}
          handleDuplicateNode={handleDuplicateNode}
          handleDeleteNode={handleDeleteNode}
        />
      );
      return acc;
    }, {} as Record<string, React.FC<NodeProps>>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleAddNodeType = (nodeType: string) => {
    const id = (nodes.length + 1).toString();
    const base = {
      id,
      position: { x: 120 + nodes.length * 60, y: 120 + nodes.length * 40 },
      data: { nodeType },
    };
    let node: Node;
    if (nodeType === "mensagem")
      node = {
        ...base,
        type: "mensagem",
        data: { ...base.data, text: "", label: "Mensagem" },
      };
    else if (nodeType === "pergunta")
      node = {
        ...base,
        type: "pergunta",
        data: { ...base.data, question: "", label: "Pergunta" },
      };
    else if (nodeType === "condicao")
      node = {
        ...base,
        type: "condicao",
        data: { ...base.data, condition: "", label: "Condição" },
      };
    else if (nodeType === "ia")
      node = {
        ...base,
        type: "ia",
        data: { ...base.data, prompt: "", label: "IA" },
      };
    else if (nodeType === "aguardar")
      node = {
        ...base,
        type: "aguardar",
        position: { x: 120 + nodes.length * 60, y: 120 + nodes.length * 40 },
        data: { ...base.data, delay: "", label: "Aguardar" },
      };
    else if (nodeType === "webhook")
      node = {
        ...base,
        type: "webhook",
        data: { ...base.data, webhookUrl: "", label: "Webhook" },
      };
    else if (nodeType === "codigo")
      node = {
        ...base,
        type: "codigo",
        data: { ...base.data, code: "", label: "Executar Código" },
      };
    else if (nodeType === "banco")
      node = {
        ...base,
        type: "banco",
        data: { ...base.data, sql: "", label: "Banco de Dados" },
      };
    else if (nodeType === "email")
      node = {
        ...base,
        type: "email",
        data: {
          ...base.data,
          to: "",
          emailText: "",
          label: "Enviar E-mail",
        },
      };
    else if (nodeType === "variavel")
      node = {
        ...base,
        type: "variavel",
        data: {
          ...base.data,
          varName: "",
          varValue: "",
          label: "Setar Variável",
        },
      };
    else if (nodeType === "arquivo")
      node = {
        ...base,
        type: "arquivo",
        data: { ...base.data, fileUrl: "", label: "Enviar Arquivo" },
      };
    else if (nodeType === "http")
      node = {
        ...base,
        type: "http",
        data: {
          ...base.data,
          httpUrl: "",
          httpMethod: "GET",
          label: "Ação HTTP",
        },
      };
    else if (nodeType === "encerrar")
      node = {
        ...base,
        type: "encerrar",
        data: { ...base.data, endText: "", label: "Encerrar" },
      };
    setNodes((nds) => [...nds, node]);
    setEditNodeId(id); // já abre o painel de edição
  };

  const handleNodeChange = (data: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === editNodeId ? { ...n, data: { ...n.data, ...data } } : n
      )
    );
  };

  const handleNodeClick = (_: unknown, node: Node) => {
    setEditNodeId(node.id);
  };

  const handleNodeDoubleClick = (_: unknown, node: Node) => {
    setEditNodeId(node.id);
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const id = (nodes.length + 1).toString();
      let node: Node;
      if (type === "mensagem")
        node = {
          id,
          type,
          position,
          data: { nodeType: type, text: "", label: "Mensagem" },
        };
      else if (type === "pergunta")
        node = {
          id,
          type: "pergunta",
          position,
          data: { nodeType: type, question: "", label: "Pergunta" },
        };
      else if (type === "condicao")
        node = {
          id,
          type: "condicao",
          position,
          data: { nodeType: type, condition: "", label: "Condição" },
        };
      else if (type === "ia")
        node = {
          id,
          type: "ia",
          position,
          data: { nodeType: type, prompt: "", label: "IA" },
        };
      else if (type === "aguardar")
        node = {
          id,
          type: "aguardar",
          position,
          data: { nodeType: type, delay: "", label: "Aguardar" },
        };
      else if (type === "webhook")
        node = {
          id,
          type: "webhook",
          position,
          data: { nodeType: type, webhookUrl: "", label: "Webhook" },
        };
      else if (type === "codigo")
        node = {
          id,
          type: "codigo",
          position,
          data: { nodeType: type, code: "", label: "Executar Código" },
        };
      else if (type === "banco")
        node = {
          id,
          type: "banco",
          position,
          data: { nodeType: type, sql: "", label: "Banco de Dados" },
        };
      else if (type === "email")
        node = {
          id,
          type: "email",
          position,
          data: {
            nodeType: type,
            to: "",
            emailText: "",
            label: "Enviar E-mail",
          },
        };
      else if (type === "variavel")
        node = {
          id,
          type: "variavel",
          position,
          data: {
            nodeType: type,
            varName: "",
            varValue: "",
            label: "Setar Variável",
          },
        };
      else if (type === "arquivo")
        node = {
          id,
          type: "arquivo",
          position,
          data: { nodeType: type, fileUrl: "", label: "Enviar Arquivo" },
        };
      else if (type === "http")
        node = {
          id,
          type: "http",
          position,
          data: {
            nodeType: type,
            httpUrl: "",
            httpMethod: "GET",
            label: "Ação HTTP",
          },
        };
      else if (type === "encerrar")
        node = {
          id,
          type: "encerrar",
          position,
          data: { nodeType: type, endText: "", label: "Encerrar" },
        };
      setNodes((nds) => [...nds, node]);
      setEditNodeId(id);
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleTestWorkflow = async () => {
    setStatus(null);
    const validationError = validateWorkflow();
    if (validationError) {
      setStatus(validationError);
      toast({
        title: "Erro ao testar workflow",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke(
        "executeWorkflow",
        {
          body: JSON.stringify({ nodes, edges }),
        }
      );
      if (error) throw error;
      setTestSteps(data.steps);
      setTestModalOpen(true);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? (e as { message?: string }).message || "Erro desconhecido"
          : "Erro desconhecido";
      setStatus("Erro ao testar workflow: " + msg);
      toast({
        title: "Erro ao testar",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    const validationError = validateWorkflow();
    if (validationError) {
      setStatus(validationError);
      toast({
        title: "Erro ao salvar",
        description: validationError,
        variant: "destructive",
      });
      setSaving(false);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("saveWorkflow", {
        body: JSON.stringify({
          id: props.workflowId,
          workflowName,
          name: workflowName,
          type: type || "atendimento",
          nodes,
          edges,
        }),
      });
      if (error) throw error;
      setStatus("Workflow salvo com sucesso!");
      toast({
        title: "Sucesso",
        description: "Workflow salvo com sucesso!",
        variant: "default",
      });
    } catch (e: unknown) {
      const backendError =
        e && typeof e === "object" && "message" in e
          ? (e as { message?: string }).message || "Erro desconhecido."
          : "Erro desconhecido.";
      setStatus("Erro ao salvar workflow: " + backendError);
      toast({
        title: "Erro ao salvar",
        description: backendError,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  function validateWorkflow() {
    if (!workflowName.trim()) return "O nome do workflow é obrigatório.";
    if (!type) return "Selecione um tipo de workflow.";
    if (!nodes.length) return "Adicione pelo menos um passo ao workflow.";
    return null;
  }

  useEffect(() => {
    // instance.fitView();
  }, [nodes]);

  return (
    <div style={{ width: "100%" }}>
      <header className="h-16 w-full flex items-center justify-between px-6 bg-white border-b z-40">
        <div className="flex-1 flex items-center">
          {editingName ? (
            <input
              autoFocus
              className="text-xl font-bold tracking-tight text-foreground bg-transparent outline-none border-none mr-4"
              style={{ minWidth: 180, maxWidth: 400 }}
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingName(false);
              }}
              placeholder="Nome do workflow..."
            />
          ) : (
            <span
              className="text-xl font-bold tracking-tight text-foreground mr-4 cursor-pointer"
              style={{ minWidth: 180, maxWidth: 400, display: "block" }}
              onDoubleClick={() => setEditingName(true)}
              title="Clique duas vezes para editar"
            >
              {workflowName || "Nome do workflow..."}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold text-base shadow hover:bg-primary/90 transition"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar fluxo"}
          </button>
          <button
            onClick={handleTestWorkflow}
            className="bg-primary text-primary-foreground rounded-lg px-5 py-2 font-semibold text-base shadow hover:bg-primary/90 transition"
          >
            Testar workflow
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-1 rounded bg-muted text-foreground border border-border hover:bg-muted/80"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 min-w-0">
        <aside className="w-64 bg-gray-50 border-r p-4 overflow-y-auto h-full flex flex-col gap-2">
          {NODE_TYPES.map((nt) => (
            <SidebarBlock key={nt.type} {...nt} onDragStart={onDragStart} />
          ))}
        </aside>
        <main
          className="flex-1 min-w-0 min-h-0 relative"
          ref={reactFlowWrapper}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlowProvider>
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              fitView
              className={cn("bg-transparent", theme === "dark" ? "dark" : "")}
              onInit={setReactFlowInstance}
            >
              <MiniMap />
              <Controls />
              <Background
                gap={24}
                size={2}
                color={theme === "dark" ? "#27272a" : "#e5e7eb"}
              />
            </ReactFlow>
            {editNodeId && (
              <NodeEditPanel
                node={nodes.find((n) => n.id === editNodeId) || null}
                onChange={(data) =>
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === editNodeId
                        ? { ...n, data: { ...n.data, ...data } }
                        : n
                    )
                  )
                }
                onClose={() => setEditNodeId(null)}
                edges={edges}
                nodes={nodes}
              />
            )}
          </ReactFlowProvider>
        </main>
      </div>
      <WorkflowTestModal
        open={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        steps={testSteps}
      />
    </div>
  );
}
