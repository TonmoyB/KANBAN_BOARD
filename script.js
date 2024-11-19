document.addEventListener("DOMContentLoaded", () => {
    const addColumnBtn = document.getElementById("addColumnBtn");
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const addColumnSubmit = document.getElementById("addColumnSubmit");
    const columnTitleInput = document.getElementById("columnTitle");
    const taskColumns = document.getElementById("taskColumns");

    let draggedColumn = null;

    // Show the modal when the "ADD STATUS" button is clicked
    addColumnBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        columnTitleInput.value = ""; // Reset input field
    });

    // Close the modal when the "Cancel" button is clicked
    closeModal.addEventListener("click", () => {
        modal.classList.add("hidden");
    });

    // Add new column and close the modal
    addColumnSubmit.addEventListener("click", () => {
        const title = columnTitleInput.value.trim();
        if (title) {
            const columnDiv = document.createElement("div");
            columnDiv.className = "taskColumn";
            columnDiv.draggable = true; // Enable drag-and-drop
            columnDiv.innerHTML = `
                <h4>${title}</h4>
                <button class="deleteBtn">Delete</button>
            `;

            // Add delete functionality
            columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
                columnDiv.remove();
            });

            // Add drag-and-drop event listeners
            addDragAndDropListeners(columnDiv);

            taskColumns.appendChild(columnDiv);
        }
        modal.classList.add("hidden");
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
});
