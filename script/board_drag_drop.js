/**
 * Drag and Drop functionality for the board.
 */

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
 * Adds visual highlight to the column when dragging over it.
 * @param {DragEvent} ev - The drag event.
 */
function highlightColumn(ev) {
  ev.preventDefault();
  let column = ev.currentTarget;

  if (!column.classList.contains('board-column')) {
    column = column.closest('.board-column');
  }

  if (column) {
    removeAllHighlights();
    column.classList.add('drag-over');
  }
}

/**
 * Removes visual highlight from the column when dragging leaves it.
 * @param {DragEvent} ev - The drag event.
 */
function removeHighlight(ev) {
  const relatedTarget = ev.relatedTarget;
  const currentTarget = ev.currentTarget;

  if (relatedTarget && currentTarget.contains(relatedTarget)) {
    return;
  }

  let column = currentTarget;

  if (!column.classList.contains('board-column')) {
    column = column.closest('.board-column');
  }

  if (column) {
    column.classList.remove('drag-over');
  }
}

/**
 * Removes all highlights from all columns.
 */
function removeAllHighlights() {
  const allColumns = document.querySelectorAll('.board-column');
  allColumns.forEach(col => col.classList.remove('drag-over'));
}

/**
 * Moves the currently dragged task to a new status category and updates the backend.
 * @param {string} newStatus - The new status to assign to the task.
 */
async function moveTo(newStatus) {
  removeAllHighlights();

  try {
    await fetch(BASE_URL + `/tasks/${currentDraggedElement}/status.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStatus),
    });

    loadTasks();
  } catch (error) {
    console.error("Fehler beim Verschieben des Tasks:", error);
  }
}
