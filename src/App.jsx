import { useCallback, useEffect, useState } from "react";
import { Calendar, Home, Moon, Plus, Settings, Sun } from "lucide-react";
import { CATS_KEY, DEFAULT_CATS, PREFS_KEY, SAMPLE_TASKS, STORAGE_KEY, TIME_SLOTS } from "./lib/constants";
import { shiftDate, todayStr, uid } from "./lib/date";
import { load, store } from "./lib/storage";
import TodayView from "./components/TodayView";
import UpcomingView from "./components/UpcomingView";
import SettingsView from "./components/SettingsView";
import DelayModal from "./components/DelayModal";
import TaskModal from "./components/TaskModal";

export default function App() {
  const [tasks,  setTasks]  = useState(() => load(STORAGE_KEY, []));
  const [prefs,  setPrefs]  = useState(() => ({ theme:"dark", ...load(PREFS_KEY, {}) }));
  const [cats,   setCats]   = useState(() => load(CATS_KEY, DEFAULT_CATS));
  const [view,   setView]   = useState("today");
  const [modal,  setModal]  = useState(null);   // null | {type:'add'} | {type:'edit', task}
  const [dlyId,  setDlyId]  = useState(null);   // task id for delay modal

  useEffect(() => { store(STORAGE_KEY, tasks); }, [tasks]);
  useEffect(() => { store(PREFS_KEY,   prefs); }, [prefs]);
  useEffect(() => { store(CATS_KEY,    cats);  }, [cats]);

  const setPref = (k,v) => setPrefs(p=>({...p,[k]:v}));
  const dark = prefs.theme === "dark";

  // ── Task Operations ──
  const addTask = useCallback((data) => {
    setTasks(p => [...p, {
      id: uid(), name:data.name, category:data.category,
      frequency:data.frequency, timeOfDay:data.timeOfDay || null,
      nextDueDate: data.startDate || todayStr(),
      baseDueDate: data.startDate || todayStr(),
      createdAt: new Date().toISOString(), lastCompleted: null,
    }]);
  }, []);

  const updateTask = useCallback((id, data) => {
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      return {
        ...t, name:data.name, category:data.category,
        frequency:data.frequency, timeOfDay:data.timeOfDay || null,
        nextDueDate: data.startDate, baseDueDate: data.startDate,
      };
    }));
  }, []);

  const deleteTask  = useCallback((id) => setTasks(p=>p.filter(t=>t.id!==id)), []);

  const completeTask = useCallback((id) => {
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const newBase = shiftDate(t.baseDueDate, t.frequency.value, t.frequency.unit);
      return { ...t, baseDueDate:newBase, nextDueDate:newBase, lastCompleted:new Date().toISOString() };
    }));
  }, []);

  const delayTask = useCallback((id, days) => {
    setTasks(p => p.map(t =>
      t.id!==id ? t : { ...t, nextDueDate:shiftDate(t.nextDueDate, days, "days") }
    ));
  }, []);

  const loadSamples = () => {
    const t = todayStr();
    const samples = SAMPLE_TASKS.map(s => ({
      id: uid(),
      name: s.name, category: s.category,
      frequency: s.frequency, timeOfDay: s.timeOfDay,
      nextDueDate: shiftDate(t, s.daysFromNow, "days"),
      baseDueDate: shiftDate(t, s.daysFromNow, "days"),
      createdAt: new Date().toISOString(), lastCompleted: null,
    }));
    setTasks(samples);
  };

  // ── Derived ──
  const t = todayStr();
  const todayTasks    = tasks.filter(task => task.nextDueDate <= t);
  const upcomingTasks = tasks.filter(task => task.nextDueDate >  t)
    .sort((a,b) => a.nextDueDate.localeCompare(b.nextDueDate));

  const todayByTime = [...TIME_SLOTS, "Anytime"].map(slot => ({
    slot,
    tasks: slot==="Anytime"
      ? todayTasks.filter(task => !task.timeOfDay)
      : todayTasks.filter(task => task.timeOfDay===slot),
  })).filter(g => g.tasks.length > 0);

  const d1=shiftDate(t,1,"days"), d7=shiftDate(t,7,"days"),
        d14=shiftDate(t,14,"days"), d30=shiftDate(t,30,"days");

  const upcomingGroups = [
    { label:"Tomorrow",   tasks: upcomingTasks.filter(x => x.nextDueDate===d1) },
    { label:"This Week",  tasks: upcomingTasks.filter(x => x.nextDueDate>d1  && x.nextDueDate<=d7)  },
    { label:"Next Week",  tasks: upcomingTasks.filter(x => x.nextDueDate>d7  && x.nextDueDate<=d14) },
    { label:"This Month", tasks: upcomingTasks.filter(x => x.nextDueDate>d14 && x.nextDueDate<=d30) },
    { label:"Future",     tasks: upcomingTasks.filter(x => x.nextDueDate>d30) },
  ].filter(g => g.tasks.length > 0);

  // ── Import / Export ──
  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ tasks, categories:cats, preferences:prefs, exportedAt:new Date().toISOString() }, null, 2)],
      { type:"application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href=url; a.download=`recurr-backup-${t}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (window.confirm("Replace current data with this backup?")) {
          if (data.tasks)       setTasks(data.tasks);
          if (data.categories)  setCats(data.categories);
          if (data.preferences) setPrefs(p=>({...p,...data.preferences}));
        }
      } catch { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  };

  const clearData = () => {
    if (window.confirm("Delete ALL tasks? This cannot be undone.")) {
      setTasks([]); setCats(DEFAULT_CATS);
    }
  };

  // ── Header meta ──
  const now = new Date();
  const dateLine = now.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric" });
  const viewSub = {
    today:    dateLine,
    upcoming: `${upcomingTasks.length} task${upcomingTasks.length!==1?"s":""} ahead`,
    settings: "Preferences & data",
  };

  const delayTask_ = tasks.find(t=>t.id===dlyId);

  return (
    <div className={`rr ${dark ? "" : "light"}`}>

      {/* Header */}
      <div className="rr-header">
        <div>
          <div className="rr-logo">
            <div className="rr-logo-dot" />
            {view==="today" ? "Recurr" : view==="upcoming" ? "Upcoming" : "Settings"}
          </div>
          <div className="rr-header-sub">{viewSub[view]}</div>
        </div>
        <button className="rr-hbtn" onClick={()=>setPref("theme",dark?"light":"dark")} aria-label="Toggle theme">
          {dark ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
      </div>

      {/* Main content */}
      <div className="rr-content">
        {view==="today" && (
          <TodayView groups={todayByTime} total={todayTasks.length}
            onComplete={completeTask} onDelay={setDlyId} onEdit={task=>setModal({type:"edit",task})}
            onDelete={deleteTask} onLoadSamples={loadSamples} />
        )}
        {view==="upcoming" && (
          <UpcomingView groups={upcomingGroups}
            onComplete={completeTask} onDelay={setDlyId} onEdit={task=>setModal({type:"edit",task})}
            onDelete={deleteTask} />
        )}
        {view==="settings" && (
          <SettingsView prefs={prefs} setPref={setPref} cats={cats} setCats={setCats}
            onExport={exportData} onImport={importData} taskCount={tasks.length} onClear={clearData} />
        )}
      </div>

      {/* FAB */}
      {view!=="settings" && (
        <button className="rr-fab" onClick={()=>setModal({type:"add"})} aria-label="Add task">
          <Plus size={22} color="#000" strokeWidth={2.5}/>
        </button>
      )}

      {/* Bottom Nav */}
      <nav className="rr-nav" role="navigation" aria-label="Main navigation">
        {[
          { id:"today",    icon:<Home size={20}/>,     label:"Today"    },
          { id:"upcoming", icon:<Calendar size={20}/>, label:"Upcoming" },
          { id:"settings", icon:<Settings size={20}/>, label:"Settings" },
        ].map(tab => (
          <button key={tab.id} className={`rr-ntab ${view===tab.id?"on":""}`}
            onClick={()=>setView(tab.id)} style={{ position:"relative" }}>
            {tab.icon}
            {tab.id==="today" && todayTasks.length>0 && (
              <span className="rr-nbadge">{todayTasks.length>9?"9+":todayTasks.length}</span>
            )}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Task Modal */}
      {(modal?.type==="add" || modal?.type==="edit") && (
        <TaskModal
          task={modal.type==="edit" ? modal.task : null}
          cats={cats} setCats={setCats}
          onSave={data => {
            if (modal.type==="edit") updateTask(modal.task.id, data);
            else addTask(data);
            setModal(null);
          }}
          onDelete={modal.type==="edit" ? ()=>{ deleteTask(modal.task.id); setModal(null); } : null}
          onClose={()=>setModal(null)}
        />
      )}

      {/* Delay Modal */}
      {dlyId && (
        <DelayModal taskName={delayTask_?.name}
          onDelay={days=>{ delayTask(dlyId, days); setDlyId(null); }}
          onClose={()=>setDlyId(null)} />
      )}
    </div>
  );
}
