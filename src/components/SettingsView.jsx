import { useRef, useState } from "react";
import { Download, Trash2, Upload, X } from "lucide-react";
import { catColor, DEFAULT_CATS } from "../lib/constants";

export default function SettingsView({ prefs, setPref, cats, setCats, onExport, onImport, taskCount, onClear }) {
  const fileRef = useRef();
  const [newCat, setNewCat] = useState("");

  const addCat = () => {
    const v = newCat.trim();
    if (v && !cats.includes(v)) { setCats(p => [...p, v]); }
    setNewCat("");
  };

  return (
    <div style={{ paddingTop:6 }}>
      <div className="rr-sec">🎨&nbsp;&nbsp;Appearance</div>
      <div className="rr-sgrp">
        <div className="rr-srow">
          <div><div className="rr-slbl">Dark Mode</div><div className="rr-ssub">Warm dark / light theme</div></div>
          <button className={`rr-toggle ${prefs.theme==="dark"?"on":""}`}
            onClick={() => setPref("theme", prefs.theme==="dark"?"light":"dark")} aria-label="Toggle theme">
            <div className="rr-tknob" />
          </button>
        </div>
      </div>

      <div className="rr-sec">📦&nbsp;&nbsp;Data</div>
      <div className="rr-sgrp">
        <div className="rr-srow">
          <div>
            <div className="rr-slbl">Local storage</div>
            <div className="rr-ssub">All data lives on your device only</div>
          </div>
          <span style={{ fontFamily:"Space Mono,monospace", fontSize:18, color:"var(--ac)", fontWeight:700 }}>
            {taskCount}
          </span>
        </div>
        <div className="rr-srow">
          <div><div className="rr-slbl">Export backup</div><div className="rr-ssub">Download as JSON</div></div>
          <button className="rr-sbtn" onClick={onExport}><Download size={13} /> Export</button>
        </div>
        <div className="rr-srow">
          <div><div className="rr-slbl">Import backup</div><div className="rr-ssub">Restore from JSON</div></div>
          <button className="rr-sbtn" onClick={() => fileRef.current?.click()}><Upload size={13} /> Import</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display:"none" }}
            onChange={e => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value=""; }} />
        </div>
      </div>

      <div className="rr-sec">🗂&nbsp;&nbsp;Categories</div>
      <div className="rr-sgrp">
        <div style={{ padding:"12px 15px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
            {cats.map(cat => {
              const cc = catColor(cat);
              const isDefault = DEFAULT_CATS.includes(cat);
              return (
                <span key={cat} style={{
                  display:"flex", alignItems:"center", gap:4,
                  padding:"4px 10px", borderRadius:20,
                  background:cc+"20", border:`1px solid ${cc}35`, color:cc,
                  fontSize:12, fontWeight:500,
                }}>
                  {cat}
                  {!isDefault && (
                    <button onClick={() => setCats(p => p.filter(c=>c!==cat))}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", padding:0, display:"flex", opacity:0.7 }}>
                      <X size={10} />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input className="rr-inp" value={newCat} onChange={e=>setNewCat(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addCat()}
              placeholder="Add custom category…" style={{ flex:1, fontSize:13, padding:"9px 12px" }} />
            <button onClick={addCat} style={{
              padding:"9px 13px", borderRadius:10, border:"1px solid var(--bd)",
              background:"var(--s2)", color:"var(--t1)", cursor:"pointer", fontSize:13, fontWeight:500
            }}>Add</button>
          </div>
        </div>
      </div>

      <div className="rr-sec">⚠️&nbsp;&nbsp;Danger Zone</div>
      <div className="rr-sgrp" style={{ marginBottom:32 }}>
        <div className="rr-srow">
          <div>
            <div className="rr-slbl" style={{ color:"var(--danger)" }}>Clear all data</div>
            <div className="rr-ssub">Permanently delete all tasks</div>
          </div>
          <button className="rr-sbtn danger" onClick={onClear}><Trash2 size={13} /> Clear</button>
        </div>
      </div>
    </div>
  );
}
