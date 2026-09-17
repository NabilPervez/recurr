// NOTE: behaviour intentionally unchanged in Sprint 1.
// Known bugs D1–D5 (time zones, month-end overflow, etc.) are fixed in Sprint 3.

export const uid = () => `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`;

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const shiftDate = (dateStr, value, unit) => {
  const d = new Date(dateStr + "T12:00:00");
  if (unit === "days") d.setDate(d.getDate() + value);
  if (unit === "weeks") d.setDate(d.getDate() + value * 7);
  if (unit === "months") d.setMonth(d.getMonth() + value);
  if (unit === "years") d.setFullYear(d.getFullYear() + value);
  return d.toISOString().split("T")[0];
};

export const dayDiff = (a, b) =>
  Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);

export const dateLabel = (dateStr) => {
  const diff = dayDiff(todayStr(), dateStr);
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff === -1) return "Yesterday";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 6) return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" });
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const freqLabel = (f) => {
  if (!f) return "";
  const { value: v, unit: u } = f;
  if (v === 1 && u === "days") return "Daily";
  if (v === 1 && u === "weeks") return "Weekly";
  if (v === 2 && u === "weeks") return "Bi-weekly";
  if (v === 1 && u === "months") return "Monthly";
  if (v === 6 && u === "months") return "Every 6 mo";
  if (v === 1 && u === "years") return "Yearly";
  return `Every ${v} ${u}`;
};
