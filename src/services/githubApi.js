// Serviço para integração com GitHub API

import axios from 'axios';
import { encode as base64Encode, decode as base64Decode } from 'js-base64';

export class GitHubService {
  constructor(config = {}) {
    this.owner = config.owner || '';
    this.repository = config.repository || '';
    this.token = config.token || '';
    this.baseUrl = 'https://api.github.com';
    
    // Configurar axios com headers padrão
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Atualiza a configuração do serviço
   * @param {Object} config - Nova configuração
   */
  updateConfig(config) {
    this.owner = config.owner || this.owner;
    this.repository = config.repository || this.repository;
    this.token = config.token || this.token;
    
    // Atualizar headers do axios
    this.api.defaults.headers['Authorization'] = `token ${this.token}`;
  }

  /**
   * Verifica se a configuração está válida
   * @returns {boolean}
   */
  isConfigured() {
    return !!(this.owner && this.repository && this.token);
  }

  /**
   * Testa a conexão com o repositório
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.api.get(`/repos/${this.owner}/${this.repository}`);
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao testar conexão com GitHub:', error);
      return false;
    }
  }

  /**
   * Lista arquivos em um diretório do repositório
   * @param {string} path - Caminho do diretório
   * @returns {Promise<Array>}
   */
  async listFiles(path = '') {
    try {
      const response = await this.api.get(`/repos/${this.owner}/${this.repository}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  /**
   * Obtém o conteúdo de um arquivo
   * @param {string} path - Caminho do arquivo
   * @returns {Promise<Object|null>}
   */
  async getFile(path) {
    try {
      const response = await this.api.get(`/repos/${this.owner}/${this.repository}/contents/${path}`);
      const file = response.data;
      
      if (file.content) {
        file.decodedContent = base64Decode(file.content);
      }
      
      return file;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Arquivo não existe
      }
      console.error('Erro ao obter arquivo:', error);
      throw error;
    }
  }

  /**
   * Cria ou atualiza um arquivo no repositório
   * @param {string} path - Caminho do arquivo
   * @param {string} content - Conteúdo do arquivo
   * @param {string} message - Mensagem do commit
   * @param {string} [sha] - SHA do arquivo existente (para atualização)
   * @returns {Promise<Object>}
   */
  async createOrUpdateFile(path, content, message, sha = null) {
    try {
      const data = {
        message,
        content: base64Encode(content),
        branch: 'main'
      };

      if (sha) {
        data.sha = sha;
      }

      const response = await this.api.put(`/repos/${this.owner}/${this.repository}/contents/${path}`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar/atualizar arquivo:', error);
      throw error;
    }
  }

  /**
   * Deleta um arquivo do repositório
   * @param {string} path - Caminho do arquivo
   * @param {string} message - Mensagem do commit
   * @param {string} sha - SHA do arquivo
   * @returns {Promise<Object>}
   */
  async deleteFile(path, message, sha) {
    try {
      const response = await this.api.delete(`/repos/${this.owner}/${this.repository}/contents/${path}`, {
        data: {
          message,
          sha,
          branch: 'main'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Salva um projeto completo no GitHub
   * @param {Object} project - Projeto para salvar
   * @returns {Promise<boolean>}
   */
  async saveProject(project) {
    try {
      const projectPath = `projects/${this.sanitizeFileName(project.name)}`;
      
      // Criar arquivo de metadados do projeto
      const projectMetadata = {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        notesCount: project.notes.length
      };

      await this.createOrUpdateFile(
        `${projectPath}/project.json`,
        JSON.stringify(projectMetadata, null, 2),
        `Atualizar projeto: ${project.name}`
      );

      // Salvar cada nota como arquivo separado
      for (const note of project.notes) {
        await this.saveNote(note, projectPath);
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      return false;
    }
  }

  /**
   * Salva uma nota individual no GitHub
   * @param {Object} note - Nota para salvar
   * @param {string} projectPath - Caminho do projeto
   * @returns {Promise<boolean>}
   */
  async saveNote(note, projectPath) {
    try {
      const fileName = this.sanitizeFileName(note.title || `nota-${note.id}`);
      const notePath = `${projectPath}/notes/${fileName}.md`;
      
      // Criar conteúdo da nota em Markdown
      const noteContent = this.formatNoteAsMarkdown(note);
      
      // Verificar se arquivo já existe
      const existingFile = await this.getFile(notePath);
      const sha = existingFile?.sha;

      await this.createOrUpdateFile(
        notePath,
        noteContent,
        `Atualizar nota: ${note.title}`,
        sha
      );

      return true;
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      return false;
    }
  }

  /**
   * Carrega um projeto do GitHub
   * @param {string} projectName - Nome do projeto
   * @returns {Promise<Object|null>}
   */
  async loadProject(projectName) {
    try {
      const projectPath = `projects/${this.sanitizeFileName(projectName)}`;
      
      // Carregar metadados do projeto
      const projectFile = await this.getFile(`${projectPath}/project.json`);
      if (!projectFile) {
        return null;
      }

      const project = JSON.parse(projectFile.decodedContent);
      
      // Carregar notas do projeto
      const notesFiles = await this.listFiles(`${projectPath}/notes`);
      project.notes = [];

      for (const file of notesFiles) {
        if (file.name.endsWith('.md')) {
          const noteFile = await this.getFile(file.path);
          if (noteFile) {
            const note = this.parseNoteFromMarkdown(noteFile.decodedContent, file.name);
            project.notes.push(note);
          }
        }
      }

      return project;
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      return null;
    }
  }

  /**
   * Lista todos os projetos salvos no GitHub
   * @returns {Promise<Array>}
   */
  async listProjects() {
    try {
      const projectsFiles = await this.listFiles('projects');
      const projects = [];

      for (const file of projectsFiles) {
        if (file.type === 'dir') {
          const projectFile = await this.getFile(`${file.path}/project.json`);
          if (projectFile) {
            const project = JSON.parse(projectFile.decodedContent);
            projects.push(project);
          }
        }
      }

      return projects;
    } catch (error) {
      console.error('Erro ao listar projetos:', error);
      return [];
    }
  }

  /**
   * Sincroniza dados locais com o GitHub
   * @param {Array} localProjects - Projetos locais
   * @returns {Promise<Object>}
   */
  async syncData(localProjects) {
    try {
      const result = {
        uploaded: 0,
        downloaded: 0,
        errors: []
      };

      // Upload de projetos locais
      for (const project of localProjects) {
        try {
          await this.saveProject(project);
          result.uploaded++;
        } catch (error) {
          result.errors.push(`Erro ao fazer upload do projeto ${project.name}: ${error.message}`);
        }
      }

      // Download de projetos do GitHub
      const remoteProjects = await this.listProjects();
      const downloadedProjects = [];

      for (const remoteProject of remoteProjects) {
        try {
          const fullProject = await this.loadProject(remoteProject.name);
          if (fullProject) {
            downloadedProjects.push(fullProject);
            result.downloaded++;
          }
        } catch (error) {
          result.errors.push(`Erro ao fazer download do projeto ${remoteProject.name}: ${error.message}`);
        }
      }

      result.projects = downloadedProjects;
      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Sanitiza nome de arquivo para uso no GitHub
   * @param {string} fileName - Nome original
   * @returns {string}
   */
  sanitizeFileName(fileName) {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Formata uma nota como Markdown
   * @param {Object} note - Nota para formatar
   * @returns {string}
   */
  formatNoteAsMarkdown(note) {
    const metadata = [
      `---`,
      `id: ${note.id}`,
      `title: "${note.title}"`,
      `created: ${note.createdAt.toISOString()}`,
      `updated: ${note.updatedAt.toISOString()}`,
      `characters: ${note.characterCount}`,
      `lines: ${note.lineCount}`,
      `---`,
      ``,
      `# ${note.title}`,
      ``,
      note.content || ''
    ];

    return metadata.join('\n');
  }

  /**
   * Extrai dados de uma nota a partir do Markdown
   * @param {string} content - Conteúdo Markdown
   * @param {string} fileName - Nome do arquivo
   * @returns {Object}
   */
  parseNoteFromMarkdown(content, fileName) {
    const lines = content.split('\n');
    const note = {
      id: '',
      title: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      characterCount: 0,
      lineCount: 0,
      fileSize: 0
    };

    let inMetadata = false;
    let metadataEnd = 0;

    // Extrair metadados
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === '---') {
        if (!inMetadata) {
          inMetadata = true;
        } else {
          metadataEnd = i;
          break;
        }
      } else if (inMetadata) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim().replace(/"/g, '');
        
        switch (key.trim()) {
          case 'id':
            note.id = value;
            break;
          case 'title':
            note.title = value;
            break;
          case 'created':
            note.createdAt = new Date(value);
            break;
          case 'updated':
            note.updatedAt = new Date(value);
            break;
          case 'characters':
            note.characterCount = parseInt(value) || 0;
            break;
          case 'lines':
            note.lineCount = parseInt(value) || 0;
            break;
        }
      }
    }

    // Extrair conteúdo (pular metadados e título)
    const contentLines = lines.slice(metadataEnd + 3); // Pular ---, linha vazia e # título
    note.content = contentLines.join('\n');
    note.fileSize = new Blob([note.content]).size;

    // Se não tiver ID, gerar um baseado no nome do arquivo
    if (!note.id) {
      note.id = fileName.replace('.md', '');
    }

    return note;
  }
}

export default GitHubService;

