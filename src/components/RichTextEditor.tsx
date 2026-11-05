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
  Image as ImageIcon,
  LayoutGrid,
  Columns
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
  placeholder = 'Redija o texto oficial com passos, regras e fotos posicionadas onde desejar...',
  minHeight = '360px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza valor inicial
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

  // Upload real de arquivo de imagem do computador e inserção onde o cursor estiver
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
        // Bloco de imagem flexível com controles
        const imgHtml = `
          <div class="rgr-image-block" style="margin: 18px 0; text-align: center;">
            <img src="${base64Url}" alt="${file.name}" style="max-width: 100%; max-height: 480px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.08); display: inline-block;" />
            <p style="font-size: 11px; color: #64748b; margin-top: 6px; font-style: italic;">${file.name}</p>
          </div>
          <p><br></p>
        `;
        insertHtmlAtCursor(imgHtml);
      }
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Inserir Layout: Foto na Esquerda + Texto na Direita (Passo a Passo)
  const insertPhotoLeftLayout = () => {
    const layoutHtml = `
      <div style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; margin: 20px 0; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
        <div style="flex: 1; min-width: 200px; text-align: center;">
          <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; background: #ffffff; color: #64748b; font-size: 12px;">
            📸 <strong>[Clique aqui e use o botão 'Inserir Foto' acima para colocar a foto aqui]</strong>
          </div>
        </div>
        <div style="flex: 1.5; min-width: 240px;">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: bold;">Passo 1: Descrição da Etapa</h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.5;">Explique detalhadamente o que o operador deve fazer ao visualizar esta tela...</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569;">
            <li>Verificação obrigatória 1</li>
            <li>Critério de aceite 2</li>
          </ul>
        </div>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(layoutHtml);
  };

  // Inserir Layout: Texto na Esquerda + Foto na Direita
  const insertPhotoRightLayout = () => {
    const layoutHtml = `
      <div style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; margin: 20px 0; padding: 14px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
        <div style="flex: 1.5; min-width: 240px;">
          <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: bold;">Passo 2: Ação no Sistema</h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #334155; line-height: 1.5;">Descreva os botões a serem clicados ou campos preenchidos...</p>
        </div>
        <div style="flex: 1; min-width: 200px; text-align: center;">
          <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px; background: #ffffff; color: #64748b; font-size: 12px;">
            📸 <strong>[Clique aqui e use o botão 'Inserir Foto' acima]</strong>
          </div>
        </div>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(layoutHtml);
  };

  // Inserir Layout: Cartão de Passo Normal (Foto Centralizada + Texto Embaixo)
  const insertStepCard = () => {
    const layoutHtml = `
      <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <h4 style="margin: 0 0 6px 0; font-size: 15px; color: #0f172a; font-weight: bold;">Etapa / Procedimento:</h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">Descreva a instrução para o colaborador...</p>
        <div style="text-align: center; padding: 10px; background: #f8fafc; border-radius: 8px;">
          <em>[Posicione o cursor aqui e insira a foto correspondente a esta etapa]</em>
        </div>
      </div>
      <p><br></p>
    `;
    insertHtmlAtCursor(layoutHtml);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs focus-within:ring-1 focus-within:ring-blue-500 transition-all">
      
      {/* Barra de Ferramentas WYSIWYG de Alto Padrão */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        
        {/* Desfazer / Refazer */}
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

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

        {/* Seletor de Tamanho */}
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 cursor-pointer"
          defaultValue="3"
        >
          <option value="2">Pequeno (12px)</option>
          <option value="3">Médio (14px Padrão)</option>
          <option value="4">Grande (16px)</option>
          <option value="5">Extra Grande (18px)</option>
          <option value="6">Título (24px)</option>
        </select>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Estilos Básicos: Negrito, Itálico, Sublinhado */}
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 font-bold cursor-pointer"
          title="Negrito (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 italic cursor-pointer"
          title="Itálico (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 underline cursor-pointer"
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Alinhamento: Esquerda, Centro, Direita, Justificado */}
        <button
          type="button"
          onClick={() => execCommand('justifyLeft')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Alinhar à Esquerda"
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
          onClick={() => execCommand('justifyRight')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Alinhar à Direita"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('justifyFull')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Justificar"
        >
          <AlignJustify className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Listas & Marcadores */}
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Lista com Marcadores (Bullets)"
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

        {/* Layouts Pré-formatados de POP (Foto + Texto Lado a Lado ou Abaixo) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={insertPhotoLeftLayout}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Inserir Bloco: Foto na Esquerda + Texto na Direita"
          >
            <Columns className="w-3 h-3 text-blue-500" />
            <span>Foto Esq.</span>
          </button>
          <button
            type="button"
            onClick={insertPhotoRightLayout}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Inserir Bloco: Texto na Esquerda + Foto na Direita"
          >
            <Columns className="w-3 h-3 text-purple-500" />
            <span>Foto Dir.</span>
          </button>
          <button
            type="button"
            onClick={insertStepCard}
            className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Inserir Bloco: Cartão de Passo Inteiro"
          >
            <LayoutGrid className="w-3 h-3 text-emerald-500" />
            <span>Cartão Passo</span>
          </button>
        </div>

        {/* Botão de Upload Real de Imagem (Insere exatamente no Cursor) */}
        <button
          type="button"
          onClick={() => {
            if (editorRef.current) editorRef.current.focus();
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors ml-auto"
          title="Escolha uma imagem do seu computador para inserir exatamente onde o cursor estiver"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Inserir Foto no Cursor</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

      </div>

      {/* Área Editável WYSIWYG de Alta Precisão */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{ minHeight }}
        className="p-5 focus:outline-none text-slate-900 dark:text-slate-100 prose dark:prose-invert max-w-none text-sm leading-relaxed overflow-y-auto"
        data-placeholder={placeholder}
      />
    </div>
  );
};
