'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Upload, 
  Undo, 
  Redo,
  Image as ImageIcon,
  Columns,
  Trash2
} from 'lucide-react';

interface RichTextEditorProps {
  value: string; // HTML content
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Descreva a política ou procedimento operacional...',
  minHeight = '360px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const layoutFileInputRef = useRef<HTMLInputElement>(null);
  const targetPlaceholderRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value && !value.includes('<p>') && !value.includes('<div>') && !value.includes('<h1>')) {
        const formatted = value
          .replace(/### (.*?)\n/g, '<h3>$1</h3>')
          .replace(/## (.*?)\n/g, '<h2>$1</h2>')
          .replace(/# (.*?)\n/g, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/\n\n/g, '<p></p>')
          .replace(/\n/g, '<br/>');
        editorRef.current.innerHTML = formatted;
      } else {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Upload solto de foto no cursor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url && editorRef.current) {
        const imgHtml = `
          <div style="margin: 16px 0; text-align: center;">
            <img src="${base64Url}" alt="${file.name}" style="max-width: 100%; max-height: 480px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.08); display: inline-block;" />
            <p style="font-size: 11px; color: #64748b; margin-top: 4px; font-style: italic;">${file.name}</p>
          </div>
          <p><br></p>
        `;
        insertHtmlAtCursor(imgHtml);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Upload de foto que substitui o placeholder da caixa
  const handleLayoutPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetPlaceholderRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url && targetPlaceholderRef.current) {
        targetPlaceholderRef.current.innerHTML = `
          <div style="text-align: center;">
            <img src="${base64Url}" alt="${file.name}" style="max-width: 100%; max-height: 380px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.08); display: inline-block;" />
            <p style="font-size: 10px; color: #64748b; margin-top: 4px; font-style: italic;">${file.name}</p>
          </div>
        `;
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    };
    reader.readAsDataURL(file);
    if (layoutFileInputRef.current) layoutFileInputRef.current.value = '';
  };

  // Clique na caixa de foto para acionar o upload
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const photoBox = target.closest('.rgr-photo-placeholder') as HTMLElement;
    if (photoBox) {
      targetPlaceholderRef.current = photoBox;
      layoutFileInputRef.current?.click();
    }
  };

  // Layout 1: Foto na Esquerda + Texto na Direita
  const insertPhotoLeftLayout = () => {
    const layoutHtml = `
      <div style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; margin: 20px 0; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
        <div class="rgr-photo-placeholder" style="flex: 1; min-width: 220px; text-align: center; cursor: pointer; border: 2px dashed #3b82f6; border-radius: 8px; padding: 24px; background: #ffffff;">
          <span style="font-size: 24px; display: block; margin-bottom: 6px;">📷</span>
          <strong style="color: #2563eb; font-size: 13px; display: block;">CLIQUE AQUI PARA CARREGAR A FOTO</strong>
          <span style="color: #64748b; font-size: 11px;">Selecione o print do seu computador</span>
        </div>
        <div style="flex: 1.5; min-width: 260px;">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: bold;">Passo 1: Descrição da Etapa</h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.5;">Escreva aqui a explicação detalhada deste passo...</p>
        </div>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(layoutHtml);
  };

  // Layout 2: Texto na Esquerda + Foto na Direita
  const insertPhotoRightLayout = () => {
    const layoutHtml = `
      <div style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; margin: 20px 0; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
        <div style="flex: 1.5; min-width: 260px;">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: bold;">Passo 2: Ação Operacional</h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.5;">Escreva aqui a explicação detalhada deste passo...</p>
        </div>
        <div class="rgr-photo-placeholder" style="flex: 1; min-width: 220px; text-align: center; cursor: pointer; border: 2px dashed #9333ea; border-radius: 8px; padding: 24px; background: #ffffff;">
          <span style="font-size: 24px; display: block; margin-bottom: 6px;">📷</span>
          <strong style="color: #7e22ce; font-size: 13px; display: block;">CLIQUE AQUI PARA CARREGAR A FOTO</strong>
          <span style="color: #64748b; font-size: 11px;">Selecione o print do seu computador</span>
        </div>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(layoutHtml);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs focus-within:ring-1 focus-within:ring-blue-500 transition-all">
      
      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        
        {/* Desfazer / Refazer */}
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          title="Desfazer"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          title="Refazer"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Formatação de Títulos */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') execCommand('formatBlock', '<p>');
            else if (val) execCommand('formatBlock', `<${val}>`);
          }}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          defaultValue="p"
        >
          <option value="p">Normal (Parágrafo)</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
        </select>

        {/* Estilos: Negrito, Itálico, Sublinhado */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
          title="Negrito"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 italic cursor-pointer"
          title="Itálico"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 underline cursor-pointer"
          title="Sublinhado"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Alinhamentos */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Esquerda"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Centralizar"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Justificado"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        {/* Listas */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Lista com Marcadores"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Lista Numerada"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Botões de Diagramação Pronta (Lado a Lado) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={insertPhotoLeftLayout}
            className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Inserir bloco com foto na esquerda e texto explicativo na direita"
          >
            <Columns className="w-3 h-3 text-blue-500" />
            <span>+ Passo (Foto Esq / Texto Dir)</span>
          </button>
          <button
            type="button"
            onClick={insertPhotoRightLayout}
            className="px-2 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Inserir bloco com texto explicativo na esquerda e foto na direita"
          >
            <Columns className="w-3 h-3 text-purple-500" />
            <span>+ Passo (Texto Esq / Foto Dir)</span>
          </button>
        </div>

        {/* Upload Solto de Imagem */}
        <button
          type="button"
          onClick={() => {
            if (editorRef.current) editorRef.current.focus();
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer ml-auto"
          title="Inserir foto centralizada solta"
        >
          <Upload className="w-3 h-3" />
          <span>Foto Solta</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <input
          ref={layoutFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLayoutPhotoUpload}
          className="hidden"
        />

      </div>

      {/* Área Editável WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable
        onClick={handleEditorClick}
        onInput={handleInput}
        style={{ minHeight }}
        className="p-5 focus:outline-none text-slate-900 dark:text-slate-100 prose dark:prose-invert max-w-none text-sm leading-relaxed overflow-y-auto"
        data-placeholder={placeholder}
      />
    </div>
  );
};
