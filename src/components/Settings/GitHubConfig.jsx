import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  TestTube, 
  Save, 
  Upload, 
  Download,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { GitHubService } from '@/services/githubApi';
import Swal from 'sweetalert2';

export function GitHubConfig() {
  const { state, dispatch, actionTypes } = useApp();
  const [config, setConfig] = useState(state.settings.github);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    dispatch({
      type: actionTypes.UPDATE_SETTINGS,
      payload: { github: config }
    });

    Swal.fire({
      title: 'Sucesso!',
      text: 'Configurações do GitHub salvas!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleTestConnection = async () => {
    if (!config.owner || !config.repository || !config.token) {
      Swal.fire({
        title: 'Erro!',
        text: 'Preencha todos os campos obrigatórios',
        icon: 'error'
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const githubService = new GitHubService(config);
      const isConnected = await githubService.testConnection();
      
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Conexão com GitHub estabelecida com sucesso!',
          icon: 'success'
        });
      } else {
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível conectar ao GitHub. Verifique suas credenciais.',
          icon: 'error'
        });
      }
    } catch (error) {
      setConnectionStatus(false);
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao testar conexão: ${error.message}`,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (direction) => {
    if (!config.owner || !config.repository || !config.token) {
      Swal.fire({
        title: 'Erro!',
        text: 'Configure o GitHub primeiro',
        icon: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      const githubService = new GitHubService(config);
      
      if (direction === 'upload') {
        // Upload dos projetos locais
        let uploaded = 0;
        for (const project of state.projects) {
          const success = await githubService.saveProject(project);
          if (success) uploaded++;
        }

        Swal.fire({
          title: 'Sucesso!',
          text: `${uploaded} projeto(s) enviado(s) para o GitHub!`,
          icon: 'success'
        });
      } else {
        // Download dos projetos do GitHub
        const projects = await githubService.listProjects();
        
        if (projects.length > 0) {
          const result = await Swal.fire({
            title: 'Projetos encontrados',
            text: `Encontrados ${projects.length} projeto(s) no GitHub. Deseja importá-los?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, importar',
            cancelButtonText: 'Cancelar'
          });

          if (result.isConfirmed) {
            // Carregar projetos completos
            const fullProjects = [];
            for (const project of projects) {
              const fullProject = await githubService.loadProject(project.name);
              if (fullProject) {
                fullProjects.push(fullProject);
              }
            }

            // Atualizar estado com projetos importados
            dispatch({
              type: actionTypes.LOAD_DATA,
              payload: {
                ...state,
                projects: fullProjects
              }
            });

            Swal.fire({
              title: 'Sucesso!',
              text: `${fullProjects.length} projeto(s) importado(s) do GitHub!`,
              icon: 'success'
            });
          }
        } else {
          Swal.fire({
            title: 'Nenhum projeto encontrado',
            text: 'Não foram encontrados projetos no GitHub',
            icon: 'info'
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro na sincronização: ${error.message}`,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Github className="h-5 w-5" />
          <span>Configuração GitHub</span>
          {connectionStatus !== null && (
            <Badge variant={connectionStatus ? 'default' : 'destructive'}>
              {connectionStatus ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {connectionStatus ? 'Conectado' : 'Desconectado'}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure a integração com GitHub para salvamento automático das suas notas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="github-owner">Proprietário *</Label>
            <Input
              id="github-owner"
              placeholder="seu-usuario"
              value={config.owner}
              onChange={(e) => handleConfigChange('owner', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github-repo">Repositório *</Label>
            <Input
              id="github-repo"
              placeholder="meu-repositorio"
              value={config.repository}
              onChange={(e) => handleConfigChange('repository', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-token">Token de Acesso *</Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            value={config.token}
            onChange={(e) => handleConfigChange('token', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Crie um Personal Access Token no GitHub com permissões de repositório
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github-interval">Intervalo de Salvamento (minutos)</Label>
          <Input
            id="github-interval"
            type="number"
            min="1"
            max="60"
            value={config.autoSaveInterval}
            onChange={(e) => handleConfigChange('autoSaveInterval', parseInt(e.target.value) || 5)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} className="flex items-center space-x-1">
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            <span>Testar Conexão</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleSync('upload')}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Enviar para GitHub</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => handleSync('download')}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Baixar do GitHub</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Dica:</strong> Para criar um token:</p>
          <p>1. Vá em GitHub → Settings → Developer settings → Personal access tokens</p>
          <p>2. Clique em "Generate new token"</p>
          <p>3. Selecione as permissões: repo (Full control of private repositories)</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GitHubConfig;

