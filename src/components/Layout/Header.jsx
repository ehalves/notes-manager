import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Moon, 
  Sun, 
  Save, 
  FileText,
  FolderPlus,
  Plus
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { SettingsModal } from '@/components/Settings/SettingsModal';
import Swal from 'sweetalert2';

export function Header() {
  const { state, dispatch, actionTypes, createProject, createNote } = useApp();
  const { settings } = state;
  const [showSettings, setShowSettings] = useState(false);

  const toggleTheme = () => {
    const newMode = settings.theme.mode === 'light' ? 'dark' : 'light';
    dispatch({
      type: actionTypes.SET_THEME,
      payload: { mode: newMode }
    });
  };

  const handleNewProject = async () => {
    const { value: name } = await Swal.fire({
      title: 'Novo Projeto',
      input: 'text',
      inputLabel: 'Nome do projeto',
      inputPlaceholder: 'Digite o nome do projeto...',
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa digitar um nome!';
        }
      }
    });

    if (name) {
      const project = createProject(name);
      dispatch({ type: actionTypes.SET_CURRENT_PROJECT, payload: project.id });
      
      Swal.fire({
        title: 'Sucesso!',
        text: `Projeto "${name}" criado com sucesso!`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  const handleNewNote = () => {
    if (!state.currentProjectId) {
      Swal.fire({
        title: 'Atenção!',
        text: 'Selecione um projeto primeiro',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const note = createNote(state.currentProjectId);
    dispatch({ type: actionTypes.SET_CURRENT_NOTE, payload: note.id });
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Nova nota criada!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSave = () => {
    // TODO: Implementar salvamento manual
    Swal.fire({
      title: 'Salvamento',
      text: 'Dados salvos automaticamente no localStorage',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <>
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-4">
          {/* Logo e título */}
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Notepad Web</h1>
          </div>

          {/* Ações centrais */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewProject}
              className="flex items-center space-x-1"
            >
              <FolderPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Projeto</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewNote}
              disabled={!state.currentProjectId}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Nota</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className="flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Salvar</span>
            </Button>
          </div>

          {/* Controles de tema e configurações */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {settings.theme.mode === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}

export default Header;

