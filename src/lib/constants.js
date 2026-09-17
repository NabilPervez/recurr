export const STORAGE_KEY = "recurr_tasks_v2";
export const PREFS_KEY = "recurr_prefs_v2";
export const CATS_KEY = "recurr_cats_v2";

export const DEFAULT_CATS = ["Auto", "Home", "Health", "Family", "Admin", "Finance", "Personal"];

export const SHORTCUTS = [
  { label: "Daily", value: 1, unit: "days" },
  { label: "Weekly", value: 1, unit: "weeks" },
  { label: "Bi-weekly", value: 2, unit: "weeks" },
  { label: "Monthly", value: 1, unit: "months" },
  { label: "6 Months", value: 6, unit: "months" },
  { label: "Yearly", value: 1, unit: "years" },
];

export const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];
export const TIME_EMOJI = { Morning: "🌅", Afternoon: "☀️", Evening: "🌇", Night: "🌙" };

const CAT_PALETTE = {
  Auto: "#f97316",
  Home: "#06b6d4",
  Health: "#22c55e",
  Family: "#f43f5e",
  Admin: "#a78bfa",
  Finance: "#eab308",
  Personal: "#60a5fa",
};
export const catColor = (cat) => CAT_PALETTE[cat] || "#94a3b8";

export const SAMPLE_TASKS = [
  { name: "Change oil", category: "Auto", frequency: { value: 6, unit: "months" }, timeOfDay: "Morning", daysFromNow: -2 },
  { name: "Dentist checkup", category: "Health", frequency: { value: 6, unit: "months" }, timeOfDay: "Morning", daysFromNow: 0 },
  { name: "Order diapers", category: "Family", frequency: { value: 2, unit: "weeks" }, timeOfDay: "Afternoon", daysFromNow: 0 },
  { name: "Pay credit card", category: "Finance", frequency: { value: 1, unit: "months" }, timeOfDay: null, daysFromNow: 3 },
  { name: "Water plants", category: "Home", frequency: { value: 1, unit: "weeks" }, timeOfDay: "Evening", daysFromNow: 0 },
  { name: "Review budget", category: "Finance", frequency: { value: 1, unit: "months" }, timeOfDay: null, daysFromNow: 10 },
  { name: "Car battery check", category: "Auto", frequency: { value: 3, unit: "years" }, timeOfDay: null, daysFromNow: 45 },
  { name: "Rotate tires", category: "Auto", frequency: { value: 6, unit: "months" }, timeOfDay: null, daysFromNow: 25 },
];
