# DevTrack

Dashboard full stack para acompanhar evolucao profissional em tecnologia.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- GitHub API
- Recharts

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

O arquivo `.env.local` deve conter:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GITHUB_USERNAME=
GITHUB_TOKEN=
```

`GITHUB_TOKEN` e opcional, mas recomendado para aumentar o limite da GitHub API.

## Banco de dados

Use o arquivo `supabase-schema.sql` no SQL Editor do Supabase para criar as
tabelas e politicas de seguranca.

## Roadmap

1. Autenticacao com Supabase Auth.
2. CRUD de tecnologias, cursos, projetos e metas semanais.
3. Integracao com GitHub API.
4. Graficos filtraveis por semana, mes e trimestre.
5. Deploy na Vercel.
