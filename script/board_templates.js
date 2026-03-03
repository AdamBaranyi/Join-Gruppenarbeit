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
      <div class="task-category ${getCategoryClass(task.category)}">
        ${task.category || ""}
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
  if (!assignedTo || assignedTo.length === 0) return "";

  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];

  return assignedTo
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
  if (category === "Technical Task") return "category-technical-task";

  if (category === "User Story") return "category-user-story";

  return "";
}

/**
 * Generates the HTML for the edit task form.
 * @param {Object} task - The task object to edit.
 * @returns {string} The HTML string for the edit form.
 */
function generateEditFormHTML(task) {
    // Determine priority button states
    const isUrgent = task.priority === 'Urgent' ? 'active' : '';
    const isMedium = task.priority === 'Medium' ? 'active' : '';
    const isLow = task.priority === 'Low' ? 'active' : '';

    return `
        <div class="edit-task-form">
            <div class="modal-close-container">
                <button class="modal-close-btn" onclick="closeTaskPopup()">
                    <img src="../assets/imgs/close.png" alt="Close">
                </button>
            </div>
            
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editTaskTitle" value="${task.title || ''}" class="edit-input">
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea id="editTaskDescription" class="edit-textarea">${task.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Due date</label>
                <input type="date" id="editTaskDueDate" value="${task.dueDate || ''}" class="edit-input">
            </div>
            
            <div class="form-group">
                <label>Priority</label>
                <div class="priority-buttons">
                    <button type="button" class="trigger urgent ${isUrgent}" onclick="setEditPriority('Urgent', this)">
                        <span class="btn-text">Urgent</span>
                        <span class="btn-icon urgent-icon">
                            <img src="../assets/imgs/urgent-priority-board.svg" alt="Urgent">
                        </span>
                    </button>
                    <button type="button" class="trigger medium ${isMedium}" onclick="setEditPriority('Medium', this)">
                        <span class="btn-text">Medium</span>
                        <span class="btn-icon medium-icon">
                            <img src="../assets/imgs/priority_medium.svg" alt="Medium">
                        </span>
                    </button>
                    <button type="button" class="trigger low ${isLow}" onclick="setEditPriority('Low', this)">
                        <span class="btn-text">Low</span>
                        <span class="btn-icon low-icon">
                            <img src="../assets/imgs/low-priority-board.svg" alt="Low">
                        </span>
                    </button>
                </div>
                <input type="hidden" id="editTaskPriority" value="${task.priority || 'Medium'}">
            </div>
            
            <div class="form-group">
                <label>Assigned to</label>
                <div class="custom-dropdown" id="editAssignedDropdown">
                    <div class="dropdown-header" onclick="toggleEditAssignedDropdown()">
                        <span class="placeholder">Select contacts to assign</span>
                        <span class="arrow">
                            <img src="../assets/imgs/arrow_drop_downaa.png" alt="Dropdown">
                        </span>
                    </div>
                    <div class="dropdown-list" id="editDropdownList">
                        <!-- Filled by JS -->
                    </div>
                </div>
                <div class="selected-users" id="editModalAssignees">
                    <!-- Rendered by JS -->
                </div>
            </div>
            
            <div class="form-group subtask-group">
                <label>Subtasks</label>
                <div class="subtask-input-wrapper" id="editSubtaskInputWrapper">
                    <input type="text" id="editSubtaskInput" placeholder="Add new subtask" class="edit-input" onkeypress="handleEditSubtaskKeypress(event)" oninput="handleEditSubtaskInput()">
                    <div class="subtask-add-default" onclick="focusEditSubtaskInput()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4V20M4 12H20" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="subtask-input-actions">
                        <button type="button" class="clear-subtask-btn" onclick="clearEditSubtaskInput()">
                            <img src="../assets/imgs/iconoir_cancel.svg" alt="">
                        </button>
                        <span class="divider"></span>
                        <button type="button" class="add-subtask-btn" onclick="addEditSubtask()"> 
                            <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <mask id="editMask" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha">
                                    <path fill="#d9d9d9" d="M0 0h24v24H0z" />
                                </mask>
                                <g mask="url(#editMask)">
                                    <path fill="#2a3647" d="m9.55 15.15 8.476-8.475q.3-.3.712-.3.413 0 .713.3t.3.713q0 .411-.3.712l-9.2 9.2q-.3.3-.7.3a.96.96 0 0 1-.7-.3L4.55 13a.93.93 0 0 1-.288-.713 1.02 1.02 0 0 1 .313-.712q.3-.3.712-.3.413 0 .713.3z" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="subtask-list" id="editModalSubtasks">
                    <!-- Filled by JS -->
                </ul>
            </div>
            
            <div class="modal-footer-actions edit-footer">
                <button class="edit-ok-btn" onclick="saveTask()">
                    Ok <img src="../assets/imgs/check.svg" style="width: 16px; height: auto;">
                </button>
            </div>
        </div>
    `;
}
