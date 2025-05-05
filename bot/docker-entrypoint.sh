#!/bin/sh
set -e

# Criar diretórios necessários
mkdir -p /home/app/.wwebjs_auth
chmod -R 777 /home/app/.wwebjs_auth

# Instalar dependências, se necessário
if [ ! -d "/home/app/node_modules" ]; then
  echo "Instalando dependências..."
  npm install
fi

# Remover arquivos de bloqueio do Chromium se existirem
find /home/app/.wwebjs_auth -name "*.lock" -type f -delete
find /home/app/.wwebjs_auth -name "SingletonLock" -type f -delete
find /home/app/.wwebjs_auth -name "SingletonCookie" -type f -delete
find /home/app/.wwebjs_auth -name "Singleton*" -type f -delete

# Garantir que não há processos zumbis do Chrome
pkill -f chromium || true
pkill -f chrome || true

# Executar o comando fornecido
exec "$@"