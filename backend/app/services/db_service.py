import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from app.config import settings

DB_PATH = os.path.join(settings.data_dir, "aetheris.db")


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        """)


def list_conversations() -> List[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, title, updated_at FROM conversations ORDER BY updated_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def create_conversation(title: str = "Nova Conversa") -> int:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("INSERT INTO conversations (title) VALUES (?)", (title,))
        return cursor.lastrowid


def get_conversation(conv_id: int) -> Optional[Dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        conv = conn.execute(
            "SELECT id, title, updated_at FROM conversations WHERE id = ?", (conv_id,)
        ).fetchone()
        if not conv:
            return None
        msg_rows = conn.execute(
            "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC",
            (conv_id,),
        ).fetchall()
        return {
            "id": conv["id"],
            "title": conv["title"],
            "updated_at": conv["updated_at"],
            "messages": [dict(m) for m in msg_rows],
        }


def add_message(conv_id: int, role: str, content: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
            (conv_id, role, content),
        )
        conn.execute(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (conv_id,),
        )


def update_conversation_title(conv_id: int, title: str):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (title, conv_id),
        )


def delete_conversation(conv_id: int):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM messages WHERE conversation_id = ?", (conv_id,))
        conn.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
