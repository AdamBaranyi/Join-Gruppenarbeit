const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";

let selectedContacts = [];

document.addEventListener("DOMContentLoaded", function () {
  initializePriorityButtons();
  initializeFormValidation();
  initializeAssignedDropdown();
  initializeCategoryDropdown();
  initializeSubtasks();
});

function initializePriorityButtons() {
  const triggers = document.querySelectorAll(".trigger");

  triggers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      triggers.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function initializeFormValidation() {
  const form = document.getElementById("taskForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
      saveTaskToFirebase();
    }
  });
}

function validateForm() {
  clearErrors();
  
  const isTitleValid = validateTaskTitle();
  const isDateValid = validateTaskDate();
  const isCategoryValid = validateTaskCategory();
  
  return isTitleValid && isDateValid && isCategoryValid;
}

function validateTaskTitle() {
  const tasktitle = document.getElementById("task-title");
  
  if (!tasktitle.value.trim()) {
    setError("task-title", "* This field is required");
    return false;
  }
  return true;
}

function validateTaskDate() {
  const taskdate = document.getElementById("due-date");
  
  if (!taskdate.value) {
    setError("due-date", "* This field is required");
    return false;
  }
  return true;
}

function validateTaskCategory() {
  const categoryDropdown = document.querySelector(".category-dropdown .placeholder");
  
  if (categoryDropdown.textContent === "Select task category") {
    setError("categoryDropdown", "* This field is required");
    document.getElementById("categoryDropdown").classList.add("input-error");
    return false;
  }
  return true;
}

function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorDiv = document.getElementById("error-" + fieldId);

  if (input) input.classList.add("input-error");
  if (errorDiv) errorDiv.innerText = message;
}

function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
    el.innerText = "";
  });

  document.querySelectorAll(".input-error").forEach((el) => {
    el.classList.remove("input-error");
  });
}

function initializeAssignedDropdown() {
  const dropdown = document.getElementById("assignedDropdown");
  if (!dropdown) return;

  const elements = getDropdownElements(dropdown);
  selectedContacts = [];
  
  renderAllContacts(elements);
  setupDropdownEventListeners(dropdown, elements);
}

function getDropdownElements(dropdown) {
  return {
    header: dropdown.querySelector(".dropdown-header"),
    dropdownList: document.getElementById("dropdownList"),
    selectedContainer: document.getElementById("selectedUsers"),
    placeholder: dropdown.querySelector(".placeholder")
  };
}

function renderAllContacts(elements) {
  const contacts = getContactsList();
  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
  
  contacts.forEach((name, index) => {
    createContactElement(name, colors[index % colors.length], elements);
  });
  
  updateSelectedUsersDisplay(elements);
}

function getContactsList() {
  return [
    "Sofiia Müller (You)",
    "Anton Mayer",
    "Anja Schulz",
    "Benedikt Ziegler",
    "David Eisenberg",
  ];
}

function getInitials(name) {
  return name.replace(" (You)", "")
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function createContactElement(name, colorClass, elements) {
  const initials = getInitials(name);
  const isYou = name.includes("(You)");
  
  const item = document.createElement("div");
  item.className = "contact-item";
  item.innerHTML = renderContactsTemplate(initials, colorClass, name, isYou);  // Hier habe das HTML ausgelagert! 
  setupContactCheckbox(item, name, isYou, elements);
  elements.dropdownList.appendChild(item);
}

function setupContactCheckbox(item, name, isYou, elements) {
  const checkbox = item.querySelector("input");
  
  if (isYou) selectedContacts.push(name);
  
  checkbox.addEventListener("change", () => {
    updateSelectedContacts(name, checkbox.checked);
    updateSelectedUsersDisplay(elements);
  });
}

function updateSelectedContacts(name, isChecked) {
  if (isChecked && !selectedContacts.includes(name)) {
    selectedContacts.push(name);
  } else if (!isChecked) {
    selectedContacts = selectedContacts.filter(c => c !== name);
  }
}

function updateSelectedUsersDisplay(elements) {
  elements.selectedContainer.innerHTML = "";
  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
  
  selectedContacts.slice(0, 4).forEach((name, index) => {
    const circle = createUserCircle(name, colors[index % colors.length]);
    elements.selectedContainer.appendChild(circle);
  });
  
  elements.placeholder.style.display = selectedContacts.length === 0 ? "inline" : "none";
}

function createUserCircle(name, colorClass) {
  const circle = document.createElement("div");
  circle.className = `user-circle ${colorClass}`;
  circle.innerText = getInitials(name);
  circle.title = name;
  return circle;
}

function setupDropdownEventListeners(dropdown, elements) {
  elements.header.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}

function initializeCategoryDropdown() {
  const dropdown = document.querySelector(".category-dropdown");
  if (!dropdown) return;
  
  const elements = getCategoryDropdownElements(dropdown);
  
  setupDropdownHeaderListener(dropdown, elements);
  setupCategoryItemsListeners(elements);
  setupOutsideClickListener(dropdown);
}

function getCategoryDropdownElements(dropdown) {
  return {
    header: dropdown.querySelector(".dropdown-header"),
    placeholder: dropdown.querySelector(".placeholder"),
    categoryItems: dropdown.querySelectorAll(".category-item")
  };
}

function setupDropdownHeaderListener(dropdown, elements) {
  elements.header.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown(dropdown);
  });
}

function toggleDropdown(dropdown) {
  dropdown.classList.toggle("open");
}

function setupCategoryItemsListeners(elements) {
  elements.categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      handleCategorySelection(item, elements);
    });
  });
}

function handleCategorySelection(selectedItem, elements) {
  updatePlaceholderWithSelectedCategory(selectedItem, elements);
  removeCategoryDropdownError();
  closeDropdown(elements);
}

function updatePlaceholderWithSelectedCategory(selectedItem, elements) {
  const categoryValue = selectedItem.textContent;
  elements.placeholder.textContent = categoryValue;
  elements.placeholder.style.color = "#000";
}

function removeCategoryDropdownError() {
  const dropdown = document.querySelector(".category-dropdown");
  dropdown.classList.remove("input-error");
  
  const errorElement = document.getElementById("error-categoryDropdown");
  if (errorElement) {
    errorElement.innerText = "";
  }
}

function closeDropdown(elements) {
  const dropdown = elements.header.closest(".category-dropdown");
  dropdown.classList.remove("open");
}

function setupOutsideClickListener(dropdown) {
  document.addEventListener("click", (event) => {
    closeDropdownIfClickOutside(event, dropdown);
  });
}

function closeDropdownIfClickOutside(event, dropdown) {
  if (!dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
  }
}

function initializeSubtasks() {
  const elements = getSubtaskElements();
  if (!elements) return;
  
  addSubtaskButtonListeners(elements);
  addSubtaskInputListeners(elements);
  addSubtaskListListener(elements);
}

function getSubtaskElements() {
  return {
    input: document.getElementById("subTaskInput"),
    addButton: document.getElementById("addSubtaskBtn"),
    clearButton: document.getElementById("clearSubtaskBtn"),
    list: document.getElementById("subtaskList")
  };
}

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

function addSubtaskInputListeners(elements) {
  elements.input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.addButton.click();
    }
  });
}

function addSubtaskListListener(elements) {
  elements.list.addEventListener("click", (event) => {
    const subtaskItem = event.target.closest(".subtask-item");
    if (!subtaskItem) return;
    
    handleDeleteButtonClick(event, subtaskItem);
    handleEditButtonClick(event, subtaskItem);
  });
}

function handleDeleteButtonClick(event, subtaskItem) {
  const deleteButton = event.target.closest(".delete-btn");
  if (deleteButton) {
    subtaskItem.remove();
  }
}

function handleEditButtonClick(event, subtaskItem) {
  const editButton = event.target.closest(".edit-btn");
  if (!editButton) return;
  
  const subtaskInput = subtaskItem.querySelector("input");
  subtaskInput.disabled = !subtaskInput.disabled;
  editButton.classList.toggle("editing");
  
  if (!subtaskInput.disabled) {
    subtaskInput.focus();
  }
}

function addSubtaskItem(value) {
  const subtaskList = document.getElementById("subtaskList");

  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item";

  subtaskItem.innerHTML = addSubtaskItemTemplate(value); // Hier habe das HTML ausgelagert! 

  subtaskList.appendChild(subtaskItem);
}

function clearForm() {
  document.getElementById("taskForm").reset();
  clearErrors();

  document.getElementById("selectedUsers").innerHTML = "";
  document.querySelector("#assignedDropdown .placeholder").style.display = "inline";

  const categoryPlaceholder = document.querySelector(
    ".category-dropdown .placeholder",
  );
  if (categoryPlaceholder) {
    categoryPlaceholder.textContent = "Select task category";
    categoryPlaceholder.style.color = "#666";
  }

  document.getElementById("subtaskList").innerHTML = "";
  document.querySelectorAll('#dropdownList input[type="checkbox"]')
    .forEach((cb) => {
      cb.checked = false;
    });

  selectedContacts = [];
}

function clearCompleteForm() {
  clearForm();
  document.getElementById("subTaskInput").value = "";
}


async function saveTaskToFirebase() {
  try {
    const taskData = collectFormData();
    const taskId = await generateTaskId();
    const completeTask = buildTaskObject(taskId, taskData);
    
    await uploadTaskToDatabase(taskId, completeTask);
    showSuccessAndRedirect();
  } catch (error) {
    console.error("Fehler beim Speichern:", error);
  }
}

function collectFormData() {
  return {
    title: document.getElementById("task-title").value.trim(),
    description: document.getElementById("taskDsc").value.trim(),
    dueDate: document.getElementById("due-date").value,
    category: document.querySelector(".category-dropdown .placeholder").textContent,
    priority: getPriorityValue(),
    assignedTo: selectedContacts || [],
    subtasks: getSubtasksFromDom()
  };
}

function getPriorityValue() {
  const priorityButton = document.querySelector(".trigger.active");
  return priorityButton ? priorityButton.dataset.priority : "Medium";
}

function getSubtasksFromDom() {
  const subtasks = [];
  document.querySelectorAll(".subtask-item input").forEach(input => {
    const value = input.value.trim();
    if (value) subtasks.push({ title: value, completed: false });
  });
  return subtasks;
}

async function generateTaskId() {
  const response = await fetch(BASE_URL + "tasks.json");
  const tasks = await response.json();
  
  let nextNumber = 1;
  if (tasks) {
    const numbers = Object.keys(tasks)
      .filter(key => key.startsWith("t"))
      .map(key => parseInt(key.replace("t", "")));
    if (numbers.length) nextNumber = Math.max(...numbers) + 1;
  }
  return "t" + nextNumber;
}

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
    createdAt: Date.now()
  };
}

async function uploadTaskToDatabase(taskId, task) {
  await fetch(BASE_URL + `tasks/${taskId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task)
  });
}

function showSuccessAndRedirect() {
  document.getElementById("successOverlay").style.display = "flex";
  setTimeout(() => window.location.href = "../html/board.html", 1200);
}