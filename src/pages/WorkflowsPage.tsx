import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WorkflowBuilder from "../components/WorkflowBuilder";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface WorkflowData {
  id: string;
  name?: string;
  workflow_name?: string;
  nodes?: any[];
  edges?: any[];
  definition?: { nodes?: any[]; edges?: any[] };
}

export default function WorkflowsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase
        .from("workflows")
        .select("id, name, workflow_name, nodes, edges, definition")
        .eq("id", id)
        .single()
        .then(({ data }: { data: WorkflowData | null }) => {
          if (!data) {
            setNotFound(true);
          } else {
            setWorkflow(data);
          }
          setLoading(false);
        });
    }
  }, [id]);

  if (notFound) {
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1>Workflow não encontrado</h1>
        <p>
          O workflow solicitado não foi encontrado. Ele pode ter sido removido
          ou o link está incorreto.
        </p>
        <a
          href="/workflows"
          style={{ color: "#2563eb", textDecoration: "underline" }}
        >
          Voltar para Workflows
        </a>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "auto" }}>
      <h1 style={{ textAlign: "center" }}>
        {id ? "Editar Workflow" : "Criador de Workflows WhatsApp (No-Code)"}
      </h1>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <WorkflowBuilder
          nodes={workflow?.definition?.nodes || workflow?.nodes}
          edges={workflow?.definition?.edges || workflow?.edges}
          initialName={workflow?.name || workflow?.workflow_name}
          workflowId={workflow?.id}
        />
      )}
    </div>
  );
}
