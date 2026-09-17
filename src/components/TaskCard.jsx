import { useState } from "react";
import { Check, Clock, Edit2, Trash2 } from "lucide-react";
import { catColor, TIME_EMOJI } from "../lib/constants";
import { dateLabel, freqLabel, todayStr } from "../lib/date";

export default function TaskCard({ task, showDate=false, onComplete, onDelay, onEdit, onDelete }) {
  const [done, setDone] = useState(false);
  const t = todayStr();
  const isOverdue = task.nextDueDate < t;
  const isToday   = task.nextDueDate === t;

  const handleComplete = () => {
    setDone(true);
    setTimeout(() => { onComplete(task.id); setDone(false); }, 350);
  };

  const cc = catColor(task.category);
  return (
    <div
      className={`rr-card ${isOverdue && showDate ? "overdue" : ""} ${done ? "completing" : ""}`}
      style={{ "--cat-clr": cc }}
    >
      <button className={`rr-check ${done ? "done" : ""}`} onClick={handleComplete} aria-label="Complete">
        <Check size={13} strokeWidth={3} />
      </button>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="rr-tname">{task.name}</div>
        <div className="rr-tmeta">
          {task.category && (
            <span className="rr-badge" style={{ background:cc+"20", color:cc, border:`1px solid ${cc}35` }}>
              {task.category}
            </span>
          )}
          <span className="rr-freq">{freqLabel(task.frequency)}</span>
          {task.timeOfDay && <span className="rr-freq">{TIME_EMOJI[task.timeOfDay]} {task.timeOfDay}</span>}
          {showDate && (
            <span className={`rr-datechip ${isOverdue?"overdue":isToday?"today":""}`}>
              {dateLabel(task.nextDueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="rr-acts">
        <button className="rr-act delay" onClick={() => onDelay(task.id)} title="Delay" aria-label="Delay"><Clock size={12} /></button>
        <button className="rr-act edit"  onClick={() => onEdit(task)}     title="Edit"  aria-label="Edit"><Edit2 size={12} /></button>
        <button className="rr-act del"   onClick={() => onDelete(task.id)} title="Delete" aria-label="Delete"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}
