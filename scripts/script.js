const addColumnBtn = document.getElementById("addColumnBtn");
const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const closeModal = document.getElementById("closeModal");
const addColumnSubmit = document.getElementById("addColumnSubmit");
const columnTitleInput = document.getElementById("columnTitle");
const taskColumns = document.getElementById("taskColumns");

const addCardModal = document.getElementById("addCardModal");
const closeCardModal = document.getElementById("closeCardModal");
const addCardSubmit = document.getElementById("addCardSubmit");
const cardTitleInput = document.getElementById("cardTitle");
const cardDetailsInput = document.getElementById("cardDetails");

let draggedColumn = null;
let draggedCard = null;
let currentColumn = null;

const closeModalAndOverlay = () => {
    modal.classList.add("hidden");
    overlay.style.display = "none";
};

addColumnBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    overlay.style.display = "block";
    columnTitleInput.value = "";
});

closeModal.addEventListener("click", closeModalAndOverlay);
overlay.addEventListener("click", closeModalAndOverlay);

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
        <h4>${title}</h4>
        <button class="deleteBtn">
            <i class="fas fa-times" style="color: black;"></i>
        </button>
        <button class="addCardBtn">+ Add Card</button>
        <div class="cardsContainer"></div>
    `;

    columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
        columnDiv.remove();
    });

    columnDiv.querySelector(".addCardBtn").addEventListener("click", () => {
        currentColumn = columnDiv;
        addCardModal.classList.remove("hidden");
        overlay.style.display = "block";
    });

    addDragAndDropListeners(columnDiv);
    taskColumns.appendChild(columnDiv);
    closeModalAndOverlay();
});

// Drag-and-Drop for Columns
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
            taskColumns.appendChild(draggedColumn); // Append at the end
        } else {
            taskColumns.insertBefore(draggedColumn, afterElement); // Insert before the element at the current position
        }
    });
}

// Determine the position to place the dragged element
function getDragAfterElement(container, x) {
    const draggableElements = [
        ...container.querySelectorAll(".taskColumn:not(.dragging)"), // Only get non-dragging columns
    ];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2; // Calculate horizontal offset
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child }; // Return closest column to where the drag is happening
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}
