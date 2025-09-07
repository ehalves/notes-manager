// Serviço para integração com OpenProject API

import axios from 'axios';
import { encode as base64Encode } from 'js-base64';

export class OpenProjectService {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || '';
    this.projectId = config.projectId || '';
    this.workPackageId = config.workPackageId || '';
    this.token = config.token || '';
    this.template = config.template || '# {{title}}\n\n{{content}}';
    
    // Configurar axios com autenticação Basic
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${base64Encode(`apikey:${this.token}`)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Atualiza a configuração do serviço
   * @param {Object} config - Nova configuração
   */
  updateConfig(config) {
    this.baseUrl = config.baseUrl || this.baseUrl;
    this.projectId = config.projectId || this.projectId;
    this.workPackageId = config.workPackageId || this.workPackageId;
    this.token = config.token || this.token;
    this.template = config.template || this.template;
    
    // Atualizar configuração do axios
    this.api.defaults.baseURL = this.baseUrl;
    this.api.defaults.headers['Authorization'] = `Basic ${base64Encode(`apikey:${this.token}`)}`;
  }

  /**
   * Verifica se a configuração está válida
   * @returns {boolean}
   */
  isConfigured() {
    return !!(this.baseUrl && this.projectId && this.workPackageId && this.token);
  }

  /**
   * Testa a conexão com o OpenProject
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this.api.get('/api/v3/projects');
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao testar conexão com OpenProject:', error);
      return false;
    }
  }

  /**
   * Obtém informações do projeto
   * @returns {Promise<Object|null>}
   */
  async getProject() {
    try {
      const response = await this.api.get(`/api/v3/projects/${this.projectId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter projeto:', error);
      return null;
    }
  }

  /**
   * Lista work packages do projeto
   * @returns {Promise<Array>}
   */
  async getWorkPackages() {
    try {
      const response = await this.api.get(`/api/v3/projects/${this.projectId}/work_packages`);
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao listar work packages:', error);
      return [];
    }
  }

  /**
   * Obtém um work package específico
   * @param {string} workPackageId - ID do work package
   * @returns {Promise<Object|null>}
   */
  async getWorkPackage(workPackageId = null) {
    const id = workPackageId || this.workPackageId;
    try {
      const response = await this.api.get(`/api/v3/work_packages/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter work package:', error);
      return null;
    }
  }

  /**
   * Cria um novo work package
   * @param {Object} workPackageData - Dados do work package
   * @returns {Promise<Object|null>}
   */
  async createWorkPackage(workPackageData) {
    try {
      const data = {
        subject: workPackageData.subject,
        description: {
          format: 'markdown',
          raw: workPackageData.description
        },
        _links: {
          type: {
            href: `/api/v3/types/${workPackageData.typeId || 1}` // User Story por padrão
          },
          project: {
            href: `/api/v3/projects/${this.projectId}`
          }
        }
      };

      const response = await this.api.post('/api/v3/work_packages', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar work package:', error);
      return null;
    }
  }

  /**
   * Atualiza um work package existente
   * @param {string} workPackageId - ID do work package
   * @param {Object} updates - Atualizações
   * @returns {Promise<Object|null>}
   */
  async updateWorkPackage(workPackageId, updates) {
    try {
      const response = await this.api.patch(`/api/v3/work_packages/${workPackageId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar work package:', error);
      return null;
    }
  }

  /**
   * Cria work package a partir de uma nota
   * @param {Object} note - Nota para converter
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object|null>}
   */
  async createWorkPackageFromNote(note, options = {}) {
    try {
      // Aplicar template
      const content = this.applyTemplate(note);
      
      const workPackageData = {
        subject: note.title || `Nota ${note.id}`,
        description: content,
        typeId: options.typeId || 1, // User Story por padrão
        ...options
      };

      return await this.createWorkPackage(workPackageData);
    } catch (error) {
      console.error('Erro ao criar work package a partir da nota:', error);
      return null;
    }
  }

  /**
   * Aplica template à nota
   * @param {Object} note - Nota
   * @returns {string}
   */
  applyTemplate(note) {
    let content = this.template;
    
    // Substituir variáveis do template
    content = content.replace(/\{\{title\}\}/g, note.title || '');
    content = content.replace(/\{\{content\}\}/g, note.content || '');
    content = content.replace(/\{\{id\}\}/g, note.id || '');
    content = content.replace(/\{\{created\}\}/g, note.createdAt ? note.createdAt.toISOString() : '');
    content = content.replace(/\{\{updated\}\}/g, note.updatedAt ? note.updatedAt.toISOString() : '');
    content = content.replace(/\{\{characters\}\}/g, note.characterCount || 0);
    content = content.replace(/\{\{lines\}\}/g, note.lineCount || 0);
    
    return content;
  }

  /**
   * Lista tipos de work package disponíveis
   * @returns {Promise<Array>}
   */
  async getWorkPackageTypes() {
    try {
      const response = await this.api.get('/api/v3/types');
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao listar tipos de work package:', error);
      return [];
    }
  }

  /**
   * Lista status disponíveis
   * @returns {Promise<Array>}
   */
  async getStatuses() {
    try {
      const response = await this.api.get('/api/v3/statuses');
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao listar status:', error);
      return [];
    }
  }

  /**
   * Lista prioridades disponíveis
   * @returns {Promise<Array>}
   */
  async getPriorities() {
    try {
      const response = await this.api.get('/api/v3/priorities');
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao listar prioridades:', error);
      return [];
    }
  }

  /**
   * Obtém usuários do projeto
   * @returns {Promise<Array>}
   */
  async getProjectUsers() {
    try {
      const response = await this.api.get(`/api/v3/projects/${this.projectId}/memberships`);
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao listar usuários do projeto:', error);
      return [];
    }
  }

  /**
   * Adiciona comentário a um work package
   * @param {string} workPackageId - ID do work package
   * @param {string} comment - Comentário
   * @returns {Promise<Object|null>}
   */
  async addComment(workPackageId, comment) {
    try {
      const data = {
        comment: {
          format: 'markdown',
          raw: comment
        }
      };

      const response = await this.api.post(`/api/v3/work_packages/${workPackageId}/activities`, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      return null;
    }
  }

  /**
   * Obtém atividades de um work package
   * @param {string} workPackageId - ID do work package
   * @returns {Promise<Array>}
   */
  async getActivities(workPackageId) {
    try {
      const response = await this.api.get(`/api/v3/work_packages/${workPackageId}/activities`);
      return response.data._embedded?.elements || [];
    } catch (error) {
      console.error('Erro ao obter atividades:', error);
      return [];
    }
  }

  /**
   * Sincroniza notas com work packages
   * @param {Array} notes - Notas para sincronizar
   * @returns {Promise<Object>}
   */
  async syncNotes(notes) {
    try {
      const result = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const note of notes) {
        try {
          // Verificar se já existe work package para esta nota
          const existingWP = await this.findWorkPackageByNote(note);
          
          if (existingWP) {
            // Atualizar work package existente
            const content = this.applyTemplate(note);
            await this.updateWorkPackage(existingWP.id, {
              subject: note.title,
              description: {
                format: 'markdown',
                raw: content
              }
            });
            result.updated++;
          } else {
            // Criar novo work package
            await this.createWorkPackageFromNote(note);
            result.created++;
          }
        } catch (error) {
          result.errors.push(`Erro ao sincronizar nota ${note.title}: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Busca work package por nota
   * @param {Object} note - Nota
   * @returns {Promise<Object|null>}
   */
  async findWorkPackageByNote(note) {
    try {
      const workPackages = await this.getWorkPackages();
      
      // Buscar por título ou ID da nota na descrição
      return workPackages.find(wp => 
        wp.subject === note.title || 
        wp.description?.raw?.includes(note.id)
      ) || null;
    } catch (error) {
      console.error('Erro ao buscar work package:', error);
      return null;
    }
  }

  /**
   * Valida template
   * @param {string} template - Template para validar
   * @returns {Object}
   */
  validateTemplate(template) {
    const result = {
      isValid: true,
      errors: [],
      variables: []
    };

    // Extrair variáveis do template
    const variableRegex = /\{\{(\w+)\}\}/g;
    let match;
    
    while ((match = variableRegex.exec(template)) !== null) {
      result.variables.push(match[1]);
    }

    // Verificar variáveis válidas
    const validVariables = ['title', 'content', 'id', 'created', 'updated', 'characters', 'lines'];
    const invalidVariables = result.variables.filter(v => !validVariables.includes(v));
    
    if (invalidVariables.length > 0) {
      result.isValid = false;
      result.errors.push(`Variáveis inválidas: ${invalidVariables.join(', ')}`);
    }

    return result;
  }
}

export default OpenProjectService;

