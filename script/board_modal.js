/**
 * Task Modal functionality for the board.
 */

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

  const updatedData = {
    title, description, dueDate, priority,
    assignedTo: editSelectedContacts,
    subtasks: editCurrentSubtasks,
  };

  try {
    await updateTaskInFirebase(updatedData);
    Object.assign(allLoadedTasks[currentTaskId], updatedData);
    loadTasks();
    openTaskPopup(currentTaskId);
  } catch (error) {
    console.error("Error saving task:", error);
    alert("Could not save task.");
  }
}

/**
 * Updates task in Firebase.
 * @param {Object} data - The updated task data.
 */
async function updateTaskInFirebase(data) {
  await fetch(BASE_URL + `/tasks/${currentTaskId}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
