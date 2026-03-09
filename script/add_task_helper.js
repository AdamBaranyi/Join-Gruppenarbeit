/**
 * @fileoverview Helper functions for the Add Task page: dropdown logic,
 * contact management, subtasks, Firebase interactions and UI updates.
 */

// ---------- Assigned-To Dropdown Helper Functions ----------

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
    const bgColor =
      typeof getColorFromName === "function"
        ? getColorFromName(fullName)
        : "#FF7A00";
    createContactElement(fullName, bgColor, elements);
  });

  updateSelectedUsersDisplay(elements);
}

/**
 * Fetches the contact list from Firebase.
 * @async
 * @returns {Promise<Object[]>} Array of contact objects (firstname, lastname, …).
 */
async function getContactsList() {
  const response = await fetch(BASE_URL + "/contacts.json");
  const data = await response.json();
  return data ? Object.values(data) : [];
}

/**
 * Extracts initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The initials (max. 2 letters, uppercase).
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Creates a DOM element for a contact and appends it to the dropdown list.
 * @param {string} name - Full name.
 * @param {string} bgColor - Background colour as hex.
 * @param {Object} elements - Dropdown elements (for checkbox event).
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
    selectedContacts = selectedContacts.filter((c) => c !== name);
  }
}

/**
 * Updates the circle display of selected users.
 * @param {Object} elements - Dropdown elements.
 */
function updateSelectedUsersDisplay(elements) {
  elements.selectedContainer.innerHTML = "";
  selectedContacts.slice(0, 5).forEach((name) => {
    const bgColor =
      typeof getColorFromName === "function"
        ? getColorFromName(name)
        : "#FF7A00";
    const circle = createUserCircle(name, bgColor);
    elements.selectedContainer.appendChild(circle);
  });
  elements.placeholder.style.display =
    selectedContacts.length === 0 ? "inline" : "none";
}

/**
 * Creates a user circle (div) with initials and background colour.
 * @param {string} name - Full name.
 * @param {string} bgColor - Background colour as hex.
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
 * Sets up event listeners for the assigned dropdown (open/close).
 * @param {HTMLElement} dropdown - The dropdown container element.
 * @param {Object} elements - Dropdown elements.
 */
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

// ---------- Category Dropdown Helper Functions ----------

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
    toggleDropdown(dropdown);
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
  updatePlaceholderWithSelectedCategory(selectedItem, elements);
  removeCategoryDropdownError();
  closeDropdown(elements);
}

/**
 * Updates the placeholder text with the selected category.
 * @param {HTMLElement} selectedItem - The selected item.
 * @param {Object} elements - Category dropdown elements.
 */
function updatePlaceholderWithSelectedCategory(selectedItem, elements) {
  const categoryValue = selectedItem.textContent;
  elements.placeholder.textContent = categoryValue;
  elements.placeholder.style.color = "#000";
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
    closeDropdownIfClickOutside(event, dropdown);
  });
}

/**
 * Closes the dropdown if the click occurred outside.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} dropdown - The dropdown container element.
 */
function closeDropdownIfClickOutside(event, dropdown) {
  if (!dropdown.contains(event.target)) {
    dropdown.classList.remove("open");
  }
}

// ---------- Subtask Helper Functions ----------

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
 * Sets up keyboard listener for the subtask input field (Enter = add).
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
 * Sets up global click listener for the subtask list (edit/delete).
 * @param {Object} elements - The subtask elements.
 */
function addSubtaskListListener(elements) {
  elements.list.addEventListener("click", (event) => {
    const subtaskItem = event.target.closest(".subtask-item");
    if (!subtaskItem) return;

    handleDeleteButtonClick(event, subtaskItem);
    handleEditButtonClick(event, subtaskItem);
  });
}

/**
 * Handles click on the delete button of a subtask.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} subtaskItem - The subtask item.
 */
function handleDeleteButtonClick(event, subtaskItem) {
  const deleteButton = event.target.closest(".delete-btn");
  if (deleteButton) {
    subtaskItem.remove();
  }
}

/**
 * Handles click on the edit button of a subtask.
 * @param {MouseEvent} event - The click event.
 * @param {HTMLElement} subtaskItem - The subtask item.
 */
function handleEditButtonClick(event, subtaskItem) {
  const editButton = event.target.closest(".edit-btn");
  if (!editButton) return;

  const subtaskInput = subtaskItem.querySelector("input");
  subtaskInput.disabled = !subtaskInput.disabled;
  subtaskItem.classList.toggle("editing");
  editButton.classList.toggle("editing");

  if (!subtaskInput.disabled) {
    subtaskInput.focus();
  }
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
 * Toggles the edit mode of a subtask (for inline onclick).
 * @param {HTMLElement} btn - The clicked edit button.
 */
function toggleEdit(btn) {
  const item = btn.closest(".subtask-item");
  item.classList.toggle("editing");
  const input = item.querySelector("input");
  input.disabled = !input.disabled;
  btn.classList.toggle("editing");
}