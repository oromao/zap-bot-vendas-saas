import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWhatsAppConversations } from "@/hooks/useWhatsAppConversations";
import { useWhatsAppMessages } from "@/hooks/useWhatsAppMessages";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { ScrollArea } from "@/components/ui/scroll-area";

type Conversation = {
  id: string;
  name: string;
  number: string;
  lastMessage: {
    text: string;
    timestamp: number;
    fromMe: boolean;
  };
};

type Message = {
  id: string;
  text: string;
  timestamp: number;
  fromMe: boolean;
  hasMedia: boolean;
  mediaUrl?: string;
};

const WhatsAppConversations: React.FC = () => {
  const { isConnected } = useWhatsAppStatus();
  const {
    conversations,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useWhatsAppConversations();
  const {
    fetchMessages,
    messages,
    isLoading: messagesLoading,
  } = useWhatsAppMessages();
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return format(date, "HH:mm", { locale: ptBR });
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, "dd 'de' MMM, HH:mm", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yyyy, HH:mm", { locale: ptBR });
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center max-w-md">
          <X className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            WhatsApp desconectado
          </h3>
          <p className="text-red-600 mb-4">
            Para visualizar suas conversas, você precisa conectar seu WhatsApp
            Business primeiro.
          </p>
          <Button className="bg-gradient">Ir para conexão do WhatsApp</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="font-medium">Conversas recentes</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchConversations()}
          disabled={conversationsLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${
              conversationsLoading ? "animate-spin" : ""
            }`}
          />
          Atualizar
        </Button>
      </div>

      {conversationsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-t-whatsapp rounded-full animate-spin mr-2"></div>
          <p className="text-gray-500">Carregando conversas...</p>
        </div>
      ) : conversations && conversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 py-2 px-4 border-b">
              <div className="text-sm font-medium">
                Contatos ({conversations.length})
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-blue-50"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-sm truncate">
                            {conversation.name || conversation.number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessage.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          {conversation.lastMessage.fromMe ? (
                            <span className="inline-block bg-blue-100 text-blue-800 rounded px-1 mr-1 text-[10px]">
                              Você
                            </span>
                          ) : null}
                          <span className="truncate">
                            {conversation.lastMessage.text}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="md:col-span-2 border rounded-lg overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="bg-gray-50 py-3 px-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {selectedConversation.name || "Contato"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {selectedConversation.number}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${selectedConversation.number.replace(
                      /[^0-9]/g,
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 flex items-center"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Abrir no WhatsApp
                  </a>
                </div>

                <ScrollArea className="h-[400px] px-4 py-2">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-3 border-t-whatsapp rounded-full animate-spin mr-2"></div>
                      <p className="text-gray-500 text-sm">
                        Carregando mensagens...
                      </p>
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-[80%] ${
                            message.fromMe ? "ml-auto" : "mr-auto"
                          }`}
                        >
                          <div
                            className={`rounded-lg p-3 ${
                              message.fromMe
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {message.hasMedia && message.mediaUrl && (
                              <div className="mb-2 bg-gray-200 rounded flex items-center justify-center h-32">
                                {/* Aqui seria exibida a mídia */}
                                <p className="text-xs text-gray-500">
                                  [Imagem ou mídia]
                                </p>
                              </div>
                            )}
                            <p className="text-sm">{message.text}</p>
                            <div className="text-right mt-1">
                              <span className="text-[10px] text-gray-500">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">
                        Nenhuma mensagem encontrada
                      </p>
                    </div>
                  )}
                </ScrollArea>

                <div className="px-4 py-3 bg-gray-50 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    As mensagens são exibidas apenas para consulta. Para
                    responder, use o WhatsApp.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-12">
                <div className="text-center max-w-xs">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Selecione uma conversa para visualizar as mensagens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-2">Nenhuma conversa encontrada</p>
            <p className="text-sm text-gray-400 max-w-md text-center mb-4">
              Quando você receber mensagens no seu WhatsApp Business, elas
              aparecerão aqui.
            </p>
            <Button variant="outline" onClick={() => refetchConversations()}>
              Verificar novamente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppConversations;
