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
  const columns = getBoardColumns();

  clearAllColumns(columns);
  populateColumns(tasks, columns);
  showEmptyStateMessages(columns);
}

/**
 * Gets all board column elements.
 * @returns {Object} The column elements.
 */
function getBoardColumns() {
  return {
    todo: document.getElementById("taskTodo"),
    inProgress: document.getElementById("taskInProgress"),
    awaitingFeedback: document.getElementById("taskAwaitingFeedback"),
    done: document.getElementById("taskDone"),
  };
}

/**
 * Clears all column contents.
 * @param {Object} columns - The column elements.
 */
function clearAllColumns(columns) {
  Object.values(columns).forEach((col) => {
    if (col) col.innerHTML = "";
  });
}

/**
 * Populates columns with task cards.
 * @param {Object} tasks - The tasks object.
 * @param {Object} columns - The column elements.
 */
function populateColumns(tasks, columns) {
  for (let id in tasks) {
    const task = tasks[id];
    const column = columns[task.status];

    if (!column) continue;

    column.innerHTML += generateTaskHTML(task, id);
  }
}

/**
 * Shows empty state messages in columns with no tasks.
 * @param {Object} columns - The column elements.
 */
function showEmptyStateMessages(columns) {
  if (columns.todo && columns.todo.innerHTML === "")
    columns.todo.innerHTML = '<div class="no-tasks">No tasks To do</div>';
  if (columns.inProgress && columns.inProgress.innerHTML === "")
    columns.inProgress.innerHTML = '<div class="no-tasks">No tasks in progress</div>';
  if (columns.awaitingFeedback && columns.awaitingFeedback.innerHTML === "")
    columns.awaitingFeedback.innerHTML = '<div class="no-tasks">No tasks awaiting feedback</div>';
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
 * Adds visual highlight to the column when dragging over it.
 * @param {DragEvent} ev - The drag event.
 */
function highlightColumn(ev) {
  ev.preventDefault();
  let column = ev.currentTarget;

  // Falls das Event von einem Child-Element kommt, finde die board-column
  if (!column.classList.contains('board-column')) {
    column = column.closest('.board-column');
  }

  if (column) {
    // Entferne ALLE Highlights von ALLEN Spalten
    removeAllHighlights();

    // Füge Highlight nur zur aktuellen Spalte hinzu
    column.classList.add('drag-over');
  }
}

/**
 * Removes visual highlight from the column when dragging leaves it.
 * @param {DragEvent} ev - The drag event.
 */
function removeHighlight(ev) {
  let column = ev.currentTarget;

  // Falls das Event von einem Child-Element kommt, finde die board-column
  if (!column.classList.contains('board-column')) {
    column = column.closest('.board-column');
  }

  if (column) {
    column.classList.remove('drag-over');
  }
}

/**
 * Removes all highlights from all columns.
 */
function removeAllHighlights() {
  const allColumns = document.querySelectorAll('.board-column');
  allColumns.forEach(col => col.classList.remove('drag-over'));
}

/**
 * Moves the currently dragged task to a new status category and updates the backend.
 * Reloads the tasks after successful update to reflect the change visually.
 * @param {string} newStatus - The new status to assign to the task (e.g., 'todo', 'inProgress').
 */
async function moveTo(newStatus) {
  // Entferne alle Highlights nach dem Drop
  removeAllHighlights();

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

  if (!task) return;

  showTaskModal();
  populateTaskModal(task);
}

/**
 * Shows the task modal and ensures correct view is displayed.
 */
function showTaskModal() {
  document.getElementById("taskModal").classList.remove("d-none");
  document.getElementById("taskModalView").classList.remove("d-none");
  document.getElementById("taskModalEdit").classList.add("d-none");
}

/**
 * Populates the task modal with task data.
 * @param {Object} task - The task object.
 */
function populateTaskModal(task) {
  document.getElementById("modalTitle").innerHTML = task.title || "";
  document.getElementById("modalDescription").innerHTML = task.description || "";
  document.getElementById("modalDate").innerHTML = task.dueDate || "";

  populateTaskPriority(task.priority);
  populateTaskCategory(task.category);
  renderModalAssignees(task.assignedTo);
  renderModalSubtasks(task.subtasks);
}

/**
 * Populates the task priority in the modal.
 * @param {string} priority - The priority level.
 */
function populateTaskPriority(priority) {
  let priorityIconStr = getPriorityIcon(priority);
  document.getElementById("modalPriority").innerHTML = `
    ${priority || ""} <img src="${priorityIconStr}" alt="${priority}">
  `;
}

/**
 * Populates the task category in the modal.
 * @param {string} category - The category name.
 */
function populateTaskCategory(category) {
  let trimmedCategory = (category || "").trim();
  let modalCategory = document.getElementById("modalCategory");
  modalCategory.innerHTML = trimmedCategory;
  modalCategory.className = `task-category ${getCategoryClass(trimmedCategory)}`;
}

/**
 * Saves the edited task back to Firebase and refreshes the UI.
 */
async function saveTask() {
  if (!currentTaskId) return;

  let title = document.getElementById("editTaskTitle").value.trim();
  let description = document.getElementById("editTaskDescription").value.trim();
  let dueDate = document.getElementById("editTaskDueDate").value;
  let priority = document.getElementById("editTaskPriority").value;

  if (!title || !dueDate) {
    alert("Title and Due Date are required.");
    return;
  }

  let updatedData = {
    title: title,
    description: description,
    dueDate: dueDate,
    priority: priority,
    assignedTo: editSelectedContacts,
    subtasks: editCurrentSubtasks,
  };

  try {
    await fetch(BASE_URL + `/tasks/${currentTaskId}.json`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    Object.assign(allLoadedTasks[currentTaskId], updatedData);

    loadTasks();

    openTaskPopup(currentTaskId);
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

  const statuses = getStatusOptions();
  const currentIndex = statuses.findIndex(s => s.id === task.status);
  if (currentIndex === -1) return;

  createAndShowMoveMenu(event, taskId, statuses, currentIndex);
}

/**
 * Gets the available status options.
 * @returns {Array<Object>} The status options.
 */
function getStatusOptions() {
  return [
    { id: 'todo', label: 'To-do' },
    { id: 'inProgress', label: 'In progress' },
    { id: 'awaitingFeedback', label: 'Awaiting feedback' },
    { id: 'done', label: 'Done' }
  ];
}

/**
 * Creates and shows the move menu.
 * @param {Event} event - The click event.
 * @param {string} taskId - The task ID.
 * @param {Array} statuses - The status options.
 * @param {number} currentIndex - The current status index.
 */
function createAndShowMoveMenu(event, taskId, statuses, currentIndex) {
  const menuContent = generateMobileMoveMenuHTML(taskId, statuses, currentIndex);
  const menu = createMoveMenuElement(menuContent);

  positionMoveMenu(menu, event.currentTarget);
  attachMoveMenuListener();
}

/**
 * Creates the move menu element.
 * @param {string} content - The HTML content.
 * @returns {HTMLElement} The menu element.
 */
function createMoveMenuElement(content) {
  const menu = document.createElement('div');
  menu.className = 'mobile-move-menu';
  menu.id = 'mobileMoveMenu';
  menu.innerHTML = content;
  document.body.appendChild(menu);
  return menu;
}

/**
 * Positions the move menu relative to the button.
 * @param {HTMLElement} menu - The menu element.
 * @param {HTMLElement} button - The button element.
 */
function positionMoveMenu(menu, button) {
  const btnRect = button.getBoundingClientRect();
  const top = btnRect.bottom + window.scrollY + 8;
  const left = btnRect.right + window.scrollX - 140;

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

/**
 * Attaches the click listener to close the menu.
 */
function attachMoveMenuListener() {
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
