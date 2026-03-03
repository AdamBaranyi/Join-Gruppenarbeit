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
 * @returns {string[]} List of mock contact names.
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

/**
 * Toggles the visibility of the assigned contacts dropdown in the edit form.
 */
function toggleEditAssignedDropdown() {
    let dropdown = document.getElementById('editAssignedDropdown');
    dropdown.classList.toggle('open');
}

/**
 * Renders the list of contacts in the dropdown for the edit form.
 */
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

/**
 * Toggles a contact's selection state and re-renders the assignee list.
 * @param {string} name - The name of the contact.
 * @param {boolean} isChecked - Whether the contact was selected or deselected.
 */
function toggleEditContact(name, isChecked) {
    if (isChecked && !editSelectedContacts.includes(name)) {
        editSelectedContacts.push(name);
    } else if (!isChecked) {
        editSelectedContacts = editSelectedContacts.filter(c => c !== name);
    }
    renderEditAssignees();
}

/**
 * Subtasks management in Edit Form. Renders the list of current subtasks.
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

/**
 * Clears the input field for adding new subtasks in the edit form.
 */
function clearEditSubtaskInput() {
    let input = document.getElementById('editSubtaskInput');
    input.value = '';
    handleEditSubtaskInput();
}

/**
 * Focuses the subtask input field in the edit form.
 */
function focusEditSubtaskInput() {
    document.getElementById('editSubtaskInput').focus();
}

/**
 * Handles input events on the subtask input field to toggle UI elements like the clear and add buttons.
 */
function handleEditSubtaskInput() {
    let val = document.getElementById('editSubtaskInput').value;
    let wrapper = document.getElementById('editSubtaskInputWrapper');
    if (val.length > 0) {
        wrapper.classList.add('typing');
    } else {
        wrapper.classList.remove('typing');
    }
}

/**
 * Adds a new subtask to the current task being edited.
 */
function addEditSubtask() {
    let input = document.getElementById('editSubtaskInput');
    let title = input.value.trim();
    if (title) {
        editCurrentSubtasks.push({ title: title, completed: false });
        clearEditSubtaskInput();
        renderEditSubtasks();
    }
}

/**
 * Handles keypress events for the subtask input, allowing users to press Enter to add a subtask.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleEditSubtaskKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addEditSubtask();
    }
}

/**
 * Deletes a subtask from the current task being edited.
 * @param {number} index - The index of the subtask in the array.
 */
function deleteEditSubtask(index) {
    editCurrentSubtasks.splice(index, 1);
    renderEditSubtasks();
}

/**
 * Prepares a subtask for editing by moving its text into the input field and removing it from the list.
 * @param {number} index - The index of the subtask in the array.
 */
function editModalSubtask(index) {
    let input = document.getElementById('editSubtaskInput');
    input.value = editCurrentSubtasks[index].title;
    input.focus();
    deleteEditSubtask(index);
}

/**
 * Helper to handle priority button clicks in the edit form.
 * @param {string} priority - The selected priority level (Urgent, Medium, Low).
 * @param {HTMLElement} btnElement - The HTML element of the button that was clicked.
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

