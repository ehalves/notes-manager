import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StorageService } from '@/services/storageService';

// Estado inicial da aplicação
const initialState = {
  projects: [],
  currentProjectId: null,
  currentNoteId: null,
  settings: {
    github: {
      owner: '',
      repository: '',
      token: '',
      autoSaveInterval: 5 // minutos
    },
    openproject: {
      projectId: '',
      workPackageId: '',
      token: '',
      template: '# {{title}}\n\n{{content}}',
      baseUrl: ''
    },
    theme: {
      mode: 'light',
      primaryColor: '#000000',
      secondaryColor: '#666666'
    }
  },
  isLoading: false,
  error: null
};

// Ações do reducer
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_DATA: 'LOAD_DATA',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_CURRENT_PROJECT: 'SET_CURRENT_PROJECT',
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  SET_CURRENT_NOTE: 'SET_CURRENT_NOTE',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_THEME: 'SET_THEME'
};

// Reducer para gerenciar o estado
function appReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case actionTypes.LOAD_DATA:
      return { ...state, ...action.payload };
    
    case actionTypes.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    
    case actionTypes.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };
    
    case actionTypes.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        currentProjectId: state.currentProjectId === action.payload ? null : state.currentProjectId,
        currentNoteId: null
      };
    
    case actionTypes.SET_CURRENT_PROJECT:
      return {
        ...state,
        currentProjectId: action.payload,
        currentNoteId: null
      };
    
    case actionTypes.ADD_NOTE:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, notes: [...project.notes, action.payload] }
            : project
        )
      };
    
    case actionTypes.UPDATE_NOTE:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                notes: project.notes.map(note =>
                  note.id === action.payload.id ? action.payload : note
                )
              }
            : project
        )
      };
    
    case actionTypes.DELETE_NOTE:
      return {
        ...state,
        projects: state.projects.map(project => ({
          ...project,
          notes: project.notes.filter(note => note.id !== action.payload)
        })),
        currentNoteId: state.currentNoteId === action.payload ? null : state.currentNoteId
      };
    
    case actionTypes.SET_CURRENT_NOTE:
      return { ...state, currentNoteId: action.payload };
    
    case actionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case actionTypes.SET_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: { ...state.settings.theme, ...action.payload }
        }
      };
    
    default:
      return state;
  }
}

// Contexto
const AppContext = createContext();

// Provider do contexto
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = StorageService.loadData();
    if (savedData) {
      dispatch({ type: actionTypes.LOAD_DATA, payload: savedData });
    }
  }, []);

  // Salvar dados no localStorage sempre que o estado mudar
  useEffect(() => {
    // Não salvar no primeiro render (dados vazios)
    if (state.projects.length > 0 || StorageService.hasData()) {
      StorageService.saveData(state);
      
      // Criar backup a cada 10 mudanças (aproximadamente)
      if (Math.random() < 0.1) {
        StorageService.createBackup(state);
      }
    }
  }, [state]);

  // Aplicar tema
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme.mode]);

  // Funções auxiliares
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const getCurrentProject = () => {
    return state.projects.find(p => p.id === state.currentProjectId);
  };

  const getCurrentNote = () => {
    const project = getCurrentProject();
    return project?.notes.find(n => n.id === state.currentNoteId);
  };

  const createProject = (name, description = '') => {
    const newProject = {
      id: generateId(),
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };
    dispatch({ type: actionTypes.ADD_PROJECT, payload: newProject });
    return newProject;
  };

  const createNote = (projectId, title = '', content = '') => {
    const now = new Date();
    const noteTitle = title || format(now, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    
    const newNote = {
      id: generateId(),
      projectId,
      title: noteTitle,
      content,
      createdAt: now,
      updatedAt: now,
      lastSaved: null,
      characterCount: content.length,
      lineCount: content.split('\n').length,
      fileSize: new Blob([content]).size
    };
    
    dispatch({ type: actionTypes.ADD_NOTE, payload: newNote });
    dispatch({ type: actionTypes.SET_CURRENT_NOTE, payload: newNote.id });
    return newNote;
  };

  const updateNote = (noteId, updates) => {
    const currentNote = getCurrentNote();
    if (!currentNote) return;

    const updatedNote = {
      ...currentNote,
      ...updates,
      updatedAt: new Date(),
      characterCount: updates.content ? updates.content.length : currentNote.characterCount,
      lineCount: updates.content ? updates.content.split('\n').length : currentNote.lineCount,
      fileSize: updates.content ? new Blob([updates.content]).size : currentNote.fileSize
    };

    dispatch({ type: actionTypes.UPDATE_NOTE, payload: updatedNote });
    return updatedNote;
  };

  const exportData = () => {
    return StorageService.exportData(state);
  };

  const importData = async (file) => {
    const data = await StorageService.importData(file);
    if (data) {
      dispatch({ type: actionTypes.LOAD_DATA, payload: data });
      return true;
    }
    return false;
  };

  const clearAllData = () => {
    StorageService.clearData();
    dispatch({ type: actionTypes.LOAD_DATA, payload: initialState });
  };

  const value = {
    state,
    dispatch,
    actionTypes,
    getCurrentProject,
    getCurrentNote,
    createProject,
    createNote,
    updateNote,
    generateId,
    exportData,
    importData,
    clearAllData
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook para usar o contexto
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

export default AppContext;

