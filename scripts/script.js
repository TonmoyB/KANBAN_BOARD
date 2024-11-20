// const addColumnBtn = document.getElementById("addColumnBtn");
// const modal = document.getElementById("modal");
// const overlay = document.getElementById("overlay");
// const closeModal = document.getElementById("closeModal");
// const addColumnSubmit = document.getElementById("addColumnSubmit");
// const columnTitleInput = document.getElementById("columnTitle");
// const taskColumns = document.getElementById("taskColumns");

// const addCardModal = document.getElementById("addCardModal");
// const closeCardModal = document.getElementById("closeCardModal");
// const addCardSubmit = document.getElementById("addCardSubmit");
// const cardTitleInput = document.getElementById("cardTitle");
// const cardDetailsInput = document.getElementById("cardDetails");

// let draggedColumn = null;
// let draggedCard = null;
// let currentColumn = null;

// const closeModalAndOverlay = () => {
//     modal.classList.add("hidden");
//     overlay.style.display = "none";
// };

// addColumnBtn.addEventListener("click", () => {
//     modal.classList.remove("hidden");
//     overlay.style.display = "block";
//     columnTitleInput.value = "";
// });

// closeModal.addEventListener("click", closeModalAndOverlay);
// overlay.addEventListener("click", closeModalAndOverlay);

// addColumnSubmit.addEventListener("click", () => {
//     const title = columnTitleInput.value.trim();

//     if (!title) {
//         columnTitleInput.focus();
//         alert("Title is required!");
//         return;
//     }

//     const columnDiv = document.createElement("div");
//     columnDiv.className = "taskColumn";
//     columnDiv.draggable = true;
//     columnDiv.innerHTML = `
//         <b><p>${title}</p></b>
//         <button class="deleteBtn">
//             <i class="fas fa-times" style="color: black;"></i>
//         </button>
//         <button class="addCardBtn">+ Add Card</button>
//         <div class="cardsContainer"></div>
//     `;

//     columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
//         columnDiv.remove();
//     });

//     columnDiv.querySelector(".addCardBtn").addEventListener("click", () => {
//         currentColumn = columnDiv;
//         addCardModal.classList.remove("hidden");
//         overlay.style.display = "block";
//     });

//     addDragAndDropListeners(columnDiv);
//     taskColumns.appendChild(columnDiv);
//     closeModalAndOverlay();
// });

// // Drag-and-Drop for Columns
// function addDragAndDropListeners(column) {
//     column.addEventListener("dragstart", () => {
//         draggedColumn = column;
//         column.classList.add("dragging");
//     });

//     column.addEventListener("dragend", () => {
//         draggedColumn = null;
//         column.classList.remove("dragging");
//     });

//     taskColumns.addEventListener("dragover", (e) => {
//         e.preventDefault();
//         const afterElement = getDragAfterElement(taskColumns, e.clientX);
//         if (afterElement == null) {
//             taskColumns.appendChild(draggedColumn); // Append at the end
//         } else {
//             taskColumns.insertBefore(draggedColumn, afterElement); // Insert before the element at the current position
//         }
//     });
// }

// // Determine the position to place the dragged element
// function getDragAfterElement(container, x) {
//     const draggableElements = [
//         ...container.querySelectorAll(".taskColumn:not(.dragging)"), // Only get non-dragging columns
//     ];

//     return draggableElements.reduce(
//         (closest, child) => {
//             const box = child.getBoundingClientRect();
//             const offset = x - box.left - box.width / 2; // Calculate horizontal offset
//             if (offset < 0 && offset > closest.offset) {
//                 return { offset, element: child }; // Return closest column to where the drag is happening
//             } else {
//                 return closest;
//             }
//         },
//         { offset: Number.NEGATIVE_INFINITY }
//     ).element;
// }
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

// Close modals and overlay
const closeModalAndOverlay = () => {
    modal.classList.add("hidden");
    overlay.style.display = "none";
};

// Show column modal
addColumnBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    overlay.style.display = "block";
    columnTitleInput.value = "";
});

// Close modal events
closeModal.addEventListener("click", closeModalAndOverlay);
overlay.addEventListener("click", closeModalAndOverlay);

// Add new column
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
        <b><p>${title}</p></b>
        <button class="deleteBtn">
            <i class="fas fa-times" style="color: black;"></i>
        </button>
        <button class="addCardBtn">+ Add Card</button>
        <div class="cardsContainer"></div>
    `;

    columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
        columnDiv.remove();
        saveColumnsToLocalStorage();
    });

    columnDiv.querySelector(".addCardBtn").addEventListener("click", () => {
        currentColumn = columnDiv;
        addCardModal.classList.remove("hidden");
        overlay.style.display = "block";
    });

    addDragAndDropListeners(columnDiv);
    taskColumns.appendChild(columnDiv);
    saveColumnsToLocalStorage();
    closeModalAndOverlay();
});

// Add new card
addCardSubmit.addEventListener("click", () => {
    const cardTitle = cardTitleInput.value.trim();
    const cardDetails = cardDetailsInput.value.trim();

    if (!cardTitle || !cardDetails) {
        alert("Both title and details are required!");
        return;
    }

    if (!currentColumn) {
        alert("Please select a column first!");
        return;
    }

    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.draggable = true;
    cardDiv.innerHTML = `
        <h5>${cardTitle}</h5>
        <p>${cardDetails}</p>
    `;

    addCardDragAndDropListeners(cardDiv);
    currentColumn.querySelector(".cardsContainer").appendChild(cardDiv);

    cardTitleInput.value = "";
    cardDetailsInput.value = "";
    addCardModal.classList.add("hidden");
    overlay.style.display = "none";

    saveColumnsToLocalStorage();
});

// Close card modal
closeCardModal.addEventListener("click", () => {
    addCardModal.classList.add("hidden");
    overlay.style.display = "none";
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
        saveColumnsToLocalStorage(); // Save the new order to localStorage
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

// Drag-and-Drop for Cards
function addCardDragAndDropListeners(card) {
    card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
        draggedCard = null;
        card.classList.remove("dragging");
        saveColumnsToLocalStorage(); // Save the new order to localStorage
    });

    const cardsContainer = card.parentElement;
    cardsContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(cardsContainer, e.clientY);
        if (afterElement == null) {
            cardsContainer.appendChild(draggedCard);
        } else {
            cardsContainer.insertBefore(draggedCard, afterElement);
        }
    });
}

// Determine the position to place the dragged element
function getDragAfterElement(container, position) {
    const draggableElements = [
        ...container.querySelectorAll(".card:not(.dragging), .taskColumn:not(.dragging)"),
    ];

    return draggableElements.reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = position - (box.top + box.height / 2);
            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
}

// Save columns and cards to localStorage
function saveColumnsToLocalStorage() {
    const columns = [...taskColumns.querySelectorAll(".taskColumn")].map((column) => {
        return {
            title: column.querySelector("p").innerText,
            cards: [...column.querySelectorAll(".card")].map((card) => ({
                title: card.querySelector("h5").innerText,
                details: card.querySelector("p").innerText,
            })),
        };
    });
    localStorage.setItem("columns", JSON.stringify(columns));
}

// Load columns and cards from localStorage
function loadColumnsFromLocalStorage() {
    const columns = JSON.parse(localStorage.getItem("columns")) || [];
    columns.forEach((columnData) => {
        const columnDiv = document.createElement("div");
        columnDiv.className = "taskColumn";
        columnDiv.draggable = true;
        columnDiv.innerHTML = `
            <b><p>${columnData.title}</p></b>
            <button class="deleteBtn">
                <i class="fas fa-times" style="color: black;"></i>
            </button>
            <button class="addCardBtn">+ Add Card</button>
            <div class="cardsContainer"></div>
        `;

        columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
            columnDiv.remove();
            saveColumnsToLocalStorage();
        });

        columnDiv.querySelector(".addCardBtn").addEventListener("click", () => {
            currentColumn = columnDiv;
            addCardModal.classList.remove("hidden");
            overlay.style.display = "block";
        });

        const cardsContainer = columnDiv.querySelector(".cardsContainer");
        columnData.cards.forEach((card) => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "card";
            cardDiv.draggable = true;
            cardDiv.innerHTML = `
                <h5>${card.title}</h5>
                <p>${card.details}</p>
            `;
            addCardDragAndDropListeners(cardDiv);
            cardsContainer.appendChild(cardDiv);
        });

        addDragAndDropListeners(columnDiv);
        taskColumns.appendChild(columnDiv);
    });
}

// Load columns on page load
document.addEventListener("DOMContentLoaded", loadColumnsFromLocalStorage);
