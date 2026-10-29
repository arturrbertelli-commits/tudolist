# Todo List — Frontend

React + Vite, consumindo a API Fastify/MySQL do backend.

## Como rodar

```bash
# 1. Backend (em outra pasta): rode schema.sql no MySQL e suba o servidor (porta 3333)
# 2. Frontend
npm install
cp .env.example .env     # ajuste VITE_API_URL se necessário
npm run dev              # http://localhost:5173
```

O backend libera CORS apenas para `http://localhost:5173` por padrão
(variável `CORS_ORIGIN` no `.env` do backend).

## Estrutura

```
src/
  api.js                  cliente HTTP (list/create/update/remove)
  App.jsx                 estado, busca, filtros, contadores
  components/
    TaskItem.jsx          item com checkbox, selo "Em atraso", ações no hover
    TaskModal.jsx         modal Create Task / Edit Task
    Icons.jsx             ícones SVG
  hooks/
    useDebounce.js        debounce da busca (400 ms)
    useTheme.js           tema claro/escuro (persistido)
  utils/date.js           regras de atraso e formatação de data
  styles.css
```
