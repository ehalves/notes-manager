import axios from 'axios'

class OpenProjectAPI {
  constructor() {
    this.config = this.loadConfig()
    this.client = null
    this.setupClient()
  }

  loadConfig() {
    const config = localStorage.getItem('openproject-config')
    return config ? JSON.parse(config) : {
      baseUrl: '',
      projectId: '',
      workPackageTypeId: '',
      token: '',
      template: `# {{title}}

## Descrição
{{description}}

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2

## Notas Técnicas
{{technicalNotes}}

## Anexos
{{attachments}}`
    }
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config }
    localStorage.setItem('openproject-config', JSON.stringify(this.config))
    this.setupClient()
  }

  setupClient() {
    if (this.config.baseUrl && this.config.token) {
      // Criar credenciais Basic Auth com "apikey" como usuário
      const credentials = btoa(`apikey:${this.config.token}`)
      
      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
  }

  isConfigured() {
    return this.config.baseUrl && this.config.projectId && this.config.workPackageTypeId && this.config.token
  }

  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error('Configuração do OpenProject incompleta')
    }

    try {
      const response = await this.client.get(`/api/v3/projects/${this.config.projectId}`)
      
      return {
        success: true,
        message: `Conectado ao projeto: ${response.data.name}`,
        project: response.data
      }
    } catch (error) {
      throw new Error(`Erro ao conectar: ${error.response?.data?.message || error.message}`)
    }
  }

  async getWorkPackageTypes() {
    if (!this.client) {
      throw new Error('Cliente não configurado')
    }

    try {
      const response = await this.client.get('/api/v3/types')
      return response.data._embedded.elements
    } catch (error) {
      throw new Error(`Erro ao buscar tipos de work package: ${error.response?.data?.message || error.message}`)
    }
  }

  async getProjectInfo() {
    if (!this.client || !this.config.projectId) {
      throw new Error('Configuração incompleta')
    }

    try {
      const response = await this.client.get(`/api/v3/projects/${this.config.projectId}`)
      return response.data
    } catch (error) {
      throw new Error(`Erro ao buscar informações do projeto: ${error.response?.data?.message || error.message}`)
    }
  }

  async createWorkPackage(data) {
    if (!this.isConfigured()) {
      throw new Error('Configuração do OpenProject incompleta')
    }

    try {
      // Primeiro, obter o formulário para criação
      const formResponse = await this.client.post(`/api/v3/projects/${this.config.projectId}/work_packages/form`, {
        type: {
          href: `/api/v3/types/${this.config.workPackageTypeId}`
        }
      })

      // Preparar o conteúdo usando o template
      const content = this.processTemplate(data)

      // Criar o work package
      const workPackageData = {
        subject: data.title || 'Nova User Story',
        description: {
          format: 'markdown',
          raw: content
        },
        type: {
          href: `/api/v3/types/${this.config.workPackageTypeId}`
        }
      }

      const response = await this.client.post(
        `/api/v3/projects/${this.config.projectId}/work_packages`,
        workPackageData
      )

      return {
        success: true,
        message: 'Work package criado com sucesso',
        workPackage: response.data,
        url: `${this.config.baseUrl}/work_packages/${response.data.id}`
      }
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data)
      throw new Error(`Erro ao criar work package: ${error.response?.data?.message || error.message}`)
    }
  }

  processTemplate(data) {
    let content = this.config.template

    // Substituir variáveis do template
    const replacements = {
      '{{title}}': data.title || 'Sem título',
      '{{description}}': data.description || 'Sem descrição',
      '{{technicalNotes}}': data.technicalNotes || 'Nenhuma nota técnica',
      '{{attachments}}': data.attachments || 'Nenhum anexo',
      '{{content}}': data.content || '',
      '{{date}}': new Date().toLocaleDateString('pt-BR'),
      '{{time}}': new Date().toLocaleTimeString('pt-BR')
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      content = content.replace(new RegExp(placeholder, 'g'), value)
    })

    return content
  }

  async updateWorkPackage(workPackageId, data) {
    if (!this.isConfigured()) {
      throw new Error('Configuração do OpenProject incompleta')
    }

    try {
      const content = this.processTemplate(data)

      const updateData = {
        subject: data.title,
        description: {
          format: 'markdown',
          raw: content
        }
      }

      const response = await this.client.patch(`/api/v3/work_packages/${workPackageId}`, updateData)

      return {
        success: true,
        message: 'Work package atualizado com sucesso',
        workPackage: response.data
      }
    } catch (error) {
      throw new Error(`Erro ao atualizar work package: ${error.response?.data?.message || error.message}`)
    }
  }

  async getWorkPackage(workPackageId) {
    if (!this.client) {
      throw new Error('Cliente não configurado')
    }

    try {
      const response = await this.client.get(`/api/v3/work_packages/${workPackageId}`)
      return response.data
    } catch (error) {
      throw new Error(`Erro ao buscar work package: ${error.response?.data?.message || error.message}`)
    }
  }

  async searchWorkPackages(query) {
    if (!this.client || !this.config.projectId) {
      throw new Error('Configuração incompleta')
    }

    try {
      const filters = [
        {
          project: {
            operator: '=',
            values: [this.config.projectId]
          }
        }
      ]

      if (query) {
        filters.push({
          subjectOrId: {
            operator: '**',
            values: [query]
          }
        })
      }

      const response = await this.client.get('/api/v3/work_packages', {
        params: {
          filters: JSON.stringify(filters)
        }
      })

      return response.data._embedded.elements
    } catch (error) {
      throw new Error(`Erro ao buscar work packages: ${error.response?.data?.message || error.message}`)
    }
  }

  generateWorkPackageUrl(workPackageId) {
    return `${this.config.baseUrl}/work_packages/${workPackageId}`
  }
}

export default new OpenProjectAPI()

