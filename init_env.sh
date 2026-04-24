#!/bin/bash

# Disabilita i prompt interattivi di Angular CLI (es. richiesta di invio analytics)
export NG_CLI_ANALYTICS=ci

# Definiamo i target: Node.js 22 (LTS consigliata) e Angular CLI 19
NODE_TARGET="22"
ANGULAR_TARGET="@angular/cli@19"

echo "=== Inizio configurazione ambiente per Angular 19 ==="

# 1. Verifica e installazione di NVM (Node Version Manager)
# NVM è lo standard di settore per gestire e impostare Node come predefinito per l'utente.
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    echo "[!] NVM non trovato. Installazione di NVM in corso..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Carica NVM immediatamente per l'uso nello script
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
    echo "[✓] NVM è già installato."
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# 2. Verifica, Installazione e Impostazione predefinita di Node.js
# Controlliamo la major version del Node corrente (es. "22" da "v22.x.x")
CURRENT_NODE=$(node -v 2>/dev/null | cut -d 'v' -f 2 | cut -d '.' -f 1)

if [ "$CURRENT_NODE" != "$NODE_TARGET" ]; then
    echo "[!] Node.js v$NODE_TARGET non trovato o non in uso. Installazione in corso..."
    nvm install $NODE_TARGET
    # Rende questa versione la predefinita per ogni nuovo terminale aperto
    nvm alias default $NODE_TARGET
    nvm use default
else
    echo "[✓] Node.js v$CURRENT_NODE (compatibile con Angular 19) è già in uso."
fi

# 3. Verifica e Installazione di Angular CLI 19
# Controlliamo se Angular è installato e recuperiamo la sua major version
if command -v ng &> /dev/null; then
    NG_VERSION=$(ng version 2>/dev/null | grep -i 'Angular CLI:' | awk '{print $3}' | cut -d. -f1)
else
    NG_VERSION="0"
fi

if [ "$NG_VERSION" != "19" ]; then
    echo "[!] Angular CLI 19 non trovato (Versione attuale: $NG_VERSION). Installazione in corso..."
    npm install -g $ANGULAR_TARGET
else
    echo "[✓] Angular CLI 19 è già installato come predefinito."
fi

# 4. Spostamento nella directory dello script ed esecuzione di npm i
# Questa riga identifica il percorso reale dello script ovunque venga chiamato
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

echo "=== Spostamento nella directory dello script: $SCRIPT_DIR ==="
cd "$SCRIPT_DIR" || { echo "Errore critico: impossibile cambiare directory"; exit 1; }

echo "=== Esecuzione di 'npm i' in corso... ==="
npm i

echo "=== Operazione completata con successo! ==="