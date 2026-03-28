// Global state for the edit form
let editSelectedContacts = [];
let editCurrentSubtasks = [];

/**
 * Helper to update Assignees list UI in Edit Mode.
 */
function renderEditAssignees() {
  let container = document.getElementById("editModalAssignees");
  if (!container) return;
  container.innerHTML = "";

  const maxVisible = 3;
  const visibleContacts = editSelectedContacts.slice(0, maxVisible);
  const remaining = editSelectedContacts.length - maxVisible;

  renderVisibleAssignees(container, visibleContacts);
  renderRemainingBadge(container, remaining);
}

/**
 * Renders visible assignee badges.
 * @param {HTMLElement} container - The container element.
 * @param {Array} contacts - The visible contacts.
 */
function renderVisibleAssignees(container, contacts) {
  contacts.forEach((name) => {
    const initials = getContactInitials(name);
    const bgColor = getContactColor(name);
    container.innerHTML += `<div class="user-circle" style="background-color: ${bgColor};">${initials}</div>`;
  });
}

/**
 * Renders the remaining count badge if needed.
 * @param {HTMLElement} container - The container element.
 * @param {number} remaining - The remaining count.
 */
function renderRemainingBadge(container, remaining) {
  if (remaining > 0) {
    container.innerHTML += `<div class="user-circle user-circle-more">+${remaining}</div>`;
  }
}

/**
 * Gets initials from a contact name.
 * @param {string} name - The full name.
 * @returns {string} The initials.
 */
function getContactInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Gets color for a contact.
 * @param {string} name - The contact name.
 * @returns {string} The color code.
 */
function getContactColor(name) {
  return typeof getColorFromName === "function"
    ? getColorFromName(name)
    : "#FF7A00";
}

/**
 * Toggles the visibility of the assigned contacts dropdown in the edit form.
 * @param {Event} event - The click event.
 */
function toggleEditAssignedDropdown(event) {
  if (event) event.stopPropagation();
  let dropdown = document.getElementById("editAssignedDropdown");
  const isOpening = !dropdown.classList.contains("open");

  dropdown.classList.toggle("open");

  if (isOpening) {
    attachDropdownCloseListener();
  }
}

/**
 * Attaches a click listener to close the dropdown when clicking outside.
 */
function attachDropdownCloseListener() {
  setTimeout(() => {
    const closeDropdown = (e) => {
      const dropdown = document.getElementById("editAssignedDropdown");
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        document.removeEventListener("click", closeDropdown, true);
      }
    };
    document.addEventListener("click", closeDropdown, true);
  }, 0);
}

/**
 * Renders the list of contacts in the dropdown for the edit form.
 */
async function renderEditAssigneesDropdown() {
  let list = document.getElementById("editDropdownList");
  if (!list) return;
  list.innerHTML = "";

  const contacts = await getContactsList();
  contacts.forEach((contact) => {
    const contactItem = createContactItemElement(contact);
    list.appendChild(contactItem);
  });
}

/**
 * Creates a contact item element for the dropdown.
 * @param {Object} contact - The contact object.
 * @returns {HTMLElement} The contact item element.
 */
function createContactItemElement(contact) {
  const name = normalizeContactName(contact);
  const isSelectedMatch = isContactSelected(name);
  const initials = getContactInitials(name);
  const bgColor = getContactColor(name);

  const contactItem = document.createElement('div');
  contactItem.className = `contact-item ${isSelectedMatch ? "checked" : ""}`;
  contactItem.innerHTML = buildContactItemHTML(name, initials, bgColor, isSelectedMatch);

  attachContactItemListeners(contactItem, name);
  return contactItem;
}

/**
 * Normalizes a contact name by removing extra spaces.
 * @param {Object} contact - The contact object.
 * @returns {string} The normalized name.
 */
function normalizeContactName(contact) {
  return `${contact.firstname} ${contact.lastname}`
    .split(/\s+/).filter(Boolean).join(' ').trim();
}

/**
 * Checks if a contact is selected (case-insensitive).
 * @param {string} name - The contact name.
 * @returns {boolean} True if selected.
 */
function isContactSelected(name) {
  return editSelectedContacts.some(
    selectedName => selectedName.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Builds the HTML for a contact item.
 * @param {string} name - The contact name.
 * @param {string} initials - The initials.
 * @param {string} bgColor - The background color.
 * @param {boolean} isChecked - Whether the contact is selected.
 * @returns {string} The HTML string.
 */
function buildContactItemHTML(name, initials, bgColor, isChecked) {
  const checked = isChecked ? "checked" : "";
  return `
    <div class="contact-left">
      <div class="contact-circle" style="background-color: ${bgColor};">${initials}</div>
      <span>${name}</span>
    </div>
    <input type="checkbox" value="${name}" ${checked}>
  `;
}

/**
 * Attaches event listeners to a contact item.
 * @param {HTMLElement} contactItem - The contact item element.
 * @param {string} name - The contact name.
 */
function attachContactItemListeners(contactItem, name) {
  const checkbox = contactItem.querySelector('input[type="checkbox"]');
  attachCheckboxListener(checkbox, name, contactItem);
  attachContactClickListener(contactItem, checkbox, name);
}

/**
 * Attaches checkbox change listener.
 * @param {HTMLElement} checkbox - The checkbox element.
 * @param {string} name - The contact name.
 * @param {HTMLElement} contactItem - The contact item element.
 */
function attachCheckboxListener(checkbox, name, contactItem) {
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleEditContact(name, checkbox.checked);
    contactItem.classList.toggle('checked', checkbox.checked);
  });
}

/**
 * Attaches contact item click listener.
 * @param {HTMLElement} contactItem - The contact item element.
 * @param {HTMLElement} checkbox - The checkbox element.
 * @param {string} name - The contact name.
 */
function attachContactClickListener(contactItem, checkbox, name) {
  contactItem.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.tagName.toLowerCase() === 'input') return;
    checkbox.checked = !checkbox.checked;
    contactItem.classList.toggle('checked', checkbox.checked);
    toggleEditContact(name, checkbox.checked);
  });
}

/**
 * Toggles a contact's selection state and re-renders the assignee list.
 * @param {string} name - The name of the contact.
 * @param {boolean} isChecked - Whether the contact was selected or deselected.
 */
function toggleEditContact(name, isChecked) {
  if (isChecked) {
    addContactToSelection(name);
  } else {
    removeContactFromSelection(name);
  }
  renderEditAssignees();
}

/**
 * Adds a contact to the selection list.
 * @param {string} name - The contact name.
 */
function addContactToSelection(name) {
  const alreadyExists = editSelectedContacts.some(
    c => c.toLowerCase() === name.toLowerCase()
  );
  if (!alreadyExists) {
    editSelectedContacts.push(name);
  }
}

/**
 * Removes a contact from the selection list.
 * @param {string} name - The contact name.
 */
function removeContactFromSelection(name) {
  editSelectedContacts = editSelectedContacts.filter(
    (c) => c.toLowerCase() !== name.toLowerCase()
  );
}

/**
 * Subtasks management in Edit Form. Renders the list of current subtasks.
 */
function renderEditSubtasks() {
  let list = document.getElementById("editModalSubtasks");
  if (!list) return;
  list.innerHTML = "";

  editCurrentSubtasks.forEach((sub, index) => {
    list.innerHTML += buildSubtaskHTML(sub, index);
  });
}

/**
 * Builds HTML for a single subtask.
 * @param {Object} sub - The subtask object.
 * @param {number} index - The index of the subtask.
 * @returns {string} The HTML string.
 */
function buildSubtaskHTML(sub, index) {
  return `
    <li>
      <div class="subtask-text">${sub.title}</div>
      <div class="subtask-actions">
        <button type="button" class="subtask-action-btn" onclick="editModalSubtask(${index})">
          <img src="../assets/imgs/edit.svg" alt="Edit">
        </button>
        <div class="divider"></div>
        <button type="button" class="subtask-action-btn" onclick="deleteEditSubtask(${index})">
          <img src="../assets/imgs/delete.svg" alt="Delete">
        </button>
      </div>
    </li>
  `;
}

/**
 * Clears the input field for adding new subtasks in the edit form.
 */
function clearEditSubtaskInput() {
  let input = document.getElementById("editSubtaskInput");
  input.value = "";
  handleEditSubtaskInput();
}

/**
 * Focuses the subtask input field in the edit form.
 */
function focusEditSubtaskInput() {
  document.getElementById("editSubtaskInput").focus();
}

/**
 * Handles input events on the subtask input field.
 */
function handleEditSubtaskInput() {
  let val = document.getElementById("editSubtaskInput").value;
  let wrapper = document.getElementById("editSubtaskInputWrapper");
  if (val.length > 0) {
    wrapper.classList.add("typing");
  } else {
    wrapper.classList.remove("typing");
  }
}

/**
 * Adds a new subtask to the current task being edited.
 */
function addEditSubtask() {
  let input = document.getElementById("editSubtaskInput");
  let title = input.value.trim();
  if (title) {
    editCurrentSubtasks.push({ title: title, completed: false });
    clearEditSubtaskInput();
    renderEditSubtasks();
  }
}

/**
 * Handles keypress events for the subtask input.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleEditSubtaskKeypress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addEditSubtask();
  }
}

/**
 * Deletes a subtask from the current task being edited.
 * @param {number} index - The index of the subtask in the array.
 */
function deleteEditSubtask(index) {
  editCurrentSubtasks.splice(index, 1);
  renderEditSubtasks();
}

/**
 * Prepares a subtask for editing.
 * @param {number} index - The index of the subtask in the array.
 */
function editModalSubtask(index) {
  let input = document.getElementById("editSubtaskInput");
  input.value = editCurrentSubtasks[index].title;
  input.focus();
  deleteEditSubtask(index);
}

/**
 * Helper to handle priority button clicks in the edit form.
 * @param {string} priority - The selected priority level.
 * @param {HTMLElement} btnElement - The button element that was clicked.
 */
function setEditPriority(priority, btnElement) {
  document.getElementById("editTaskPriority").value = priority;

  let buttons = btnElement.parentElement.querySelectorAll(".trigger");
  buttons.forEach((btn) => btn.classList.remove("active"));

  btnElement.classList.add("active");
}
