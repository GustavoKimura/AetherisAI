import { API_BASE } from '../config/constants';

export async function fetchModels() {
    const res = await fetch(`${API_BASE}/api/models`);
    if (!res.ok) throw new Error('Falha ao carregar modelos');
    return res.json();
}

export async function switchModel(modelName) {
    const res = await fetch(`${API_BASE}/api/models/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: modelName }),
    });
    if (!res.ok) throw new Error('Falha ao trocar modelo');
    return res.json();
}

export async function fetchConversations() {
    const res = await fetch(`${API_BASE}/api/conversations`);
    if (!res.ok) throw new Error('Falha ao carregar conversas');
    return res.json();
}

export async function fetchConversationDetail(id) {
    const res = await fetch(`${API_BASE}/api/conversations/${id}`);
    if (!res.ok) throw new Error('Falha ao buscar histórico');
    return res.json();
}

export async function deleteConversation(id) {
    const res = await fetch(`${API_BASE}/api/conversations/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Falha ao excluir conversa');
    return res.json();
} s