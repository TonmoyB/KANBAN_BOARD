const addColumnBtn = document.getElementById("addColumnBtn");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const closeModal = document.getElementById("closeModal");
const addColumnSubmit = document.getElementById("addColumnSubmit");
const columnTitleInput = document.getElementById("columnTitle");
const taskColumns = document.getElementById("taskColumns");

let draggedColumn = null;

// Show the modal and overlay when "ADD STATUS" is clicked
addColumnBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    overlay.style.display = "block";
    columnTitleInput.value = ""; // Reset input field
});

// Close modal and hide overlay
const closeModalAndOverlay = () => {
    modal.classList.add("hidden");
    overlay.style.display = "none";
};

closeModal.addEventListener("click", closeModalAndOverlay);
overlay.addEventListener("click", closeModalAndOverlay);

// Add new column and close the modal
addColumnSubmit.addEventListener("click", () => {
    const title = columnTitleInput.value.trim();

    if (!title) {
        columnTitleInput.focus();
        alert("Title is required!");
        return;
    }

    const columnDiv = document.createElement("div");
    columnDiv.className = "taskColumn";
    columnDiv.draggable = true;
    columnDiv.innerHTML = `
        <h2>${title}</h2>
        <button class="deleteBtn"> 
            <i class="fas fa-times" style="color: black;"></i> 
        </button>
    `;

    columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
        columnDiv.remove();
    });

    // Add drag-and-drop event listeners
    addDragAndDropListeners(columnDiv);

    taskColumns.appendChild(columnDiv);

    closeModalAndOverlay();
});

// Drag-and-Drop Handlers
function addDragAndDropListeners(column) {
    column.addEventListener("dragstart", () => {
        draggedColumn = column;
        column.classList.add("dragging");
    });

    column.addEventListener("dragend", () => {
        draggedColumn = null;
        column.classList.remove("dragging");
    });

    taskColumns.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskColumns, e.clientX);
        if (afterElement == null) {
            taskColumns.appendChild(draggedColumn);
        } else {
            taskColumns.insertBefore(draggedColumn, afterElement);
        }
    });
}

// Determine the position to place the dragged element
function getDragAfterElement(container, x) {
    const draggableElements = [
        ...container.querySelectorAll(".taskColumn:not(.dragging)"),
    ];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}
