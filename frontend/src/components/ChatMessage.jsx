import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Brain, Copy, Check, User, Sparkles } from 'lucide-react';

export function ChatMessage({ role, content }) {
    const isUser = role === 'user';
    const [copiedCode, setCopiedCode] = useState(null);
    const [isThinkingOpen, setIsThinkingOpen] = useState(true);

    let thinkingContent = '';
    let finalContent = content;

    if (content.includes('<think>')) {
        const parts = content.split('</think>');
        if (parts.length > 1) {
            thinkingContent = parts[0].replace('<think>', '').trim();
            finalContent = parts.slice(1).join('</think>').trim();
        } else {
            thinkingContent = content.replace('<think>', '').trim();
            finalContent = '';
        }
    }

    const handleCopy = (codeText, blockIndex) => {
        navigator.clipboard.writeText(codeText);
        setCopiedCode(blockIndex);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className={`py-6 px-4 md:px-6 w-full ${isUser ? 'bg-transparent' : 'bg-[#18191a]'}`}>
            <div className="max-w-3xl mx-auto flex gap-4">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-[#282a2c] text-[#e3e3e3]' : 'bg-gradient-to-tr from-[#1a73e8] to-[#8ab4f8] text-white shadow-md'
                        }`}
                >
                    {isUser ? <User size={18} /> : <Sparkles size={18} />}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                    {thinkingContent && (
                        <div className="rounded-xl border border-[#2d2f31] bg-[#1e1f20] overflow-hidden text-xs">
                            <button
                                type="button"
                                onClick={() => setIsThinkingOpen(!isThinkingOpen)}
                                className="w-full flex items-center justify-between px-3 py-2 text-[#a8c7fa] font-medium hover:bg-[#282a2c] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Brain size={15} />
                                    <span>Processo de Raciocínio Profundo</span>
                                </div>
                                {isThinkingOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            {isThinkingOpen && (
                                <div className="p-3 text-[#c4c7c5] whitespace-pre-wrap border-t border-[#2d2f31] font-mono leading-relaxed bg-[#131314]">
                                    {thinkingContent}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-sm md:text-[15px] leading-relaxed text-[#e3e3e3] prose prose-invert max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeString = String(children).replace(/\n$/, '');

                                    if (!inline && match) {
                                        return (
                                            <div className="relative my-3 rounded-xl overflow-hidden border border-[#2d2f31] bg-[#1e1f20]">
                                                <div className="flex items-center justify-between px-4 py-1.5 bg-[#282a2c] text-xs font-mono text-[#8e918f]">
                                                    <span>{match[1]}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(codeString, codeString)}
                                                        className="flex items-center gap-1 hover:text-[#e3e3e3] transition-colors"
                                                    >
                                                        {copiedCode === codeString ? <Check size={14} /> : <Copy size={14} />}
                                                        <span>{copiedCode === codeString ? 'Copiado' : 'Copiar'}</span>
                                                    </button>
                                                </div>
                                                <pre className="p-4 overflow-x-auto m-0 bg-[#1e1f20]">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            </div>
                                        );
                                    }
                                    return (
                                        <code className="bg-[#282a2c] text-[#a8c7fa] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {finalContent}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}