import React from 'react';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft, Cpu, Zap, Award } from 'lucide-react';

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
    isSwitchingModel
}) {
    return (
        <aside
            className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#1e1f20] border-r border-[#2d2f31] transition-all duration-300 ${isOpen ? 'w-72' : 'w-0 md:w-16'
                } overflow-hidden`}
        >
            <div className="flex flex-col h-full min-w-72">
                <div className="p-3 flex items-center justify-between border-b border-[#2d2f31]">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="p-2 rounded-full hover:bg-[#2d2f31] text-[#c4c7c5] transition-colors"
                    >
                        {isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                    </button>
                    {isOpen && (
                        <button
                            type="button"
                            onClick={onNewChat}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2d2f31] hover:bg-[#37393b] text-sm text-[#e3e3e3] font-medium transition-colors"
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
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-[#37393b] text-[#8e918f] hover:text-[#ffb4ab] transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="p-3 border-t border-[#2d2f31] space-y-2">
                    {isOpen && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#8e918f] flex items-center gap-1.5 px-1">
                                <Cpu size={14} />
                                <span>Perfil de Inteligência</span>
                            </label>
                            <div className="space-y-1">
                                {models.map((m) => {
                                    const filename = typeof m === 'object' ? m.filename : m;
                                    const label = typeof m === 'object' ? m.label : m;
                                    const isSelected = filename === activeModel;
                                    const isPro = filename.toLowerCase().includes('coder');

                                    return (
                                        <button
                                            key={filename}
                                            type="button"
                                            disabled={isSwitchingModel}
                                            onClick={() => onSelectModel(filename)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${isSelected
                                                    ? 'bg-[#004a77] text-[#c2e7ff] border border-[#00639b]'
                                                    : 'bg-[#131314] text-[#8e918f] hover:text-[#c4c7c5] border border-[#2d2f31]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {isPro ? <Award size={15} className="text-[#a8c7fa] shrink-0" /> : <Zap size={15} className="text-[#6dd58c] shrink-0" />}
                                                <span className="truncate">{label}</span>
                                            </div>
                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#c2e7ff] shrink-0"></span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}