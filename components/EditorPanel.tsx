'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Code, RotateCcw, Copy, Check, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-slate-800 overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono text-cyan-400 font-medium">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>solution.js</span>
          {isReadOnly && (
            <span className="px-2 py-0.5 text-[10px] uppercase font-sans font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">
              Read Only (Time Expired)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFormatCode}
            disabled={isReadOnly}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50"
            title="Auto format code"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Format
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={onReset}
            disabled={isReadOnly}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 transition-colors disabled:opacity-50"
            title="Reset starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
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
            fontSize: 14,
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
