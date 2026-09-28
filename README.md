# Calculadora de Lucro

Calculadoras Shopee, Enjoei e Doces, com vendas associadas à conta no Supabase.

## Conectar seu Supabase

O projeto externo está configurado em `vite.config.ts` com sua URL base e chave pública. A URL usada pelo cliente é a raiz `https://faebrmezzvtnbwrappct.supabase.co` (sem `/rest/v1/`). O cliente lê somente as variáveis públicas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; a configuração do Vite define esses valores para impedir que os valores antigos injetados pelo ambiente de prévia sejam usados. Se trocar de projeto, atualize os dois valores públicos em `vite.config.ts`.

```text
VITE_SUPABASE_URL=https://faebrmezzvtnbwrappct.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_W3KIlncj0x6MbLUxQalU7g_WDLfueig
```

A chave anon é pública; **nunca use a service_role** como chave VITE_. O aplicativo não usa as antigas variáveis SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY como alternativa. Não publique um arquivo `.env` com credenciais privadas.

O projeto externo já responde à tabela `sales` e ao serviço de autenticação, mas as políticas de acesso e a gravação com uma conta ainda precisam ser verificadas. Compare a tabela e as políticas existentes com a migração SQL em `supabase/migrations/`. O login por e-mail está ativo; o login Google está desativado no projeto externo e precisa ser ativado antes de usar o botão Google. Adicione a URL pública do site e `https://seu-site/auth` às URLs de redirecionamento permitidas. Para Google, configure também as credenciais OAuth e a URL de callback fornecida pelo seu projeto Supabase no provedor Google.

As vendas já guardadas no navegador são importadas para a conta após o login. Vendas que existem somente no banco antigo **não são copiadas automaticamente**: exporte-as e importe-as no novo projeto preservando os IDs dos usuários e das vendas, ou mantenha uma cópia antes de encerrar o projeto anterior. Contas do banco antigo também não migram automaticamente.

Sem estas variáveis o aplicativo continua calculando e guardando vendas neste navegador, mas não acessa a conta. Depois de configurar, reinicie o servidor de desenvolvimento.

```sh
bun install
bun run dev
```
