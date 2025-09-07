import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useApp } from '@/contexts/AppContext';
import { StatusBar } from './StatusBar';

export function RichTextEditor() {
  const { state, updateNote, getCurrentNote } = useApp();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const quillRef = useRef(null);
  const currentNote = getCurrentNote();

  // Configuração do toolbar do Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet',
    'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Carregar conteúdo da nota atual
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content || '');
      setTitle(currentNote.title || '');
    } else {
      setContent('');
      setTitle('');
    }
  }, [currentNote]);

  // Auto-save com debounce
  useEffect(() => {
    if (!currentNote) return;

    const timeoutId = setTimeout(() => {
      if (content !== currentNote.content || title !== currentNote.title) {
        updateNote(currentNote.id, { content, title });
      }
    }, 1000); // 1 segundo de debounce

    return () => clearTimeout(timeoutId);
  }, [content, title, currentNote, updateNote]);

  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">Nenhuma nota selecionada</h3>
          <p className="text-sm">
            Selecione uma nota na barra lateral ou crie uma nova para começar a editar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Campo de título */}
      <div className="p-4 border-b border-border">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título da nota..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Comece a escrever sua nota..."
          className="flex-1 [&_.ql-container]:border-none [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border"
          style={{
            height: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        />
      </div>

      {/* Barra de status */}
      <StatusBar note={currentNote} />
    </div>
  );
}

export default RichTextEditor;

