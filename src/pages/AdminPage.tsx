
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Download, Search, Filter, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'free' | 'basic' | 'premium';
  message_limit: number;
  messages_sent: number;
  whatsapp_status: 'connected' | 'disconnected';
}

const AdminPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users from Supabase
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('user_status')
        .update({ status: newStatus })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, status: newStatus} : user
      ));
      
      toast({
        title: "Status atualizado",
        description: `Usuário ${newStatus === 'active' ? 'ativado' : 'suspenso'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao excluir usuário",
        description: "Ocorreu um erro ao excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const filteredUsers = filterUsers(users);
    
    // Convert to CSV
    const headers = ['ID', 'Email', 'Criado em', 'Último login', 'Status', 'Plano', 'Limite de mensagens', 'Mensagens enviadas', 'Status WhatsApp'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Nunca',
        user.status,
        user.plan,
        user.message_limit,
        user.messages_sent,
        user.whatsapp_status
      ].join(','))
    ].join('\n');
    
    // Create CSV download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios-zapbot-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterUsers = (userList: User[]) => {
    return userList.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus ? user.status === filterStatus : true;
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUsers = filterUsers(users);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 px-4">
        <div className="container">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Painel de Administração</h1>
              <p className="text-gray-600">Gerencie usuários, planos e configurações do sistema</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">Admin</Badge>
            </div>
          </div>
          
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold">Lista de usuários</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        type="search"
                        placeholder="Buscar por email..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                          Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                          Ativos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterStatus('suspended')}>
                          Suspensos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={exportUsers}
                      title="Exportar para CSV"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-10 h-10 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead className="hidden md:table-cell">Criado em</TableHead>
                          <TableHead className="hidden md:table-cell">Plano</TableHead>
                          <TableHead className="hidden lg:table-cell">Mensagens</TableHead>
                          <TableHead>Status WhatsApp</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.email}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge className={
                                  user.plan === 'premium' 
                                    ? "bg-purple-500" 
                                    : user.plan === 'basic' 
                                    ? "bg-blue-500" 
                                    : "bg-gray-500"
                                }>
                                  {user.plan === 'premium' 
                                    ? 'Premium' 
                                    : user.plan === 'basic' 
                                    ? 'Básico' 
                                    : 'Gratuito'
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {user.messages_sent} / {user.message_limit}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  user.whatsapp_status === 'connected'
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }>
                                  {user.whatsapp_status === 'connected' 
                                    ? 'Conectado' 
                                    : 'Desconectado'
                                  }
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Switch
                                  checked={user.status === 'active'}
                                  onCheckedChange={(checked) => 
                                    toggleUserStatus(user.id, checked ? 'active' : 'suspended')
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                                    <DropdownMenuItem>Editar plano</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => deleteUser(user.id)}
                                    >
                                      Excluir conta
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                              Nenhum usuário encontrado.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Mostrando {filteredUsers.length} de {users.length} usuários
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="plans" className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Gerenciamento de Planos</h2>
                
                {/* Plans management interface */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Free Plan */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Plano Gratuito</h3>
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm">Limite de mensagens</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="100"
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-gray-500">mensagens/mês</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">Atualizar</Button>
                  </div>
                  
                  {/* Basic Plan */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Plano Básico</h3>
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm">Limite de mensagens</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="1000"
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-gray-500">mensagens/mês</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">Atualizar</Button>
                  </div>
                  
                  {/* Premium Plan */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-2">Plano Premium</h3>
                    <div className="mb-4">
                      <p className="text-gray-500 text-sm">Limite de mensagens</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          defaultValue="10000"
                          className="w-20 text-right" 
                        />
                        <span className="text-sm text-gray-500">mensagens/mês</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full">Atualizar</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Configurações do Sistema</h2>
                
                {/* System settings here */}
                <div className="max-w-2xl">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Configurações gerais</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="system-name">Nome do sistema</Label>
                          <Input id="system-name" defaultValue="ZapBot" />
                        </div>
                        
                        <div>
                          <Label htmlFor="support-email">Email de suporte</Label>
                          <Input id="support-email" defaultValue="suporte@zapbot.com" type="email" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Registro de novos usuários</h4>
                            <p className="text-sm text-gray-500">Permitir que novos usuários se registrem</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Auto-aprovação de contas</h4>
                            <p className="text-sm text-gray-500">Aprovar automaticamente novos usuários</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Button>Salvar configurações</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
