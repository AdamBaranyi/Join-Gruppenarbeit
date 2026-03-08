/**
 * @typedef {Object} Contact
 * @property {string} firstname - Contact's first name
 * @property {string} lastname - Contact's last name
 */

/**
 * @typedef {Object} DropdownElements
 * @property {HTMLElement} header - Dropdown header element
 * @property {HTMLElement} dropdownList - Container for contact items
 * @property {HTMLElement} selectedContainer - Container for selected user circles
 * @property {HTMLElement} placeholder - Placeholder text element
 */

/**
 * @typedef {Object} CategoryDropdownElements
 * @property {HTMLElement} header - Category dropdown header
 * @property {HTMLElement} placeholder - Category placeholder
 * @property {NodeListOf<HTMLElement>} categoryItems - Category option items
 */

/**
 * @typedef {Object} SubtaskElements
 * @property {HTMLInputElement} input - Subtask input field
 * @property {HTMLElement} addButton - Add subtask button
 * @property {HTMLElement} clearButton - Clear input button
 * @property {HTMLElement} list - Subtask list container
 */

/**
 * @typedef {Object} TaskData
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} dueDate - Due date
 * @property {string} category - Task category
 * @property {string} priority - Priority level
 * @property {Array<string>} assignedTo - Assigned contacts
 * @property {Array<{title: string, completed: boolean}>} subtasks - Subtasks
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string} dueDate - Due date
 * @property {string} category - Task category
 * @property {string} priority - Priority level
 * @property {Array<string>} assignedTo - Assigned contacts
 * @property {Array<{title: string, completed: boolean}>} subtasks - Subtasks
 * @property {string} status - Current status (todo/doing/done)
 * @property {number} createdAt - Creation timestamp
 */

/** @type {Array<string>} - Names of selected contacts */
let selectedContacts = [];

document.addEventListener("DOMContentLoaded", function () {
  initializePriorityButtons();
  initializeFormValidation();
  initializeAssignedDropdown();
  initializeCategoryDropdown();
  initializeSubtasks();
});

/** Initializes priority button click handlers */
function initializePriorityButtons() {
  /** @type {NodeListOf<HTMLElement>} */
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

/** Sets up form submit validation */
function initializeFormValidation() {
  /** @type {HTMLFormElement} */
  const form = document.getElementById("taskForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateForm()) saveTaskToFirebase();
    });
  }
}

/** @returns {boolean} True if all form fields are valid */
function validateForm() {
  clearErrors();
  return validateTaskTitle() && validateTaskDate() && validateTaskCategory();
}

/** @returns {boolean} True if title is not empty */
function validateTaskTitle() {
  /** @type {HTMLInputElement} */
  const tasktitle = document.getElementById("task-title");

  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    return false;
  }
  return true;
}

/** @returns {boolean} True if date is not empty */
function validateTaskDate() {
  /** @type {HTMLInputElement} */
  const taskdate = document.getElementById("due-date");

  if (!taskdate.value) {
    setError("due-date", "* This field is required");
    return false;
  }
  return true;
}

/** @returns {boolean} True if category is selected */
function validateTaskCategory() {
  /** @type {HTMLElement} */
  const categoryDropdown = document.querySelector(".category-dropdown .placeholder");

  if (categoryDropdown.textContent === "Select task category") {
    setError("categoryDropdown", "* This field is required");
    document.getElementById("categoryDropdown").classList.add("input-error");
    return false;
  }
  return true;
}

/**
 * Displays error message for a field
 * @param {string} fieldId - ID of the input field
 * @param {string} message - Error message to display
 */
function setError(fieldId, message) {
  /** @type {HTMLInputElement} */
  const input = document.getElementById(fieldId);
  /** @type {HTMLElement} */
  const errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

/** Removes all error messages and styling */
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => el.innerText = "");
  document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

/** Initializes the assigned contacts dropdown */
async function initializeAssignedDropdown() {
  /** @type {HTMLElement} */
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;

  const elements = getDropdownElements(dropdown);
  selectedContacts = [];

  await renderAllContacts(elements);
  setupDropdownEventListeners(dropdown, elements);
}

/**
 * Gets all dropdown DOM elements
 * @param {HTMLElement} dropdown - Main dropdown container
 * @returns {DropdownElements} Object with dropdown elements
 */
function getDropdownElements(dropdown) {
  return {
    header: dropdown.querySelector(".dropdown-header"),
    dropdownList: document.getElementById("dropdownList"),
    selectedContainer: document.getElementById("selectedUsers"),
    placeholder: dropdown.querySelector(".placeholder"),
  };
}

/**
 * Fetches and renders all contacts
 * @param {DropdownElements} elements - Dropdown elements
 */
async function renderAllContacts(elements) {
  /** @type {Array<Contact>} */
  const contacts = await getContactsList();

  elements.dropdownList.innerHTML = "";

  contacts.forEach((contact) => {
    const fullName = `${contact.firstname} ${contact.lastname}`;
    /** @type {string} */
    const bgColor = typeof getColorFromName === "function" ? getColorFromName(fullName) : "#FF7A00";
    createContactElement(fullName, bgColor, elements);
  });

  updateSelectedUsersDisplay(elements);
}

/** @returns {Promise<Array<Contact>>} List of contacts from database */
async function getContactsList() {
  const response = await fetch(BASE_URL + "/contacts.json");
  /** @type {Object<string, Contact>} */
  const data = await response.json();
  return data ? Object.values(data) : [];
}

/** @param {string} name - Full name @returns {string} Uppercase initials */
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

/**
 * Creates a contact item in the dropdown
 * @param {string} name - Contact name
 * @param {string} bgColor - Background color for circle
 * @param {DropdownElements} elements - Dropdown elements
 */
function createContactElement(name, bgColor, elements) {
  const initials = getInitials(name);
  /** @type {HTMLDivElement} */
  const item = document.createElement("div");
  item.className = "contact-item";
  item.innerHTML = renderContactsTemplate(initials, bgColor, name, false);
  setupContactCheckbox(item, name, false, elements);
  elements.dropdownList.appendChild(item);
}

/**
 * Sets up checkbox for a contact
 * @param {HTMLElement} item - Contact item
 * @param {string} name - Contact name
 * @param {boolean} isYou - Is current user
 * @param {DropdownElements} elements - Dropdown elements
 */
function setupContactCheckbox(item, name, isYou, elements) {
  /** @type {HTMLInputElement} */
  const checkbox = item.querySelector("input");

  if (isYou) selectedContacts.push(name);

  checkbox.addEventListener("change", () => {
    updateSelectedContacts(name, checkbox.checked);
    updateSelectedUsersDisplay(elements);
  });
}

/**
 * Updates selected contacts array
 * @param {string} name - Contact name
 * @param {boolean} isChecked - Checkbox state
 */
function updateSelectedContacts(name, isChecked) {
  if (isChecked && !selectedContacts.includes(name)) {
    selectedContacts.push(name);
  } else if (!isChecked) {
    selectedContacts = selectedContacts.filter((c) => c !== name);
  }
}

/** Updates the displayed user circles */
function updateSelectedUsersDisplay(elements) {
  elements.selectedContainer.innerHTML = "";

  selectedContacts.slice(0, 5).forEach((name) => {
    /** @type {string} */
    const bgColor = typeof getColorFromName === "function" ? getColorFromName(name) : "#FF7A00";
    const circle = createUserCircle(name, bgColor);
    elements.selectedContainer.appendChild(circle);
  });

  elements.placeholder.style.display = selectedContacts.length === 0 ? "inline" : "none";
}

/**
 * Creates a user circle element
 * @param {string} name - User name
 * @param {string} bgColor - Circle color
 * @returns {HTMLDivElement} Circle element
 */
function createUserCircle(name, bgColor) {
  /** @type {HTMLDivElement} */
  const circle = document.createElement("div");
  circle.className = "user-circle";
  circle.style.backgroundColor = bgColor;
  circle.innerText = getInitials(name);
  circle.title = name;
  return circle;
}

/**
 * Sets up dropdown open/close listeners
 * @param {HTMLElement} dropdown - Dropdown container
 * @param {DropdownElements} elements - Dropdown elements
 */
function setupDropdownEventListeners(dropdown, elements) {
  elements.header.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
  });
}

/** Initializes the category dropdown */
function initializeCategoryDropdown() {
  /** @type {HTMLElement} */
  const dropdown = document.querySelector(".category-dropdown");
  if (!dropdown) return;

  const elements = getCategoryDropdownElements(dropdown);
  if (!elements.header) return;

  setupDropdownHeaderListener(dropdown, elements);
  setupCategoryItemsListeners(elements);
  setupOutsideClickListener(dropdown);
}

/**
 * Gets category dropdown elements
 * @param {HTMLElement} dropdown - Category dropdown
 * @returns {CategoryDropdownElements} Category elements
 */
function getCategoryDropdownElements(dropdown) {
  return {
    header: dropdown.querySelector(".dropdown-header"),
    placeholder: dropdown.querySelector(".placeholder"),
    categoryItems: dropdown.querySelectorAll(".category-item"),
  };
}

/**
 * Sets up header click listener
 * @param {HTMLElement} dropdown - Dropdown container
 * @param {CategoryDropdownElements} elements - Category elements
 */
function setupDropdownHeaderListener(dropdown, elements) {
  elements.header.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown(dropdown);
  });
}

/** @param {HTMLElement} dropdown - Dropdown to toggle */
function toggleDropdown(dropdown) {
  dropdown.classList.toggle("open");
}

/** @param {CategoryDropdownElements} elements - Category elements */
function setupCategoryItemsListeners(elements) {
  elements.categoryItems.forEach((item) => {
    item.addEventListener("click", () => handleCategorySelection(item, elements));
  });
}

/**
 * Handles category item selection
 * @param {HTMLElement} selectedItem - Selected category
 * @param {CategoryDropdownElements} elements - Category elements
 */
function handleCategorySelection(selectedItem, elements) {
  updatePlaceholderWithSelectedCategory(selectedItem, elements);
  removeCategoryDropdownError();
  closeDropdown(elements);
}

/**
 * Updates placeholder with selected category
 * @param {HTMLElement} selectedItem - Selected category
 * @param {CategoryDropdownElements} elements - Category elements
 */
function updatePlaceholderWithSelectedCategory(selectedItem, elements) {
  elements.placeholder.textContent = selectedItem.textContent;
  elements.placeholder.style.color = "#000";
}

/** Removes error styling from category dropdown */
function removeCategoryDropdownError() {
  /** @type {HTMLElement} */
  const dropdown = document.querySelector(".category-dropdown");
  dropdown.classList.remove("input-error");

  /** @type {HTMLElement} */
  const errorElement = document.getElementById("error-categoryDropdown");
  if (errorElement) errorElement.innerText = "";
}

/** @param {CategoryDropdownElements} elements - Category elements */
function closeDropdown(elements) {
  /** @type {HTMLElement} */
  const dropdown = elements.header.closest(".category-dropdown");
  dropdown.classList.remove("open");
}

/** @param {HTMLElement} dropdown - Dropdown to close on outside click */
function setupOutsideClickListener(dropdown) {
  document.addEventListener("click", (event) => {
    closeDropdownIfClickOutside(event, dropdown);
  });
}

/**
 * Closes dropdown if click is outside
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} dropdown - Dropdown container
 */
function closeDropdownIfClickOutside(event, dropdown) {
  if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
}

/** Initializes subtasks functionality */
function initializeSubtasks() {
  const elements = getSubtaskElements();
  if (!elements?.addButton || !elements.input || !elements.list || !elements.clearButton) return;

  addSubtaskButtonListeners(elements);
  addSubtaskInputListeners(elements);
  addSubtaskListListener(elements);
}

/** @returns {SubtaskElements|null} Subtask DOM elements */
function getSubtaskElements() {
  return {
    input: document.getElementById("subTaskInput"),
    addButton: document.getElementById("addSubtaskBtn"),
    clearButton: document.getElementById("clearSubtaskBtn"),
    list: document.getElementById("subtaskList"),
  };
}

/** @param {SubtaskElements} elements - Subtask elements */
function addSubtaskButtonListeners(elements) {
  elements.addButton.addEventListener("click", (event) => {
    event.preventDefault();
    const subtaskText = elements.input.value.trim();
    if (subtaskText) {
      addSubtaskItem(subtaskText);
      elements.input.value = "";
    }
  });

  elements.clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    elements.input.value = "";
  });
}

/** @param {SubtaskElements} elements - Subtask elements */
function addSubtaskInputListeners(elements) {
  elements.input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.addButton.click();
    }
  });
}

/** @param {SubtaskElements} elements - Subtask elements */
function addSubtaskListListener(elements) {
  elements.list.addEventListener("click", (event) => {
    /** @type {HTMLElement} */
    const subtaskItem = event.target.closest(".subtask-item");
    if (!subtaskItem) return;

    handleDeleteButtonClick(event, subtaskItem);
    handleEditButtonClick(event, subtaskItem);
  });
}

/**
 * Handles delete button click
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} subtaskItem - Subtask item
 */
function handleDeleteButtonClick(event, subtaskItem) {
  /** @type {HTMLElement} */
  const deleteButton = event.target.closest(".delete-btn");
  if (deleteButton) subtaskItem.remove();
}

/**
 * Handles edit button click
 * @param {MouseEvent} event - Click event
 * @param {HTMLElement} subtaskItem - Subtask item
 */
function handleEditButtonClick(event, subtaskItem) {
  /** @type {HTMLElement} */
  const editButton = event.target.closest(".edit-btn");
  if (!editButton) return;

  /** @type {HTMLInputElement} */
  const subtaskInput = subtaskItem.querySelector("input");

  subtaskInput.disabled = !subtaskInput.disabled;
  subtaskItem.classList.toggle("editing");
  editButton.classList.toggle("editing");

  if (!subtaskInput.disabled) subtaskInput.focus();
}

/** @param {string} value - Subtask text */
function addSubtaskItem(value) {
  /** @type {HTMLElement} */
  const subtaskList = document.getElementById("subtaskList");
  /** @type {HTMLDivElement} */
  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item";
  subtaskItem.innerHTML = addSubtaskItemTemplate(value);
  subtaskList.appendChild(subtaskItem);
}

/** @param {HTMLElement} btn - Edit button clicked */
function toggleEdit(btn) {
  /** @type {HTMLElement} */
  const item = btn.closest(".subtask-item");
  /** @type {HTMLInputElement} */
  const input = item.querySelector("input");

  item.classList.toggle("editing");
  input.disabled = !input.disabled;
  btn.classList.toggle("editing");
}

/** Resets form to initial state */
function clearForm() {
  document.getElementById("taskForm").reset();
  clearErrors();

  document.getElementById("selectedUsers").innerHTML = "";
  /** @type {HTMLElement} */
  const assignedPlaceholder = document.querySelector("#assignedDropdown .placeholder");
  if (assignedPlaceholder) assignedPlaceholder.style.display = "inline";

  /** @type {HTMLElement} */
  const categoryPlaceholder = document.querySelector(".category-dropdown .placeholder");
  if (categoryPlaceholder) {
    categoryPlaceholder.textContent = "Select task category";
    categoryPlaceholder.style.color = "#666";
  }

  document.getElementById("subtaskList").innerHTML = "";
  document.querySelectorAll('#dropdownList input[type="checkbox"]').forEach((cb) => cb.checked = false);
  selectedContacts = [];
}

/** Complete form reset including input field */
function clearCompleteForm() {
  clearForm();
  document.getElementById("subTaskInput").value = "";
}

/** Saves task to Firebase */
async function saveTaskToFirebase() {
  try {
    const taskData = collectFormData();
    const taskId = await generateTaskId();
    const completeTask = buildTaskObject(taskId, taskData);

    await uploadTaskToDatabase(taskId, completeTask);
    showSuccessAndRedirect();
  } catch (error) {
    console.error("Error saving task:", error);
  }
}

/** @returns {TaskData} Form data as task object */
function collectFormData() {
  return {
    title: document.getElementById("task-title").value.trim(),
    description: document.getElementById("taskDsc").value.trim(),
    dueDate: document.getElementById("due-date").value,
    category: document.querySelector(".category-dropdown .placeholder").textContent,
    priority: getPriorityValue(),
    assignedTo: selectedContacts || [],
    subtasks: getSubtasksFromDom(),
  };
}

/** @returns {string} Selected priority or "Medium" */
function getPriorityValue() {
  /** @type {HTMLElement} */
  const priorityButton = document.querySelector(".trigger.active");
  return priorityButton ? priorityButton.dataset.priority : "Medium";
}

/** @returns {Array<{title: string, completed: boolean}>} Subtasks from DOM */
function getSubtasksFromDom() {
  /** @type {Array<{title: string, completed: boolean}>} */
  const subtasks = [];
  document.querySelectorAll(".subtask-item input").forEach((input) => {
    const value = input.value.trim();
    if (value) subtasks.push({ title: value, completed: false });
  });
  return subtasks;
}

/** @returns {Promise<string>} Unique task ID (t1, t2, etc.) */
async function generateTaskId() {
  const response = await fetch(BASE_URL + "/tasks.json");
  /** @type {Object<string, Task>} */
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
 * Creates complete task object
 * @param {string} taskId - Unique task ID
 * @param {TaskData} data - Form data
 * @returns {Task} Complete task object
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
 * Uploads task to Firebase
 * @param {string} taskId - Task ID
 * @param {Task} task - Complete task object
 */
async function uploadTaskToDatabase(taskId, task) {
  await fetch(BASE_URL + `/tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
}

/** Shows success overlay and redirects to board */
function showSuccessAndRedirect() {
  document.getElementById("successOverlay").style.display = "flex";
  setTimeout(() => (window.location.href = "../html/board.html"), 1200);
}