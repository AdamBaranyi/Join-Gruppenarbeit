let currentTaskId = null;
let currentTaskData = null;
let currentDraggedElement;
let allLoadedTasks = {};

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

/**
 * Loads tasks from Firebase and renders them in the board.
 */
async function loadTasks() {
  try {
    const response = await fetch(BASE_URL + "/tasks.json");
    const tasks = await response.json();

    allLoadedTasks = tasks || {};
    renderTasks(allLoadedTasks);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

/**
 * Renders the provided tasks into their respective columns on the board.
 * @param {Object} tasks - An object containing tasks fetched from the database.
 */
function renderTasks(tasks) {
  const columns = {
    todo: document.getElementById("taskTodo"),
    inProgress: document.getElementById("taskInProgress"),
    awaitingFeedback: document.getElementById("taskAwaitingFeedback"),
    done: document.getElementById("taskDone"),
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

  if (columns.todo && columns.todo.innerHTML === "")
    columns.todo.innerHTML = '<div class="no-tasks">No tasks To do</div>';
  if (columns.inProgress && columns.inProgress.innerHTML === "")
    columns.inProgress.innerHTML =
      '<div class="no-tasks">No tasks in progress</div>';
  if (columns.awaitingFeedback && columns.awaitingFeedback.innerHTML === "")
    columns.awaitingFeedback.innerHTML =
      '<div class="no-tasks">No tasks awaiting feedback</div>';
  if (columns.done && columns.done.innerHTML === "")
    columns.done.innerHTML = '<div class="no-tasks">No tasks done</div>';
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
    await fetch(BASE_URL + `/tasks/${currentDraggedElement}/status.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStatus),
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
  let searchInput = document
    .getElementById("searchTaskInput")
    .value.toLowerCase();

  let filteredTasks = {};

  for (let id in allLoadedTasks) {
    let task = allLoadedTasks[id];
    let titleMatch =
      task.title && task.title.toLowerCase().includes(searchInput);
    let descMatch =
      task.description && task.description.toLowerCase().includes(searchInput);

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
    document.getElementById("taskModal").classList.remove("d-none");
    document.getElementById("taskModalView").classList.remove("d-none");
    document.getElementById("taskModalEdit").classList.add("d-none");

    document.getElementById("modalTitle").innerHTML = task.title || "";
    document.getElementById("modalDescription").innerHTML =
      task.description || "";
    document.getElementById("modalDate").innerHTML = task.dueDate || "";

    let priorityIconStr = getPriorityIcon(task.priority);
    document.getElementById("modalPriority").innerHTML = `
            ${task.priority || ""} <img src="${priorityIconStr}" alt="${task.priority}">
        `;

    let modalCategory = document.getElementById("modalCategory");
    modalCategory.innerHTML = task.category || "";
    modalCategory.className = `task-category ${getCategoryClass(task.category)}`;

    renderModalAssignees(task.assignedTo);
    renderModalSubtasks(task.subtasks);
  }
}

/**
 * Saves the edited task back to Firebase and refreshes the UI.
 */
async function saveTask() {
  if (!currentTaskId) return;

  // 1. Gather data from inputs
  let title = document.getElementById("editTaskTitle").value.trim();
  let description = document.getElementById("editTaskDescription").value.trim();
  let dueDate = document.getElementById("editTaskDueDate").value;
  let priority = document.getElementById("editTaskPriority").value;

  if (!title || !dueDate) {
    alert("Title and Due Date are required.");
    return;
  }

  // 2. Prepare payload
  let updatedData = {
    title: title,
    description: description,
    dueDate: dueDate,
    priority: priority,
    assignedTo: editSelectedContacts,
    subtasks: editCurrentSubtasks,
  };

  // 3. Send to Firebase
  try {
    await fetch(BASE_URL + `/tasks/${currentTaskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    // 4. Update local cache
    Object.assign(allLoadedTasks[currentTaskId], updatedData);

    // 5. Update UI
    loadTasks(); // refreshes the columns

    // 6. Return back to View mode within the opened modal
    openTaskPopup(currentTaskId); // Re-initializes view mode with new data
  } catch (error) {
    console.error("Error saving task:", error);
    alert("Could not save task.");
  }
}



/**
 * Opens a context menu to move a task to another column on mobile.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 */
function openMoveMenu(event, taskId) {
  event.stopPropagation();
  
  closeMoveMenu();

  const task = allLoadedTasks[taskId];
  if (!task) return;

  const statuses = [
      { id: 'todo', label: 'To-do' },
      { id: 'inProgress', label: 'In progress' },
      { id: 'awaitingFeedback', label: 'Awaiting feedback' },
      { id: 'done', label: 'Done' }
  ];

  const currentIndex = statuses.findIndex(s => s.id === task.status);
  if (currentIndex === -1) return;

  const menuContent = generateMobileMoveMenuHTML(taskId, statuses, currentIndex);

  const menu = document.createElement('div');
  menu.className = 'mobile-move-menu';
  menu.id = 'mobileMoveMenu';
  menu.innerHTML = menuContent;

  const btnRect = event.currentTarget.getBoundingClientRect();
  document.body.appendChild(menu);

  // Position the menu slightly below and aligned to the right edge of the button
  const top = btnRect.bottom + window.scrollY + 8; // 8px below the button
  const left = btnRect.right + window.scrollX - 140; // The max-width of the menu is approx 140px. This aligns the 0 border-radius flush with the button.
  
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  setTimeout(() => {
      document.addEventListener('click', closeMoveMenuHandler);
  }, 0);
}

/**
 * Closes the mobile context menu if it is open.
 */
function closeMoveMenu() {
  const existingMenu = document.getElementById('mobileMoveMenu');
  if (existingMenu) {
      existingMenu.remove();
  }
  document.removeEventListener('click', closeMoveMenuHandler);
}

/**
 * Event handler to close the move menu when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeMoveMenuHandler(event) {
  const menu = document.getElementById('mobileMoveMenu');
  if (menu && !menu.contains(event.target)) {
      closeMoveMenu();
  }
}

/**
 * Moves a task to a specific status via the mobile context menu.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status to move the task to.
 */
async function moveTaskToStatus(event, taskId, newStatus) {
  event.stopPropagation();
  closeMoveMenu();
  
  currentDraggedElement = taskId;
  await moveTo(newStatus);
}
