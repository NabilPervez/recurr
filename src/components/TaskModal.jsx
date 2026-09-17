import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { SHORTCUTS, TIME_EMOJI, TIME_SLOTS } from "../lib/constants";
import { todayStr } from "../lib/date";

export default function TaskModal({ task, cats, setCats, onSave, onDelete, onClose }) {
  const isEdit = !!task;
  const initFreq = task?.frequency;
  const initIsCustom = initFreq ? !SHORTCUTS.some(s=>s.value===initFreq.value&&s.unit===initFreq.unit) : false;

  const [name,       setName]       = useState(task?.name || "");
  const [category,   setCategory]   = useState(task?.category || cats[0] || "");
  const [shortcut,   setShortcut]   = useState(initFreq || SHORTCUTS[2]);
  const [useCustom,  setUseCustom]  = useState(initIsCustom);
  const [custVal,    setCustVal]    = useState(initFreq?.value || 2);
  const [custUnit,   setCustUnit]   = useState(initFreq?.unit  || "weeks");
  const [timeOfDay,  setTimeOfDay]  = useState(task?.timeOfDay || null);
  const [startDate,  setStartDate]  = useState(task?.nextDueDate || todayStr());
  const [newCat,     setNewCat]     = useState("");
  const [err,        setErr]        = useState("");

  const freq = useCustom ? { value: Number(custVal), unit: custUnit } : shortcut;

  const handleSave = () => {
    if (!name.trim()) { setErr("Task name is required."); return; }
    onSave({ name: name.trim(), category, frequency: freq, timeOfDay, startDate });
  };

  const addNewCat = () => {
    const v = newCat.trim();
    if (!v) return;
    if (!cats.includes(v)) setCats(p => [...p, v]);
    setCategory(v);
    setNewCat("");
  };

  return (
    <div className="rr-overlay" onClick={onClose}>
      <div className="rr-sheet" onClick={e=>e.stopPropagation()}>
        <div className="rr-handle" />
        <div className="rr-shdr">
          <span className="rr-sttl">{isEdit ? "Edit Task" : "New Task"}</span>
          <button className="rr-hbtn" onClick={onClose} aria-label="Close"><X size={17} /></button>
        </div>

        {/* Name */}
        <div className="rr-fg">
          <label className="rr-lbl">Task Name</label>
          <input className="rr-inp" value={name} autoFocus
            onChange={e=>{ setName(e.target.value); setErr(""); }}
            onKeyDown={e=>e.key==="Enter"&&handleSave()}
            placeholder="e.g. Change oil, Order diapers, Call mom…" />
          {err && <p style={{ color:"var(--danger)", fontSize:12, marginTop:5 }}>{err}</p>}
        </div>

        {/* Category */}
        <div className="rr-fg">
          <label className="rr-lbl">Category</label>
          <select className="rr-sel" value={category} onChange={e=>setCategory(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <input className="rr-inp" value={newCat} onChange={e=>setNewCat(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addNewCat()}
              placeholder="New category…" style={{ flex:1, fontSize:13, padding:"9px 12px" }} />
            <button onClick={addNewCat} style={{
              padding:"9px 13px", borderRadius:10, border:"1px solid var(--bd)",
              background:"var(--s2)", color:"var(--t1)", cursor:"pointer", fontSize:13, whiteSpace:"nowrap"
            }}>+ Add</button>
          </div>
        </div>

        {/* Frequency */}
        <div className="rr-fg">
          <label className="rr-lbl">Repeat Every</label>
          <div className="rr-chips" style={{ marginBottom:10 }}>
            {SHORTCUTS.map(s => (
              <button key={s.label}
                className={`rr-chip ${!useCustom && shortcut.value===s.value && shortcut.unit===s.unit ? "on":""}`}
                onClick={() => { setShortcut(s); setUseCustom(false); }}>
                {s.label}
              </button>
            ))}
            <button className={`rr-chip ${useCustom?"on":""}`} onClick={() => setUseCustom(true)}>
              Custom…
            </button>
          </div>
          {useCustom && (
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" min={1} max={999} className="rr-inp"
                value={custVal} onChange={e=>setCustVal(e.target.value)}
                style={{ width:78, flex:"0 0 78px" }} />
              <select className="rr-sel" value={custUnit} onChange={e=>setCustUnit(e.target.value)}>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          )}
        </div>

        {/* Time of day */}
        <div className="rr-fg">
          <label className="rr-lbl">Time of Day <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:"var(--t3)", fontFamily:"DM Sans" }}>(optional)</span></label>
          <div className="rr-chips">
            {TIME_SLOTS.map(slot => (
              <button key={slot}
                className={`rr-chip ${timeOfDay===slot?"on":""}`}
                onClick={() => setTimeOfDay(timeOfDay===slot ? null : slot)}>
                {TIME_EMOJI[slot]} {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div className="rr-fg">
          <label className="rr-lbl">First Due Date</label>
          <input type="date" className="rr-inp" value={startDate}
            onChange={e=>setStartDate(e.target.value)}
            style={{ colorScheme: "dark" }} />
        </div>

        {/* Buttons */}
        <div className="rr-row">
          {isEdit && onDelete && (
            <button className="rr-btn-s danger" onClick={onDelete}
              style={{ flex:"0 0 auto", padding:"13px 14px" }}>
              <Trash2 size={15} />
            </button>
          )}
          <button className="rr-btn-s" onClick={onClose}>Cancel</button>
          <button className="rr-btn-p" onClick={handleSave}>{isEdit ? "Save Changes" : "Add Task"}</button>
        </div>
      </div>
    </div>
  );
}
