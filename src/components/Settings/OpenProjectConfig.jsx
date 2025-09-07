import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  TestTube, 
  Save, 
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { OpenProjectService } from '@/services/openprojectApi';
import Swal from 'sweetalert2';

export function OpenProjectConfig() {
  const { state, dispatch, actionTypes } = useApp();
  const [config, setConfig] = useState(state.settings.openproject);
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
      payload: { openproject: config }
    });

    Swal.fire({
      title: 'Sucesso!',
      text: 'Configurações do OpenProject salvas!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleTestConnection = async () => {
    if (!config.baseUrl || !config.token) {
      Swal.fire({
        title: 'Erro!',
        text: 'Preencha a URL base e o token',
        icon: 'error'
      });
      return;
    }

    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const openProjectService = new OpenProjectService(config);
      const isConnected = await openProjectService.testConnection();
      
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Conexão com OpenProject estabelecida com sucesso!',
          icon: 'success'
        });
      } else {
        Swal.fire({
          title: 'Erro!',
          text: 'Não foi possível conectar ao OpenProject. Verifique suas credenciais.',
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

  const handleTestTemplate = () => {
    const openProjectService = new OpenProjectService(config);
    const validation = openProjectService.validateTemplate(config.template);
    
    if (validation.isValid) {
      Swal.fire({
        title: 'Template válido!',
        text: `Variáveis encontradas: ${validation.variables.join(', ') || 'nenhuma'}`,
        icon: 'success'
      });
    } else {
      Swal.fire({
        title: 'Template inválido!',
        text: validation.errors.join('\n'),
        icon: 'error'
      });
    }
  };

  const handleSyncNotes = async () => {
    if (!config.baseUrl || !config.token || !config.projectId) {
      Swal.fire({
        title: 'Erro!',
        text: 'Configure o OpenProject primeiro',
        icon: 'error'
      });
      return;
    }

    const currentProject = state.projects.find(p => p.id === state.currentProjectId);
    if (!currentProject || currentProject.notes.length === 0) {
      Swal.fire({
        title: 'Nenhuma nota encontrada',
        text: 'Selecione um projeto com notas para sincronizar',
        icon: 'info'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Sincronizar notas',
      text: `Deseja criar work packages para ${currentProject.notes.length} nota(s) do projeto "${currentProject.name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, sincronizar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);

    try {
      const openProjectService = new OpenProjectService(config);
      const syncResult = await openProjectService.syncNotes(currentProject.notes);
      
      let message = `Sincronização concluída!\n`;
      message += `Criados: ${syncResult.created}\n`;
      message += `Atualizados: ${syncResult.updated}`;
      
      if (syncResult.errors.length > 0) {
        message += `\n\nErros:\n${syncResult.errors.join('\n')}`;
      }

      Swal.fire({
        title: 'Sincronização concluída!',
        text: message,
        icon: syncResult.errors.length > 0 ? 'warning' : 'success'
      });
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

  const defaultTemplate = `# {{title}}

## Informações da Nota
- **ID:** {{id}}
- **Criado em:** {{created}}
- **Atualizado em:** {{updated}}
- **Caracteres:** {{characters}}
- **Linhas:** {{lines}}

## Conteúdo

{{content}}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Configuração OpenProject</span>
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
          Configure a integração com OpenProject para criar work packages a partir das suas notas
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="op-baseurl">URL Base do OpenProject *</Label>
          <Input
            id="op-baseurl"
            placeholder="https://meu-openproject.com"
            value={config.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="op-project">ID do Projeto *</Label>
            <Input
              id="op-project"
              placeholder="1"
              value={config.projectId}
              onChange={(e) => handleConfigChange('projectId', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="op-workpackage">ID do Work Package Tipo</Label>
            <Input
              id="op-workpackage"
              placeholder="1"
              value={config.workPackageId}
              onChange={(e) => handleConfigChange('workPackageId', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              ID do tipo User Story (opcional)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="op-token">Token de API *</Label>
          <Input
            id="op-token"
            type="password"
            placeholder="seu-token-aqui"
            value={config.token}
            onChange={(e) => handleConfigChange('token', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Token de API do OpenProject (será usado como apikey:token em Base64)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="op-template">Template Markdown</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfig(prev => ({ ...prev, template: defaultTemplate }))}
            >
              Usar padrão
            </Button>
          </div>
          <Textarea
            id="op-template"
            rows={8}
            placeholder="Template para work packages..."
            value={config.template}
            onChange={(e) => handleConfigChange('template', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Variáveis disponíveis: {'{'}{'{'} title {'}'}{'}'}, {'{'}{'{'} content {'}'}{'}'}, {'{'}{'{'} id {'}'}{'}'}, {'{'}{'{'} created {'}'}{'}'}, {'{'}{'{'} updated {'}'}{'}'}, {'{'}{'{'} characters {'}'}{'}'}, {'{'}{'{'} lines {'}'}{'}'}
          </p>
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
            onClick={handleTestTemplate}
            className="flex items-center space-x-1"
          >
            <FileText className="h-4 w-4" />
            <span>Validar Template</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={handleSyncNotes}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>Sincronizar Notas</span>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Dica:</strong> Para obter o token de API:</p>
          <p>1. Faça login no OpenProject</p>
          <p>2. Vá em "Minha conta" → "Tokens de acesso"</p>
          <p>3. Clique em "Gerar" e copie o token</p>
          <p>4. O token será usado automaticamente no formato Basic Auth</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default OpenProjectConfig;

