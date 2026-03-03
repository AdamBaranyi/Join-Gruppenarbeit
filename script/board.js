const BASE_URL =
  "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/";

let currentTaskId = null;
let currentTaskData = null;
let currentDraggedElement;
let allLoadedTasks = {};

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

async function loadTasks() {
  try {
    const response = await fetch(BASE_URL + "tasks.json");
    const tasks = await response.json();

    allLoadedTasks = tasks || {};
    renderTasks(allLoadedTasks);
  } catch (error) {
    console.error("Fehler beim Laden:", error);
  }
}

function renderTasks(tasks) {
  const columns = {
    todo: document.getElementById("todo"),
    inProgress: document.getElementById("inProgress"),
    awaitingFeedback: document.getElementById("awaitingFeedback"),
    done: document.getElementById("done"),
  };

  Object.values(columns).forEach((col) => {
    if (col) col.innerHTML = "";
  });

  for (let id in tasks) {
    const task = tasks[id];
    const column = columns[task.status];

    if (!column) continue;

    column.innerHTML += generateTaskHTML(task, id);
  }

  if (columns.todo && columns.todo.innerHTML === "") columns.todo.innerHTML = '<div class="no-tasks">No tasks To do</div>';
  if (columns.inProgress && columns.inProgress.innerHTML === "") columns.inProgress.innerHTML = '<div class="no-tasks">No tasks in progress</div>';
  if (columns.awaitingFeedback && columns.awaitingFeedback.innerHTML === "") columns.awaitingFeedback.innerHTML = '<div class="no-tasks">No tasks awaiting feedback</div>';
  if (columns.done && columns.done.innerHTML === "") columns.done.innerHTML = '<div class="no-tasks">No tasks done</div>';
}


/**
 * Sets the ID of the task that is currently being dragged.
 * @param {string} id - The unique identifier of the dragged task.
 */
function startDragging(id) {
    currentDraggedElement = id;
}

/**
 * Prevents the default browser action to allow dropping an element into a container.
 * @param {DragEvent} ev - The drag event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Moves the currently dragged task to a new status category and updates the backend.
 * Reloads the tasks after successful update to reflect the change visually.
 * @param {string} newStatus - The new status to assign to the task (e.g., 'todo', 'inProgress').
 */
async function moveTo(newStatus) {
    try {
        await fetch(BASE_URL + `tasks/${currentDraggedElement}/status.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newStatus)
        });
        
        loadTasks();
    } catch (error) {
        console.error("Fehler beim Verschieben des Tasks:", error);
    }
}

/**
 * Filters the displayed tasks based on the search input.
 * Matches the input against task titles and descriptions.
 * Re-renders the board with the filtered tasks.
 */
function filterTasks() {
    let searchInput = document.getElementById('searchTaskInput').value.toLowerCase();
    
    let filteredTasks = {};
    
    for (let id in allLoadedTasks) {
        let task = allLoadedTasks[id];
        let titleMatch = task.title && task.title.toLowerCase().includes(searchInput);
        let descMatch = task.description && task.description.toLowerCase().includes(searchInput);
        
        if (titleMatch || descMatch) {
            filteredTasks[id] = task;
        }
    }
    
    renderTasks(filteredTasks);
}

/**
 * Opens the task details pop-up modal and populates it with the selected task's data.
 * @param {string} id - The unique identifier of the task to display.
 */
function openTaskPopup(id) {
    currentTaskId = id;
    let task = allLoadedTasks[id];
    
    if (task) {
        document.getElementById('taskModal').classList.remove('d-none');
        document.getElementById('taskModalView').classList.remove('d-none');
        document.getElementById('taskModalEdit').classList.add('d-none');
        
        document.getElementById('modalTitle').innerHTML = task.title || "";
        document.getElementById('modalDescription').innerHTML = task.description || "";
        document.getElementById('modalDate').innerHTML = task.dueDate || "";
        
        let priorityIconStr = getPriorityIcon(task.priority);
        document.getElementById('modalPriority').innerHTML = `
            ${task.priority || ""} <img src="${priorityIconStr}" alt="${task.priority}">
        `;
        
        let modalCategory = document.getElementById('modalCategory');
        modalCategory.innerHTML = task.category || "";
        modalCategory.className = `task-category ${getCategoryClass(task.category)}`; 
        
        renderModalAssignees(task.assignedTo);
        renderModalSubtasks(task.subtasks);
    }
}

/**
 * Renders the assignee badges within the task modal.
 * @param {string[]} assignedTo - An array of assignee names.
 */
function renderModalAssignees(assignedTo) {
    let container = document.getElementById('modalAssignees');
    container.innerHTML = "";
    
    if (!assignedTo || assignedTo.length === 0) return;
    
    const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
    
    assignedTo.forEach((name, index) => {
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
        const colorClass = colors[index % colors.length];
        
        container.innerHTML += `
            <div class="assignee-row">
                <div class="assignee-badge ${colorClass}">${initials}</div>
                <span class="assignee-name">${name}</span>
            </div>
        `;
    });
}

/**
 * Renders the subtasks list within the task modal.
 * @param {Object[]} subtasks - An array of subtask objects.
 */
function renderModalSubtasks(subtasks) {
    let container = document.getElementById('modalSubtasks');
    container.innerHTML = "";
    
    if (!subtasks || subtasks.length === 0) {
        container.innerHTML = "<span>No subtasks</span>";
        return;
    }
    
    subtasks.forEach((st, index) => {
        let iconPath = st.completed 
            ? "../assets/imgs/Property 1=checked.svg" 
            : "../assets/imgs/Property 1=Default.svg";
            
        container.innerHTML += `
            <div class="subtask-row" onclick="toggleSubtask(${index})">
                <img src="${iconPath}" class="subtask-icon">
                <span class="subtask-text" style="font-size: 16px;">${st.title || st.name || "Subtask"}</span>
            </div>
        `;
    });
}

/**
 * Toggles the completion state of a subtask, updates Firebase, and re-renders the UI.
 * @param {number} subtaskIndex - The index of the subtask in the array.
 */
async function toggleSubtask(subtaskIndex) {
    if (!currentTaskId) return;
    
    let task = allLoadedTasks[currentTaskId];
    if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;
    
    // Toggle the state locally
    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    
    // Re-render the modal list immediately for snappy UI
    renderModalSubtasks(task.subtasks);
    
    // Re-render the board tasks to update the progress bar behind the modal
    renderTasks(allLoadedTasks);
    
    // Update the subtasks array in Firebase
    try {
        await fetch(BASE_URL + `tasks/${currentTaskId}/subtasks.json`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task.subtasks)
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Subtasks:", error);
    }
}

/**
 * Closes the task details pop-up modal with an animation.
 */
function closeTaskPopup() {
    let modalOverlay = document.getElementById('taskModal');
    let modalContent = modalOverlay.querySelector('.task-modal-content');
    
    // Add animation classes
    modalOverlay.classList.add('fade-out');
    modalContent.classList.add('slide-out');
    
    // Wait for the animation to finish (200ms) before hiding and cleaning up
    setTimeout(() => {
        modalOverlay.classList.add('d-none');
        modalOverlay.classList.remove('fade-out');
        modalContent.classList.remove('slide-out');
        currentTaskId = null;
    }, 200);
}

/**
 * Deletes the currently opened task.
 */
async function deleteTask() {
    if (!currentTaskId) return;

    try {
        await fetch(BASE_URL + `tasks/${currentTaskId}.json`, {
            method: "DELETE"
        });
        
        // Remove from local cache
        delete allLoadedTasks[currentTaskId];
        
        // Close modal and refresh board
        closeTaskPopup();
        loadTasks(); // Ensuring we have latest from DB as well
        
    } catch (error) {
        console.error("Error deleting task:", error);
        alert("There was an error deleting the task.");
    }
}

/**
 * Triggers the edit mode for the currently opened task.
 */
function editTask() {
    if (!currentTaskId) return;
    
    let task = allLoadedTasks[currentTaskId];
    if (!task) return;
    
    // Copy subtasks and assignees to local edit arrays
    editSelectedContacts = [...(task.assignedTo || [])];
    editCurrentSubtasks = [...(task.subtasks || [])];
    
    let viewContainer = document.getElementById('taskModalView');
    let editContainer = document.getElementById('taskModalEdit');
    
    editContainer.innerHTML = generateEditFormHTML(task);
    
    // Populate the form fields dynamically
    renderEditAssignees();
    renderEditAssigneesDropdown();
    renderEditSubtasks();
    
    viewContainer.classList.add('d-none');
    editContainer.classList.remove('d-none');
}

// Global state for the edit form
let editSelectedContacts = [];
let editCurrentSubtasks = [];



/**
 * Helper to update Assignees list UI in Edit Mode.
 */
function renderEditAssignees() {
    let container = document.getElementById('editModalAssignees');
    if (!container) return;
    container.innerHTML = '';
    const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
    editSelectedContacts.forEach((name, index) => {
        const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
        const colorClass = colors[index % colors.length];
        container.innerHTML += `<div class="user-circle ${colorClass}">${initials}</div>`;
    });
}

/**
 * Prepares the mock contacts dropdown. (Reuse from add_task if needed)
 */
function getMockContactsList() {
    return [
        "Sofiia Müller (You)",
        "Anton Mayer",
        "Anja Schulz",
        "Benedikt Ziegler",
        "David Eisenberg",
    ];
}

function toggleEditAssignedDropdown() {
    let dropdown = document.getElementById('editAssignedDropdown');
    dropdown.classList.toggle('open');
}

function renderEditAssigneesDropdown() {
    let list = document.getElementById('editDropdownList');
    if (!list) return;
    list.innerHTML = '';
    const colors = ["bg-orange", "bg-teal", "bg-purple", "bg-blue"];
    const contacts = getMockContactsList();
    
    contacts.forEach((name, index) => {
        const initials = name.replace(" (You)", "").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        const colorClass = colors[index % colors.length];
        const isChecked = editSelectedContacts.includes(name) ? "checked" : "";
        
        list.innerHTML += `
            <div class="contact-item">
                <div class="contact-left">
                  <div class="contact-circle ${colorClass}">${initials}</div>
                  <span>${name}</span>
                </div>
                <input type="checkbox" value="${name}" ${isChecked} onchange="toggleEditContact('${name}', this.checked)">
            </div>
        `;
    });
}

function toggleEditContact(name, isChecked) {
    if (isChecked && !editSelectedContacts.includes(name)) {
        editSelectedContacts.push(name);
    } else if (!isChecked) {
        editSelectedContacts = editSelectedContacts.filter(c => c !== name);
    }
    renderEditAssignees();
}

/**
 * Subtasks management in Edit Form.
 */
function renderEditSubtasks() {
    let list = document.getElementById('editModalSubtasks');
    if (!list) return;
    list.innerHTML = '';
    
    editCurrentSubtasks.forEach((sub, index) => {
        list.innerHTML += `
            <li>
                <div class="subtask-text">${sub.title}</div>
                <div class="subtask-actions">
                    <img src="../assets/imgs/edit.svg" alt="Edit" onclick="editModalSubtask(${index})">
                    <div class="divider"></div>
                    <img src="../assets/imgs/delete.svg" alt="Delete" onclick="deleteEditSubtask(${index})">
                </div>
            </li>
        `;
    });
}

function clearEditSubtaskInput() {
    let input = document.getElementById('editSubtaskInput');
    input.value = '';
    handleEditSubtaskInput();
}

function focusEditSubtaskInput() {
    document.getElementById('editSubtaskInput').focus();
}

function handleEditSubtaskInput() {
    let val = document.getElementById('editSubtaskInput').value;
    let wrapper = document.getElementById('editSubtaskInputWrapper');
    if (val.length > 0) {
        wrapper.classList.add('typing');
    } else {
        wrapper.classList.remove('typing');
    }
}

function addEditSubtask() {
    let input = document.getElementById('editSubtaskInput');
    let title = input.value.trim();
    if (title) {
        editCurrentSubtasks.push({ title: title, completed: false });
        clearEditSubtaskInput();
        renderEditSubtasks();
    }
}

function handleEditSubtaskKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addEditSubtask();
    }
}

function deleteEditSubtask(index) {
    editCurrentSubtasks.splice(index, 1);
    renderEditSubtasks();
}

function editModalSubtask(index) {
    let input = document.getElementById('editSubtaskInput');
    input.value = editCurrentSubtasks[index].title;
    input.focus();
    deleteEditSubtask(index);
}

/**
 * Helper to handle priority button clicks in the edit form.
 */
function setEditPriority(priority, btnElement) {
    document.getElementById('editTaskPriority').value = priority;
    
    // Remove active class from all buttons in the edit form
    let buttons = btnElement.parentElement.querySelectorAll('.trigger');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    btnElement.classList.add('active');
}

/**
 * Saves the edited task back to Firebase and refreshes the UI.
 */
async function saveTask() {
    if (!currentTaskId) return;

    // 1. Gather data from inputs
    let title = document.getElementById('editTaskTitle').value.trim();
    let description = document.getElementById('editTaskDescription').value.trim();
    let dueDate = document.getElementById('editTaskDueDate').value;
    let priority = document.getElementById('editTaskPriority').value;

    if (!title || !dueDate) {
        alert("Title and Due Date are required.");
        return;
    }

    // 2. Prepare payload
    let updatedData = {
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        assignedTo: editSelectedContacts,
        subtasks: editCurrentSubtasks
    };

    // 3. Send to Firebase
    try {
        await fetch(BASE_URL + `tasks/${currentTaskId}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        // 4. Update local cache
        Object.assign(allLoadedTasks[currentTaskId], updatedData);

        // 5. Update UI
        loadTasks(); // refreshes the columns
        
        // 6. Return back to View mode within the opened modal
        openTaskPopup(currentTaskId); // Re-initializes view mode with new data

    } catch (error) {
        console.error("Error saving task:", error);
        alert("Could not save task.");
    }
}

