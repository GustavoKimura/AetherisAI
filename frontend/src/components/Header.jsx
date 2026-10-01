import React from 'react';
import { Sparkles } from 'lucide-react';

export function Header({ activeModel }) {
    return (
        <header className="h-14 border-b border-[#2d2f31] px-4 flex items-center justify-between shrink-0 bg-[#131314]/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-[#e3e3e3] tracking-tight">Aetheris</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#282a2c] text-[#a8c7fa] font-mono border border-[#37393b]">
                    1.0 Pro
                </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#8e918f]">
                <Sparkles size={14} className="text-[#a8c7fa]" />
                <span className="hidden sm:inline">{activeModel || 'Nenhum modelo ativo'}</span>
            </div>
        </header>
    );
}