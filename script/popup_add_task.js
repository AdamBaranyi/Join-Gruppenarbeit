// const overlay = document.getElementById('addTaskOverlay');
// const popupContainer = document.getElementById('popupContainer');

// async function openAddTaskPopup() {
//     // Template nur laden, wenn noch leer
//     if (!popupContainer.innerHTML.trim()) {
//         try {
//             const res = await fetch('../assets/templates/task_popup.html');
//             let html = await res.text();
            
//             // Entferne den main-container und passe das HTML für das Popup an
//             html = html.replace('<main class="main-container">', '<div class="popup-main-container">');
//             html = html.replace('</main>', '</div>');
            
//             popupContainer.innerHTML = html;
            
//             // Warte kurz, bis das DOM aktualisiert ist
//             setTimeout(() => {
//                 initializePopupComponents();
//             }, 100);
            
//         } catch (err) {
//             console.error("Popup konnte nicht geladen werden:", err);
//             return;
//         }
//     }

//     overlay.classList.remove('d-none');
// }
// function initializePopupComponents() {
//     // Initialisiere alle benötigten Komponenten für das Popup
//     setTimeout(() => {
//         if (typeof initializePriorityButtons === 'function') {
//             initializePriorityButtons();
//         }
        
//         if (typeof initializeCategoryDropdown === 'function') {
//             initializeCategoryDropdown();
//         }
        
//         if (typeof initializeAssignedDropdown === 'function') {
//             initializeAssignedDropdown();
//         }
        
//         if (typeof initializeSubtasks === 'function') {
//             initializeSubtasks();
//         }
        
//         // Form-Submit Handling für das Popup
//         const taskForm = document.getElementById('taskForm');
//         if (taskForm) {
//             const newForm = taskForm.cloneNode(true);
//             taskForm.parentNode.replaceChild(newForm, taskForm);
            
//             newForm.addEventListener('submit', async function(e) {
//                 e.preventDefault();
//                 await handlePopupFormSubmit(e);
//             });
//         }
//     }, 100); // Kurze Verzögerung um DOM-Rendering abzuwarten
// }

// async function handlePopupFormSubmit(event) {
//     // Hier deine existierende Logik zum Erstellen einer Task
//     if (typeof createTask === 'function') {
//         const success = await createTask(event);
//         if (success) {
//             closeAddTaskPopup();
//             // Aktualisiere das Board
//             if (typeof updateBoard === 'function') {
//                 await updateBoard();
//             }
//         }
//     }
// }

// function closeAddTaskPopup() {
//     overlay.classList.add('d-none');
    
//     // Optional: Formular zurücksetzen beim Schließen
//     const taskForm = document.getElementById('taskForm');
//     if (taskForm && typeof clearForm === 'function') {
//         clearForm();
//     }
// }

// // Close popup with Escape key
// document.addEventListener('keydown', function(e) {
//     if (e.key === 'Escape' && !overlay.classList.contains('d-none')) {
//         closeAddTaskPopup();
//     }
// });