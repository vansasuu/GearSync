import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

  try {
    let imageUrl = null;

    try {
      if (process.env.SERPER_API_KEY) {
        const res = await fetch("https://google.serper.dev/images", {
          method: "POST",
          headers: {
            "X-API-KEY": process.env.SERPER_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ q: `${query} product` })
        });
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          imageUrl = data.images[0].imageUrl;
        }
      } else {
        console.warn("Missing SERPER_API_KEY in environment variables.");
      }
    } catch (e) {
      console.error("Serper API Fetch failed:", e);
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json({ imageUrl: null });
  }
}