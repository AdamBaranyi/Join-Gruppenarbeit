const overlay = document.getElementById("addTaskOverlay");
const popupContainer = document.getElementById("popupContainer");

/**
 * Prevents background scrolling by fixing the scroll position
 */
function disableBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

/**
 * Re-enables background scrolling and restores the original scroll position
 */
function enableBodyScroll() {
  const scrollY = document.body.style.top;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  if (scrollY) window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
}

/**
 * Opens the "Add Task" popup with a slide-in animation
 * @async
 * @returns {Promise<void>}
 */
async function openAddTaskPopup() {
  try {
    renderPopupContent();
    showPopup();
    disableBodyScroll();
    setTimeout(initializePopup, 150);
  } catch (err) {
    console.error("Failed to load popup:", err);
  }
}

/**
 * Renders the popup content with the template and close button
 */
function renderPopupContent() {
  const html = getTaskPopupTemplate();
  const closeButton = `<button class="popup-close-btn">
    <img src="../assets/imgs/iconoir_cancel.svg" alt="Close">
  </button>`;
  popupContainer.innerHTML = closeButton + html;
}

/**
 * Displays the popup with slide-in animation and shows the overlay
 */
function showPopup() {
  popupContainer.classList.remove("slide-out-right");
  popupContainer.classList.add("slide-in-right");
  overlay.classList.remove("d-none");
  overlay.style.display = "flex";
}

/**
 * Initializes all popup components
 */
function initializePopup() {
  initializeDateInput();
  initializePopupHelpers();
  setupCloseButton();
  attachFormSubmitHandler();
}

/**
 * Sets up the event listener for the close button
 */
function setupCloseButton() {
  const closeBtn = document.querySelector('.popup-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeAddTaskPopup);
}

/**
 * Initializes the date input field with minimum date and prevents manual input
 */
function initializeDateInput() {
  const dateInput = document.getElementById("due-date");
  if (!dateInput) return;
  dateInput.addEventListener("keydown", e => e.preventDefault());
  dateInput.min = new Date().toISOString().split("T")[0];
}

/**
 * Initializes all popup helper components (priority, category, assignment, subtasks)
 */
function initializePopupHelpers() {
  if (typeof initializePriorityButtons === "function") initializePriorityButtons();
  if (typeof initializeCategoryDropdown === "function") initializeCategoryDropdown();
  if (typeof initializeAssignedDropdown === "function") initializeAssignedDropdown();
  if (typeof initializeSubtasks === "function") initializeSubtasks();
}

/**
 * Adds the submit event listener to the task form
 */
function attachFormSubmitHandler() {
  const taskForm = document.getElementById("taskForm");
  if (!taskForm) return;
  taskForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    if (!validateForm()) return;
    await saveTaskToFirebase();
    closeAddTaskPopup();
    if (typeof loadTasks === "function") await loadTasks();
  });
}

/**
 * Handles the popup form submission (alternative handler)
 * @async
 * @param {Event} event - The form submit event
 * @returns {Promise<void>}
 */
async function handlePopupFormSubmit(event) {
  if (typeof createTask !== "function") return;
  const success = await createTask(event);
  if (!success) return;
  closeAddTaskPopup();
  if (typeof updateBoard === "function") await updateBoard();
}

/**
 * Closes the "Add Task" popup with a slide-out animation
 */
function closeAddTaskPopup() {
  popupContainer.classList.remove("slide-in-right");
  popupContainer.classList.add("slide-out-right");
  setTimeout(() => {
    overlay.classList.add("d-none");
    overlay.style.display = "none";
    enableBodyScroll();
    const taskForm = document.getElementById("taskForm");
    if (taskForm && typeof clearForm === "function") clearForm();
  }, 400);
}

/**
 * Closes dropdowns when clicking outside of them
 */
document.addEventListener("click", function(e) {
  document.querySelectorAll(".custom-dropdown").forEach(dropdown => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove("open");
  });
});

/**
 * Closes the popup when pressing the Escape key
 */
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && !overlay.classList.contains("d-none")) {
    closeAddTaskPopup();
  }
});