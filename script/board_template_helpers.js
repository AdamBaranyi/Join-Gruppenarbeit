/**
 * Helper functions for board templates - contains logic separated from HTML.
 */

/**
 * Converts assignedTo to array format.
 * @param {*} assignedTo - The assignedTo data (can be array or object).
 * @returns {Array} Array of assignee names.
 */
function convertAssigneesToArray(assignedTo) {
  if (!assignedTo) return [];
  return Array.isArray(assignedTo) ? assignedTo : Object.values(assignedTo);
}

/**
 * Gets initials from a name.
 * @param {string} name - The full name.
 * @returns {string} The initials in uppercase.
 */
function getInitialsFromName(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Gets assignee badge color class.
 * @param {number} index - The assignee index.
 * @returns {string} The color class.
 */
function getAssigneeColorClass(index) {
  const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
  return colors[index % colors.length];
}

/**
 * Builds assignee badges HTML.
 * @param {Array} assignees - Array of assignee names.
 * @param {number} maxVisible - Maximum visible badges.
 * @returns {Object} Object with html and remaining count.
 */
function buildAssigneeBadges(assignees, maxVisible = 3) {
  const visibleAssignees = assignees.slice(0, maxVisible);
  const remaining = assignees.length - maxVisible;

  const html = visibleAssignees
    .map((name, index) => {
      const initials = getInitialsFromName(name);
      const colorClass = getAssigneeColorClass(index);
      return `<div class="assignee-badge ${colorClass}">${initials}</div>`;
    })
    .join("");

  return { html, remaining };
}

/**
 * Calculates subtask progress.
 * @param {Array} subtasks - Array of subtask objects.
 * @returns {Object} Object with total, completed, and percent.
 */
function calculateSubtaskProgress(subtasks) {
  const total = subtasks.length;
  const completed = subtasks.filter((st) => st.completed).length;
  const percent = (completed / total) * 100;
  return { total, completed, percent };
}

/**
 * Gets priority button active class.
 * @param {string} taskPriority - The task's priority.
 * @param {string} buttonPriority - The button's priority.
 * @returns {string} "active" or empty string.
 */
function getPriorityActiveClass(taskPriority, buttonPriority) {
  return taskPriority === buttonPriority ? "active" : "";
}

/**
 * Gets priority icon filename.
 * @param {string} type - The priority type (urgent, medium, low).
 * @returns {string} The icon filename.
 */
function getPriorityIconFilename(type) {
  if (type === 'medium') return 'priority_medium.svg';
  return `${type}-priority-board.svg`;
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
