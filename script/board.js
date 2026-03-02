const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";

let currentTaskId = null;
let currentTaskData = null;
let currentDraggedElement;
let allLoadedTasks = {};

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

async function loadTasks() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const tasks = await response.json();

    allLoadedTasks = tasks || {};
    renderTasks(allLoadedTasks);
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

  if (columns.todo && columns.todo.innerHTML === "") columns.todo.innerHTML = '<div class="no-tasks">No tasks To do</div>';
  if (columns.inProgress && columns.inProgress.innerHTML === "") columns.inProgress.innerHTML = '<div class="no-tasks">No tasks in progress</div>';
  if (columns.awaitingFeedback && columns.awaitingFeedback.innerHTML === "") columns.awaitingFeedback.innerHTML = '<div class="no-tasks">No tasks awaiting feedback</div>';
  if (columns.done && columns.done.innerHTML === "") columns.done.innerHTML = '<div class="no-tasks">No tasks done</div>';
}

function generateTaskHTML(task, id) {
  const assignedHTML = generateAssignedHTML(task.assignedTo);
  const progressHTML = generateSubtaskProgress(task);
  const priorityIcon = getPriorityIcon(task.priority);

  return `
    <div draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskPopup('${id}')" class="task-card">
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

/**
 * Sets the ID of the task that is currently being dragged.
 * @param {string} id - The unique identifier of the dragged task.
 */
function startDragging(id) {
    currentDraggedElement = id;
}

/**
 * Prevents the default browser action to allow dropping an element into a container.
 * @param {DragEvent} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Moves the currently dragged task to a new status category and updates the backend.
 * Reloads the tasks after successful update to reflect the change visually.
 * @param {string} newStatus - The new status to assign to the task (e.g., 'todo', 'inProgress').
 */
async function moveTo(newStatus) {
    try {
        await fetch(BASE_URL + `tasks/${currentDraggedElement}/status.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStatus)
        });
        
        loadTasks();
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    }
}

/**
 * Filters the displayed tasks based on the search input.
 * Matches the input against task titles and descriptions.
 * Re-renders the board with the filtered tasks.
 */
function filterTasks() {
    let searchInput = document.getElementById('searchTaskInput').value.toLowerCase();
    
    let filteredTasks = {};
    
    for (let id in allLoadedTasks) {
        let task = allLoadedTasks[id];
        let titleMatch = task.title && task.title.toLowerCase().includes(searchInput);
        let descMatch = task.description && task.description.toLowerCase().includes(searchInput);
        
        if (titleMatch || descMatch) {
            filteredTasks[id] = task;
        }
    }
    
    renderTasks(filteredTasks);
}

/**
 * Opens the task details pop-up modal and populates it with the selected task's data.
 * @param {string} id - The unique identifier of the task to display.
 */
function openTaskPopup(id) {
    currentTaskId = id;
    let task = allLoadedTasks[id];
    
    if (task) {
        document.getElementById('taskModal').classList.remove('d-none');
        
        document.getElementById('modalTitle').innerHTML = task.title || "";
        document.getElementById('modalDescription').innerHTML = task.description || "";
        document.getElementById('modalDate').innerHTML = task.dueDate || "";
        
        let priorityIconStr = getPriorityIcon(task.priority);
        document.getElementById('modalPriority').innerHTML = `
            ${task.priority || ""} <img src="${priorityIconStr}" alt="${task.priority}">
        `;
        
        let modalCategory = document.getElementById('modalCategory');
        modalCategory.innerHTML = task.category || "";
        modalCategory.className = `task-category ${getCategoryClass(task.category)}`; 
        
        renderModalAssignees(task.assignedTo);
        renderModalSubtasks(task.subtasks);
    }
}

/**
 * Renders the assignee badges within the task modal.
 * @param {string[]} assignedTo - An array of assignee names.
 */
function renderModalAssignees(assignedTo) {
    let container = document.getElementById('modalAssignees');
    container.innerHTML = "";
    
    if (!assignedTo || assignedTo.length === 0) return;
    
    const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
    
    assignedTo.forEach((name, index) => {
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        const colorClass = colors[index % colors.length];
        
        container.innerHTML += `
            <div class="assignee-row">
                <div class="assignee-badge ${colorClass}">${initials}</div>
                <span class="assignee-name">${name}</span>
            </div>
        `;
    });
}

/**
 * Renders the subtasks list within the task modal.
 * @param {Object[]} subtasks - An array of subtask objects.
 */
function renderModalSubtasks(subtasks) {
    let container = document.getElementById('modalSubtasks');
    container.innerHTML = "";
    
    if (!subtasks || subtasks.length === 0) {
        container.innerHTML = "<span>No subtasks</span>";
        return;
    }
    
    subtasks.forEach((st, index) => {
        let iconPath = st.completed 
            ? "../assets/imgs/Property 1=checked.svg" 
            : "../assets/imgs/Property 1=Default.svg";
            
        container.innerHTML += `
            <div class="subtask-row" onclick="toggleSubtask(${index})">
                <img src="${iconPath}" class="subtask-icon">
                <span class="subtask-text" style="font-size: 16px;">${st.title || st.name || "Subtask"}</span>
            </div>
        `;
    });
}

/**
 * Toggles the completion state of a subtask, updates Firebase, and re-renders the UI.
 * @param {number} subtaskIndex - The index of the subtask in the array.
 */
async function toggleSubtask(subtaskIndex) {
    if (!currentTaskId) return;
    
    let task = allLoadedTasks[currentTaskId];
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;
    
    // Toggle the state locally
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    
    // Re-render the modal list immediately for snappy UI
    renderModalSubtasks(task.subtasks);
    
    // Re-render the board tasks to update the progress bar behind the modal
    renderTasks(allLoadedTasks);
    
    // Update the subtasks array in Firebase
    try {
        await fetch(BASE_URL + `tasks/${currentTaskId}/subtasks.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task.subtasks)
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Subtasks:", error);
    }
}

/**
 * Closes the task details pop-up modal with an animation.
 */
function closeTaskPopup() {
    let modalOverlay = document.getElementById('taskModal');
    let modalContent = modalOverlay.querySelector('.task-modal-content');
    
    // Add animation classes
    modalOverlay.classList.add('fade-out');
    modalContent.classList.add('slide-out');
    
    // Wait for the animation to finish (200ms) before hiding and cleaning up
    setTimeout(() => {
        modalOverlay.classList.add('d-none');
        modalOverlay.classList.remove('fade-out');
        modalContent.classList.remove('slide-out');
        currentTaskId = null;
    }, 200);
}
