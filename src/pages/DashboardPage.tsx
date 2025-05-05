import { createClient } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface Workflow {
  id: string;
  name?: string;
  workflow_name?: string;
  type?: string;
  created_at: string;
}

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWorkflows() {
      setLoading(true);
      const { data, error } = await supabase
        .from("workflows")
        .select("id, name, type, created_at, workflow_name");
      if (!error) setWorkflows(data || []);
      setLoading(false);
    }
    fetchWorkflows();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="py-8 px-4">
        <div className="container">
          <h1 className="text-3xl font-bold mb-4">Dashboard de Workflows</h1>

          {/* Métricas */}
          <div className="flex gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex-1 text-center">
              <div className="text-sm text-gray-500 mb-2">
                Total de Workflows
              </div>
              <div className="text-3xl font-bold">{workflows.length}</div>
            </div>
            {/* Aqui pode adicionar mais métricas, como execuções, se houver */}
          </div>

          {/* Listagem de workflows */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Seus Workflows</h2>
              <Link to="/workflows">
                <Button variant="default">
                  <Plus className="w-4 h-4 mr-2" /> Novo Workflow
                </Button>
              </Link>
            </div>
            {loading ? (
              <div>Carregando...</div>
            ) : workflows.length === 0 ? (
              <div>Nenhum workflow criado ainda.</div>
            ) : (
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Nome</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Criado em</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((wf) => (
                    <tr
                      key={wf.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/workflows/${wf.id}`)}
                    >
                      <td className="p-2">{wf.name || wf.workflow_name}</td>
                      <td className="p-2">{wf.type}</td>
                      <td className="p-2">
                        {new Date(wf.created_at).toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/workflows/${wf.id}`);
                          }}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
