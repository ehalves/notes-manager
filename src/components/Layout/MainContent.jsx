import React from 'react';
import { RichTextEditor } from '@/components/Editor/RichTextEditor';

export function MainContent() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <RichTextEditor />
    </main>
  );
}

export default MainContent;

