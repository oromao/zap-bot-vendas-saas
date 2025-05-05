#!/bin/bash

# Configurações
BACKUP_DIR="/backup/wwebjs"
SOURCE_DIR="/home/app/.wwebjs_auth"
MAX_BACKUPS=7

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup com timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wwebjs_backup_$TIMESTAMP.tar.gz"

# Criar backup
tar -czf "$BACKUP_FILE" -C "$(dirname "$SOURCE_DIR")" "$(basename "$SOURCE_DIR")"

# Remover backups antigos mantendo apenas MAX_BACKUPS
cd "$BACKUP_DIR" || exit
ls -t | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm --

echo "Backup criado: $BACKUP_FILE"