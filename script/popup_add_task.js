const overlay = document.getElementById("addTaskOverlay");
const popupContainer = document.getElementById("popupContainer");

/**
 * Opens "Add Task" popup with slide-in animation, shows overlay,
 * and initializes its components.
 */
async function openAddTaskPopup() {
  try {
    const html = getTaskPopupTemplate();
    const cleanHtml = html;

    const closeButton = `<button class="popup-close-btn" onclick="closeAddTaskPopup()">
            <img src="../assets/imgs/close.png" alt="Close">
        </button>`;

    popupContainer.innerHTML = closeButton + cleanHtml;

    popupContainer.classList.remove("slide-out-right");
    popupContainer.classList.add("slide-in-right");

    overlay.classList.remove("d-none");
    overlay.style.display = "flex";

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
