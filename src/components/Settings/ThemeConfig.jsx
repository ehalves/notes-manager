import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor,
  Save
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Swal from 'sweetalert2';

export function ThemeConfig() {
  const { state, dispatch, actionTypes } = useApp();
  const [config, setConfig] = useState(state.settings.theme);

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    dispatch({
      type: actionTypes.SET_THEME,
      payload: config
    });

    Swal.fire({
      title: 'Sucesso!',
      text: 'Configurações de tema salvas!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const presetColors = [
    { name: 'Azul', primary: '#3b82f6', secondary: '#64748b' },
    { name: 'Verde', primary: '#10b981', secondary: '#6b7280' },
    { name: 'Roxo', primary: '#8b5cf6', secondary: '#6b7280' },
    { name: 'Rosa', primary: '#ec4899', secondary: '#6b7280' },
    { name: 'Laranja', primary: '#f97316', secondary: '#6b7280' },
    { name: 'Vermelho', primary: '#ef4444', secondary: '#6b7280' },
    { name: 'Preto', primary: '#000000', secondary: '#666666' },
    { name: 'Cinza', primary: '#374151', secondary: '#6b7280' }
  ];

  const applyPreset = (preset) => {
    setConfig(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Aparência</span>
          </CardTitle>
          <CardDescription>
            Personalize a aparência da aplicação
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Modo do tema */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Modo do Tema</Label>
            <RadioGroup
              value={config.mode}
              onValueChange={(value) => handleConfigChange('mode', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  <span>Claro</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  <span>Escuro</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  <span>Sistema</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Cores personalizadas */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Cores Personalizadas</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={config.secondaryColor}
                    onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                    placeholder="#666666"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Presets de cores */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Presets de Cores</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="flex items-center space-x-2 h-auto p-3"
                >
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                  <span className="text-xs">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Visualização</Label>
            <div className="p-4 border rounded-lg space-y-2">
              <div 
                className="h-8 rounded flex items-center px-3 text-white text-sm font-medium"
                style={{ backgroundColor: config.primaryColor }}
              >
                Cor Primária
              </div>
              <div 
                className="h-8 rounded flex items-center px-3 text-white text-sm"
                style={{ backgroundColor: config.secondaryColor }}
              >
                Cor Secundária
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="flex items-center space-x-1">
            <Save className="h-4 w-4" />
            <span>Salvar Configurações</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ThemeConfig;

