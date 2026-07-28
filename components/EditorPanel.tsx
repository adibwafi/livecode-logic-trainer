'use client';

import React, { useRef } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { Code, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';

interface EditorPanelProps {
  code: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  onReset: () => void;
}

export default function EditorPanel({
  code,
  onChange,
  isReadOnly = false,
  onReset
}: EditorPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const editorRef = useRef<any>(null);

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
        'editor.background': '#1e1e1e',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2F333B40',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#AEAFAD',
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
    <div
      className="flex flex-col h-full overflow-hidden bg-[#1e1e1e] border-l border-[#2b2b2b]"
    >
      {/* ── Editor Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs text-zinc-400 bg-[#252526] border-b border-[#2b2b2b] select-none"
      >
        {/* File label */}
        <div className="flex items-center gap-2 font-mono text-zinc-200 font-medium text-xs">
          <Code className="w-3.5 h-3.5 text-blue-400" />
          <span>solution.js</span>
          {isReadOnly && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-sans font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full animate-scale-in">
              {t('readOnly')}
            </span>
          )}
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormatCode}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#333333] hover:bg-[#3c3c3c] text-zinc-200 hover:text-white text-[11px] font-medium border border-zinc-700/50 shadow-2xs btn-glass disabled:opacity-40 transition-all"
            title="Auto format code"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            {t('format')}
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border btn-glass transition-all duration-200 ${
              copied
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-[#333333] hover:bg-[#3c3c3c] text-zinc-200 hover:text-white border-zinc-700/50 shadow-2xs'
            }`}
            title="Copy code"
          >
            {copied
              ? <Check className="w-3 h-3 text-emerald-400" />
              : <Copy className="w-3 h-3 text-zinc-400" />
            }
            {copied ? t('copied') : t('copy')}
          </button>

          <button
            onClick={onReset}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#333333] hover:bg-rose-500/15 text-zinc-300 hover:text-rose-300 text-[11px] font-medium border border-zinc-700/50 hover:border-rose-500/30 shadow-2xs btn-glass disabled:opacity-40 transition-all"
            title="Reset starter code"
          >
            <RotateCcw className="w-3 h-3" />
            {t('reset')}
          </button>
        </div>
      </div>

      {/* ── Monaco Code Editor ── */}
      <div className="flex-1 relative bg-[#1e1e1e]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="antigravity-vs-dark"
          value={code}
          onChange={(val) => onChange(val || '')}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly,
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
