import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { MainContent } from '@/components/Layout/MainContent';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="h-screen flex flex-col bg-background text-foreground">
        {/* Header */}
        <Header />
        
        {/* Layout principal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Conteúdo principal */}
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
