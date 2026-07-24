'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
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
    <div className="flex flex-col h-full bg-[#18181b] border-l border-zinc-800/80 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/90 border-b border-zinc-800/80 text-xs text-zinc-400 backdrop-blur-md">
        <div className="flex items-center gap-2 font-mono text-zinc-300 font-medium">
          <Code className="w-3.5 h-3.5 text-zinc-400" />
          <span>solution.js</span>
          {isReadOnly && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-sans font-semibold bg-rose-950/40 text-rose-400 border border-rose-800/50 rounded-full">
              {t('readOnly')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormatCode}
            disabled={isReadOnly}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 transition-colors disabled:opacity-50"
            title="Auto format code"
          >
            <Sparkles className="w-3 h-3 text-zinc-400" />
            {t('format')}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-800 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            {copied ? t('copied') : t('copy')}
          </button>

          <button
            onClick={onReset}
            disabled={isReadOnly}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-rose-400 text-[11px] font-medium border border-zinc-800 transition-colors disabled:opacity-50"
            title="Reset starter code"
          >
            <RotateCcw className="w-3 h-3" />
            {t('reset')}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly: isReadOnly,
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, Monaco, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>
    </div>
  );
}
