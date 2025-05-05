import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { logger } from "../lib/frontend-logger";

interface User {
  id: string;
  email: string;
  last_sign_in_at: string;
  whatsapp_connected: boolean;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseClient = useSupabaseClient();
  const { toast } = useToast();

  // Função para carregar os usuários
  const loadUsers = async () => {
    setLoading(true);
    logger.info("Iniciando carregamento de usuários");
    try {
      // Aqui precisamos fazer duas consultas porque não podemos acessar diretamente auth.users
      // Primeiro, vamos obter as conexões WhatsApp
      const { data: connectionsData, error: connectionsError } =
        await supabaseClient.from("whatsapp_connections").select("*");

      if (connectionsError) {
        logger.error(
          `Erro ao carregar conexões do WhatsApp: ${connectionsError}`
        );
        throw connectionsError;
      }

      logger.info("Conexões do WhatsApp carregadas com sucesso");

      // Simular dados de usuários já que não podemos acessar auth.users diretamente
      // Em um cenário real, você precisaria ter uma tabela de perfis vinculada aos usuários
      const mockUsers = [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          email: "usuario1@example.com",
          last_sign_in_at: new Date().toISOString(),
          whatsapp_connected: false,
        },
        {
          id: "223e4567-e89b-12d3-a456-426614174001",
          email: "usuario2@example.com",
          last_sign_in_at: new Date(Date.now() - 86400000).toISOString(),
          whatsapp_connected: false,
        },
      ];

      // Vincular dados de conexão WhatsApp com os usuários simulados
      const usersWithWhatsApp = mockUsers.map((user) => {
        const connection = connectionsData?.find(
          (conn) => conn.user_id === user.id
        );
        return {
          ...user,
          whatsapp_connected: connection?.connected || false,
        };
      });

      setUsers(usersWithWhatsApp);
      logger.info(
        `Usuários carregados com sucesso - Total: ${usersWithWhatsApp.length}`
      );
    } catch (error) {
      logger.error(`Erro ao carregar usuários: ${error}`);
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Navbar />
      <main className="py-12 px-4">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Carregando usuários...</p>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Último Login</th>
                        <th className="text-left p-2">WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            {new Date(user.last_sign_in_at).toLocaleString(
                              "pt-BR"
                            )}
                          </td>
                          <td className="p-2">
                            {user.whatsapp_connected ? (
                              <span className="text-green-600 font-medium">
                                Conectado
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Desconectado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Nenhum usuário encontrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
