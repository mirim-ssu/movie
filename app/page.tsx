"use client";

import { useEffect, useMemo, useState } from "react";

type Movie = {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
};

const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [selected, setSelected] = useState<Movie | null>(null);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const hasOverview = !!selected?.overview?.trim();

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;

    setErrorMsg("");
    setIsSearching(true);
    setSelected(null);
    setAiSummary("");

    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(q)}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        const t = await res.text();
        setErrorMsg(`검색 실패: ${res.status} ${t}`);
        setResults([]);
        return;
      }

      const data = await res.json();
      const list: Movie[] = Array.isArray(data?.results) ? data.results : [];
      setResults(list);
    } catch (err: any) {
      setErrorMsg(`검색 중 오류: ${err?.message ?? "unknown"}`);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function openMovie(m: Movie) {
    setSelected(m);
    setAiSummary("");
    setErrorMsg("");
  }

  function closeModal() {
    setSelected(null);
    setAiSummary("");
    setIsSummarizing(false);
  }

  async function runSummarize() {
    if (!selected) return;

    const text = selected.overview?.trim() ?? "";
    if (!text) {
      setAiSummary("요약할 줄거리가 없습니다.");
      return;
    }

    setErrorMsg("");
    setIsSummarizing(true);
    setAiSummary("");

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, title: selected.title }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.detail || data?.error || "요약 실패");
        return;
      }

      setAiSummary(data?.summary ?? "");
    } catch (err: any) {
      setErrorMsg(`요약 중 오류: ${err?.message ?? "unknown"}`);
    } finally {
      setIsSummarizing(false);
    }
  }

  // ESC로 모달 닫기
  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>TMDB 영화 검색</h1>

      <form onSubmit={onSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="영화 제목을 입력하세요"
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          disabled={isSearching}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: isSearching ? "#f3f3f3" : "white",
            cursor: isSearching ? "not-allowed" : "pointer",
          }}
        >
          {isSearching ? "검색 중..." : "검색"}
        </button>
      </form>

      {errorMsg ? (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd0d0" }}>
          {errorMsg}
        </div>
      ) : null}

      {/* ✅ 검색 결과: 포스터 + 제목만 크게, 그리드 */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {results.map((m) => (
          <button
            key={m.id}
            onClick={() => openMovie(m)}
            style={{
              textAlign: "left",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 12,
              background: "white",
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
            aria-label={`${m.title} 상세 보기`}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "2/3",
                borderRadius: 12,
                overflow: "hidden",
                background: "#f2f2f2",
                marginBottom: 10,
              }}
            >
              {m.poster_path ? (
                <img
                  src={`${TMDB_IMG}${m.poster_path}`}
                  alt={m.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#888" }}>
                  No Image
                </div>
              )}
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{m.title}</div>
            {m.release_date ? (
              <div style={{ marginTop: 4, fontSize: 13, color: "#666" }}>{m.release_date}</div>
            ) : null}
          </button>
        ))}
      </section>

      {/* ✅ 모달: 클릭 시 줄거리 + AI 요약 */}
      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            // 배경 클릭 시 닫기
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "min(920px, 100%)",
              borderRadius: 16,
              background: "white",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eee" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.title}</div>
                {selected.release_date ? (
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{selected.release_date}</div>
                ) : null}
              </div>

              <button
                onClick={closeModal}
                style={{ border: "1px solid #ddd", borderRadius: 10, padding: "8px 10px", background: "white", cursor: "pointer" }}
              >
                닫기
              </button>
            </div>

            {/* 본문 */}
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, padding: 16 }}>
              {/* 포스터 */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#f2f2f2",
                }}
              >
                {selected.poster_path ? (
                  <img
                    src={`${TMDB_IMG}${selected.poster_path}`}
                    alt={selected.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#888" }}>
                    No Image
                  </div>
                )}
              </div>

              {/* 상세 + 요약 */}
              <div style={{ minWidth: 0 }}>
                {/* ✅ 요약 중 표시를 "글 영역"에 크게 */}
                {isSummarizing ? (
                  <div
                    style={{
                      marginBottom: 10,
                      padding: 10,
                      borderRadius: 12,
                      border: "1px solid #dbeafe",
                      background: "#eff6ff",
                      fontWeight: 700,
                    }}
                  >
                    요약 중... 잠시만 기다려주세요
                  </div>
                ) : null}

                <div style={{ fontSize: 14, color: "#333", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {hasOverview ? selected.overview : "줄거리 정보가 없습니다."}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
                  <button
                    onClick={runSummarize}
                    disabled={isSummarizing || !hasOverview}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      background: isSummarizing ? "#f3f3f3" : "white",
                      cursor: isSummarizing || !hasOverview ? "not-allowed" : "pointer",
                      fontWeight: 700,
                    }}
                  >
                    {isSummarizing ? "요약 중..." : "AI 요약"}
                  </button>

                  {!hasOverview ? (
                    <span style={{ fontSize: 13, color: "#777" }}>줄거리가 없어 AI 요약을 할 수 없어요.</span>
                  ) : null}
                </div>

                {aiSummary ? (
                  <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>AI 한 문장 요약</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6 }}>{aiSummary}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
