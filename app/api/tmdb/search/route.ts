import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB_API_KEY is missing" },
      { status: 500 }
    );
  }

  const url =
    "https://api.themoviedb.org/3/search/movie" +
    `?query=${encodeURIComponent(query)}` +
    `&include_adult=false&language=ko-KR&page=1` +
    `&api_key=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "TMDB request failed", status: res.status, detail },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}