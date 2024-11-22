document.addEventListener("DOMContentLoaded", () => {
    const addColumnBtn = document.getElementById("addColumnBtn");
    const modal = document.getElementById("modal");
    const overlay = document.getElementById("overlay");
    const closeModal = document.getElementById("closeModal");
    const addColumnSubmit = document.getElementById("addColumnSubmit");
    const columnTitleInput = document.getElementById("columnTitle");
    const taskColumns = document.getElementById("taskColumns");
    const cardEditModal = document.getElementById("cardEditModal");
    const editCardTitleInput = document.getElementById("editCardTitle");
    const editCardDetailsInput = document.getElementById("editCardDetails");
    const saveCardEditBtn = document.getElementById("saveCardEdit");
    const closeCardEditBtn = document.getElementById("closeCardEdit");

    let draggedColumn = null;
    let currentCard = null;
    let ColumnTitle = null;

    // Helper: Close modals and overlay
    const closeModalAndOverlay = () => {
        modal.classList.add("hidden");
        overlay.style.display = "none";
        cardEditModal.classList.add("hidden");
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

        // Delete Column Button Logic
        columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
            const confirmDeletion = confirm("Sure to Delete???");
            if (confirmDeletion) {
                deleteColumnFromLocalStorage(title);
                columnDiv.remove();
                updateColumnOrderInLocalStorage();
            }
        });

        // Column title update logic
        const titleElement = columnDiv.querySelector(".editableTitle");
        titleElement.addEventListener("blur", () => {
            const updatedTitle = titleElement.innerText.trim();
            if (!updatedTitle) {
                alert("Column title cannot be empty!");
                titleElement.innerText = title; // Revert to the original title
                return;
            }
            updateColumnTitleInLocalStorage(title, updatedTitle);
            title = updatedTitle; // Update title reference
        });

        // Add Card Button Logic
        const addCardBtn = columnDiv.querySelector(".addCardBtn");
        addCardBtn.addEventListener("click", () => {
            const cardTitle = prompt("Enter card title:");
            if (cardTitle && cardTitle.trim()) {
                const cardDetails = prompt("Enter card details:");
                if (cardDetails && cardDetails.trim()) {
                    const cardObj = { cardTitle, cardDetails };
                    const cardDiv = createCard(cardObj);

                    // Append card to the column
                    columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);

                    // Save card in local storage
                    saveCardToLocalStorage(cardObj, title);
                }
            }
        });

        // Add Drag and Drop functionality
        addColumnDragAndDropListeners(columnDiv);
        taskColumns.appendChild(columnDiv);

        // Save column to local storage
        saveColumnToLocalStorage(title);
        return columnDiv;
    }

    // Save a new column to local storage
    function saveColumnToLocalStorage(title) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        if (!storedColumns.some(column => column.title === title)) {
            storedColumns.push({ title, cards: [] });
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    // Save a card to a specific column in local storage
    function saveCardToLocalStorage(card, columnTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === columnTitle);
        if (column) {
            column.cards.push(card);
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    // Load columns and cards from local storage
    function loadColumnsFromLocalStorage() {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];

        storedColumns.forEach(column => {
            const columnDiv = createColumn(column.title);
            column.cards.forEach(card => {
                const cardDiv = createCard(card);
                columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);
            });
        });
    }

    // Add the event listener for saveCardEditBtn outside of createCard function
    saveCardEditBtn.addEventListener("click", () => {
        const newCardTitle = editCardTitleInput.value.trim();
        const newCardDetails = editCardDetailsInput.value.trim();

        if (!newCardTitle || !newCardDetails) {
            alert("Both title and details are required!");
            return;
        }

        // Find the column using ColumnTitle
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const columnDivIndex = storedColumns.findIndex(col => col.title === ColumnTitle);

        if (columnDivIndex !== -1) {
            // Find the card inside the column by matching the cardTitle
            const card = storedColumns[columnDivIndex].cards.find(card => card.cardTitle === currentCard.cardTitle);

            if (card) {
                // Update the card's title and details
                card.cardTitle = newCardTitle;
                card.cardDetails = newCardDetails;

                // Save the updated columns array to localStorage
                localStorage.setItem("columns", JSON.stringify(storedColumns));

                // Update the card in the DOM
                const cardDiv = [...taskColumns.querySelectorAll(".card")].find(card => card.querySelector("p").innerText === currentCard.cardTitle);
                if (cardDiv) {
                    cardDiv.querySelector("p").innerText = newCardTitle; // Update the card title in the DOM
                }
            }
        }
        closeModalAndOverlay(); // Close modal after saving
    });

    // Create card function
    function createCard(cardObj) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.innerHTML = `
        <button class="cardDeleteBtn"><i class="fas fa-times" style="color: black;"></i></button>
        <button class="cardEditBtn"><i class="fas fa-edit" style="color: black;"></i></button>
        <p>${cardObj.cardTitle}</p>
        `;

        // Delete card logic
        cardDiv.querySelector(".cardDeleteBtn").addEventListener("click", () => {
            const confirmDeletion = confirm("Are you sure you want to delete this card?");
            if (confirmDeletion) {
                const columnTitle = cardDiv.closest(".taskColumn").querySelector(".editableTitle").innerText.trim();
                deleteCardFromLocalStorage(cardObj, columnTitle);
                cardDiv.remove();
            }
        });

        const editBtn = cardDiv.querySelector(".cardEditBtn");
        editBtn.addEventListener("click", () => {
            currentCard = cardObj; // Set the current card as the card being edited
            ColumnTitle = cardDiv.closest(".taskColumn").querySelector(".editableTitle").innerText.trim();
            editCardTitleInput.value = cardObj.cardTitle;
            editCardDetailsInput.value = cardObj.cardDetails;
            cardEditModal.classList.remove("hidden"); // Show modal
            overlay.style.display = "block"; // Show overlay
        });

        return cardDiv;
    }

    // Delete a card from local storage
    function deleteCardFromLocalStorage(cardObj, columnTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === columnTitle);
        if (column) {
            column.cards = column.cards.filter(card => card.cardTitle !== cardObj.cardTitle);
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    // Update column title in local storage
    function updateColumnTitleInLocalStorage(oldTitle, newTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === oldTitle);
        if (column) {
            column.title = newTitle;
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    // Delete column from local storage
    function deleteColumnFromLocalStorage(title) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const updatedColumns = storedColumns.filter(col => col.title !== title);
        localStorage.setItem("columns", JSON.stringify(updatedColumns));
    }

    // Drag-and-Drop Listeners for Columns
    function addColumnDragAndDropListeners(column) {
        column.addEventListener("dragstart", () => {
            draggedColumn = column;
            column.classList.add("dragging");
        });

        column.addEventListener("dragend", () => {
            draggedColumn = null;
            column.classList.remove("dragging");
            updateColumnOrderInLocalStorage(); // Update order in local storage
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

    // Update column order in local storage
    function updateColumnOrderInLocalStorage() {
        const updatedColumns = [...taskColumns.querySelectorAll(".taskColumn")].map(column => {
            const title = column.querySelector(".editableTitle").innerText.trim();
            const cards = JSON.parse(localStorage.getItem("columns")).find(col => col.title === title).cards;
            return { title, cards };
        });
        localStorage.setItem("columns", JSON.stringify(updatedColumns));
    }

    // Helper: Get the column after the current dragged column
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

    // Load columns and cards on DOM ready
    loadColumnsFromLocalStorage();

    // Show modal when Add Column button is clicked
    addColumnBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        overlay.style.display = "block";
        columnTitleInput.value = "";
    });

    // Close modal
    closeModal.addEventListener("click", closeModalAndOverlay);
    overlay.addEventListener("click", closeModalAndOverlay);
    closeCardEditBtn.addEventListener("click", closeModalAndOverlay);

    // Add a new column when the submit button is clicked
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
});
