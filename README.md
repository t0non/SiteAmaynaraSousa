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
