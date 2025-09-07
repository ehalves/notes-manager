import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Folder, FileText, Settings, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

const Sidebar = ({ 
  projects, 
  setProjects, 
  currentProject, 
  setCurrentProject, 
  currentNote, 
  setCurrentNote 
}) => {
  const [expandedProjects, setExpandedProjects] = useState(new Set())

  const createProject = async () => {
    const { value: projectName } = await Swal.fire({
      title: 'Novo Projeto',
      input: 'text',
      inputLabel: 'Nome do projeto',
      inputPlaceholder: 'Digite o nome do projeto',
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa digitar um nome!'
        }
      }
    })

    if (projectName) {
      const newProject = {
        id: Date.now().toString(),
        name: projectName,
        notes: [],
        createdAt: new Date().toISOString()
      }
      
      const updatedProjects = [...projects, newProject]
      setProjects(updatedProjects)
      localStorage.setItem('notes-manager-projects', JSON.stringify(updatedProjects))
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Projeto criado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  const createNote = async (projectId) => {
    const { value: noteTitle } = await Swal.fire({
      title: 'Nova Nota',
      input: 'text',
      inputLabel: 'Título da nota (opcional)',
      inputPlaceholder: 'Digite o título da nota',
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar'
    })

    const now = new Date()
    const defaultTitle = noteTitle || `Nota ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    
    const newNote = {
      id: Date.now().toString(),
      title: defaultTitle,
      content: '',
      projectId: projectId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      characterCount: 0,
      lineCount: 1,
      fileSize: 0
    }

    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          notes: [...project.notes, newNote]
        }
      }
      return project
    })

    setProjects(updatedProjects)
    localStorage.setItem('notes-manager-projects', JSON.stringify(updatedProjects))
    setCurrentNote(newNote)
    setCurrentProject(updatedProjects.find(p => p.id === projectId))
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Nota criada com sucesso!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
  }

  const deleteProject = async (projectId) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação irá deletar o projeto e todas as suas notas!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      const updatedProjects = projects.filter(p => p.id !== projectId)
      setProjects(updatedProjects)
      localStorage.setItem('notes-manager-projects', JSON.stringify(updatedProjects))
      
      if (currentProject?.id === projectId) {
        setCurrentProject(null)
        setCurrentNote(null)
      }
      
      Swal.fire({
        title: 'Deletado!',
        text: 'Projeto deletado com sucesso.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  const deleteNote = async (noteId, projectId) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação irá deletar a nota permanentemente!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            notes: project.notes.filter(note => note.id !== noteId)
          }
        }
        return project
      })

      setProjects(updatedProjects)
      localStorage.setItem('notes-manager-projects', JSON.stringify(updatedProjects))
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null)
      }
      
      Swal.fire({
        title: 'Deletado!',
        text: 'Nota deletada com sucesso.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      })
    }
  }

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const selectNote = (note, project) => {
    setCurrentNote(note)
    setCurrentProject(project)
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes Manager</h1>
        <Button onClick={createProject} size="sm" className="create-project-btn">
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="sidebar-content">
        {projects.map(project => (
          <div key={project.id} className="project-item">
            <div className="project-header">
              <button 
                className="project-toggle"
                onClick={() => toggleProject(project.id)}
              >
                <Folder className="w-4 h-4 mr-2" />
                <span className="project-name">{project.name}</span>
              </button>
              <div className="project-actions">
                <button 
                  className="action-btn"
                  onClick={() => createNote(project.id)}
                  title="Nova nota"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => deleteProject(project.id)}
                  title="Deletar projeto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {expandedProjects.has(project.id) && (
              <div className="notes-list">
                {project.notes.map(note => (
                  <div 
                    key={note.id} 
                    className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
                    onClick={() => selectNote(note, project)}
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    <span className="note-title">{note.title}</span>
                    <button 
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id, project.id)
                      }}
                      title="Deletar nota"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Link to="/settings" className="settings-link">
          <Settings className="w-4 h-4 mr-2" />
          Configurações
        </Link>
      </div>
    </div>
  )
}

export default Sidebar

