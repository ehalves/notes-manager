# Notes Manager - Gerenciador de Notas

Uma aplicação web moderna para gerenciamento de notas e projetos, com funcionalidades avançadas de edição de texto rico, integração com GitHub e OpenProject.

## 🚀 Funcionalidades

### ✨ Editor de Texto Rico
- Editor WYSIWYG baseado em Quill.js
- Formatação completa: negrito, itálico, sublinhado, tachado
- Suporte a cores, listas, alinhamento
- Inserção de links, imagens e blocos de código
- Contadores em tempo real: caracteres, linhas, tamanho do arquivo

### 📁 Organização por Projetos
- Criação e gerenciamento de projetos
- Organização hierárquica de notas dentro de projetos
- Títulos automáticos baseados em data/hora para notas sem título
- Interface intuitiva com sidebar expansível

### 💾 Salvamento Automático
- Salvamento local no localStorage
- Integração com GitHub API para backup na nuvem
- Salvamento automático a cada 30 segundos
- Exportação/importação de notas em HTML

### 🔗 Integração com OpenProject
- Criação de work packages diretamente das notas
- Templates personalizáveis em Markdown
- Configuração flexível de projetos e tipos de work package
- Autenticação via API key

### 🎨 Temas e Personalização
- Tema claro e escuro
- Cores personalizáveis
- Interface responsiva para desktop e mobile
- Animações suaves e design moderno

### ⚙️ Configurações Avançadas
- Configuração de integração com GitHub (owner, repo, token)
- Configuração de integração com OpenProject (URL, projeto, token)
- Templates personalizáveis para work packages
- Intervalos de salvamento configuráveis

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Editor**: React Quill
- **Ícones**: Lucide React
- **Notificações**: SweetAlert2
- **APIs**: GitHub REST API, OpenProject API
- **Deploy**: GitHub Pages

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js 20+
- pnpm (recomendado) ou npm

### Instalação Local
```bash
# Clone o repositório
git clone https://github.com/ehalves/notes-manager.git
cd notes-manager

# Instale as dependências
pnpm install

# Execute em modo de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### Configuração

#### GitHub Integration
1. Acesse as Configurações → GitHub
2. Configure:
   - **Owner**: Seu usuário do GitHub
   - **Repositório**: Nome do repositório para backup
   - **Token**: Personal Access Token com permissões de repo
   - **Branch**: Branch para salvamento (padrão: main)

#### OpenProject Integration
1. Acesse as Configurações → OpenProject
2. Configure:
   - **URL Base**: URL da sua instância OpenProject
   - **ID do Projeto**: ID numérico do projeto
   - **ID do Tipo de Work Package**: ID do tipo (ex: User Story)
   - **Token**: API key do OpenProject
   - **Template**: Template Markdown para work packages

## 🔧 Configuração do GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages via GitHub Actions. O workflow é executado automaticamente a cada push na branch master.

### URL de Acesso
Após o deploy, a aplicação estará disponível em:
`https://ehalves.github.io/notes-manager/`

## 📝 Como Usar

1. **Criar Projeto**: Clique em "Novo Projeto" na sidebar
2. **Criar Nota**: Clique no ícone "+" ao lado do projeto
3. **Editar**: Selecione uma nota para abrir o editor
4. **Salvar**: Use Ctrl+S ou o botão "Salvar"
5. **Configurar**: Acesse "Configurações" para integrar com GitHub/OpenProject

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🔗 Links Úteis

- [GitHub Repository](https://github.com/ehalves/notes-manager)
- [GitHub Pages](https://ehalves.github.io/notes-manager/)
- [React Documentation](https://react.dev/)
- [Quill.js Documentation](https://quilljs.com/)
- [GitHub API Documentation](https://docs.github.com/rest)
- [OpenProject API Documentation](https://www.openproject.org/docs/api/)

---

Desenvolvido com ❤️ para facilitar o gerenciamento de notas e projetos.

