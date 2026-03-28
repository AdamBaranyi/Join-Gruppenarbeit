/**
 * Board HTML Templates - Pure HTML template strings only, no logic.
 */

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
  const categoryClass = getCategoryClass(task.category);

  return `
    <div draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskPopup('${id}')" class="task-card">
      <div class="task-header-row">
        <div class="task-category ${categoryClass}">
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
        <div class="task-assignees">${assignedHTML}</div>
        <div class="task-priority"><img src="${priorityIcon}" /></div>
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
  const assignees = convertAssigneesToArray(assignedTo);
  if (assignees.length === 0) return "";

  const { html, remaining } = buildAssigneeBadges(assignees);
  const remainingBadge = remaining > 0
    ? `<div class="assignee-badge assignee-badge-more">+${remaining}</div>`
    : "";

  return html + remainingBadge;
}

/**
 * Generates the HTML for the subtask progress bar on a task card.
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} The HTML string for the progress bar.
 */
function generateSubtaskProgress(task) {
  if (!task.subtasks || task.subtasks.length === 0) return "";

  const { total, completed, percent } = calculateSubtaskProgress(task.subtasks);

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
 * Generates the HTML for the edit task form.
 * @param {Object} task - The task object to edit.
 * @returns {string} The HTML string for the edit form.
 */
function generateEditFormHTML(task) {
  const urgentClass = getPriorityActiveClass(task.priority, "Urgent");
  const mediumClass = getPriorityActiveClass(task.priority, "Medium");
  const lowClass = getPriorityActiveClass(task.priority, "Low");

  return `
    <div class="edit-task-form">
      <div class="modal-header-row">
        <h2 class="edit-task-heading">Edit Task</h2>
        <button class="modal-close-btn" onclick="closeTaskPopup()">
          <img src="../assets/imgs/Close.png" alt="Close">
        </button>
      </div>

      <div class="form-group">
        <label>Title</label>
        <input type="text" id="editTaskTitle" value="${task.title || ""}" class="edit-input">
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea id="editTaskDescription" class="edit-textarea">${task.description || ""}</textarea>
      </div>

      <div class="form-group">
        <label>Due date</label>
        <input type="date" id="editTaskDueDate" value="${task.dueDate || ""}" class="edit-input">
      </div>

      <div class="form-group">
        <label>Priority</label>
        <div class="priority-buttons">
          <button type="button" class="trigger urgent ${urgentClass}" onclick="setEditPriority('Urgent', this)">
            <span class="btn-text">Urgent</span>
            <span class="btn-icon urgent-icon">
              <img src="../assets/imgs/urgent-priority.svg" alt="Urgent">
            </span>
          </button>
          <button type="button" class="trigger medium ${mediumClass}" onclick="setEditPriority('Medium', this)">
            <span class="btn-text">Medium</span>
            <span class="btn-icon medium-icon">
              <img src="../assets/imgs/priority_medium.svg" alt="Medium">
            </span>
          </button>
          <button type="button" class="trigger low ${lowClass}" onclick="setEditPriority('Low', this)">
            <span class="btn-text">Low</span>
            <span class="btn-icon low-icon">
              <img src="../assets/imgs/low-priority.svg" alt="Low">
            </span>
          </button>
        </div>
        <input type="hidden" id="editTaskPriority" value="${task.priority || "Medium"}">
      </div>

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

      <div class="modal-footer-actions edit-footer">
        <button class="edit-ok-btn" onclick="saveTask()">
          Ok <img src="../assets/imgs/check.svg" style="width: 16px; height: auto;">
        </button>
      </div>
    </div>
  `;
}

/**
 * Generates the HTML string for the mobile move context menu.
 * @param {string} taskId - The ID of the task.
 * @param {Array<Object>} statuses - The list of available status columns.
 * @param {number} currentIndex - The index of the task's current status.
 * @returns {string} The HTML string for the mobile move menu.
 */
function generateMobileMoveMenuHTML(taskId, statuses, currentIndex) {
  let menuContent = `<div class="mobile-move-menu-header">Move to</div>`;

  statuses.forEach((status, index) => {
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
