import React from 'react';
import { ProjectTree } from '@/components/Sidebar/ProjectTree';

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full flex flex-col">
        {/* Cabeçalho da sidebar */}
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Projetos
          </h2>
        </div>
        
        {/* Árvore de projetos */}
        <div className="flex-1 overflow-y-auto">
          <ProjectTree />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

