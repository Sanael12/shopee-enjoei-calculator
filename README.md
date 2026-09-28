# Calculadora de Lucro

Calculadoras Shopee, Enjoei e Doces, com vendas associadas à conta no Supabase.

## Conectar seu Supabase

Configure estas duas variáveis no ambiente de desenvolvimento e no serviço onde o site for publicado:

```text
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

Copie os valores de **Project Settings → API** do seu próprio projeto Supabase. A chave anon é pública; **nunca use a service_role** como chave VITE_. O aplicativo não usa as antigas variáveis SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY como alternativa. Não publique um arquivo `.env` com credenciais privadas.

Antes de entrar, aplique a migração SQL em `supabase/migrations/` no seu novo projeto para criar a tabela `sales`, permissões e políticas de acesso. Ative os métodos de login que pretende usar (Google e/ou e-mail) no painel de autenticação do seu projeto, adicione a URL pública do site e `https://seu-site/auth` às URLs de redirecionamento permitidas. Para Google, configure também as credenciais OAuth e a URL de callback fornecida pelo seu projeto Supabase no provedor Google.

As vendas já guardadas no navegador são importadas para a conta após o login. Vendas que existem somente no banco antigo **não são copiadas automaticamente**: exporte-as e importe-as no novo projeto preservando os IDs dos usuários e das vendas, ou mantenha uma cópia antes de encerrar o projeto anterior. Contas do banco antigo também não migram automaticamente.

Sem estas variáveis o aplicativo continua calculando e guardando vendas neste navegador, mas não acessa a conta. Depois de configurar, reinicie o servidor de desenvolvimento.

```sh
bun install
bun run dev
```
