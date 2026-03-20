/**
 * @fileoverview Main controller for the Add Task page: initialisation,
 * event listeners, form validation and save process.
 */

/**
 * Array holding the names of contacts selected for "Assigned to".
 * @type {string[]}
 */
let selectedContacts = [];

/**
 * Executed when the DOM is fully loaded.
 * Initialises all page components.
 * @listens document#DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("due-date");
  if (input) {
    input.addEventListener("keydown", e => e.preventDefault());
    input.min = new Date().toISOString().split("T")[0]; 
  }

  initializePriorityButtons();
  initializeFormValidation();
  initializeAssignedDropdown();
  initializeCategoryDropdown();
  initializeSubtasks();
});

/**
 * Initialises the priority buttons.
 */
function initializePriorityButtons() {
  const triggers = document.querySelectorAll(".trigger");
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      triggers.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

/**
 * Initialises form validation and the submit listener.
 */
function initializeFormValidation() {
  const form = document.getElementById("taskForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateForm()) {
        saveTaskToFirebase();
      }
    });
  }
}

/**
 * Validates all required form fields.
 * @returns {boolean} True if all fields are valid.
 */
function validateForm() {
  clearErrors();

  const isTitleValid = validateTaskTitle();
  const isDateValid = validateTaskDate();
  const isCategoryValid = validateTaskCategory();

  return isTitleValid && isDateValid && isCategoryValid;
}

/**
 * Validates the task title field.
 * @returns {boolean} True if the field is not empty.
 */
function validateTaskTitle() {
  const tasktitle = document.getElementById("task-title");
  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    return false;
  }
  return true;
}

/**
 * Validates the due date field.
 * @returns {boolean} True if a date has been selected.
 */
function validateTaskDate() {
  const input = document.getElementById("due-date");
  const value = input.value;

  if (!value) {
    setError("due-date", "* This field is required");
    return false;
  }

  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    setError("due-date", "* Invalid date");
    return false;
  }

  if (date < today) {
    setError("due-date", "* Date cannot be in the past");
    return false;
  }

  return true;
}

/**
 * Validates the category selection.
 * @returns {boolean} True if a category has been selected.
 */
function validateTaskCategory() {
  const categoryDropdown = document.querySelector(
    ".category-dropdown .placeholder",
  );
  if (categoryDropdown.textContent === "Select task category") {
    setError("categoryDropdown", "* This field is required");
    document.getElementById("categoryDropdown").classList.add("input-error");
    return false;
  }
  return true;
}

/**
 * Sets an error message for a specific field.
 * @param {string} fieldId - The ID of the field.
 * @param {string} message - The error message to display.
 */
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorDiv = document.getElementById("error-" + fieldId);
  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

/**
 * Removes all error messages and error classes.
 */
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => (el.innerText = ""));
  document.querySelectorAll(".input-error").forEach((el) =>
    el.classList.remove("input-error")
  );
}

// ---------- Dropdown Initialisation (calls helper functions) ----------

/**
 * Initialises the "Assigned to" dropdown.
 * @async
 */
async function initializeAssignedDropdown() {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;

  const elements = getDropdownElements(dropdown);
  selectedContacts = [];

  await renderAllContacts(elements);
  setupDropdownEventListeners(dropdown, elements);
}

/**
 * Initialises the category dropdown.
 */
function initializeCategoryDropdown() {
  const dropdown = document.querySelector(".category-dropdown");
  if (!dropdown) return;

  const elements = getCategoryDropdownElements(dropdown);
  if (!elements.header) return;

  setupDropdownHeaderListener(dropdown, elements);
  setupCategoryItemsListeners(elements);
  setupOutsideClickListener(dropdown);
}

/**
 * Initialises the subtask functionality.
 */
function initializeSubtasks() {
  const elements = getSubtaskElements();
  if (
    !elements ||
    !elements.addButton ||
    !elements.input ||
    !elements.list ||
    !elements.clearButton
  )
    return;

  addSubtaskButtonListeners(elements);
  addSubtaskInputListeners(elements);
  addSubtaskListListener(elements);
}

// ---------- Form Resets ----------

/**
 * Resets the entire form (without reloading the page).
 */
function clearForm() {
  document.getElementById("taskForm").reset();
  clearErrors();

  document.getElementById("selectedUsers").innerHTML = "";
  document.querySelector("#assignedDropdown .placeholder").style.display =
    "inline";

  const categoryPlaceholder = document.querySelector(
    ".category-dropdown .placeholder",
  );
  if (categoryPlaceholder) {
    categoryPlaceholder.textContent = "Select task category";
    categoryPlaceholder.style.color = "#666";
  }

  document.getElementById("subtaskList").innerHTML = "";
  document
    .querySelectorAll('#dropdownList input[type="checkbox"]')
    .forEach((cb) => (cb.checked = false));

  selectedContacts = [];
}

/**
 * Resets the entire form and also clears the subtask input field.
 */
function clearCompleteForm() {
  clearForm();
  document.getElementById("subTaskInput").value = "";
}

// ---------- Firebase Save Process ----------

/**
 * Collects all form data, creates a task object and saves it to Firebase.
 * @async
 */
async function saveTaskToFirebase() {
  try {
    const taskData = collectFormData();
    const taskId = await generateTaskId();
    const completeTask = buildTaskObject(taskId, taskData);

    await uploadTaskToDatabase(taskId, completeTask);
    showSuccessAndRedirect();
  } catch (error) {
    console.error("Error while saving:", error);
  }
}

/**
 * Collects the entered form data.
 * @returns {Object} An object with title, description, dueDate, category, priority, assignedTo, subtasks.
 */
function collectFormData() {
  return {
    title: document.getElementById("task-title").value.trim(),
    description: document.getElementById("taskDsc").value.trim(),
    dueDate: document.getElementById("due-date").value,
    category: document.querySelector(".category-dropdown .placeholder")
      .textContent,
    priority: getPriorityValue(),
    assignedTo: selectedContacts || [],
    subtasks: getSubtasksFromDom(),
  };
}

/**
 * Determines the currently selected priority.
 * @returns {string} The priority value (e.g., "Urgent", "Medium", "Low").
 */
function getPriorityValue() {
  const priorityButton = document.querySelector(".trigger.active");
  return priorityButton ? priorityButton.dataset.priority : "Medium";
}

/**
 * Collects the subtasks from the DOM.
 * @returns {Array<{title: string, completed: boolean}>} An array of subtask objects.
 */
function getSubtasksFromDom() {
  const subtasks = [];
  document.querySelectorAll(".subtask-item input").forEach((input) => {
    const value = input.value.trim();
    if (value) subtasks.push({ title: value, completed: false });
  });
  return subtasks;
}

/**
 * Generates a new task ID in the format "t" + next free number.
 * @async
 * @returns {Promise<string>} The generated ID.
 */
async function generateTaskId() {
  const response = await fetch(BASE_URL + "/tasks.json");
  const tasks = (await response.json()) || {};

  let nextNumber = 1;
  if (tasks) {
    const numbers = Object.keys(tasks)
      .filter((key) => key.startsWith("t"))
      .map((key) => parseInt(key.replace("t", "")));
    if (numbers.length) nextNumber = Math.max(...numbers) + 1;
  }
  return "t" + nextNumber;
}

/**
 * Builds the complete task object from ID and raw data.
 * @param {string} taskId - The unique task ID.
 * @param {Object} data - The collected form data.
 * @returns {Object} The complete task object for Firebase.
 */
function buildTaskObject(taskId, data) {
  return {
    id: taskId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate,
    category: data.category,
    priority: data.priority,
    assignedTo: data.assignedTo,
    subtasks: data.subtasks,
    status: "todo",
    createdAt: Date.now(),
  };
}

/**
 * Uploads the task object to Firebase under the given ID.
 * @async
 * @param {string} taskId - The task ID.
 * @param {Object} task - The complete task object.
 * @returns {Promise<void>}
 */
async function uploadTaskToDatabase(taskId, task) {
  await fetch(BASE_URL + `/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/**
 * Displays a success overlay and redirects to the board after a short delay.
 */
function showSuccessAndRedirect() {
  document.getElementById("successOverlay").style.display = "flex";
  setTimeout(() => (window.location.href = "../html/board.html"), 1200);
}