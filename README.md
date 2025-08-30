# nps

Plataforma completa para gestão de Net Promoter Score (NPS) com backend Node.js e SQLite.
## Sistema de Gestão de NPS
### Tecnologias
**Frontend:**
- React + TypeScript
- Tailwind CSS
- Vite
- React Router
- Chart.js
- Framer Motion
**Backend:**
- Node.js + Express
- TypeScript
- SQLite
- JWT Authentication
- Nodemailer
- bcryptjs
### Instalação e Execução
1. **Instalar dependências:**
```bash
npm install
cd server && npm install
```
2. **Configurar ambiente:**
```bash
# Copiar arquivos de exemplo
cp .env.example .env
cp server/.env.example server/.env
# Editar as variáveis de ambiente conforme necessário
```
3. **Executar migração do banco:**
```bash
npm run server:migrate
```
4. **Executar em desenvolvimento:**
```bash
# Executar frontend e backend simultaneamente
npm run dev:full
# Ou executar separadamente:
npm run dev              # Frontend (porta 5173)
npm run server:dev       # Backend (porta 3001)
```
5. **Build para produção:**
```bash
npm run build           # Frontend
npm run server:build    # Backend
npm run server:start    # Executar backend em produção
```
### Estrutura do Projeto
```
├── src/                 # Frontend React
├── server/              # Backend Node.js
│   ├── src/
│   │   ├── config/      # Configuração do banco
│   │   ├── middleware/  # Middlewares (auth, etc)
│   │   ├── routes/      # Rotas da API
│   │   ├── scripts/     # Scripts de migração
│   │   └── types/       # Tipos TypeScript
│   └── data/            # Banco SQLite
├── public/              # Assets estáticos
└── supabase/           # Migrações antigas (descontinuadas)
```
### Funcionalidades
- ✅ Autenticação JWT
- ✅ Gestão de campanhas NPS
- ✅ Formulários personalizáveis
- ✅ Coleta de respostas
- ✅ Relatórios e analytics
- ✅ Gestão de contatos
- ✅ Sistema de afiliados
- ✅ Painel administrativo
- ✅ Envio de emails (SMTP)
- ✅ Webhooks para automação
- ✅ Temas personalizáveis
- ✅ Multi-idioma (PT, EN, ES)
### Credenciais Padrão
**Administrador:**
- Email: admin@meunps.com
- Senha: admin123
### API Endpoints
**Autenticação:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuário atual
- `POST /api/auth/change-password` - Alterar senha
- `DELETE /api/auth/account` - Excluir conta
**Campanhas:**
- `GET /api/campaigns` - Listar campanhas
- `POST /api/campaigns` - Criar campanha
- `PUT /api/campaigns/:id` - Atualizar campanha
- `DELETE /api/campaigns/:id` - Excluir campanha
**Respostas:**
- `GET /api/responses/campaign/:id` - Respostas da campanha
- `POST /api/responses/submit` - Enviar resposta (público)
**E mais endpoints para contatos, formulários, configurações, etc.**
### Migração do Supabase
Este projeto foi migrado do Supabase para um backend Node.js local com SQLite. As principais mudanças:
1. **Banco de dados:** PostgreSQL (Supabase) → SQLite
2. **Autenticação:** Supabase Auth → JWT personalizado
3. **Storage:** Supabase Storage → Sistema de arquivos local
4. **Edge Functions:** Supabase Functions → Rotas Express
### Desenvolvimento
Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request
### Licença
MIT License - veja o arquivo LICENSE para detalhes.