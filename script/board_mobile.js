/**
 * Mobile Move Menu functionality for the board.
 */

/**
 * Opens a context menu to move a task to another column on mobile.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 */
function openMoveMenu(event, taskId) {
  event.stopPropagation();
  closeMoveMenu();

  const task = allLoadedTasks[taskId];
  if (!task) return;

  const statuses = getStatusOptions();
  const currentIndex = statuses.findIndex(s => s.id === task.status);
  if (currentIndex === -1) return;

  createAndShowMoveMenu(event, taskId, statuses, currentIndex);
}

/**
 * Gets the available status options.
 * @returns {Array<Object>} The status options.
 */
function getStatusOptions() {
  return [
    { id: 'todo', label: 'To-do' },
    { id: 'inProgress', label: 'In progress' },
    { id: 'awaitingFeedback', label: 'Awaiting feedback' },
    { id: 'done', label: 'Done' }
  ];
}

/**
 * Creates and shows the move menu.
 * @param {Event} event - The click event.
 * @param {string} taskId - The task ID.
 * @param {Array} statuses - The status options.
 * @param {number} currentIndex - The current status index.
 */
function createAndShowMoveMenu(event, taskId, statuses, currentIndex) {
  const menuContent = generateMobileMoveMenuHTML(taskId, statuses, currentIndex);
  const menu = createMoveMenuElement(menuContent);

  positionMoveMenu(menu, event.currentTarget);
  attachMoveMenuListener();
}

/**
 * Creates the move menu element.
 * @param {string} content - The HTML content.
 * @returns {HTMLElement} The menu element.
 */
function createMoveMenuElement(content) {
  const menu = document.createElement('div');
  menu.className = 'mobile-move-menu';
  menu.id = 'mobileMoveMenu';
  menu.innerHTML = content;
  document.body.appendChild(menu);
  return menu;
}

/**
 * Positions the move menu relative to the button.
 * @param {HTMLElement} menu - The menu element.
 * @param {HTMLElement} button - The button element.
 */
function positionMoveMenu(menu, button) {
  const btnRect = button.getBoundingClientRect();
  const top = btnRect.bottom + window.scrollY + 8;
  const left = btnRect.right + window.scrollX - 140;

  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
}

/**
 * Attaches the click listener to close the menu.
 */
function attachMoveMenuListener() {
  setTimeout(() => {
    document.addEventListener('click', closeMoveMenuHandler);
  }, 0);
}

/**
 * Closes the mobile context menu if it is open.
 */
function closeMoveMenu() {
  const existingMenu = document.getElementById('mobileMoveMenu');
  if (existingMenu) {
      existingMenu.remove();
  }
  document.removeEventListener('click', closeMoveMenuHandler);
}

/**
 * Event handler to close the move menu when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeMoveMenuHandler(event) {
  const menu = document.getElementById('mobileMoveMenu');
  if (menu && !menu.contains(event.target)) {
      closeMoveMenu();
  }
}

/**
 * Moves a task to a specific status via the mobile context menu.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status to move the task to.
 */
async function moveTaskToStatus(event, taskId, newStatus) {
  event.stopPropagation();
  closeMoveMenu();

  currentDraggedElement = taskId;
  await moveTo(newStatus);
}
