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

    let currentCardElement = null;
    let editColumnTitle = null;
    let prevColumnTitle = null;
    let quill = null;

    const closeModalAndOverlay = () => {
        modal.classList.add("hidden");
        overlay.style.display = "none";
        cardEditModal.classList.add("hidden");
    };

    function initializeQuill(content = '') {
        if (quill) {
            quill.root.innerHTML = content;
        } else {
            quill = new Quill(editCardDetailsInput, {
                theme: 'snow',
                placeholder: 'Edit the details of the card...',
            });
            quill.root.innerHTML = content;
        }
    }

    function createColumn(title = "New Column") {
        const columnDiv = document.createElement("div");
        columnDiv.className = "taskColumn";
        columnDiv.innerHTML = `
            <p contenteditable="true" class="editableTitle">${title}</p>
            <button class="deleteBtn"><i class="fas fa-times" style="color: black;"></i></button>
            <div class="cardsContainer"></div>
            <button class="addCardBtn"> Add Card </button>
        `;

        columnDiv.querySelector(".deleteBtn").addEventListener("click", () => {
            const confirmDeletion = confirm("Sure to Delete???");
            if (confirmDeletion) {
                deleteColumnFromLocalStorage(title);
                columnDiv.remove();
            }
        });

        const titleElement = columnDiv.querySelector(".editableTitle");
        titleElement.addEventListener("blur", () => {
            const updatedTitle = titleElement.innerText.trim();
            if (!updatedTitle) {
                alert("Column title cannot be empty!");
                titleElement.innerText = title;
                return;
            }
            updateColumnTitleInLocalStorage(title, updatedTitle);
            title = updatedTitle;
        });

        const addCardBtn = columnDiv.querySelector(".addCardBtn");
        addCardBtn.addEventListener("click", () => {
            const cardTitle = prompt("Enter card title:");
            if (cardTitle && cardTitle.trim()) {
                const cardDetails = prompt("Enter card details:");
                if (cardDetails && cardDetails.trim()) {
                    const cardObj = { cardTitle, cardDetails, assignedPerson: "NONE" };
                    const cardDiv = createCard(cardObj);

                    columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);
                    addCardDragAndDropListeners(cardDiv);
                    saveCardToLocalStorage(cardObj, title);
                }
            }
        });

        columnDiv.addEventListener("dragover", (e) => {
            e.preventDefault();

            const container = columnDiv.querySelector(".cardsContainer");
            const afterElement = getCardDragAfterElement(container, e.clientY);
            const draggingCard = document.querySelector(".dragging");

            if (afterElement == null) {
                container.appendChild(draggingCard);
            } else {
                container.insertBefore(draggingCard, afterElement);
            }
        });

        columnDiv.addEventListener("drop", (e) => {
            e.preventDefault();

            const container = columnDiv.querySelector(".cardsContainer");
            const draggingCard = document.querySelector(".dragging");

            const newColumnTitle = columnDiv.querySelector(".editableTitle").innerText.trim();


            const cardTitle = draggingCard.querySelector("p").innerText.trim();
            const cardDetails = draggingCard.getAttribute("data-details");
            const assignedPerson = draggingCard.getAttribute("data-assigned-person") || "";

            const cardObj = { cardTitle, cardDetails, assignedPerson };

            const afterElement = getCardDragAfterElement(container, e.clientY);
            if (afterElement == null) {
                container.appendChild(draggingCard);
            } else {
                container.insertBefore(draggingCard, afterElement);
            }

            if (prevColumnTitle && prevColumnTitle !== newColumnTitle) {
                console.log("Deleting card from previous column:", prevColumnTitle);
                deleteCardFromLocalStorage(cardObj, prevColumnTitle);
            }

            saveCardToLocalStorage(cardObj, newColumnTitle);
            draggingCard.setAttribute("data-details", cardDetails);
            draggingCard.setAttribute("data-assigned-person", assignedPerson);

            updateCardOrderInLocalStorage(newColumnTitle);
        });

        taskColumns.appendChild(columnDiv);
        saveColumnToLocalStorage(title);
        return columnDiv;
    }

    function deleteColumnFromLocalStorage(columnTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const updatedColumns = storedColumns.filter(col => col.title !== columnTitle);
        localStorage.setItem("columns", JSON.stringify(updatedColumns));
    }

    function updateColumnTitleInLocalStorage(oldTitle, newTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === oldTitle);
        if (column) {
            column.title = newTitle;
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    function saveColumnToLocalStorage(title) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        if (!storedColumns.some(column => column.title === title)) {
            storedColumns.push({ title, cards: [] });
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    function createCard(cardObj) {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.setAttribute("data-details", cardObj.cardDetails);
        cardDiv.setAttribute("data-assigned-person", cardObj.assignedPerson || "");

        cardDiv.innerHTML = `
            <button class="cardDeleteBtn"><i class="fas fa-times" style="color: black;"></i></button>
            <p>${cardObj.cardTitle}</p>
        `;

        cardDiv.querySelector(".cardDeleteBtn").addEventListener("click", (e) => {
            e.stopPropagation();
            const confirmDeletion = confirm("Are you sure you want to delete this card?");
            if (confirmDeletion) {
                const columnTitle = cardDiv.closest(".taskColumn").querySelector(".editableTitle").innerText.trim();
                deleteCardFromLocalStorage(cardObj, columnTitle);
                cardDiv.remove();
            }
        });

        cardDiv.addEventListener("click", () => {
            currentCardElement = cardObj;
            editColumnTitle = cardDiv.closest(".taskColumn").querySelector(".editableTitle").innerText.trim();
            editCardTitleInput.value = cardObj.cardTitle;
            initializeQuill(cardObj.cardDetails);
            cardEditModal.classList.remove("hidden");
            overlay.style.display = "block";

            const assignedPersonDisplay = document.getElementById("assignedPersonDisplay");
            const dropdown = document.getElementById("assignPersonDropdown");

            populateAssignPersonDropdown();
            dropdown.value = cardObj.assignedPerson || "";

            if (cardObj.assignedPerson && cardObj.assignedPerson !== "NONE") {
                assignedPersonDisplay.textContent = cardObj.assignedPerson;
                dropdown.style.display = "none";
            } else {
                assignedPersonDisplay.textContent = "Unassigned";
            }

            assignedPersonDisplay.style.display = "block";

            assignedPersonDisplay.addEventListener("click", () => {
                dropdown.style.display = "block";
            });

            dropdown.addEventListener("change", () => {
                const assignedPerson = dropdown.value.trim();
                assignedPersonDisplay.textContent = assignedPerson || "Unassigned";
                dropdown.style.display = "none";

                cardObj.assignedPerson = assignedPerson;
            });
        });

        return cardDiv;
    }

    function deleteCardFromLocalStorage(cardObj, columnTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === columnTitle);
        if (column) {
            column.cards = column.cards.filter(card => card.cardTitle !== cardObj.cardTitle);
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    function saveCardToLocalStorage(card, columnTitle) {
        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];

        const column = storedColumns.find(col => col.title === columnTitle);
        if (column) {
            const existingCardIndex = column.cards.findIndex(c => c.cardTitle === card.cardTitle);
            if (existingCardIndex !== -1) {
                column.cards[existingCardIndex] = card;
            } else {
                column.cards.push(card);
            }
        } else {
            storedColumns.push({
                title: columnTitle,
                cards: [card]
            });
        }
        localStorage.setItem("columns", JSON.stringify(storedColumns));
    }

    function updateCardOrderInLocalStorage(columnTitle) {
        const columnDiv = [...document.querySelectorAll(".taskColumn")].find(col =>
            col.querySelector(".editableTitle").innerText.trim() === columnTitle
        );

        if (!columnDiv) return;

        const cards = [...columnDiv.querySelectorAll(".card")].map(card => {
            const title = card.querySelector("p").innerText.trim();
            const details = card.getAttribute("data-details");
            return { cardTitle: title, cardDetails: details };
        });

        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        const column = storedColumns.find(col => col.title === columnTitle);
        if (column) {
            column.cards = cards;
            localStorage.setItem("columns", JSON.stringify(storedColumns));
        }
    }

    function getCardDragAfterElement(container, yPosition) {
        const draggableCards = [...container.querySelectorAll(".card:not(.dragging)")];
        return draggableCards.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = yPosition - (box.top + box.height / 2);
                if (offset < 0 && offset > closest.offset) {
                    return { offset, element: child };
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }

    function addCardDragAndDropListeners(card) {
        card.draggable = true;

        card.addEventListener("dragstart", () => {
            card.classList.add("dragging");

            const columnDiv = card.closest(".taskColumn");
            prevColumnTitle = columnDiv.querySelector(".editableTitle").innerText.trim();
        });

        card.addEventListener("dragend", () => {
            card.classList.remove("dragging");
        });
    }

    function loadColumnsFromLocalStorage() {
        taskColumns.innerHTML = "";

        const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
        storedColumns.forEach(column => {
            const columnDiv = createColumn(column.title);
            column.cards.forEach(card => {
                const cardDiv = createCard(card);
                columnDiv.querySelector(".cardsContainer").appendChild(cardDiv);
                addCardDragAndDropListeners(cardDiv);
            });
        });
    }

    addColumnBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        overlay.style.display = "block";
    });

    closeModal.addEventListener("click", closeModalAndOverlay);
    overlay.addEventListener("click", closeModalAndOverlay);

    addColumnSubmit.addEventListener("click", () => {
        const columnTitle = columnTitleInput.value.trim();
        if (columnTitle) {
            createColumn(columnTitle);
            columnTitleInput.value = "";
            closeModalAndOverlay();
        } else {
            alert("Column title cannot be empty!");
        }
    });

    saveCardEditBtn.addEventListener("click", () => {
        const updatedTitle = editCardTitleInput.value.trim();
        const updatedDetails = quill.root.innerHTML.trim();
        const dropdown = document.getElementById("assignPersonDropdown");
        const assignedPerson = dropdown.value.trim();

        if (assignedPerson) {
            const assignedPersonDisplay = document.getElementById("assignedPersonDisplay");
            assignedPersonDisplay.textContent = assignedPerson;
            dropdown.style.display = "none";
            assignedPersonDisplay.style.display = "block";
        }
        const textContent = updatedDetails.replace(/<[^>]*>/g, '').trim();

        if (!updatedTitle || !textContent) {
            alert("Both title and details are required!");
            return;
        }

        if (currentCardElement && editColumnTitle) {
            const storedColumns = JSON.parse(localStorage.getItem("columns")) || [];
            const column = storedColumns.find(col => col.title === editColumnTitle);

            if (column) {
                const cardIndex = column.cards.findIndex(card =>
                    card.cardTitle === currentCardElement.cardTitle &&
                    card.cardDetails === currentCardElement.cardDetails &&
                    card.assignedPerson === currentCardElement.assignedPerson
                );

                if (cardIndex !== -1) {
                    column.cards[cardIndex].cardTitle = updatedTitle;
                    column.cards[cardIndex].cardDetails = updatedDetails;
                    column.cards[cardIndex].assignedPerson = assignedPerson;
                    localStorage.setItem("columns", JSON.stringify(storedColumns));
                    loadColumnsFromLocalStorage();
                }
            }
        }

        closeModalAndOverlay();
    });

    closeCardEditBtn.addEventListener("click", closeModalAndOverlay);
    loadColumnsFromLocalStorage();
    populateAssignPersonDropdown();

    function initializePersonTable() {
        const personTable = [
            { id: 1, name: "Alice Johnson", email: "alice.johnson@example.com" },
            { id: 2, name: "Bob Smith", email: "bob.smith@example.com" },
            { id: 3, name: "Charlie Brown", email: "charlie.brown@example.com" },
            { id: 4, name: "Diana Prince", email: "diana.prince@example.com" },
            { id: 5, name: "Edward King", email: "edward.king@example.com" },
            { id: 6, name: "Fiona White", email: "fiona.white@example.com" },
            { id: 7, name: "George Harris", email: "george.harris@example.com" },
            { id: 8, name: "Hannah Lee", email: "hannah.lee@example.com" },
            { id: 9, name: "Ian Scott", email: "ian.scott@example.com" },
            { id: 10, name: "Julia Adams", email: "julia.adams@example.com" },
        ];
        localStorage.setItem("personTable", JSON.stringify(personTable));
    }

    function populateAssignPersonDropdown() {
        const dropdown = document.getElementById("assignPersonDropdown");
        dropdown.innerHTML = '<option value="">-- Select a Person --</option>';

        const persons = JSON.parse(localStorage.getItem("personTable")) || [];

        persons.forEach(person => {
            const option = document.createElement("option");
            option.value = person.name;
            option.textContent = person.name;
            dropdown.appendChild(option);
        });
    }

    if (!localStorage.getItem("personTable")) {
        initializePersonTable();
    }
});