// Tipos básicos da aplicação

/**
 * @typedef {Object} Project
 * @property {string} id - ID único do projeto
 * @property {string} name - Nome do projeto
 * @property {string} [description] - Descrição opcional do projeto
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {Note[]} notes - Array de notas do projeto
 */

/**
 * @typedef {Object} Note
 * @property {string} id - ID único da nota
 * @property {string} projectId - ID do projeto pai
 * @property {string} [title] - Título da nota (opcional)
 * @property {string} content - Conteúdo da nota em HTML/Markdown
 * @property {Date} createdAt - Data de criação
 * @property {Date} updatedAt - Data da última atualização
 * @property {Date} [lastSaved] - Data do último salvamento
 * @property {number} characterCount - Contador de caracteres
 * @property {number} lineCount - Contador de linhas
 * @property {number} fileSize - Tamanho do arquivo em bytes
 */

/**
 * @typedef {Object} GitHubSettings
 * @property {string} owner - Proprietário do repositório
 * @property {string} repository - Nome do repositório
 * @property {string} token - Token de acesso do GitHub
 * @property {number} autoSaveInterval - Intervalo de salvamento automático em minutos
 */

/**
 * @typedef {Object} OpenProjectSettings
 * @property {string} projectId - ID do projeto no OpenProject
 * @property {string} workPackageId - ID do work package
 * @property {string} token - Token de autenticação
 * @property {string} template - Template Markdown para work packages
 * @property {string} baseUrl - URL base da instância OpenProject
 */

/**
 * @typedef {Object} ThemeSettings
 * @property {'light' | 'dark'} mode - Modo do tema
 * @property {string} primaryColor - Cor primária
 * @property {string} secondaryColor - Cor secundária
 */

/**
 * @typedef {Object} Settings
 * @property {GitHubSettings} github - Configurações do GitHub
 * @property {OpenProjectSettings} openproject - Configurações do OpenProject
 * @property {ThemeSettings} theme - Configurações de tema
 */

/**
 * @typedef {Object} AppState
 * @property {Project[]} projects - Lista de projetos
 * @property {string} [currentProjectId] - ID do projeto atual
 * @property {string} [currentNoteId] - ID da nota atual
 * @property {Settings} settings - Configurações da aplicação
 * @property {boolean} isLoading - Estado de carregamento
 * @property {string} [error] - Mensagem de erro
 */

export {};

