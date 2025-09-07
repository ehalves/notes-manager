import { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Button } from '@/components/ui/button'
import { Save, Upload, Download } from 'lucide-react'
import Swal from 'sweetalert2'

const NoteEditor = ({ 
  currentNote, 
  setCurrentNote, 
  currentProject, 
  projects, 
  setProjects 
}) => {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [stats, setStats] = useState({
    characters: 0,
    lines: 1,
    fileSize: 0,
    lastSaved: null
  })
  const quillRef = useRef(null)

  // Configuração do Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  }

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image', 'code-block'
  ]

  // Carregar nota atual
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content || '')
      setTitle(currentNote.title || '')
      updateStats(currentNote.content || '')
    } else {
      setContent('')
      setTitle('')
      setStats({
        characters: 0,
        lines: 1,
        fileSize: 0,
        lastSaved: null
      })
    }
  }, [currentNote])

  // Atualizar estatísticas
  const updateStats = (text) => {
    const plainText = text.replace(/<[^>]*>/g, '') // Remove HTML tags
    const characters = plainText.length
    const lines = plainText.split('\n').length
    const fileSize = new Blob([text]).size

    setStats({
      characters,
      lines,
      fileSize,
      lastSaved: currentNote?.updatedAt ? new Date(currentNote.updatedAt).toLocaleString() : null
    })
  }

  // Salvar nota
  const saveNote = () => {
    if (!currentNote || !currentProject) {
      Swal.fire({
        title: 'Erro!',
        text: 'Selecione uma nota para salvar.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }

    const updatedNote = {
      ...currentNote,
      title: title || `Nota ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      content,
      updatedAt: new Date().toISOString(),
      characterCount: stats.characters,
      lineCount: stats.lines,
      fileSize: stats.fileSize
    }

    const updatedProjects = projects.map(project => {
      if (project.id === currentProject.id) {
        return {
          ...project,
          notes: project.notes.map(note => 
            note.id === currentNote.id ? updatedNote : note
          )
        }
      }
      return project
    })

    setProjects(updatedProjects)
    setCurrentNote(updatedNote)
    localStorage.setItem('notes-manager-projects', JSON.stringify(updatedProjects))
    
    updateStats(content)
    
    Swal.fire({
      title: 'Sucesso!',
      text: 'Nota salva com sucesso!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    })
  }

  // Exportar nota
  const exportNote = () => {
    if (!currentNote) {
      Swal.fire({
        title: 'Erro!',
        text: 'Selecione uma nota para exportar.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      })
      return
    }

    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `${title || 'nota'}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Importar nota
  const importNote = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.txt,.md'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setContent(e.target.result)
          updateStats(e.target.result)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (currentNote && content !== currentNote.content) {
      const timer = setTimeout(() => {
        saveNote()
      }, 30000)
      
      return () => clearTimeout(timer)
    }
  }, [content, currentNote])

  const handleContentChange = (value) => {
    setContent(value)
    updateStats(value)
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  if (!currentNote) {
    return (
      <div className="note-editor-empty">
        <div className="empty-state">
          <h2>Bem-vindo ao Notes Manager</h2>
          <p>Selecione uma nota existente ou crie uma nova para começar a editar.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="note-editor">
      <div className="note-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título da nota..."
          className="note-title-input"
        />
        <div className="note-actions">
          <Button onClick={importNote} size="sm" variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button onClick={exportNote} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={saveNote} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="editor-container">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Comece a escrever sua nota..."
        />
      </div>

      <div className="note-footer">
        <div className="note-stats">
          <span>Caracteres: {stats.characters}</span>
          <span>Linhas: {stats.lines}</span>
          <span>Tamanho: {(stats.fileSize / 1024).toFixed(2)} KB</span>
          {stats.lastSaved && (
            <span>Última alteração: {stats.lastSaved}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteEditor

