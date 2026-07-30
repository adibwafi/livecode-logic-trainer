'use client';

import React, { useRef } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { Code, RotateCcw, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { t } from '@/lib/i18n';

interface EditorPanelProps {
  code: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  onReset: () => void;
  isWorkerRunning?: boolean;
}

export default function EditorPanel({
  code,
  onChange,
  isReadOnly = false,
  onReset,
  isWorkerRunning = false,
}: EditorPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('antigravity-vs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'storage.type', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'delimiter', foreground: 'D4D4D4' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2A2A60',
        'editorLineNumber.foreground': '#555555',
        'editorLineNumber.activeForeground': '#B0B0B0',
        'editorIndentGuide.background1': '#333333',
        'editorIndentGuide.activeBackground1': '#555555',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#AEAFAD',
        'editorWidget.background': '#1f1f1f',
        'editorSuggestWidget.background': '#1f1f1f',
        'editorSuggestWidget.border': '#3c3c3c',
      },
    });
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50">

      {/* ── Light Chrome Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs bg-white border-b border-zinc-200 select-none shrink-0"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.03)' }}
      >
        {/* File label */}
        <div className="flex items-center gap-2 font-mono text-zinc-700 font-medium text-xs">
          <Code className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-zinc-900">solution.js</span>

          {isReadOnly && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-sans font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-full animate-scale-in">
              {t('readOnly')}
            </span>
          )}

          {isWorkerRunning && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-sans font-semibold bg-violet-50 text-violet-700 border border-violet-200 rounded-full animate-scale-in">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Running…
            </span>
          )}
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleFormatCode}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 text-[11px] font-medium border border-zinc-200 shadow-xs btn-glass disabled:opacity-40 transition-all"
            title="Auto format code"
            aria-label="Format code"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            {t('format')}
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border btn-glass transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border-zinc-200 shadow-xs'
            }`}
            title="Copy code"
            aria-label="Copy code to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500" />}
            {copied ? t('copied') : t('copy')}
          </button>

          <button
            onClick={onReset}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 text-[11px] font-medium border border-zinc-200 hover:border-rose-200 shadow-xs btn-glass disabled:opacity-40 transition-all"
            title="Reset starter code"
            aria-label="Reset to starter code"
          >
            <RotateCcw className="w-3 h-3" />
            {t('reset')}
          </button>
        </div>
      </div>

      {/* ── Monaco Code Editor (intentionally dark — IDE convention) ── */}
      <div className="flex-1 relative overflow-hidden rounded-none">
        <div className="absolute inset-0 border-t border-zinc-800/30" />
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="antigravity-vs-dark"
          value={code}
          onChange={(val) => onChange(val || '')}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly || isWorkerRunning,
            fontSize: 13.5,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            padding: { top: 14, bottom: 14 },
            fontLigatures: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            renderLineHighlight: 'all',
          }}
        />
      </div>
    </div>
  );
}
