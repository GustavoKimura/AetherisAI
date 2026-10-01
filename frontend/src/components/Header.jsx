import React from 'react';
import { Sparkles, Menu } from 'lucide-react';

export function Header({ activeModel, models = [], onToggleSidebar }) {
    const getModelName = () => {
        if (!activeModel) return 'Nenhum modelo ativo';
        if (typeof activeModel === 'object') return activeModel.label || activeModel.filename || '';
        const found = models.find((m) => (typeof m === 'object' ? m.filename : m) === activeModel);
        if (found) return typeof found === 'object' ? found.label : found;
        return activeModel;
    };

    return (
        <header className="h-14 border-b border-[#2d2f31] px-3 sm:px-4 flex items-center justify-between shrink-0 bg-[#131314]/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label="Abrir barra lateral"
                    className="p-2 rounded-full hover:bg-[#282a2c] text-[#c4c7c5] transition-colors md:hidden cursor-pointer"
                >
                    <Menu size={20} />
                </button>
                <span className="text-lg font-medium text-[#e3e3e3] tracking-tight">Aetheris</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#282a2c] text-[#a8c7fa] font-mono border border-[#37393b]">
                    2.0 Pro
                </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#8e918f]">
                <Sparkles size={14} className="text-[#a8c7fa]" />
                <span className="hidden sm:inline">{getModelName()}</span>
            </div>
        </header>
    );
}