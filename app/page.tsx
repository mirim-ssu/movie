"use client";

import { useState } from "react";

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

            <div style={{ fontWeight: 600 }}>
              {m.title}
              {m.release_date ? ` (${m.release_date.slice(0, 4)})` : ""}
            </div>
            {m.overview ? (
              <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
                {m.overview}
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