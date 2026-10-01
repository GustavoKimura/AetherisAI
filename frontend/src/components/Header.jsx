import React from 'react';
import { Sparkles, Menu, Loader2 } from 'lucide-react';

export function Header({ activeModel, models = [], onToggleSidebar, isSwitchingModel }) {
    const getModelLabel = () => {
        if (isSwitchingModel) return 'Trocando modelo na GPU...';
        if (!activeModel) return 'Nenhum modelo ativo';
        const filename = typeof activeModel === 'object' ? activeModel.filename : activeModel;
        if (filename.toLowerCase().includes('coder')) return 'Aetheris Pro (Qwen 2.5 Coder 7B)';
        if (filename.toLowerCase().includes('hermes')) return 'Aetheris Fast (Hermes 3 8B)';
        return filename;
    };

    return (
        <header className="h-14 border-b border-[#2d2f31] px-3 sm:px-4 flex items-center justify-between shrink-0 bg-[#131314]/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label="Abrir menu lateral"
                    className="p-2 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] transition-colors md:hidden cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                    <Menu size={20} />
                </button>
                <span className="text-lg font-medium text-[#e3e3e3] tracking-tight">Aetheris</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#282a2c] text-[#a8c7fa] font-mono border border-[#37393b]">
                    2.0 Pro
                </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#8e918f]">
                {isSwitchingModel ? (
                    <Loader2 size={14} className="text-[#a8c7fa] animate-spin" />
                ) : (
                    <Sparkles size={14} className="text-[#a8c7fa]" />
                )}
                <span className="hidden sm:inline">{getModelLabel()}</span>
            </div>
        </header>
    );
}