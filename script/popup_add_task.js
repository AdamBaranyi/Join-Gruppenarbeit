const overlay = document.getElementById("addTaskOverlay");
const popupContainer = document.getElementById("popupContainer");

/**
 * Verhindert das Scrollen des Hintergrunds
 */
function disableBodyScroll() {
  const scrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
}

/**
 * Aktiviert das Scrollen des Hintergrunds wieder
 */
function enableBodyScroll() {
  const scrollY = document.body.style.top;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  
  if (scrollY) {
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
  }
}

/**
 * Opens "Add Task" popup with slide-in animation, shows overlay,
 * and initializes its components.
 */
async function openAddTaskPopup() {
  try {
    const html = getTaskPopupTemplate();
    const cleanHtml = html;

    const closeButton = `<button class="popup-close-btn" onclick="closeAddTaskPopup()">
            <img src="../assets/imgs/Close.png" alt="Close">
        </button>`;

    popupContainer.innerHTML = closeButton + cleanHtml;

    popupContainer.classList.remove("slide-out-right");
    popupContainer.classList.add("slide-in-right");

    overlay.classList.remove("d-none");
    overlay.style.display = "flex";

    // Hintergrund-Scrollen verhindern
    disableBodyScroll();

    setTimeout(() => {
      initializePopupComponents();
    }, 150);
  } catch (err) {
    console.error("Popup konnte nicht geladen werden:", err);
  }
}

/**
 * Initializes components within the popup by calling their setup functions.
 * Also adds an event listener for handling form submission.
 */
function initializePopupComponents() {
  // Prevent manual date input and set minimum date
  const dateInput = document.getElementById("due-date");
  if (dateInput) {
    dateInput.addEventListener("keydown", e => e.preventDefault());
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  if (typeof initializePriorityButtons === "function") {
    initializePriorityButtons();
  }

  if (typeof initializeCategoryDropdown === "function") {
    initializeCategoryDropdown();
  }

  if (typeof initializeAssignedDropdown === "function") {
    initializeAssignedDropdown();
  }

  if (typeof initializeSubtasks === "function") {
    initializeSubtasks();
  }

  const taskForm = document.getElementById("taskForm");
  if (taskForm) {
    taskForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (validateForm()) {
        await saveTaskToFirebase();
        closeAddTaskPopup();
        if (typeof loadTasks === "function") {
          await loadTasks();
        }
      }
    });
  }
}

/**
 * Handles the popup form submission.
 * It creates a task and updates the board array if successful.
 *
 * @param {Event} event - The submit event from the form.
 */
async function handlePopupFormSubmit(event) {
  if (typeof createTask === "function") {
    const success = await createTask(event);
    if (success) {
      closeAddTaskPopup();
      if (typeof updateBoard === "function") {
        await updateBoard();
      }
    }
  }
}

/**
 * Closes "Add Task" popup, applying a slide-out animation,
 * hiding the overlay, and then optionally clearing the form.
 */
function closeAddTaskPopup() {
  popupContainer.classList.remove("slide-in-right");
  popupContainer.classList.add("slide-out-right");

  setTimeout(() => {
    overlay.classList.add("d-none");
    overlay.style.display = "none";

    // Hintergrund-Scrollen wieder aktivieren
    enableBodyScroll();

    const taskForm = document.getElementById("taskForm");
    if (taskForm && typeof clearForm === "function") {
      clearForm();
    }
  }, 400);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !overlay.classList.contains("d-none")) {
    closeAddTaskPopup();
  }
});