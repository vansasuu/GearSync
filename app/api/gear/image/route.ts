import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    const encoded = encodeURIComponent(`${query} product`);

    // Step 1: get DuckDuckGo vqd token
    const initRes = await fetch(`https://duckduckgo.com/?q=${encoded}&iax=images&ia=images`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const initHtml = await initRes.text();
    const vqdMatch = initHtml.match(/vqd=([\d-]+)/);

    if (!vqdMatch) return NextResponse.json({ imageUrl: null });

    const vqd = vqdMatch[1];

    // Step 2: fetch image results
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?q=${encoded}&vqd=${vqd}&f=,,,,,&p=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://duckduckgo.com/",
        },
      }
    );
    const imgData = await imgRes.json();
    const imageUrl = imgData.results?.[0]?.image ?? null;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json({ imageUrl: null });
  }
}