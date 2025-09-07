import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ProjectTree() {
  const { 
    state, 
    dispatch, 
    actionTypes, 
    createNote, 
    getCurrentProject, 
    getCurrentNote 
  } = useApp();
  
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const selectProject = (projectId) => {
    dispatch({ type: actionTypes.SET_CURRENT_PROJECT, payload: projectId });
    // Expandir automaticamente o projeto selecionado
    setExpandedProjects(prev => new Set([...prev, projectId]));
  };

  const selectNote = (noteId) => {
    dispatch({ type: actionTypes.SET_CURRENT_NOTE, payload: noteId });
  };

  const handleNewNote = (projectId, e) => {
    e.stopPropagation();
    const note = createNote(projectId);
    dispatch({ type: actionTypes.SET_CURRENT_NOTE, payload: note.id });
    dispatch({ type: actionTypes.SET_CURRENT_PROJECT, payload: projectId });
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto e todas as suas notas?')) {
      dispatch({ type: actionTypes.DELETE_PROJECT, payload: projectId });
    }
  };

  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      dispatch({ type: actionTypes.DELETE_NOTE, payload: noteId });
    }
  };

  const formatNoteTitle = (note) => {
    if (note.title && note.title.trim()) {
      return note.title;
    }
    return format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (state.projects.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum projeto criado</p>
        <p className="text-xs mt-1">Clique em "Novo Projeto" para começar</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1">
      {state.projects.map((project) => {
        const isExpanded = expandedProjects.has(project.id);
        const isSelected = state.currentProjectId === project.id;
        
        return (
          <div key={project.id} className="space-y-1">
            {/* Projeto */}
            <div
              className={`flex items-center space-x-1 p-2 rounded-md cursor-pointer hover:bg-accent group ${
                isSelected ? 'bg-accent' : ''
              }`}
              onClick={() => selectProject(project.id)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProject(project.id);
                }}
              >
                {project.notes.length > 0 && (
                  isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )
                )}
              </Button>
              
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )}
              
              <span className="flex-1 text-sm font-medium truncate">
                {project.name}
              </span>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => handleNewNote(project.id, e)}
                  title="Nova nota"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  title="Excluir projeto"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Notas do projeto */}
            {isExpanded && project.notes.length > 0 && (
              <div className="ml-6 space-y-1">
                {project.notes.map((note) => {
                  const isNoteSelected = state.currentNoteId === note.id;
                  
                  return (
                    <div
                      key={note.id}
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent group ${
                        isNoteSelected ? 'bg-accent' : ''
                      }`}
                      onClick={() => selectNote(note.id)}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      
                      <span className="flex-1 text-sm truncate">
                        {formatNoteTitle(note)}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        title="Excluir nota"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mensagem quando projeto não tem notas */}
            {isExpanded && project.notes.length === 0 && (
              <div className="ml-6 p-2 text-xs text-muted-foreground">
                Nenhuma nota neste projeto
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProjectTree;

