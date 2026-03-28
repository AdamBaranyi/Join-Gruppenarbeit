/**
 * Extracts the relevant DOM elements of the assigned dropdown.
 * @param {HTMLElement} dropdown - The dropdown container element.
 * @returns {Object} Contains header, dropdownList, selectedContainer, placeholder.
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
 * Loads contacts from Firebase and renders them into the dropdown list.
 * @async
 * @param {Object} elements - The elements returned by getDropdownElements.
 */
async function renderAllContacts(elements) {
  const contacts = await getContactsList();
  elements.dropdownList.innerHTML = "";

  contacts.forEach((contact) => {
    const fullName = `${contact.firstname} ${contact.lastname}`;
    const bgColor = typeof getColorFromName === "function" ? getColorFromName(fullName) : "#FF7A00";
    createContactElement(fullName, bgColor, elements);
  });
  updateSelectedUsersDisplay(elements);
}

/**
 * Fetches the contact list from Firebase.
 * @async
 * @returns {Promise<Object[]>} Array of contact objects.
 */
async function getContactsList() {
  const response = await fetch(BASE_URL + "/contacts.json");
  const data = await response.json();
  return data ? Object.values(data) : [];
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
}

/**
 * Creates a DOM element for a contact and appends it to the dropdown list.
 * @param {string} name - Full name.
 * @param {string} bgColor - Background colour.
 * @param {Object} elements - Dropdown elements.
 */
function createContactElement(name, bgColor, elements) {
  const initials = getInitials(name);
  const item = document.createElement("div");
  item.className = "contact-item";
  item.innerHTML = renderContactsTemplate(initials, bgColor, name, false);
  setupContactCheckbox(item, name, false, elements);
  elements.dropdownList.appendChild(item);
}

/**
 * Sets up the change listener for a contact checkbox.
 * @param {HTMLElement} item - The contact item.
 * @param {string} name - Contact name.
 * @param {boolean} isYou - True if this is the current user.
 * @param {Object} elements - Dropdown elements.
 */
function setupContactCheckbox(item, name, isYou, elements) {
  const checkbox = item.querySelector("input");
  if (isYou) selectedContacts.push(name);

  checkbox.addEventListener("change", () => {
    updateSelectedContacts(name, checkbox.checked);
    updateSelectedUsersDisplay(elements);
    item.classList.toggle("selected", checkbox.checked);
  });

  item.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "input") return;
    checkbox.checked = !checkbox.checked;
    item.classList.toggle("selected", checkbox.checked);
    updateSelectedContacts(name, checkbox.checked);
    updateSelectedUsersDisplay(elements);
  });
}

/**
 * Updates the array of selected contacts.
 * @param {string} name - Contact name.
 * @param {boolean} isChecked - Checkbox status.
 */
function updateSelectedContacts(name, isChecked) {
  if (isChecked && !selectedContacts.includes(name)) {
    selectedContacts.push(name);
  } else if (!isChecked) {
    selectedContacts = selectedContacts.filter(c => c !== name);
  }
}

/**
 * Updates the circle display of selected users.
 * @param {Object} elements - Dropdown elements.
 */
function updateSelectedUsersDisplay(elements) {
  const c = elements.selectedContainer;
  c.innerHTML = "";
  const max = 6, total = selectedContacts.length;
  const visible = total > max ? max - 1 : total;

  selectedContacts.slice(0, visible).forEach(name => {
    const color = typeof getColorFromName === "function" ? getColorFromName(name) : "#FF7A00";
    c.appendChild(createUserCircle(name, color));
  });

  if (total > max) {
    const more = document.createElement("div");
    more.className = "user-circle more";
    more.innerText = `+${total - visible}`;
    c.appendChild(more);
  }
  elements.placeholder.style.display = total ? "none" : "inline";
}

/**
 * Creates a user circle with initials and background colour.
 * @param {string} name - Full name.
 * @param {string} bgColor - Background colour.
 * @returns {HTMLElement} The circle element.
 */
function createUserCircle(name, bgColor) {
  const circle = document.createElement("div");
  circle.className = "user-circle";
  circle.style.backgroundColor = bgColor;
  circle.innerText = getInitials(name);
  circle.title = name;
  return circle;
}

/**
 * Sets up event listeners for the assigned dropdown.
 * @param {HTMLElement} dropdown - The dropdown container element.
 * @param {Object} elements - Dropdown elements.
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

/**
 * Extracts the relevant DOM elements of the category dropdown.
 * @param {HTMLElement} dropdown - The dropdown container element.
 * @returns {Object} Contains header, placeholder, categoryItems.
 */
function getCategoryDropdownElements(dropdown) {
  return {
    header: dropdown.querySelector(".dropdown-header"),
    placeholder: dropdown.querySelector(".placeholder"),
    categoryItems: dropdown.querySelectorAll(".category-item"),
  };
}

/**
 * Sets up the click listener for the category header.
 * @param {HTMLElement} dropdown - The dropdown container element.
 * @param {Object} elements - Category dropdown elements.
 */
function setupDropdownHeaderListener(dropdown, elements) {
  elements.header.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdown.classList.toggle("open");
  });
}

/**
 * Opens or closes the dropdown.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
function toggleDropdown(dropdown) {
  dropdown.classList.toggle("open");
}

/**
 * Sets up click listeners for all category items.
 * @param {Object} elements - Category dropdown elements.
 */
function setupCategoryItemsListeners(elements) {
  elements.categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      handleCategorySelection(item, elements);
    });
  });
}

/**
 * Handles the selection of a category.
 * @param {HTMLElement} selectedItem - The clicked item.
 * @param {Object} elements - Category dropdown elements.
 */
function handleCategorySelection(selectedItem, elements) {
  elements.placeholder.textContent = selectedItem.textContent.trim();
  elements.placeholder.style.color = "#000";
  
  const dropdown = document.querySelector(".category-dropdown");
  dropdown.classList.remove("input-error");
  const errorElement = document.getElementById("error-categoryDropdown");
  if (errorElement) errorElement.innerText = "";
  
  dropdown.classList.remove("open");
}

/**
 * Removes error classes and messages from the category dropdown.
 */
function removeCategoryDropdownError() {
  const dropdown = document.querySelector(".category-dropdown");
  dropdown.classList.remove("input-error");
  const errorElement = document.getElementById("error-categoryDropdown");
  if (errorElement) errorElement.innerText = "";
}

/**
 * Closes the category dropdown.
 * @param {Object} elements - Category dropdown elements.
 */
function closeDropdown(elements) {
  const dropdown = elements.header.closest(".category-dropdown");
  dropdown.classList.remove("open");
}

/**
 * Sets up a global click listener that closes the dropdown when clicking outside.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
function setupOutsideClickListener(dropdown) {
  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
  });
}

/**
 * Closes the dropdown if the click occurred outside.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
function closeDropdownIfClickOutside(event, dropdown) {
  if (!dropdown.contains(event.target)) dropdown.classList.remove("open");
}

/**
 * Collects the DOM elements for subtasks.
 * @returns {Object} Contains input, addButton, clearButton, list.
 */
function getSubtaskElements() {
  return {
    input: document.getElementById("subTaskInput"),
    addButton: document.getElementById("addSubtaskBtn"),
    clearButton: document.getElementById("clearSubtaskBtn"),
    list: document.getElementById("subtaskList"),
  };
}

/**
 * Sets up click listeners for the subtask buttons.
 * @param {Object} elements - The subtask elements.
 */
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

/**
 * Sets up keyboard listener for the subtask input field.
 * @param {Object} elements - The subtask elements.
 */
function addSubtaskInputListeners(elements) {
  elements.input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      elements.addButton.click();
    }
  });
}

/**
 * Sets up global click listener for the subtask list.
 * @param {Object} elements - The subtask elements.
 */
function addSubtaskListListener(elements) {
  elements.list.addEventListener("click", (event) => {
    const subtaskItem = event.target.closest(".subtask-item");
    if (!subtaskItem) return;
    
    if (event.target.closest(".delete-btn")) {
      subtaskItem.remove();
    } else {
      handleSubtaskEdit(event, subtaskItem);
    }
  });
}

/**
 * Handles the edit functionality for a subtask.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} subtaskItem - The subtask item.
 */
function handleSubtaskEdit(event, subtaskItem) {
  const editButton = event.target.closest(".edit-btn");
  if (!editButton) return;
  
  const input = subtaskItem.querySelector("input");
  if (!input.disabled && !input.value.trim()) {
    subtaskItem.classList.add("error");
    input.focus();
    return;
  }
  
  subtaskItem.classList.remove("error");
  input.disabled = !input.disabled;
  subtaskItem.classList.toggle("editing");
  editButton.classList.toggle("editing");
}

/**
 * Handles click on the delete button of a subtask.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} subtaskItem - The subtask item.
 */
function handleDeleteButtonClick(event, subtaskItem) {
  if (event.target.closest(".delete-btn")) subtaskItem.remove();
}

/**
 * Handles click on the edit button of a subtask.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} subtaskItem - The subtask item.
 */
function handleEditButtonClick(event, subtaskItem) {
  const editButton = event.target.closest(".edit-btn");
  if (!editButton) return;

  const input = subtaskItem.querySelector("input");

  if (!input.disabled && !input.value.trim()) {
    subtaskItem.classList.add("error");
    input.focus();
    return;
  }

  subtaskItem.classList.remove("error");
  input.disabled = !input.disabled;
  subtaskItem.classList.toggle("editing");
  editButton.classList.toggle("editing");
}

/**
 * Adds a new subtask item to the list.
 * @param {string} value - The subtask text.
 */
function addSubtaskItem(value) {
  const subtaskList = document.getElementById("subtaskList");
  const subtaskItem = document.createElement("div");
  subtaskItem.className = "subtask-item";
  subtaskItem.innerHTML = addSubtaskItemTemplate(value);
  subtaskList.appendChild(subtaskItem);
}

/**
 * Toggles the edit mode of a subtask.
 * @param {HTMLElement} btn - The clicked edit button.
 */
function toggleEdit(btn) {
  const item = btn.closest(".subtask-item");
  item.classList.toggle("editing");
  const input = item.querySelector("input");
  input.disabled = !input.disabled;
  btn.classList.toggle("editing");
}