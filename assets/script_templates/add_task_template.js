/**
 * Renders the HTML template for a contact item in the assigned-to dropdown.
 * @param {string} initials - The initials of the contact.
 * @param {string} bgColor - The background color for the contact circle (hex code).
 * @param {string} name - The full name of the contact.
 * @param {boolean} isYou - Whether this contact represents the current user.
 * @returns {string} The HTML string for the contact item.
 */
function renderContactsTemplate(initials, bgColor, name, isYou) {
  return `
        <div class="contact-left">
          <div class="contact-circle" style="background-color: ${bgColor};">${initials}</div>
          <span>${name}</span>
        </div>
        <input type="checkbox" value="${name}" ${isYou ? "checked" : ""}>
        `;
}

/**
 * Renders the HTML template for a subtask item.
 * @param {string} value - The text content of the subtask.
 * @returns {string} The HTML string for the subtask item with edit and delete buttons.
 */
function addSubtaskItemTemplate(value) {
  return `
    <input type="text" value="${value}" disabled>

    <div class="subtask-actions">
      <button type="button" class="edit-btn">
        <img src="../assets/imgs/edit.svg" class="edit-icon" alt="Edit">

        <img src="../assets/imgs/check.svg" class="save-icon" alt="Save">
      </button>

      <span class="divider"></span>

      <button type="button" class="delete-btn">
        <img src="../assets/imgs/delete.svg" class="subtask-icons" alt="Delete">
      </button>
    </div>
  `;
}

/**
 * Renders the complete HTML template for the task popup/form.
 * @returns {string} The HTML string for the entire add task popup including form,
 * priority buttons, dropdowns, subtasks section, and footer buttons.
 */
function getTaskPopupTemplate() {
  return `
    <div class="popup-page-header">
         <h1>Add Task</h1>
     </div>
     <div class="popup-main-container">

         <form id="taskForm">
             <div class="form-grid">
                 <div class="left-column">
                     <div class="form-group">
                         <label>Title <span class="required">*</span></label>
                         <input type="text" id="task-title" placeholder="Enter a title">
                         <div class="error-msg" id="error-task-title"></div>
                     </div>

                     <div class="form-group">
                         <label>Description</label>
                         <textarea id="taskDsc" placeholder="Enter a Description"></textarea>
                     </div>

                     <div class="form-group">
                         <label>Due date <span class="required">*</span></label>
                         <input type="date" id="due-date">
                         <div class="error-msg" id="error-due-date"></div>
                     </div>
                 </div>

                 <div class="column-separator">
                     <img src="../assets/imgs/Vector 4.png" alt="Vertical separator">
                 </div>

                 <div class="right-column">
                     <div class="form-group">
                         <label>Priority</label>
                         <div class="priority-buttons">
                             <button type="button" class="trigger urgent" data-priority="Urgent">
                                 <span class="btn-text">Urgent</span>
                                 <span class="btn-icon urgent-icon">
                                     <img src="../assets/imgs/urgent-priority-board.svg" alt="Urgent Priority">
                                 </span>
                             </button>
                             <button type="button" class="trigger medium active" data-priority="Medium">
                                 <span class="btn-text">Medium</span>
                                 <span class="btn-icon medium-icon">
                                     <img src="../assets/imgs/priority_medium.svg" alt="Medium Priority">
                                 </span>
                             </button>
                             <button type="button" class="trigger low" data-priority="Low">
                                 <span class="btn-text">Low</span>
                                 <span class="btn-icon low-icon">
                                     <img src="../assets/imgs/low-priority-board.svg" alt="Low Priority">
                                 </span>
                             </button>
                         </div>
                     </div>

                     <div class="form-group">
                         <label>Assigned to</label>
                         <div class="custom-dropdown" id="assignedDropdown">
                             <div class="dropdown-header">
                                 <span class="placeholder">Select contacts to assign</span>
                                 <span class="arrow">
                                     <img src="../assets/imgs/arrow_drop_downaa.png" alt="DropDwon-icon">
                                 </span>
                             </div>
                             <div class="dropdown-list" id="dropdownList"></div>
                         </div>
                         <div id="selectedUsers" class="selected-users"></div>
                     </div>

                     <div class="form-group">
                         <label>Category <span class="required">*</span></label>
                         <div class="custom-dropdown category-dropdown" id="categoryDropdown">
                             <div class="dropdown-header">
                                 <span class="placeholder">Select task category</span>
                                 <span class="arrow">
                                     <img src="../assets/imgs/arrow_drop_downaa.png" alt="DropDwon-icon">
                                 </span>
                             </div>
                             <div class="dropdown-list" id="categoryDropdownList">
                                 <div class="category-item" data-value="Technical Task">Technical Task</div>
                                 <div class="category-item" data-value="User Story">User Story</div>
                             </div>
                         </div>
                         <div class="error-msg" id="error-categoryDropdown"></div>
                     </div>

                     <div class="form-group subtask-group">
                         <label>Subtasks</label>
                         <div class="subtask-input-wrapper">
                             <input type="text" id="subTaskInput" placeholder="Add new subtask">
                             <div class="subtask-input-actions">
                                 <button type="button" class="clear-subtask-btn" id="clearSubtaskBtn">
                                     <img src="../assets/imgs/iconoir_cancel.svg" alt="">
                                 </button>
                                 <span class="divider"></span>
                                 <button type="button" id="addSubtaskBtn" class="add-subtask-btn">
                                     <img src="../assets/imgs/check.svg" class="subtask-icons" alt="Add Subtask">
                                 </button>
                             </div>
                         </div>
                         <div id="subtaskList" class="subtask-list"></div>
                     </div>

                 </div>
             </div>
         </form>

         <div id="successOverlay" class="overlay" style="display: none;">
             <div class="overlay-content">
                 <p>Task added to Board </p>
                 <img src="../assets/imgs/Board.svg" alt="">
             </div>
         </div>

        <div class="popup-footer-section">
         <div class="popup-footer-container">
             <p><span class="required">*</span> This field is required</p>
             <div class="button-group">
                 <button type="button" class="clear-btn" onclick="clearForm(); closeAddTaskPopup();">
                     <span class="btn-text">Cancel</span>
                     <img src="../assets/imgs/iconoir_cancel.svg" class="btn-icon close-icon" alt="Cancel">
                 </button>
                 <button type="submit" class="create-btn" form="taskForm">
                     <span class="btn-text">Create Task</span>
                     <img src="../assets/imgs/check.svg" class="btn-icon create-icon" alt="Create">
                 </button>
             </div>
         </div>
     </div>

     </div>`;
}