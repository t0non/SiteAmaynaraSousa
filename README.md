# Dra. Amaynara Sousa – site

Site estático da Dra. Amaynara Sousa, médica de família e comunidade em Belo Horizonte (bairros Castelo e Fernão Dias).
Desenvolvido por [Top Marketing BH](https://topmarketingbh.com.br/).

## Rodar localmente

Requer Node.js 22 ou superior.

```sh
npm run dev
```

A prévia abre em http://localhost:4173/ e serve a pasta `site/`.

## Estrutura

- `site/index.html`: página principal
- `site/<serviço>/`: páginas de serviço (medicina de família, doenças crônicas, dor crônica, saúde mental, acupuntura, teleconsulta)
- `site/blog/`: listagem e 100 artigos
- `site/contato/` e `site/onde-atendemos/`
- `site/wp-content/uploads/amaynara/`: CSS, JS e imagens próprios do site
- `site/robots.txt` e `site/llms.txt`

## Antes de publicar

- Registrar o domínio, trocar as URLs relativas de canonical e schema pelo domínio e gerar o `sitemap.xml`
- Remover o `noindex` das páginas
- Revisão médica dos artigos do blog pela Dra. Amaynara
- Configurar GA4, banner de cookies e política de privacidade (LGPD)

## Painel do site (/admin)

Painel próprio (mesmo padrão do Instituto do Sono): visitas, cliques em cada botão, tempo, quem voltou, horário/dia,
páginas, seções, origem (Google, ChatGPT/IAs, Instagram, anúncios), cidade e aparelho.

- Rastreador: `site/wp-content/uploads/amaynara/tracker.js` (já incluído em todas as páginas)
- Funções da Vercel: `api/track.js` (recebe os dados) e `api/admin/*` (login, sair, dados)
- Painel: `site/admin/` → `https://SEU-DOMINIO/admin/` (com `?demo=1` mostra dados de exemplo)
- Banco: `supabase/painel.sql`

Para ativar:
1. Supabase → novo projeto (região São Paulo) → **SQL Editor** → cole `supabase/painel.sql` → **Run**
2. Supabase → Project Settings → API: copie a **URL** e a chave **service_role**
3. Vercel → projeto → Settings → **Environment Variables**:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD` (senha do painel, mín. 8 caracteres)
   - `ADMIN_SESSION_SECRET` (texto aleatório, mín. 16 caracteres)
4. Faça um novo deploy. Pronto: `/admin`

Para testar no computador, crie `.env.local` na raiz com as mesmas 4 variáveis e rode `npm run dev`.
Visitas no localhost e com o admin logado ficam marcadas como teste (fora dos números).
