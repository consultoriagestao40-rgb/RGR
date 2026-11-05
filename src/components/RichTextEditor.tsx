'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Type, 
  Palette, 
  Upload, 
  Undo, 
  Redo,
  RemoveFormatting
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
  placeholder = 'Redija o texto oficial da política aqui...',
  minHeight = '280px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza valor inicial
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Se for markdown ou texto puro sem tags HTML, converte quebras de linha para HTML
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

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Upload real de arquivo de imagem do computador e inserção inline no cursor
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url && editorRef.current) {
        // Cria elemento de imagem estilizado inline que se encaixa no fluxo do texto
        const imgHtml = `
          <div style="margin: 16px 0; text-align: center;">
            <img src="${base64Url}" alt="${file.name}" style="max-width: 100%; max-height: 480px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: inline-block;" />
            <p style="font-size: 11px; color: #64748b; margin-top: 4px; font-style: italic;">Evidência / Imagem Ilustrativa</p>
          </div>
          <p><br></p>
        `;
        document.execCommand('insertHTML', false, imgHtml);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    };
    reader.readAsDataURL(file);

    // Reseta o input para permitir selecionar o mesmo arquivo novamente se quiser
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs focus-within:ring-1 focus-within:ring-blue-500 transition-all">
      
      {/* Barra de Ferramentas WYSIWYG de Alto Padrão */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        
        {/* Desfazer / Refazer */}
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Formatação de Títulos / Cabeçalhos */}
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
          <option value="h1">Título 1 (Principal)</option>
          <option value="h2">Título 2 (Seção)</option>
          <option value="h3">Título 3 (Subseção)</option>
        </select>

        {/* Seletor de Família de Fonte */}
        <select
          onChange={(e) => execCommand('fontName', e.target.value)}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 cursor-pointer"
          defaultValue="Inter, sans-serif"
        >
          <option value="Inter, sans-serif">Padrão (Inter)</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier (Mono)</option>
          <option value="Georgia, serif">Georgia</option>
        </select>

        {/* Seletor de Tamanho */}
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 cursor-pointer"
          defaultValue="3"
        >
          <option value="1">Muito Pequeno (10px)</option>
          <option value="2">Pequeno (12px)</option>
          <option value="3">Médio (14px Padrão)</option>
          <option value="4">Grande (16px)</option>
          <option value="5">Extra Grande (18px)</option>
          <option value="6">Título (24px)</option>
        </select>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Estilos Básicos: Negrito, Itálico, Sublinhado, Riscado */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold"
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 italic"
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 underline"
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('strikeThrough')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 line-through"
          title="Riscado"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Alinhamento: Esquerda, Centro, Direita, Justificado */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Alinhar à Esquerda"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyCenter')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Centralizar"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Alinhar à Direita"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Justificar"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Listas & Marcadores */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Lista com Marcadores"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
          title="Lista Numerada"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Cores do Texto & Fundo */}
        <div className="flex items-center gap-1" title="Cor do Texto">
          <Palette className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="color"
            onChange={(e) => execCommand('foreColor', e.target.value)}
            defaultValue="#0f172a"
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
          />
        </div>

        {/* Botão de Upload Real de Imagem */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold cursor-pointer border border-blue-200 dark:border-blue-800 transition-colors ml-auto"
          title="Fazer Upload de Foto/Imagem do Computador"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload de Imagem Real</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

      </div>

      {/* Área Editável WYSIWYG */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ minHeight }}
        className="p-4 focus:outline-none text-slate-900 dark:text-slate-100 prose dark:prose-invert max-w-none text-sm leading-relaxed overflow-y-auto"
        data-placeholder={placeholder}
      />
    </div>
  );
};
