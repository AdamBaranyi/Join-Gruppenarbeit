/**
 * Renders the assignee badges within the task modal.
 * @param {string[]} assignedTo - An array of assignee names.
 */
function renderModalAssignees(assignedTo) {
  let container = document.getElementById("modalAssignees");
  container.innerHTML = "";

  if (!assignedTo || assignedTo.length === 0) return;

  assignedTo.forEach((name) => {
    container.innerHTML += buildAssigneeRowHTML(name);
  });
}

/**
 * Builds HTML for a single assignee row.
 * @param {string} name - The assignee name.
 * @returns {string} The HTML string.
 */
function buildAssigneeRowHTML(name) {
  const initials = getContactInitials(name);
  const bgColor = getContactColor(name);

  return `
    <div class="assignee-row">
      <div class="assignee-badge" style="background-color: ${bgColor};">${initials}</div>
      <span class="assignee-name">${name}</span>
    </div>
  `;
}

/**
 * Renders the subtasks list within the task modal.
 * @param {Object[]} subtasks - An array of subtask objects.
 */
function renderModalSubtasks(subtasks) {
  let container = document.getElementById("modalSubtasks");
  container.innerHTML = "";

  if (!subtasks || subtasks.length === 0) {
    container.innerHTML = "<span>No subtasks</span>";
    return;
  }

  subtasks.forEach((st, index) => {
    container.innerHTML += buildModalSubtaskHTML(st, index);
  });
}

/**
 * Builds HTML for a modal subtask item.
 * @param {Object} st - The subtask object.
 * @param {number} index - The subtask index.
 * @returns {string} The HTML string.
 */
function buildModalSubtaskHTML(st, index) {
  let iconPath = st.completed
    ? "../assets/imgs/Property 1=checked.svg"
    : "../assets/imgs/Property 1=Default.svg";

  return `
    <div class="subtask-row" onclick="toggleSubtask(${index})">
      <img src="${iconPath}" class="subtask-icon">
      <span class="subtask-text" style="font-size: 16px;">${st.title || st.name || "Subtask"}</span>
    </div>
  `;
}

/**
 * Toggles the completion state of a subtask.
 * @param {number} subtaskIndex - The index of the subtask in the array.
 */
async function toggleSubtask(subtaskIndex) {
  if (!currentTaskId) return;

  let task = allLoadedTasks[currentTaskId];
  if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;

  task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

  renderModalSubtasks(task.subtasks);
  renderTasks(allLoadedTasks);

  await updateSubtasksInFirebase(task.subtasks);
}

/**
 * Updates subtasks in Firebase.
 * @param {Object[]} subtasks - The subtasks array.
 */
async function updateSubtasksInFirebase(subtasks) {
  try {
    await fetch(BASE_URL + `/tasks/${currentTaskId}/subtasks.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subtasks),
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Subtasks:", error);
  }
}

/**
 * Closes the task details pop-up modal with an animation.
 */
function closeTaskPopup() {
  let modalOverlay = document.getElementById("taskModal");
  let modalContent = modalOverlay.querySelector(".task-modal-content");

  modalOverlay.classList.add("fade-out");
  modalContent.classList.add("slide-out");

  setTimeout(() => {
    cleanupTaskModal(modalOverlay, modalContent);
  }, 200);
}

/**
 * Cleans up the task modal after animation.
 * @param {HTMLElement} modalOverlay - The modal overlay element.
 * @param {HTMLElement} modalContent - The modal content element.
 */
function cleanupTaskModal(modalOverlay, modalContent) {
  modalOverlay.classList.add("d-none");
  modalOverlay.classList.remove("fade-out");
  modalContent.classList.remove("slide-out");
  currentTaskId = null;
}

/**
 * Deletes the currently opened task.
 */
async function deleteTask() {
  if (!currentTaskId) return;

  try {
    await fetch(BASE_URL + `/tasks/${currentTaskId}.json`, {
      method: "DELETE",
    });

    delete allLoadedTasks[currentTaskId];

    closeTaskPopup();
    loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("There was an error deleting the task.");
  }
}

/**
 * Triggers the edit mode for the currently opened task.
 */
function editTask() {
  if (!currentTaskId) return;

  let task = allLoadedTasks[currentTaskId];
  if (!task) return;

  prepareEditState(task);
  renderEditForm(task);
  populateEditForm();
  switchToEditView();
}

/**
 * Prepares the edit state with task data.
 * @param {Object} task - The task object.
 */
function prepareEditState(task) {
  let assignedToArray = task.assignedTo
    ? (Array.isArray(task.assignedTo) ? task.assignedTo : Object.values(task.assignedTo))
    : [];

  editSelectedContacts = assignedToArray.map(name =>
    name.split(/\s+/).filter(Boolean).join(' ').trim()
  );
  editCurrentSubtasks = [...(task.subtasks || [])];
}

/**
 * Renders the edit form HTML.
 * @param {Object} task - The task object.
 */
function renderEditForm(task) {
  let editContainer = document.getElementById("taskModalEdit");
  editContainer.innerHTML = generateEditFormHTML(task);

  const dateInput = document.getElementById("editTaskDueDate");
  if (dateInput) {
    dateInput.addEventListener("keydown", e => e.preventDefault());
    dateInput.min = new Date().toISOString().split("T")[0];
  }
}

/**
 * Populates the edit form with data.
 */
function populateEditForm() {
  renderEditAssignees();
  renderEditAssigneesDropdown();
  renderEditSubtasks();
}

/**
 * Switches from view mode to edit mode.
 */
function switchToEditView() {
  document.getElementById("taskModalView").classList.add("d-none");
  document.getElementById("taskModalEdit").classList.remove("d-none");
}
