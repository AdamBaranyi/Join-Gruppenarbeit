/**
 * Core board functionality - loading and rendering tasks.
 */

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
 * Filters the displayed tasks based on the search input.
 */
function filterTasks() {
  let searchInput = document
    .getElementById("searchTaskInput")
    .value.toLowerCase();

  let filteredTasks = {};

  for (let id in allLoadedTasks) {
    const task = allLoadedTasks[id];
    const titleMatch = (task.title || "").toLowerCase().includes(searchInput);
    const descMatch = (task.description || "").toLowerCase().includes(searchInput);

    if (titleMatch || descMatch) {
      filteredTasks[id] = task;
    }
  }

  renderTasks(filteredTasks);
}
