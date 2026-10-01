import asyncio
from typing import List, Dict
from duckduckgo_search import DDGS


class SearchService:
    @staticmethod
    def _sync_search(query: str, max_results: int = 4) -> List[Dict[str, str]]:
        results = []
        try:
            with DDGS() as ddgs:
                raw_results = list(ddgs.text(query, max_results=max_results))
                for item in raw_results:
                    results.append(
                        {
                            "title": item.get("title", ""),
                            "snippet": item.get("body", ""),
                            "link": item.get("href", ""),
                        }
                    )
        except Exception:
            pass
        return results

    @classmethod
    async def search(cls, query: str, max_results: int = 4) -> List[Dict[str, str]]:
        return await asyncio.to_thread(cls._sync_search, query, max_results)

    @classmethod
    def format_search_context(cls, results: List[Dict[str, str]]) -> str:
        if not results:
            return ""
        lines = ["[RESULTADOS DA PESQUISA WEB EM TEMPO REAL]:"]
        for idx, res in enumerate(results, 1):
            lines.append(
                f"{idx}. {res['title']}\nTrecho: {res['snippet']}\nFonte: {res['link']}"
            )
        return "\n\n".join(lines)
