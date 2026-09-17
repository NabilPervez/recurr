import { Clock, X } from "lucide-react";
import { dateLabel, shiftDate, todayStr } from "../lib/date";

export default function DelayModal({ taskName, onDelay, onClose }) {
  const opts = [
    { label:"+1 Day",   days:1  },
    { label:"+3 Days",  days:3  },
    { label:"+1 Week",  days:7  },
    { label:"+2 Weeks", days:14 },
  ];
  const t = todayStr();
  return (
    <div className="rr-overlay" onClick={onClose}>
      <div className="rr-sheet" onClick={e=>e.stopPropagation()}>
        <div className="rr-handle" />
        <div className="rr-shdr">
          <span className="rr-sttl">Delay Task</span>
          <button className="rr-hbtn" onClick={onClose} aria-label="Close"><X size={17} /></button>
        </div>
        <div style={{ padding:"0 16px 8px" }}>
          {taskName && <p style={{ fontSize:14, fontWeight:500, color:"var(--t1)", marginBottom:6 }}>"{taskName}"</p>}
          <p style={{ fontSize:13, color:"var(--t2)", lineHeight:1.55, marginBottom:14 }}>
            Delays this occurrence only. The recurrence base stays the same, so the <em>next</em> due date is unaffected.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
            {opts.map(({ label, days }) => (
              <button key={days} className="rr-dopt" onClick={() => onDelay(days)}>
                <Clock size={16} />
                <span>{label}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"var(--t3)", fontFamily:"Space Mono,monospace" }}>
                  → {dateLabel(shiftDate(t, days, "days"))}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="rr-row">
          <button className="rr-btn-s" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
