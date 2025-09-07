import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Componentes principais
import Sidebar from './components/Sidebar'
import NoteEditor from './components/NoteEditor'
import Settings from './components/Settings'

function App() {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [currentNote, setCurrentNote] = useState(null)
  const [theme, setTheme] = useState('light')

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedProjects = localStorage.getItem('notes-manager-projects')
    const savedTheme = localStorage.getItem('notes-manager-theme')
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
    
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <Router>
      <div className={`app ${theme}`}>
        <div className="app-layout">
          <Sidebar 
            projects={projects}
            setProjects={setProjects}
            currentProject={currentProject}
            setCurrentProject={setCurrentProject}
            currentNote={currentNote}
            setCurrentNote={setCurrentNote}
          />
          
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <NoteEditor 
                    currentNote={currentNote}
                    setCurrentNote={setCurrentNote}
                    currentProject={currentProject}
                    projects={projects}
                    setProjects={setProjects}
                  />
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <Settings 
                    theme={theme}
                    setTheme={setTheme}
                  />
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App

