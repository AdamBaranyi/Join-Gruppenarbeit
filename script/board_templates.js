/**
 * Generates the HTML for a single task card on the board.
 * @param {Object} task - The task object.
 * @param {string} id - The ID of the task in Firebase.
 * @returns {string} The HTML string for the task card.
 */
function generateTaskHTML(task, id) {
  const assignedHTML = generateAssignedHTML(task.assignedTo);
  const progressHTML = generateSubtaskProgress(task);
  const priorityIcon = getPriorityIcon(task.priority);

  return `
    <div draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskPopup('${id}')" class="task-card">
      <div class="task-header-row">
        <div class="task-category ${getCategoryClass(task.category)}">
          ${(task.category || "").trim()}
        </div>
        <button type="button" class="mobile-move-btn" onclick="openMoveMenu(event, '${id}')">
          <img src="../assets/imgs/swap_horiz.svg" alt="Move">
        </button>
      </div>

      <h3 class="task-title">${task.title || ""}</h3>
      <p class="task-description">${task.description || ""}</p>

      ${progressHTML}

      <div class="task-footer">
        <div class="task-assignees">
          ${assignedHTML}
        </div>
        <div class="task-priority">
          <img src="${priorityIcon}" />
        </div>
      </div>

    </div>
  `;
}

/**
 * Generates the HTML for the assigned users' initials on a task card.
 * @param {string[]} assignedTo - Array of assigned user names.
 * @returns {string} The HTML string for the assigned badges.
 */
function generateAssignedHTML(assignedTo) {
  if (!assignedTo) return "";

  // Firebase might return an object instead of an array depending on how it was saved
  let assigneesArray = Array.isArray(assignedTo)
    ? assignedTo
    : Object.values(assignedTo);

  if (assigneesArray.length === 0) return "";

  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
  const maxVisible = 3;
  const totalCount = assigneesArray.length;
  const visibleAssignees = assigneesArray.slice(0, maxVisible);
  const remaining = totalCount - maxVisible;

  let html = visibleAssignees
    .map((name, index) => {
      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

      const colorClass = colors[index % colors.length];

      return `<div class="assignee-badge ${colorClass}">${initials}</div>`;
    })
    .join("");

  // Add +X badge if more than 3 assignees
  if (remaining > 0) {
    html += `<div class="assignee-badge assignee-badge-more">+${remaining}</div>`;
  }

  return html;
}

/**
 * Generates the HTML for the subtask progress bar on a task card.
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} The HTML string for the progress bar.
 */
function generateSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";

  const total = task.subtasks.length;
  const completed = task.subtasks.filter((st) => st.completed).length;
  const percent = (completed / total) * 100;

  return `
    <div class="task-progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width:${percent}%"></div>
      </div>
      <span class="progress-text">${completed}/${total} Subtasks</span>
    </div>
  `;
}

/**
 * Returns the path to the priority icon based on the priority level.
 * @param {string} priority - The priority level (Urgent, Medium, Low).
 * @returns {string} The relative path to the SVG icon.
 */
function getPriorityIcon(priority) {
  if (priority === "Urgent") return "../assets/imgs/urgent-priority-board.svg";

  if (priority === "Low") return "../assets/imgs/low-priority-board.svg";

  return "../assets/imgs/priority_medium.svg";
}

/**
 * Returns the corresponding CSS class for a task category.
 * @param {string} category - The category name.
 * @returns {string} The CSS class name.
 */
function getCategoryClass(category) {
  const trimmedCategory = (category || "").trim();
  if (trimmedCategory === "Technical Task") return "category-technical-task";

  if (trimmedCategory === "User Story") return "category-user-story";

  return "";
}

/**
 * Generates the HTML for the edit task form.
 * @param {Object} task - The task object to edit.
 * @returns {string} The HTML string for the edit form.
 */
function generateEditFormHTML(task) {
  return `
    <div class="edit-task-form">
      ${generateEditFormHeader()}
      ${generateEditFormFields(task)}
      ${generateEditFormFooter()}
    </div>
  `;
}

/**
 * Generates the edit form header.
 * @returns {string} The HTML string for the header.
 */
function generateEditFormHeader() {
  return `
    <div class="modal-header-row">
      <h2 class="edit-task-heading">Edit Task</h2>
      <button class="modal-close-btn" onclick="closeTaskPopup()">
        <img src="../assets/imgs/Close.png" alt="Close">
      </button>
    </div>
  `;
}

/**
 * Generates all edit form fields.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string for all fields.
 */
function generateEditFormFields(task) {
  return `
    ${generateEditTitleField(task)}
    ${generateEditDescriptionField(task)}
    ${generateEditDueDateField(task)}
    ${generateEditPriorityField(task)}
    ${generateEditAssignedToField()}
    ${generateEditSubtasksField()}
  `;
}

/**
 * Generates the title field.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string.
 */
function generateEditTitleField(task) {
  return `
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="editTaskTitle" value="${task.title || ""}" class="edit-input">
    </div>
  `;
}

/**
 * Generates the description field.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string.
 */
function generateEditDescriptionField(task) {
  return `
    <div class="form-group">
      <label>Description</label>
      <textarea id="editTaskDescription" class="edit-textarea">${task.description || ""}</textarea>
    </div>
  `;
}

/**
 * Generates the due date field.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string.
 */
function generateEditDueDateField(task) {
  return `
    <div class="form-group">
      <label>Due date</label>
      <input type="date" id="editTaskDueDate" value="${task.dueDate || ""}" class="edit-input">
    </div>
  `;
}

/**
 * Generates the priority field.
 * @param {Object} task - The task object.
 * @returns {string} The HTML string.
 */
function generateEditPriorityField(task) {
  const isUrgent = task.priority === "Urgent" ? "active" : "";
  const isMedium = task.priority === "Medium" ? "active" : "";
  const isLow = task.priority === "Low" ? "active" : "";

  return `
    <div class="form-group">
      <label>Priority</label>
      <div class="priority-buttons">
        ${generatePriorityButton('urgent', 'Urgent', isUrgent)}
        ${generatePriorityButton('medium', 'Medium', isMedium)}
        ${generatePriorityButton('low', 'Low', isLow)}
      </div>
      <input type="hidden" id="editTaskPriority" value="${task.priority || "Medium"}">
    </div>
  `;
}

/**
 * Generates a priority button.
 * @param {string} type - The priority type.
 * @param {string} label - The button label.
 * @param {string} activeClass - The active class if selected.
 * @returns {string} The HTML string.
 */
function generatePriorityButton(type, label, activeClass) {
  return `
    <button type="button" class="trigger ${type} ${activeClass}" onclick="setEditPriority('${label}', this)">
      <span class="btn-text">${label}</span>
      <span class="btn-icon ${type}-icon">
        <img src="../assets/imgs/${type === 'medium' ? 'priority_medium' : type + '-priority-board'}.svg" alt="${label}">
      </span>
    </button>
  `;
}

/**
 * Generates the assigned to field.
 * @returns {string} The HTML string.
 */
function generateEditAssignedToField() {
  return `
    <div class="form-group">
      <label>Assigned to</label>
      <div class="custom-dropdown" id="editAssignedDropdown">
        <div class="dropdown-header" onclick="toggleEditAssignedDropdown(event)">
          <span class="placeholder">Select contacts to assign</span>
          <span class="arrow">
            <img src="../assets/imgs/arrow_drop_downaa.png" alt="Dropdown">
          </span>
        </div>
        <div class="dropdown-list" id="editDropdownList"></div>
      </div>
      <div class="selected-users" id="editModalAssignees"></div>
    </div>
  `;
}

/**
 * Generates the subtasks field.
 * @returns {string} The HTML string.
 */
function generateEditSubtasksField() {
  return `
    <div class="form-group subtask-group">
      <label>Subtasks</label>
      <div class="subtask-input-wrapper" id="editSubtaskInputWrapper" onclick="focusEditSubtaskInput()">
        <input type="text" id="editSubtaskInput" placeholder="Add new subtask" class="edit-input"
               onkeypress="handleEditSubtaskKeypress(event)" oninput="handleEditSubtaskInput()">
        <div class="subtask-input-actions">
          <button type="button" class="clear-subtask-btn" onclick="clearEditSubtaskInput()">
            <img src="../assets/imgs/iconoir_cancel.svg" alt="">
          </button>
          <span class="divider"></span>
          <button type="button" class="add-subtask-btn" onclick="addEditSubtask()">
            <img src="../assets/imgs/check.svg" class="subtask-icons" alt="Add Subtask">
          </button>
        </div>
      </div>
      <ul class="subtask-list" id="editModalSubtasks"></ul>
    </div>
  `;
}

/**
 * Generates the form footer.
 * @returns {string} The HTML string.
 */
function generateEditFormFooter() {
  return `
    <div class="modal-footer-actions edit-footer">
      <button class="edit-ok-btn" onclick="saveTask()">
        Ok <img src="../assets/imgs/check.svg" style="width: 16px; height: auto;">
      </button>
    </div>
  `;
}

/**
 * Generates the HTML string for the mobile move context menu.
 * @param {string} taskId - The ID of the task.
 * @param {Array<Object>} statuses - The list of available status columns.
 * @param {number} currentIndex - The index of the task's current status in the array.
 * @returns {string} The HTML string for the mobile move menu.
 */
function generateMobileMoveMenuHTML(taskId, statuses, currentIndex) {
  let menuContent = `<div class="mobile-move-menu-header">Move to</div>`;

  // Zeige ALLE Spalten außer der aktuellen
  statuses.forEach((status, index) => {
    // Überspringe die aktuelle Spalte
    if (index !== currentIndex) {
      menuContent += `
          <div class="mobile-move-menu-item" onclick="moveTaskToStatus(event, '${taskId}', '${status.id}')">
              <span>${status.label}</span>
          </div>
      `;
    }
  });

  return menuContent;
}
