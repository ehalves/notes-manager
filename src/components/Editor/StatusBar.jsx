import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, FileText, Hash, HardDrive } from 'lucide-react';

export function StatusBar({ note }) {
  if (!note) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return format(new Date(date), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  };

  return (
    <div className="h-8 px-4 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center space-x-4">
        {/* Contador de caracteres */}
        <div className="flex items-center space-x-1">
          <Hash className="h-3 w-3" />
          <span>{note.characterCount || 0} caracteres</span>
        </div>

        {/* Contador de linhas */}
        <div className="flex items-center space-x-1">
          <FileText className="h-3 w-3" />
          <span>{note.lineCount || 0} linhas</span>
        </div>

        {/* Tamanho do arquivo */}
        <div className="flex items-center space-x-1">
          <HardDrive className="h-3 w-3" />
          <span>{formatFileSize(note.fileSize || 0)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Data da última alteração */}
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Modificado: {formatDate(note.updatedAt)}</span>
        </div>

        {/* Data do último salvamento */}
        {note.lastSaved && (
          <div className="flex items-center space-x-1">
            <span>Salvo: {formatDate(note.lastSaved)}</span>
          </div>
        )}

        {/* Indicador de salvamento pendente */}
        {note.updatedAt && note.lastSaved && new Date(note.updatedAt) > new Date(note.lastSaved) && (
          <div className="flex items-center space-x-1 text-orange-500">
            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            <span>Não salvo</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatusBar;

