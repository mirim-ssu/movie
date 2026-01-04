"use client";

import { useState } from "react";

function summarizeOverview(text?: string, maxSentences = 3, maxChars = 220) {
  if (!text) return "";

  const t = text.trim();
  if (!t) return "";

  // 문장 단위 분리(한국어/영어 혼합 대응용, 완벽하진 않음)
  const sentences = t
    .split(/(?<=[.!?。]|[다요죠]\.)\s+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) {
    const picked = sentences.slice(0, maxSentences).join(" ");
    return picked.length > maxChars ? picked.slice(0, maxChars) + "..." : picked;
  }

  // 문장 분리가 잘 안 되면 글자수 기준
  return t.length > maxChars ? t.slice(0, maxChars) + "..." : t;
}

type Movie = {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [aiSummaries, setAiSummaries] = useState<Record<number, string>>({});
  const [aiLoadingIds, setAiLoadingIds] = useState<Record<number, boolean>>({});

  const requestAiSummary = async (m: Movie) => {
      if (!m.overview) return;

      setAiLoadingIds((prev) => ({ ...prev, [m.id]: true }));

      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: m.overview, title: m.title }),
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data?.error ?? "AI 요약 실패");
          return;
        }

        setAiSummaries((prev) => ({ ...prev, [m.id]: data.summary || "" }));
      } finally {
        setAiLoadingIds((prev) => ({ ...prev, [m.id]: false }));
      }
    };

  const onSearch = async () => {
    const q = query.trim();
    if (!q) {
      setError("영화 제목을 입력해줘");
      return;
    }

    setLoading(true);
    setError(null);
    setMovies([]);

    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "검색 실패");
        return;
      }

      const results = Array.isArray(data?.results) ? data.results : [];
      setMovies(
        results.map((m: any) => ({
          id: m.id,
          title: m.title,
          release_date: m.release_date,
          overview: m.overview,
          poster_path: m.poster_path,
        }))
      );
    } catch {
      setError("네트워크 오류(확실하지 않음)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>TMDB 영화 검색</h1>
      
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예) 기생충"
          style={{
            flex: 1,
            padding: 10,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch();
          }}
        />
        <button
          onClick={onSearch}
          disabled={loading}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ddd",
            cursor: "pointer",
          }}
        >
          {loading ? "검색 중..." : "검색"}
        </button>
      </div>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}

      <ul style={{ marginTop: 16, paddingLeft: 18 }}>
        {movies.map((m) => (
          <li key={m.id} style={{ marginBottom: 12 }}>
            {m.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                alt={`${m.title} 포스터`}
                style={{
                  width: 120,
                  borderRadius: 8,
                  border: "1px solid #eee",
                  marginBottom: 8,
                }}
              />
            ) : (
              <div style={{ fontSize: 12, color: "#999", marginBottom: 8 }}>
                포스터 없음
              </div>
            )}

            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => requestAiSummary(m)}
                disabled={!m.overview || aiLoadingIds[m.id]}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                {aiLoadingIds[m.id] ? "요약 중..." : "AI 요약"}
              </button>
            </div>

            {m.overview ? (
              <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
                {aiSummaries[m.id] ? aiSummaries[m.id] : summarizeOverview(m.overview)}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#999", marginTop: 4 }}>
                줄거리 정보 없음
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}