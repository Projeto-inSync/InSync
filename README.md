# InSync

## Como executar a aplicação

## Pré-requisitos

Antes de iniciar o projeto, certifique-se de possuir instalado:

* Node.js (v18 ou superior)
* NPM
* Python 3.10+
* PostgreSQL
* Expo Go (para execução em dispositivos móveis)

---

## 1. Clone o repositório

```bash
git clone https://github.com/Projeto-inSync/InSync.git
```

Acesse a pasta do projeto:

```bash
cd InSync
```

---

## 2. Configuração do Frontend

Acesse a pasta do frontend:

```bash
cd frontend
```

### 2.1 Instale as dependências

```bash
npm install
```

Caso necessário, instale também:

```bash
npm install react-native-dotenv
npm install babel-preset-expo
```

### 2.2 Configurando o .env

Crie um arquivo `.env` na pasta `frontend` com a seguinte variável:

```env
API_URL=http://SEU_IP:8000
```

Para descobrir seu IP no Windows, execute no terminal:

```bash
ipconfig
```

Use o endereço IPv4 da sua rede local.

Exemplo:

```env
API_URL=http://192.168.15.100:8000
```

### 2.3 Execute o frontend

```bash
npx expo start
```

Observação: execute o comando dentro da pasta `frontend`.

---

## 3. Configuração do Backend

Em outro terminal, acesse a pasta do backend:

```bash
cd backend
```

### 3.1 Instale as dependências

```bash
python -m pip install -r requirements.txt
```

### 3.4 Configurando o .env

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
API_KEY=SUA_API_KEY

DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_POSTGRES
DB_HOST=localhost
DB_NAME=insync_db
DB_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=SEU_EMAIL
EMAIL_PASSWORD=SUA_SENHA_DE_APLICATIVO
```

---

## 4. Banco de Dados

O projeto utiliza PostgreSQL. Antes de executar o backend, crie o banco de dados usado pela aplicação.

Acesse o PostgreSQL:

```bash
psql -U postgres
```

Crie o banco:

```sql
CREATE DATABASE insync_db;
```

Saia do PostgreSQL:

```sql
\q
```

# 5. Executar o script SQL

Após criar o banco, execute o arquivo schema.sql:

```bash
psql -U postgres -d insync_db -f database/schema.sql
```

Observação: esse comando deve ser executado dentro da pasta backend.

---

## 6. Execute o backend

Ainda dentro da pasta `backend`, execute:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

A API ficará disponível em:

```text
http://localhost:8000
```

---

## Observações importantes

* O frontend e o backend devem estar rodando ao mesmo tempo, em terminais separados.
* O IP configurado no `.env` do frontend deve apontar para o computador onde o backend está sendo executado.
* Não envie arquivos `.env` para o GitHub.
* Não publique API keys, senhas do banco ou senhas de aplicativo no repositório.