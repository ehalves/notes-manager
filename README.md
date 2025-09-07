# Notepad Web - Editor de Notas Avançado

Uma aplicação web moderna de bloco de notas estilo Notepad++/Notion com funcionalidades avançadas de edição, organização por projetos, salvamento automático no GitHub e integração com OpenProject.

## 🚀 Funcionalidades

### ✨ Editor de Texto Rico
- **Formatação avançada**: Negrito, itálico, sublinhado, tachado
- **Suporte a links e URLs**
- **Código e blocos de código**
- **Suporte a HTML e Markdown**
- **Toolbar personalizada** com todas as opções de formatação

### 📁 Gerenciamento de Projetos
- **Organização hierárquica**: Projetos contendo múltiplas notas
- **Sidebar navegável** com árvore de projetos
- **Criação dinâmica** de projetos e notas
- **Títulos automáticos** baseados em data/hora quando não especificado

### 💾 Persistência e Backup
- **Salvamento automático** no localStorage
- **Sistema de backup** automático
- **Exportação/importação** de dados em JSON
- **Sincronização com GitHub** para backup na nuvem

### 🔗 Integrações

#### GitHub API
- **Salvamento automático** de projetos e notas no GitHub
- **Sincronização bidirecional** (upload/download)
- **Organização em repositório** com estrutura de pastas
- **Formato Markdown** para compatibilidade

#### OpenProject API
- **Criação de work packages** a partir de notas
- **Templates personalizáveis** em Markdown
- **Sincronização automática** de notas para User Stories
- **Autenticação segura** com token de API

### 🎨 Personalização
- **Temas claro/escuro** com alternância automática
- **Cores personalizáveis** (primária e secundária)
- **Presets de cores** predefinidos
- **Interface responsiva** para desktop e mobile

### 📊 Informações Detalhadas
- **Contador de caracteres** em tempo real
- **Contador de linhas**
- **Tamanho do arquivo** calculado
- **Data/hora** da última modificação
- **Barra de status** completa no rodapé

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Shadcn/UI** - Componentes de interface
- **React Quill** - Editor de texto rico
- **SweetAlert2** - Modais e alertas elegantes
- **Axios** - Cliente HTTP para APIs
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas
- **js-base64** - Codificação Base64

## 📦 Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- npm ou pnpm

### Instalação Local
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd notepad-web

# Instale as dependências
pnpm install

# Execute em modo de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build
```

### Deploy
A aplicação está configurada para deploy automático no GitHub Pages.

## ⚙️ Configuração

### GitHub Integration
1. Acesse **Configurações → GitHub**
2. Preencha:
   - **Proprietário**: Seu usuário do GitHub
   - **Repositório**: Nome do repositório para backup
   - **Token**: Personal Access Token com permissões de repositório
   - **Intervalo**: Frequência de salvamento automático (minutos)

#### Como obter o GitHub Token:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecione: `repo` (Full control of private repositories)
4. Copie o token gerado

### OpenProject Integration
1. Acesse **Configurações → OpenProject**
2. Preencha:
   - **URL Base**: URL da sua instância OpenProject
   - **ID do Projeto**: ID numérico do projeto
   - **ID do Work Package**: ID do tipo User Story (opcional)
   - **Token**: Token de API do OpenProject
   - **Template**: Template Markdown para work packages

#### Como obter o OpenProject Token:
1. Faça login no OpenProject
2. Minha conta → Tokens de acesso
3. Gerar novo token
4. Copie o token (será usado automaticamente em Basic Auth)

### Templates Personalizados
O template padrão para OpenProject inclui:
```markdown
# {{title}}

## Informações da Nota
- **ID:** {{id}}
- **Criado em:** {{created}}
- **Atualizado em:** {{updated}}
- **Caracteres:** {{characters}}
- **Linhas:** {{lines}}

## Conteúdo

{{content}}
```

**Variáveis disponíveis:**
- `{{title}}` - Título da nota
- `{{content}}` - Conteúdo da nota
- `{{id}}` - ID único da nota
- `{{created}}` - Data de criação
- `{{updated}}` - Data de última atualização
- `{{characters}}` - Número de caracteres
- `{{lines}}` - Número de linhas

## 🔧 Funcionalidades Avançadas

### Backup e Restauração
- **Exportação**: Baixa todos os dados em arquivo JSON
- **Importação**: Restaura dados de backup anterior
- **Limpeza**: Remove todos os dados (com confirmação)

### Sincronização GitHub
- **Upload**: Envia projetos locais para o GitHub
- **Download**: Importa projetos do GitHub
- **Estrutura**: Organiza arquivos em `projects/[nome-projeto]/notes/`

### Sincronização OpenProject
- **Criação**: Converte notas em work packages
- **Atualização**: Sincroniza mudanças nas notas
- **Template**: Aplica formatação personalizada

## 🎯 Casos de Uso

### Levantamento de Requisitos
1. Crie um projeto para cada sistema/módulo
2. Adicione notas para cada requisito levantado
3. Use formatação rica para destacar informações importantes
4. Sincronize com OpenProject para criar User Stories
5. Mantenha backup automático no GitHub

### Documentação Técnica
1. Organize documentos por projeto/componente
2. Use Markdown para formatação consistente
3. Exporte para backup ou compartilhamento
4. Mantenha histórico de versões no GitHub

### Anotações Pessoais
1. Crie projetos temáticos
2. Use títulos automáticos por data/hora
3. Aproveite a busca e organização hierárquica
4. Acesse de qualquer dispositivo via GitHub

## 🔒 Segurança

- **Tokens locais**: Armazenados apenas no localStorage do browser
- **HTTPS**: Todas as comunicações com APIs são criptografadas
- **Sem servidor**: Aplicação 100% client-side
- **Controle total**: Você mantém controle dos seus dados

## 🐛 Solução de Problemas

### GitHub não conecta
- Verifique se o token tem permissões corretas
- Confirme se o repositório existe e é acessível
- Teste a conexão antes de sincronizar

### OpenProject não conecta
- Verifique a URL base (deve incluir https://)
- Confirme se o token de API está correto
- Teste a conexão antes de sincronizar

### Dados perdidos
- Verifique o localStorage do browser
- Importe backup anterior se disponível
- Baixe dados do GitHub se configurado

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests
- Melhorar a documentação

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação das APIs integradas
- Verifique os logs do console do browser para debugging

---

**Desenvolvido com ❤️ usando React e tecnologias modernas**

