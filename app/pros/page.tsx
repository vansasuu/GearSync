import connectToDatabase from "@/lib/mongoose";
import mongoose from "mongoose";
import Pro from "@/models/Pro";
import ProAvatar from "./ProAvatar";
import ImportProButton from "./ImportProButton";

async function getPros() {
  await connectToDatabase();
  const pros = await Pro.find({ game: "CS2" }).sort({ name: 1 });
  return JSON.parse(JSON.stringify(pros));
}


export default async function ProsPage() {
  const pros = await getPros();

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans">
      {/* NAV */}
      <nav className="glass w-full h-16 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-black tracking-tighter text-green-500">GEARSYNC</a>
          <a href="/explore" className="nav-link text-sm font-semibold text-zinc-400 hover:text-white transition">Explore Gear</a>
        </div>
        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">CS2 Pro Settings</span>
      </nav>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">CS2 Pro Settings</h1>
            <p className="text-base text-zinc-500">{pros.length} pros tracked · Updated from prosettings.net</p>
          </div>
          <a
            href="/"
            className="text-sm font-semibold text-zinc-400 border border-zinc-700 px-5 py-2.5 rounded-xl hover:border-green-500 hover:text-white transition-all"
          >
            ← Back
          </a>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pros.map((pro: any) => (
            <div
              key={pro._id}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 hover:border-zinc-700 transition-all"
            >
              {/* PLAYER HEADER */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#111] flex-shrink-0 overflow-hidden border border-[#222]">
                  <ProAvatar name={pro.name} imageUrl={pro.imageUrl} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white text-sm truncate">{pro.name}</div>
                  {pro.team && <div className="text-[11px] text-zinc-600 truncate">{pro.team}</div>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ImportProButton proId={pro._id} />
                  <a
                    href={pro.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-zinc-600 hover:text-green-500 transition"
                  >
                    ↗
                  </a>
                </div>
              </div>

              {/* GEAR ROWS */}
              <div className="flex flex-col gap-0">
                {[
                  { label: 'Mouse', value: pro.gear?.mouse },
                  { label: 'Keyboard', value: pro.gear?.keyboard },
                  { label: 'Headset', value: pro.gear?.headset },
                  { label: 'Mousepad', value: pro.gear?.mousepad },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#111]">
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider w-20 flex-shrink-0">
                      {item.label}
                    </span>
                    <span className="text-xs text-zinc-400 text-right truncate max-w-[160px]">
                      {item.value || <span className="text-zinc-700">—</span>}
                    </span>
                  </div>
                ))}

                {/* SETTINGS ROW */}
                <div className="flex justify-between items-center pt-3 mt-1">
                  <div className="flex gap-4">
                    {pro.settings?.dpi && (
                      <div>
                        <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">DPI</div>
                        <div className="text-xs font-bold text-green-500">{pro.settings.dpi}</div>
                      </div>
                    )}
                    {pro.settings?.sensitivity && (
                      <div>
                        <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">Sens</div>
                        <div className="text-xs font-bold text-green-500">{pro.settings.sensitivity}</div>
                      </div>
                    )}
                    {pro.settings?.eDPI && (
                      <div>
                        <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-wider mb-0.5">eDPI</div>
                        <div className="text-xs font-bold text-green-500">{pro.settings.eDPI}</div>
                      </div>
                    )}
                  </div>
                  {pro.settings?.resolution && (
                    <div className="text-[10px] font-bold text-zinc-700 bg-[#111] px-2 py-1 rounded">
                      {pro.settings.resolution}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
