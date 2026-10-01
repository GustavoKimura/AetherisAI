import React, { useRef, useEffect } from 'react';
import { ArrowUp, Globe, Brain, Square } from 'lucide-react';

export function ChatInput({
    input,
    setInput,
    onSend,
    isGenerating,
    onStop,
    deepThinking,
    setDeepThinking,
    webSearch,
    setWebSearch
}) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [input]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full px-4 pb-6 pt-2">
            <div className="bg-[#1e1f20] border border-[#2d2f31] rounded-3xl p-3 shadow-2xl focus-within:border-[#444746] transition-all">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte ao Aetheris..."
                    className="w-full bg-transparent text-[#e3e3e3] text-sm md:text-base outline-none resize-none px-2 max-h-44 placeholder-[#8e918f]"
                />

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#282a2c]">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setDeepThinking(!deepThinking)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${deepThinking
                                    ? 'bg-[#004a77] text-[#c2e7ff] border border-[#00639b]'
                                    : 'bg-[#131314] text-[#8e918f] hover:text-[#c4c7c5] border border-[#2d2f31]'
                                }`}
                        >
                            <Brain size={14} />
                            <span>Pensamento Aprofundado</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setWebSearch(!webSearch)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${webSearch
                                    ? 'bg-[#004a77] text-[#c2e7ff] border border-[#00639b]'
                                    : 'bg-[#131314] text-[#8e918f] hover:text-[#c4c7c5] border border-[#2d2f31]'
                                }`}
                        >
                            <Globe size={14} />
                            <span>Pesquisa Web</span>
                        </button>
                    </div>

                    <div>
                        {isGenerating ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="w-8 h-8 rounded-full bg-[#e3e3e3] text-[#131314] flex items-center justify-center hover:opacity-90 transition-opacity"
                            >
                                <Square size={14} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={!input.trim()}
                                onClick={onSend}
                                className="w-8 h-8 rounded-full bg-[#e3e3e3] text-[#131314] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                <ArrowUp size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}