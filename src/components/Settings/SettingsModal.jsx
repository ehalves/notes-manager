import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Palette, 
  Github, 
  Briefcase,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { GitHubConfig } from './GitHubConfig';
import { OpenProjectConfig } from './OpenProjectConfig';
import { ThemeConfig } from './ThemeConfig';
import { useApp } from '@/contexts/AppContext';
import Swal from 'sweetalert2';

export function SettingsModal({ isOpen, onClose }) {
  const { exportData, importData, clearAllData } = useApp();

  const handleExportData = () => {
    try {
      exportData();
      Swal.fire({
        title: 'Sucesso!',
        text: 'Dados exportados com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao exportar dados: ${error.message}`,
        icon: 'error'
      });
    }
  };

  const handleImportData = async () => {
    try {
      const { value: file } = await Swal.fire({
        title: 'Importar dados',
        input: 'file',
        inputAttributes: {
          accept: '.json',
          'aria-label': 'Selecione o arquivo de backup'
        },
        showCancelButton: true,
        confirmButtonText: 'Importar',
        cancelButtonText: 'Cancelar'
      });

      if (file) {
        const success = await importData(file);
        if (success) {
          Swal.fire({
            title: 'Sucesso!',
            text: 'Dados importados com sucesso!',
            icon: 'success'
          });
        } else {
          Swal.fire({
            title: 'Erro!',
            text: 'Arquivo inválido ou corrompido',
            icon: 'error'
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: 'Erro!',
        text: `Erro ao importar dados: ${error.message}`,
        icon: 'error'
      });
    }
  };

  const handleClearData = async () => {
    const result = await Swal.fire({
      title: 'Atenção!',
      text: 'Esta ação irá apagar todos os seus projetos e notas. Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar tudo',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      clearAllData();
      Swal.fire({
        title: 'Dados apagados!',
        text: 'Todos os dados foram removidos',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="theme" className="flex items-center space-x-1">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Tema</span>
            </TabsTrigger>
            <TabsTrigger value="github" className="flex items-center space-x-1">
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </TabsTrigger>
            <TabsTrigger value="openproject" className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">OpenProject</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-4">
            <ThemeConfig />
          </TabsContent>

          <TabsContent value="github" className="mt-4">
            <GitHubConfig />
          </TabsContent>

          <TabsContent value="openproject" className="mt-4">
            <OpenProjectConfig />
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Backup e Restauração</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Exporte seus dados para backup ou importe dados de um backup anterior
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleExportData} className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>Exportar Dados</span>
                    </Button>
                    <Button variant="outline" onClick={handleImportData} className="flex items-center space-x-1">
                      <Upload className="h-4 w-4" />
                      <span>Importar Dados</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg border-destructive/20">
                  <h3 className="text-lg font-semibold mb-2 text-destructive">Zona de Perigo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ações irreversíveis que podem resultar em perda de dados
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Apagar Todos os Dados</span>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;

