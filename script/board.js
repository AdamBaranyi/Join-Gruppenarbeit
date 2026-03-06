

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
    todo: document.getElementById("taskTodo"),
    inProgress: document.getElementById("taskInProgress"),
    awaitingFeedback: document.getElementById("taskAwaitingFeedback"),
    done: document.getElementById("taskDone")
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

