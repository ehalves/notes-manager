import { Octokit } from '@octokit/rest'

class GitHubAPI {
  constructor() {
    this.octokit = null
    this.config = this.loadConfig()
  }

  loadConfig() {
    const config = localStorage.getItem('github-config')
    return config ? JSON.parse(config) : {
      owner: '',
      repo: '',
      token: '',
      autoSaveInterval: 30000, // 30 segundos
      branch: 'main'
    }
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config }
    localStorage.setItem('github-config', JSON.stringify(this.config))
    
    if (this.config.token) {
      this.octokit = new Octokit({
        auth: this.config.token
      })
    }
  }

  isConfigured() {
    return this.config.owner && this.config.repo && this.config.token
  }

  async testConnection() {
    if (!this.isConfigured()) {
      throw new Error('Configuração do GitHub incompleta')
    }

    try {
      if (!this.octokit) {
        this.octokit = new Octokit({
          auth: this.config.token
        })
      }

      const { data } = await this.octokit.rest.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      })

      return {
        success: true,
        message: `Conectado ao repositório ${data.full_name}`,
        repo: data
      }
    } catch (error) {
      throw new Error(`Erro ao conectar: ${error.message}`)
    }
  }

  async getFileContent(path) {
    if (!this.isConfigured()) {
      throw new Error('Configuração do GitHub incompleta')
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: path,
        ref: this.config.branch
      })

      if (data.type === 'file') {
        return {
          content: atob(data.content),
          sha: data.sha
        }
      }
      
      throw new Error('Caminho não é um arquivo')
    } catch (error) {
      if (error.status === 404) {
        return null // Arquivo não existe
      }
      throw error
    }
  }

  async saveFile(path, content, message = 'Atualização automática via Notes Manager') {
    if (!this.isConfigured()) {
      throw new Error('Configuração do GitHub incompleta')
    }

    try {
      // Primeiro, tenta obter o arquivo existente para pegar o SHA
      const existingFile = await this.getFileContent(path)
      
      const params = {
        owner: this.config.owner,
        repo: this.config.repo,
        path: path,
        message: message,
        content: btoa(unescape(encodeURIComponent(content))), // Codifica em Base64
        branch: this.config.branch
      }

      // Se o arquivo existe, inclui o SHA para atualização
      if (existingFile) {
        params.sha = existingFile.sha
      }

      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents(params)
      
      return {
        success: true,
        message: existingFile ? 'Arquivo atualizado' : 'Arquivo criado',
        commit: data.commit
      }
    } catch (error) {
      throw new Error(`Erro ao salvar arquivo: ${error.message}`)
    }
  }

  async deleteFile(path, message = 'Arquivo deletado via Notes Manager') {
    if (!this.isConfigured()) {
      throw new Error('Configuração do GitHub incompleta')
    }

    try {
      const existingFile = await this.getFileContent(path)
      
      if (!existingFile) {
        throw new Error('Arquivo não encontrado')
      }

      const { data } = await this.octokit.rest.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: path,
        message: message,
        sha: existingFile.sha,
        branch: this.config.branch
      })

      return {
        success: true,
        message: 'Arquivo deletado',
        commit: data.commit
      }
    } catch (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`)
    }
  }

  async saveProject(project) {
    const path = `projects/${project.id}.json`
    const content = JSON.stringify(project, null, 2)
    const message = `Atualização do projeto: ${project.name}`
    
    return await this.saveFile(path, content, message)
  }

  async saveNote(note, projectName) {
    const path = `notes/${note.projectId}/${note.id}.html`
    const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${note.title}</title>
    <meta name="project" content="${projectName}">
    <meta name="created" content="${note.createdAt}">
    <meta name="updated" content="${note.updatedAt}">
</head>
<body>
    <h1>${note.title}</h1>
    ${note.content}
</body>
</html>`
    
    const message = `Atualização da nota: ${note.title}`
    
    return await this.saveFile(path, content, message)
  }

  async loadProjects() {
    if (!this.isConfigured()) {
      return []
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: 'projects',
        ref: this.config.branch
      })

      const projects = []
      
      for (const file of data) {
        if (file.type === 'file' && file.name.endsWith('.json')) {
          try {
            const content = await this.getFileContent(file.path)
            if (content) {
              const project = JSON.parse(content.content)
              projects.push(project)
            }
          } catch (error) {
            console.warn(`Erro ao carregar projeto ${file.name}:`, error)
          }
        }
      }

      return projects
    } catch (error) {
      if (error.status === 404) {
        return [] // Pasta projects não existe ainda
      }
      throw error
    }
  }

  generateFilePath(note, project) {
    const sanitizeName = (name) => {
      return name.replace(/[^a-zA-Z0-9\-_]/g, '_').toLowerCase()
    }
    
    const projectName = sanitizeName(project.name)
    const noteName = sanitizeName(note.title)
    
    return `notes/${projectName}/${noteName}_${note.id}.html`
  }
}

export default new GitHubAPI()

