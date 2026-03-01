const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";

let currentTaskId = null;
let currentTaskData = null;

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

async function loadTasks() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const tasks = await response.json();

    renderTasks(tasks || {});
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

function renderTasks(tasks) {
  const columns = {
    todo: document.getElementById("todo"),
    inProgress: document.getElementById("inProgress"),
    awaitingFeedback: document.getElementById("awaitingFeedback"),
    done: document.getElementById("done"),
  };

  Object.values(columns).forEach((col) => {
    if (col) col.innerHTML = "";
  });

  for (let id in tasks) {
    const task = tasks[id];
    const column = columns[task.status];

    if (!column) continue;

    column.innerHTML += generateTaskHTML(task, id);
  }
}

function generateTaskHTML(task, id) {
  const assignedHTML = generateAssignedHTML(task.assignedTo);
  const progressHTML = generateSubtaskProgress(task);
  const priorityIcon = getPriorityIcon(task.priority);

  return `
   
      <div class="task-category ${getCategoryClass(task.category)}">
        ${task.category || ""}
      </div>

      <h3 class="task-title">${task.title || ""}</h3>
      <p class="task-description">${task.description || ""}</p>

      ${progressHTML}

      <div class="task-footer">
        <div class="task-assignees">
          ${assignedHTML}
        </div>
        <div class="task-priority">
          <img src="${priorityIcon}" />
        </div>
      </div>

    </div>
  `;
}

function generateAssignedHTML(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) return "";

  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];

  return assignedTo
    .map((name, index) => {
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const colorClass = colors[index % colors.length];

      return `<div class="assignee-badge ${colorClass}">${initials}</div>`;
    })
    .join("");
}

function generateSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";

  const total = task.subtasks.length;
  const completed = task.subtasks.filter((st) => st.completed).length;
  const percent = (completed / total) * 100;

  return `
    <div class="task-progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:${percent}%"></div>
      </div>
      <span class="progress-text">${completed}/${total} Subtasks</span>
    </div>
  `;
}

function getPriorityIcon(priority) {
  if (priority === "Urgent") return "../assets/imgs/urgent-priority-board.svg";

  if (priority === "Low") return "../assets/imgs/low-priority-board.svg";

  return "../assets/imgs/priority_medium.svg";
}

function getCategoryClass(category) {
  if (category === "Technical Task") return "category-technical-task";

  if (category === "User Story") return "category-user-story";

  return "";
}
