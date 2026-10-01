import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { API_BASE } from './config/constants';
import {
    fetchModels,
    switchModel,
    fetchConversations,
    fetchConversationDetail,
    deleteConversation
} from './services/api';

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [models, setModels] = useState([]);
    const [activeModel, setActiveModel] = useState('');
    const [isSwitchingModel, setIsSwitchingModel] = useState(false);
    const [switchingModelName, setSwitchingModelName] = useState(null);
    const [deepThinking, setDeepThinking] = useState(false);
    const [webSearch, setWebSearch] = useState(false);

    const abortControllerRef = useRef(null);
    const scrollAnchorRef = useRef(null);

    const scrollToBottom = () => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadInitData = async () => {
        try {
            const modelData = await fetchModels();
            const rawModels = modelData.models || [];
            setModels(rawModels);

            const defaultFilename = rawModels.length > 0
                ? (typeof rawModels[0] === 'object' ? rawModels[0].filename : rawModels[0])
                : '';

            const resolvedCurrent = modelData.current || defaultFilename;
            setActiveModel(resolvedCurrent);

            const convs = await fetchConversations();
            setConversations(convs);
            if (convs.length > 0) {
                selectConversation(convs[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        loadInitData();
    }, []);

    const selectConversation = async (id) => {
        try {
            const data = await fetchConversationDetail(id);
            setActiveConvId(data.id);
            setMessages(data.messages || []);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleNewChat = () => {
        setActiveConvId(null);
        setMessages([]);
        setInput('');
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleDeleteConversation = async (id) => {
        await deleteConversation(id);
        const updated = await fetchConversations();
        setConversations(updated);
        if (activeConvId === id) {
            handleNewChat();
        }
    };

    const handleSelectModel = async (modelName) => {
        if (modelName === activeModel || isSwitchingModel) return;
        setSwitchingModelName(modelName);
        setIsSwitchingModel(true);
        try {
            await switchModel(modelName);
            setActiveModel(modelName);
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            }
        } finally {
            setIsSwitchingModel(false);
            setSwitchingModelName(null);
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsGenerating(false);
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isGenerating) return;

        setInput('');
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);

        setIsGenerating(true);
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setMessages([...newMessages, { role: 'assistant', content: '' }]);

        try {
            const response = await fetch(`${API_BASE}/api/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: activeConvId,
                    messages: newMessages,
                    deep_thinking: deepThinking,
                    web_search: webSearch
                }),
                signal: controller.signal
            });

            if (!response.ok) throw new Error('Falha na resposta do assistente');

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let accumulated = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (!dataStr) continue;
                        const parsed = JSON.parse(dataStr);

                        if (parsed.type === 'init') {
                            setActiveConvId(parsed.conversation_id);
                        } else if (parsed.type === 'delta') {
                            accumulated += parsed.text;
                            setMessages((prev) => {
                                const copy = [...prev];
                                copy[copy.length - 1] = { role: 'assistant', content: accumulated };
                                return copy;
                            });
                        } else if (parsed.type === 'done') {
                            const updatedConvs = await fetchConversations();
                            setConversations(updatedConvs);
                        }
                    }
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: '[Erro de comunicação com o servidor local]' }
                ]);
            }
        } finally {
            setIsGenerating(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#131314]">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                conversations={conversations}
                activeId={activeConvId}
                onSelectConversation={selectConversation}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                models={models}
                activeModel={activeModel}
                onSelectModel={handleSelectModel}
                isSwitchingModel={isSwitchingModel}
                switchingModelName={switchingModelName}
            />

            <div className="flex-1 flex flex-col h-full min-w-0">
                <Header
                    activeModel={activeModel}
                    models={models}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    isSwitchingModel={isSwitchingModel}
                />

                <main className="flex-1 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
                            <h2 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[#8ab4f8] to-[#c58af9] bg-clip-text text-transparent">
                                Olá, como posso ajudar?
                            </h2>
                            <p className="text-xs sm:text-sm text-[#8e918f] mt-2 max-w-md">
                                Aetheris é o seu motor local de inteligência, raciocínio aprofundado e programação.
                            </p>
                        </div>
                    ) : (
                        <div className="pb-4">
                            {messages.map((m, idx) => (
                                <ChatMessage key={idx} role={m.role} content={m.content} />
                            ))}
                            <div ref={scrollAnchorRef} />
                        </div>
                    )}
                </main>

                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    isGenerating={isGenerating}
                    onStop={handleStop}
                    deepThinking={deepThinking}
                    setDeepThinking={setDeepThinking}
                    webSearch={webSearch}
                    setWebSearch={setWebSearch}
                />
            </div>
        </div>
    );
}