// Serviço para gerenciar armazenamento local de dados

const STORAGE_KEY = 'notepad-web-data';

export class StorageService {
  /**
   * Salva dados no localStorage
   * @param {Object} data - Dados para salvar
   */
  static saveData(data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serializedData);
      console.log('Dados salvos no localStorage:', data);
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
      return false;
    }
  }

  /**
   * Carrega dados do localStorage
   * @returns {Object|null} - Dados carregados ou null se não existir
   */
  static loadData() {
    try {
      const serializedData = localStorage.getItem(STORAGE_KEY);
      if (!serializedData) {
        return null;
      }

      const data = JSON.parse(serializedData);
      
      // Converter strings de data de volta para objetos Date
      if (data.projects) {
        data.projects = data.projects.map(project => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          notes: project.notes?.map(note => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            lastSaved: note.lastSaved ? new Date(note.lastSaved) : null
          })) || []
        }));
      }

      console.log('Dados carregados do localStorage:', data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return null;
    }
  }

  /**
   * Limpa todos os dados do localStorage
   */
  static clearData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Dados limpos do localStorage');
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados do localStorage:', error);
      return false;
    }
  }

  /**
   * Verifica se há dados salvos
   * @returns {boolean}
   */
  static hasData() {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /**
   * Exporta dados para download
   * @param {Object} data - Dados para exportar
   * @param {string} filename - Nome do arquivo
   */
  static exportData(data, filename = 'notepad-web-backup.json') {
    try {
      const serializedData = JSON.stringify(data, null, 2);
      const blob = new Blob([serializedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return false;
    }
  }

  /**
   * Importa dados de um arquivo
   * @param {File} file - Arquivo para importar
   * @returns {Promise<Object|null>}
   */
  static async importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validar estrutura básica dos dados
      if (!data.projects || !Array.isArray(data.projects)) {
        throw new Error('Formato de arquivo inválido');
      }

      return data;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return null;
    }
  }

  /**
   * Cria backup automático dos dados
   * @param {Object} data - Dados para backup
   */
  static createBackup(data) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `${STORAGE_KEY}-backup-${timestamp}`;
      const serializedData = JSON.stringify(data);
      
      localStorage.setItem(backupKey, serializedData);
      
      // Manter apenas os últimos 5 backups
      this.cleanOldBackups();
      
      console.log('Backup criado:', backupKey);
      return true;
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      return false;
    }
  }

  /**
   * Lista todos os backups disponíveis
   * @returns {Array<string>}
   */
  static listBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY}-backup-`)) {
        backups.push(key);
      }
    }
    return backups.sort().reverse(); // Mais recentes primeiro
  }

  /**
   * Remove backups antigos, mantendo apenas os 5 mais recentes
   */
  static cleanOldBackups() {
    const backups = this.listBackups();
    if (backups.length > 5) {
      const toRemove = backups.slice(5);
      toRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('Backup antigo removido:', key);
      });
    }
  }

  /**
   * Restaura dados de um backup
   * @param {string} backupKey - Chave do backup
   * @returns {Object|null}
   */
  static restoreBackup(backupKey) {
    try {
      const serializedData = localStorage.getItem(backupKey);
      if (!serializedData) {
        return null;
      }

      const data = JSON.parse(serializedData);
      this.saveData(data);
      
      console.log('Backup restaurado:', backupKey);
      return data;
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      return null;
    }
  }
}

export default StorageService;

