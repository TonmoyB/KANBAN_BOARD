document.addEventListener("DOMContentLoaded", () => {
    const addColumnBtn = document.getElementById("addColumnBtn");
    const modal = document.getElementById("modal");
    const overlay = document.getElementById("overlay");
    const closeModal = document.getElementById("closeModal");
    const addColumnSubmit = document.getElementById("addColumnSubmit");
    const columnTitleInput = document.getElementById("columnTitle");
    const taskColumns = document.getElementById("taskColumns");

    let draggedColumn = null;

    // Helper: Close modals and overlay
    const closeModalAndOverlay = () => {
        modal.classList.add("hidden");
        overlay.style.display = "none";
    };

    // Helper: Create a new column
    function createColumn(title = "New Column") {
        const columnDiv = document.createElement("div");
        columnDiv.className = "taskColumn";
        columnDiv.draggable = true;
        columnDiv.innerHTML = `
            <p contenteditable="true" class="editableTitle">${title}</p>
            <button class="deleteBtn"><i class="fas fa-times" style="color: black;"></i></button>
            <div class="cardsContainer"></div>
            <button class="addCardBtn"> Add Card </button>
        `;

        columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
            const confirmDeletion = confirm("Sure to Delete???");
            if (confirmDeletion) {
                columnDiv.remove();
                saveColumnsToLocalStorage();
            }
        });

        const titleElement = columnDiv.querySelector(".editableTitle");
        titleElement.addEventListener("blur", () => {
            if (!titleElement.innerText.trim()) {
                alert("Column title cannot be empty!");
                titleElement.innerText = "!!!!!";
            }
            saveColumnsToLocalStorage();
        });

        const addCardBtn = columnDiv.querySelector(".addCardBtn");
        addCardBtn.addEventListener("click", () => {
            const cardTitle = prompt("Enter card title:");
            if (cardTitle && cardTitle.trim()) {
                const cardDetails = prompt("Enter card details:");
                if (cardDetails && cardDetails.trim()) {
                    const cardObj = { cardTitle, cardDetails };
                    const cardDiv = document.createElement("div");
                    cardDiv.className = "card";
                    cardDiv.textContent = cardTitle.trim();
                    columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);
                    saveCardToLocalStorage(cardObj, title);
                }
            }
        });

        addColumnDragAndDropListeners(columnDiv);
        taskColumns.appendChild(columnDiv);
        saveColumnsToLocalStorage();
    }

    function saveColumnsToLocalStorage() {
        const columns = [...taskColumns.querySelectorAll(".taskColumn")].map(column => ({
            title: column.querySelector(".editableTitle").innerText.trim()
        }));

        localStorage.setItem("columns", JSON.stringify(columns));
    }

    function saveCardToLocalStorage(card, columnTitle) {
        const cards = JSON.parse(localStorage.getItem("cards")) || [];
        const columnCards = cards.find(col => col.title === columnTitle);
        if (columnCards) {
            columnCards.cards.push(card);
        } else {
            cards.push({ title: columnTitle, cards: [card] });
        }
        localStorage.setItem("cards", JSON.stringify(cards));
    }

    function loadColumnsFromLocalStorage() {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        storedColumns.forEach(column => {
            createColumn(column.title);
        });
        loadCardsFromLocalStorage();  // Load cards after columns are created
    }

    function loadCardsFromLocalStorage() {
        const storedCards = JSON.parse(localStorage.getItem("cards")) || [];

        // For each stored card, find the corresponding column and append the card
        storedCards.forEach(column => {
            const columnDiv = [...taskColumns.querySelectorAll(".taskColumn")].find(col => col.querySelector(".editableTitle").innerText.trim() === column.title);
            if (columnDiv) {
                column.cards.forEach(card => {
                    const cardDiv = document.createElement("div");
                    cardDiv.className = "card";
                    cardDiv.textContent = card.cardTitle;  // Display card title
                    columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);
                });
            }
        });
    }

    // Load columns and cards when the DOM content is loaded
    loadColumnsFromLocalStorage();

    addColumnBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        overlay.style.display = "block";
        columnTitleInput.value = "";
    });

    closeModal.addEventListener("click", closeModalAndOverlay);
    overlay.addEventListener("click", closeModalAndOverlay);

    // Add a new column
    addColumnSubmit.addEventListener("click", () => {
        const title = columnTitleInput.value.trim();
        if (!title) {
            alert("Title is required!");
            columnTitleInput.focus();
            return;
        }
        createColumn(title);
        closeModalAndOverlay();
    });

    function addColumnDragAndDropListeners(column) {
        column.addEventListener("dragstart", () => {
            draggedColumn = column;
            column.classList.add("dragging");
            [...taskColumns.querySelectorAll(".taskColumn")].forEach(col => col.classList.remove("dragging"));
        });

        column.addEventListener("dragend", () => {
            draggedColumn = null;
            column.classList.remove("dragging");
            saveColumnsToLocalStorage();
        });

        taskColumns.addEventListener("dragover", (e) => {
            e.preventDefault();
            const afterElement = getColumnDragAfterElement(taskColumns, e.clientX);
            if (afterElement == null) {
                taskColumns.appendChild(draggedColumn);
            } else {
                taskColumns.insertBefore(draggedColumn, afterElement);
            }
        });
    }

    function getColumnDragAfterElement(container, xPosition) {
        const draggableElements = [...container.querySelectorAll(".taskColumn:not(.dragging)")];
        return draggableElements.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = xPosition - (box.left + box.width / 2);
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
