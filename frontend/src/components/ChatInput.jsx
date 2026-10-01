import React, { useRef, useEffect } from 'react';
import { ArrowUp, Globe, Brain, Square, Loader2 } from 'lucide-react';

export function ChatInput({
    input,
    setInput,
    onSend,
    isGenerating,
    isSwitchingModel,
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
            if (!isSwitchingModel && !isGenerating) {
                onSend();
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto w-full px-4 pb-6 pt-2">
            <div className={`bg-[#1e1f20] border rounded-3xl p-3 shadow-2xl transition-all ${isSwitchingModel ? 'border-[#004a77] opacity-80' : 'border-[#2d2f31] focus-within:border-[#444746]'
                }`}>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    disabled={isSwitchingModel}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isSwitchingModel ? "Carregando modelo na GPU, aguarde um instante..." : "Pergunte ao Aetheris..."}
                    className="w-full bg-transparent text-[#e3e3e3] text-sm md:text-base outline-none resize-none px-2 max-h-44 placeholder-[#8e918f] disabled:cursor-not-allowed"
                />

                <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#282a2c]">
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            disabled={isSwitchingModel}
                            onClick={() => setDeepThinking(!deepThinking)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${deepThinking
                                    ? 'bg-[#004a77] text-[#c2e7ff] border border-[#00639b]'
                                    : 'bg-[#131314] text-[#8e918f] hover:text-[#c4c7c5] border border-[#2d2f31]'
                                } ${isSwitchingModel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <Brain size={14} />
                            <span>Pensamento Aprofundado</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSwitchingModel}
                            onClick={() => setWebSearch(!webSearch)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${webSearch
                                    ? 'bg-[#004a77] text-[#c2e7ff] border border-[#00639b]'
                                    : 'bg-[#131314] text-[#8e918f] hover:text-[#c4c7c5] border border-[#2d2f31]'
                                } ${isSwitchingModel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <Globe size={14} />
                            <span>Pesquisa Web</span>
                        </button>
                    </div>

                    <div>
                        {isSwitchingModel ? (
                            <div className="w-8 h-8 rounded-full bg-[#282a2c] text-[#a8c7fa] flex items-center justify-center">
                                <Loader2 size={16} className="animate-spin" />
                            </div>
                        ) : isGenerating ? (
                            <button
                                type="button"
                                onClick={onStop}
                                className="w-8 h-8 rounded-full bg-[#e3e3e3] text-[#131314] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                <Square size={14} fill="currentColor" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={!input.trim() || isSwitchingModel}
                                onClick={onSend}
                                className="w-8 h-8 rounded-full bg-[#e3e3e3] text-[#131314] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
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