import { Component } from "react";
import { CATS_KEY, PREFS_KEY, STORAGE_KEY } from "../lib/constants";

const KEYS = [STORAGE_KEY, PREFS_KEY, CATS_KEY];

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Recurr crashed:", error, info.componentStack);
  }

  exportRaw = () => {
    const raw = Object.fromEntries(KEYS.map((k) => [k, localStorage.getItem(k)]));
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recurr-recovery.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  reset = () => {
    if (!window.confirm("Erase all Recurr data on this device and restart?")) return;
    KEYS.forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rr">
        <div className="rr-empty">
          <div className="rr-empty-ico">⚠️</div>
          <div className="rr-empty-ttl">Something went wrong</div>
          <div className="rr-empty-sub">
            Recurr hit an unexpected error. Your data is still saved — export it before resetting.
          </div>
          <button className="rr-demo-btn" onClick={() => location.reload()}>Reload</button>
          <button className="rr-demo-btn" onClick={this.exportRaw}>Export data</button>
          <button className="rr-demo-btn" style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "var(--dangbg)" }} onClick={this.reset}>
            Reset app
          </button>
        </div>
      </div>
    );
  }
}
