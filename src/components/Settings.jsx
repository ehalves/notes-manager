import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Save, TestTube, Github, Settings as SettingsIcon, Palette, Link } from 'lucide-react'
import Swal from 'sweetalert2'
import githubApi from '../utils/githubApi'
import openProjectApi from '../utils/openProjectApi'

const Settings = ({ theme, setTheme }) => {
  const [githubConfig, setGithubConfig] = useState({
    owner: '',
    repo: '',
    token: '',
    autoSaveInterval: 30000,
    branch: 'main'
  })

  const [openProjectConfig, setOpenProjectConfig] = useState({
    baseUrl: '',
    projectId: '',
    workPackageTypeId: '',
    token: '',
    template: ''
  })

  const [themeConfig, setThemeConfig] = useState({
    theme: 'light',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  })

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = () => {
    // Carregar configuração do GitHub
    const savedGithubConfig = githubApi.config
    if (savedGithubConfig) {
      setGithubConfig(savedGithubConfig)
    }

    // Carregar configuração do OpenProject
    const savedOpenProjectConfig = openProjectApi.config
    if (savedOpenProjectConfig) {
      setOpenProjectConfig(savedOpenProjectConfig)
    }

    // Carregar configuração de tema
    const savedThemeConfig = localStorage.getItem('theme-config')
    if (savedThemeConfig) {
      const parsed = JSON.parse(savedThemeConfig)
      setThemeConfig(parsed)
    }
  }

  const saveGithubConfig = async () => {
    try {
      githubApi.saveConfig(githubConfig)
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Configurações do GitHub salvas com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao salvar configurações: ${error.message}`,
        icon: 'error'
      })
    }
  }

  const testGithubConnection = async () => {
    try {
      const result = await githubApi.testConnection()
      
      Swal.fire({
        title: 'Conexão bem-sucedida!',
        text: result.message,
        icon: 'success'
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro de conexão!',
        text: error.message,
        icon: 'error'
      })
    }
  }

  const saveOpenProjectConfig = async () => {
    try {
      openProjectApi.saveConfig(openProjectConfig)
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Configurações do OpenProject salvas com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao salvar configurações: ${error.message}`,
        icon: 'error'
      })
    }
  }

  const testOpenProjectConnection = async () => {
    try {
      const result = await openProjectApi.testConnection()
      
      Swal.fire({
        title: 'Conexão bem-sucedida!',
        text: result.message,
        icon: 'success'
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro de conexão!',
        text: error.message,
        icon: 'error'
      })
    }
  }

  const saveThemeConfig = () => {
    try {
      localStorage.setItem('theme-config', JSON.stringify(themeConfig))
      setTheme(themeConfig.theme)
      
      // Aplicar cores personalizadas
      const root = document.documentElement
      root.style.setProperty('--primary-color', themeConfig.primaryColor)
      root.style.setProperty('--secondary-color', themeConfig.secondaryColor)
      root.style.setProperty('--accent-color', themeConfig.accentColor)
      root.style.setProperty('--background-color', themeConfig.backgroundColor)
      root.style.setProperty('--text-color', themeConfig.textColor)
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Configurações de tema salvas com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao salvar tema: ${error.message}`,
        icon: 'error'
      })
    }
  }

  const resetToDefaults = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação irá resetar todas as configurações para os valores padrão!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, resetar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset GitHub config
        setGithubConfig({
          owner: '',
          repo: '',
          token: '',
          autoSaveInterval: 30000,
          branch: 'main'
        })

        // Reset OpenProject config
        setOpenProjectConfig({
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
        })

        // Reset theme config
        setThemeConfig({
          theme: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#10b981',
          backgroundColor: '#ffffff',
          textColor: '#1f2937'
        })

        // Clear localStorage
        localStorage.removeItem('github-config')
        localStorage.removeItem('openproject-config')
        localStorage.removeItem('theme-config')

        Swal.fire({
          title: 'Resetado!',
          text: 'Todas as configurações foram resetadas.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      }
    })
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">
          <SettingsIcon className="w-6 h-6 mr-2" />
          Configurações
        </h1>
        <Button onClick={resetToDefaults} variant="outline" size="sm">
          Resetar Tudo
        </Button>
      </div>

      <Tabs defaultValue="github" className="settings-tabs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="github">
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="openproject">
            <Link className="w-4 h-4 mr-2" />
            OpenProject
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Tema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do GitHub</CardTitle>
              <CardDescription>
                Configure a integração com o GitHub para salvamento automático das notas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github-owner">Proprietário (Owner)</Label>
                  <Input
                    id="github-owner"
                    value={githubConfig.owner}
                    onChange={(e) => setGithubConfig({...githubConfig, owner: e.target.value})}
                    placeholder="seu-usuario"
                  />
                </div>
                <div>
                  <Label htmlFor="github-repo">Repositório</Label>
                  <Input
                    id="github-repo"
                    value={githubConfig.repo}
                    onChange={(e) => setGithubConfig({...githubConfig, repo: e.target.value})}
                    placeholder="nome-do-repositorio"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="github-token">Token de Acesso Pessoal</Label>
                <Input
                  id="github-token"
                  type="password"
                  value={githubConfig.token}
                  onChange={(e) => setGithubConfig({...githubConfig, token: e.target.value})}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github-branch">Branch</Label>
                  <Input
                    id="github-branch"
                    value={githubConfig.branch}
                    onChange={(e) => setGithubConfig({...githubConfig, branch: e.target.value})}
                    placeholder="main"
                  />
                </div>
                <div>
                  <Label htmlFor="github-interval">Intervalo de Auto-save (ms)</Label>
                  <Input
                    id="github-interval"
                    type="number"
                    value={githubConfig.autoSaveInterval}
                    onChange={(e) => setGithubConfig({...githubConfig, autoSaveInterval: parseInt(e.target.value)})}
                    placeholder="30000"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveGithubConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={testGithubConnection} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openproject">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do OpenProject</CardTitle>
              <CardDescription>
                Configure a integração com o OpenProject para criação de work packages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="op-url">URL Base do OpenProject</Label>
                <Input
                  id="op-url"
                  value={openProjectConfig.baseUrl}
                  onChange={(e) => setOpenProjectConfig({...openProjectConfig, baseUrl: e.target.value})}
                  placeholder="https://seu-openproject.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="op-project">ID do Projeto</Label>
                  <Input
                    id="op-project"
                    value={openProjectConfig.projectId}
                    onChange={(e) => setOpenProjectConfig({...openProjectConfig, projectId: e.target.value})}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="op-workpackage">ID do Tipo de Work Package</Label>
                  <Input
                    id="op-workpackage"
                    value={openProjectConfig.workPackageTypeId}
                    onChange={(e) => setOpenProjectConfig({...openProjectConfig, workPackageTypeId: e.target.value})}
                    placeholder="1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="op-token">Token de API</Label>
                <Input
                  id="op-token"
                  type="password"
                  value={openProjectConfig.token}
                  onChange={(e) => setOpenProjectConfig({...openProjectConfig, token: e.target.value})}
                  placeholder="seu-token-aqui"
                />
              </div>

              <div>
                <Label htmlFor="op-template">Template Markdown</Label>
                <Textarea
                  id="op-template"
                  value={openProjectConfig.template}
                  onChange={(e) => setOpenProjectConfig({...openProjectConfig, template: e.target.value})}
                  placeholder="Template para criação de work packages..."
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveOpenProjectConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button onClick={testOpenProjectConnection} variant="outline">
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Tema</CardTitle>
              <CardDescription>
                Personalize a aparência da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme-select">Tema</Label>
                <Select value={themeConfig.theme} onValueChange={(value) => setThemeConfig({...themeConfig, theme: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig({...themeConfig, primaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeConfig.primaryColor}
                      onChange={(e) => setThemeConfig({...themeConfig, primaryColor: e.target.value})}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={themeConfig.secondaryColor}
                      onChange={(e) => setThemeConfig({...themeConfig, secondaryColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeConfig.secondaryColor}
                      onChange={(e) => setThemeConfig({...themeConfig, secondaryColor: e.target.value})}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={themeConfig.accentColor}
                      onChange={(e) => setThemeConfig({...themeConfig, accentColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeConfig.accentColor}
                      onChange={(e) => setThemeConfig({...themeConfig, accentColor: e.target.value})}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="background-color">Cor de Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background-color"
                      type="color"
                      value={themeConfig.backgroundColor}
                      onChange={(e) => setThemeConfig({...themeConfig, backgroundColor: e.target.value})}
                      className="w-16 h-10"
                    />
                    <Input
                      value={themeConfig.backgroundColor}
                      onChange={(e) => setThemeConfig({...themeConfig, backgroundColor: e.target.value})}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="text-color">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="text-color"
                    type="color"
                    value={themeConfig.textColor}
                    onChange={(e) => setThemeConfig({...themeConfig, textColor: e.target.value})}
                    className="w-16 h-10"
                  />
                  <Input
                    value={themeConfig.textColor}
                    onChange={(e) => setThemeConfig({...themeConfig, textColor: e.target.value})}
                    placeholder="#1f2937"
                  />
                </div>
              </div>

              <Button onClick={saveThemeConfig}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Tema
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings

