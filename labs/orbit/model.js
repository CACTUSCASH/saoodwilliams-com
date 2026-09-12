export const columns = ["Backlog", "In progress", "Review", "Done"];
export const seed = [
  {
    id: "ORB-101",
    title: "Design the new onboarding flow",
    description: "Create a calm, focused first-run experience.",
    status: "In progress",
    priority: "High",
    tag: "Design",
  },
  {
    id: "ORB-102",
    title: "Add workspace invitations",
    description: "Invite collaborators from workspace settings.",
    status: "Backlog",
    priority: "Medium",
    tag: "Feature",
  },
  {
    id: "ORB-103",
    title: "Ship keyboard shortcuts",
    description: "Improve navigation for power users.",
    status: "Review",
    priority: "Low",
    tag: "Experience",
  },
  {
    id: "ORB-104",
    title: "Audit API validation",
    description: "Review payload boundaries and error messages.",
    status: "In progress",
    priority: "High",
    tag: "Engineering",
  },
  {
    id: "ORB-105",
    title: "Set up release pipeline",
    description: "Run validation before each release.",
    status: "Done",
    priority: "Medium",
    tag: "Engineering",
  },
  {
    id: "ORB-106",
    title: "Explore a compact board view",
    description: "Sketch an alternative for smaller screens.",
    status: "Backlog",
    priority: "Low",
    tag: "Design",
  },
  {
    id: "ORB-107",
    title: "Refine empty states",
    description: "Give users a useful next action.",
    status: "Review",
    priority: "Medium",
    tag: "Experience",
  },
];
export function validate(data) {
  return (
    Array.isArray(data) &&
    data.length <= 500 &&
    new Set(data.map((x) => x?.id)).size === data.length &&
    data.every(
      (t) =>
        t &&
        typeof t.id === "string" &&
        t.id.length <= 80 &&
        typeof t.title === "string" &&
        t.title.trim().length > 0 &&
        t.title.length <= 120 &&
        typeof t.description === "string" &&
        t.description.length <= 2000 &&
        columns.includes(t.status) &&
        ["Low", "Medium", "High"].includes(t.priority) &&
        typeof t.tag === "string" &&
        t.tag.length <= 40,
    )
  );
}
export function filterTasks(data, query = "", priority = "All priorities") {
  return data.filter(
    (t) =>
      (priority === "All priorities" || t.priority === priority) &&
      `${t.title} ${t.description} ${t.tag} ${t.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
}
