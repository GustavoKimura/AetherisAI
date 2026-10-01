import React from 'react';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft, Cpu, Zap, Award, Loader2 } from 'lucide-react';

export function Sidebar({
    isOpen,
    onToggle,
    conversations,
    activeId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    models,
    activeModel,
    onSelectModel,
    isSwitchingModel,
    switchingModelName
}) {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
                    onClick={onToggle}
                />
            )}

            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#1e1f20] border-r border-[#2d2f31] transition-all duration-300 ${isOpen ? 'w-[85vw] max-w-[320px] md:w-72 translate-x-0' : '-translate-x-full md:translate-x-0 w-0 md:w-16'
                    } overflow-hidden`}
            >
                <div className="flex flex-col h-full w-full">
                    <div className="p-3 flex items-center justify-between border-b border-[#2d2f31]">
                        <button
                            type="button"
                            onClick={onToggle}
                            className="p-2 rounded-full hover:bg-[#2d2f31] text-[#c4c7c5] transition-colors cursor-pointer"
                        >
                            {isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                        </button>
                        {isOpen && (
                            <button
                                type="button"
                                onClick={onNewChat}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d2f31] hover:bg-[#37393b] text-sm text-[#e3e3e3] font-medium transition-colors cursor-pointer"
                            >
                                <Plus size={16} />
                                <span>Novo chat</span>
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                        {conversations.map((conv) => {
                            const isSelected = conv.id === activeId;
                            return (
                                <div
                                    key={conv.id}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-full cursor-pointer text-sm transition-colors ${isSelected
                                            ? 'bg-[#004a77] text-[#c2e7ff] font-medium'
                                            : 'text-[#c4c7c5] hover:bg-[#282a2c]'
                                        }`}
                                    onClick={() => onSelectConversation(conv.id)}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <MessageSquare size={16} className="shrink-0" />
                                        <span className="truncate">{conv.title}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteConversation(conv.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-[#37393b] text-[#8e918f] hover:text-[#ffb4ab] transition-all cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-3 border-t border-[#2d2f31] space-y-2">
                        {isOpen && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-[#8e918f] flex items-center gap-1.5 px-1">
                                    <Cpu size={14} />
                                    <span>Perfil de Inteligência</span>
                                </label>
                                <div className="space-y-1.5">
                                    {models.map((m) => {
                                        const filename = typeof m === 'object' ? m.filename : m;
                                        const isSelected = filename === activeModel;
                                        const isSwitchingThis = isSwitchingModel && switchingModelName === filename;
                                        const isPro = filename.toLowerCase().includes('coder');

                                        const title = isPro ? 'Aetheris Pro' : 'Aetheris Fast';
                                        const subtitle = isPro ? 'Qwen 2.5 Coder 7B • Código & Raciocínio' : 'Hermes 3 8B • Agilidade & Web';
                                        const badge = isPro ? 'PRO' : 'FAST';

                                        return (
                                            <button
                                                key={filename}
                                                type="button"
                                                disabled={isSwitchingModel}
                                                onClick={() => onSelectModel(filename)}
                                                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer ${isSelected
                                                        ? 'bg-[#004a77]/50 border border-[#00639b] text-[#c2e7ff] shadow-md'
                                                        : 'bg-[#18191a] hover:bg-[#282a2c] text-[#c4c7c5] border border-[#2d2f31]'
                                                    } ${isSwitchingModel && !isSwitchingThis ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-start gap-2.5 min-w-0">
                                                    <div className={`p-1.5 rounded-xl mt-0.5 shrink-0 ${isPro ? 'bg-[#1a73e8]/20 text-[#a8c7fa]' : 'bg-[#1e8e3e]/20 text-[#6dd58c]'
                                                        }`}>
                                                        {isSwitchingThis ? (
                                                            <Loader2 size={16} className="animate-spin text-[#a8c7fa]" />
                                                        ) : isPro ? (
                                                            <Award size={16} />
                                                        ) : (
                                                            <Zap size={16} />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-xs sm:text-sm text-[#e3e3e3]">{title}</span>
                                                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isPro ? 'border-[#1a73e8]/40 text-[#a8c7fa] bg-[#1a73e8]/10' : 'border-[#1e8e3e]/40 text-[#6dd58c] bg-[#1e8e3e]/10'
                                                                }`}>
                                                                {badge}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-[#8e918f] leading-snug mt-0.5 truncate">
                                                            {isSwitchingThis ? 'Carregando na GPU...' : subtitle}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isSelected && !isSwitchingThis && (
                                                    <div className="w-2 h-2 rounded-full bg-[#a8c7fa] shrink-0 ml-1.5" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}