import TaskCard from "./TaskCard";

export default function UpcomingView({ groups, onComplete, onDelay, onEdit, onDelete }) {
  if (groups.length === 0) return (
    <div className="rr-empty">
      <div className="rr-empty-ico">📅</div>
      <div className="rr-empty-ttl">Nothing ahead</div>
      <div className="rr-empty-sub">No upcoming tasks. Tasks will appear here after you add them.</div>
    </div>
  );
  return (
    <div>
      {groups.map(({ label, tasks }) => (
        <div key={label}>
          <div className="rr-sec">{label}</div>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} showDate
              onComplete={onComplete} onDelay={onDelay} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
