import { ImageResponse } from "next/og";
import mongoose from "mongoose";
import Gear from "@/models/Gear";

export const runtime = "nodejs";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);

  await connectDB();

  const gear = await Gear.find({
    discordUsername: { $regex: new RegExp(`^${username}$`, "i") },
    isMain: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const gearNames = (gear as any[]).map((g) => `${g.category}: ${g.name}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#050505",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Green accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "6px",
            height: "100%",
            background: "#22c55e",
          }}
        />

        {/* GEARSYNC brand */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "#22c55e",
            letterSpacing: "-0.5px",
            marginBottom: "40px",
            display: "flex",
          }}
        >
          GEARSYNC
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: "24px",
            display: "flex",
          }}
        >
          {username}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            color: "#52525b",
            marginBottom: "48px",
            display: "flex",
          }}
        >
          Gaming Gear Profile
        </div>

        {/* Gear pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {gearNames.length > 0 ? (
            gearNames.map((name, i) => (
              <div
                key={i}
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: "12px",
                  padding: "10px 18px",
                  fontSize: "15px",
                  color: "#a1a1aa",
                  display: "flex",
                }}
              >
                {name}
              </div>
            ))
          ) : (
            <div
              style={{
                fontSize: "16px",
                color: "#3f3f46",
                display: "flex",
              }}
            >
              No gear set up yet
            </div>
          )}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "80px",
            fontSize: "14px",
            color: "#27272a",
            display: "flex",
          }}
        >
          gearsync.gg/u/{username}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
