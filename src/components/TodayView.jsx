import TaskCard from "./TaskCard";
import { TIME_EMOJI } from "../lib/constants";

export default function TodayView({ groups, total, onComplete, onDelay, onEdit, onDelete, onLoadSamples }) {
  if (total === 0) return (
    <div className="rr-empty">
      <div className="rr-empty-ico">✅</div>
      <div className="rr-empty-ttl">You're all caught up!</div>
      <div className="rr-empty-sub">No tasks due today. Add a recurring task to start tracking life maintenance.</div>
      <button className="rr-demo-btn" onClick={onLoadSamples}>Load sample tasks</button>
    </div>
  );
  return (
    <div>
      {groups.map(({ slot, tasks }) => (
        <div key={slot}>
          <div className="rr-sec">{TIME_EMOJI[slot] || "⏰"}&nbsp;&nbsp;{slot}</div>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task}
              onComplete={onComplete} onDelay={onDelay} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
