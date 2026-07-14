const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if(!token) {
    window.location.href = "login.html";
}

const shoppingList = document.getElementById("shoppingList");
const searchInput = document.getElementById("shoppingSearchInput");
const logoutBtn = document.getElementById("logoutBtn");
const openShoppingModalBtn = document.getElementById("openShoppingModalBtn");
const closeShoppingModalBtn = document.getElementById("closeShoppingModalBtn");
const shoppingModal = document.getElementById("shoppingModal");
const shoppingForm = document.getElementById("shoppingForm");
const shoppingMessage = document.getElementById("shoppingMessage");
const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const toast = document.getElementById("toast");
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const moveBoughtBtn = document.getElementById("moveBoughtBtn");
const moveBoughtModal = document.getElementById("moveBoughtModal");
const closeMoveBoughtModalBtn = document.getElementById("closeMoveBoughtModalBtn");
const cancelMoveBoughtBtn = document.getElementById("cancelMoveBoughtBtn");
const confirmMoveBoughtBtn = document.getElementById("confirmMoveBoughtBtn");
const moveBoughtItemsList = document.getElementById("moveBoughtItemsList");
const moveBoughtMessage = document.getElementById("moveBoughtMessage");
const shoppingFormError = document.getElementById("shoppingFormError");

const pantryCategories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Meat",
    "Seafood",
    "Grains",
    "Snacks",
    "Drinks",
    "Frozen",
    "Canned",
    "Other",
];

const pantryLocations = [
    "Fridge",
    "Freezer",
    "Pantry",
    "Other",
];

let shoppingItems = [];
let deleteItemId = null;

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show")

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
    }, 2500);
}

const renderShoppingItems = (items) => {
    if(!items.length) {
        shoppingList.innerHTML = `
            <div class="shopping-empty">
                <h3>🛒 Shopping list is empty</h3>
                <p>Add your first shopping item.</p>
            </div>
        `;
        return;
    }

    shoppingList.innerHTML = items
        .map((item) => {
            return `
                <div class="shopping-item ${item.isBought ? "bought" : ""}">
                    <div>
                        <h4>${item.name}</h4>
                        <p>
                            Need:
                            <span class="quantity-text">
                                ${item.quantity} ${item.unit}
                            </span>
                        </p>
                    </div>

                    <div class="shopping-actions">
                        <button class="check-btn" data-id="${item._id}">
                            ${item.isBought ? "⟲" : "✔️"}
                        </button>

                        <button class="delete-btn" data-id="${item._id}">❌</button>
                    </div>
                </div>
            `;
        })
        .join("");
};

const loadShoppingItems = async () => {
    try {
        const res = await fetch(`${API_URL}/shopping`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if(!res.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        shoppingItems = data.items || [];
        renderShoppingItems(shoppingItems);
    } catch (error) {
        console.error(error);
        shoppingList.innerHTML = `<p class="empty-text">Could not load shopping list.</p>`;
    }
};

const addShoppingItem = async (e) => {
    e.preventDefault();

    shoppingFormError.textContent = "";
    shoppingMessage.textContent = "";

    const shoppingName =
        document.getElementById("shoppingName");

    const shoppingQuantity =
        document.getElementById("shoppingQuantity");

    const shoppingUnit =
        document.getElementById("shoppingUnit");

    if (!shoppingName.value.trim()) {
        shoppingFormError.textContent =
            "Please enter an item name.";

        shoppingName.focus();
        return;
    }

    if (
        shoppingQuantity.value === "" ||
        Number(shoppingQuantity.value) <= 0
    ) {
        shoppingFormError.textContent =
            "Quantity must be greater than 0.";

        shoppingQuantity.focus();
        return;
    }

    if (!shoppingUnit.value) {
        shoppingFormError.textContent =
            "Please select a unit.";

        shoppingUnit.focus();
        return;
    }

    const itemData = {
        name: shoppingName.value.trim(),
        quantity: Number(shoppingQuantity.value),
        unit: shoppingUnit.value
    };

    try {
        const res = await fetch(`${API_URL}/shopping`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(itemData)
        });

        const data = await res.json();

        if (!res.ok) {
            shoppingMessage.textContent = data.message || "Could not add item.";
            return;
        }

        shoppingForm.reset();
        shoppingFormError.textContent = "";
        shoppingModal.classList.add("hidden");
        shoppingMessage.textContent = "";

        loadShoppingItems();
    } catch (error) {
        console.error(error);
        shoppingMessage.textContent = "Something went wrong. Please try again.";
    }
};

const toggleBought = async (id) => {
    const item = shoppingItems.find((item) => item._id === id);
    if(!item) return;

    try {
        const res = await fetch(`${API_URL}/shopping/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                isBought: !item.isBought,
            }),
        });

        if (!res.ok) {
            alert("Could not update item.");
            return;
        }

        loadShoppingItems();
    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
};

const closeMoveBoughtModal = () => {
    moveBoughtModal.classList.add("hidden");
    moveBoughtItemsList.innerHTML = "";
    moveBoughtMessage.textContent = "";
};

const openMoveBoughtModal = () => {
    const boughtItems = shoppingItems.filter((item) => item.isBought);

    if(!boughtItems.length) {
        showToast("❕No bought items to move");
        return;
    }

    moveBoughtItemsList.innerHTML = boughtItems
        .map((item) => {
            const categoryOptions = [
                `
                    <option
                        value=""
                        disabled
                        ${item.category ? "" : "selected"}
                    >
                        Select category
                    </option>
                `,
                ...pantryCategories.map(
                    (category) => `
                        <option
                            value="${category}"
                            ${item.category === category ? "selected" : ""}
                        >
                            ${category}
                        </option>
                    `
                )
            ].join("");
            
            const locationOptions = [
                `
                    <option
                        value=""
                        disabled
                        ${item.location ? "" : "selected"}
                    >
                        Select storage location
                    </option>
                `,
                ...pantryLocations.map(
                    (location) => `
                        <option
                            value="${location}"
                            ${item.location === location ? "selected" : ""}
                        >
                            ${location}
                        </option>
                    `
                )
            ].join("");
            
            return `
                <div class="move-item-card" data-id="${item._id}">
                    <div class="move-item-header">
                        <div>
                            <h3>${item.name}</h3>
                            <p>Ready to move into your pantry</p>
                        </div>

                        <span class="move-item-quantity">
                            ${item.quantity} ${item.unit}
                        </span>
                    </div>

                    <div class="move-item-fields">
                        <div class="move-form-group">
                            <label for="category-${item._id}">
                                Category
                            </label>

                            <select
                                id="category-${item._id}"
                                class="move-category"
                                required
                            >
                                ${categoryOptions}
                            </select>
                        </div>

                        <div class="move-form-group">
                            <label for="location-${item._id}">
                                Storage Location
                            </label>

                            <select
                                id="location-${item._id}"
                                class="move-location"
                                required
                            >
                                ${locationOptions}
                            </select>
                        </div>

                        <div class="move-form-group">
                            <label for="minimumQuantity-${item._id}">
                                Minimum Quantity
                            </label>

                            <input
                                type="number"
                                id="minimumQuantity-${item._id}"
                                class="move-minimum-quantity"
                                min="0"
                                step="1"
                                value="0"
                                placeholder="Example: 1"
                            >
                        </div>

                        <div class="move-form-group full-width custom-location-group hidden">
                            <label for="customLocation-${item._id}">
                                Custom Location
                            </label>

                            <input
                                type="text"
                                id="customLocation-${item._id}"
                                class="move-custom-location"
                                placeholder="Example: Mini fridge"
                            >
                        </div>

                        <div class="move-form-group full-width">
                            <label for="expiry-${item._id}">
                                Expiry Date
                            </label>

                            <input
                                type="date"
                                id="expiry-${item._id}"
                                class="move-expiry-date"
                                required
                            >
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
    
    moveBoughtModal.classList.remove("hidden");
};

const moveBoughtItemsToPantry = async () => {
    const boughtItems = shoppingItems.filter((items) => items.isBought);
    const itemCards = document.querySelectorAll(".move-item-card");

    if (!boughtItems.length || !itemCards.length) {
        return;
    }
    const itemsToMove = [];

    for (const card of itemCards) {
        const id = card.dataset.id;
        const shoppingItem = boughtItems.find((item) => item._id === id);

        if(!shoppingItem) continue;

        const category = card.querySelector(".move-category").value;
        const location = card.querySelector(".move-location").value;
        const minimumQuantityValue = card.querySelector(".move-minimum-quantity").value;
        const minimumQuantity =
            minimumQuantityValue === ""
                ? 0
                : Number(minimumQuantityValue);
        const customLocation = card
            .querySelector(".move-custom-location")
            .value.trim();
        const expiryDate = card.querySelector(".move-expiry-date").value;

        if (!category) {
            moveBoughtMessage.textContent = `Please select a category for ${shoppingItem.name}.`;
            return;
        }
        
        if(!expiryDate) {
            moveBoughtMessage.textContent =
                `Please choose an expiry date for ${shoppingItem.name}.`;
            return;
        }

        if (!location) {
            moveBoughtMessage.textContent =
                `Please select a storage location for ${shoppingItem.name}.`;
            return;
        }

        if(location === "Other" && !customLocation) {
            moveBoughtMessage.textContent =
                `Please enter a custom location for ${shoppingItem.name}.`;
            return;
        }

        if (
            !Number.isFinite(minimumQuantity) ||
            minimumQuantity < 0
        ) {
            moveBoughtMessage.textContent =
                `Please enter a valid minimum quantity for ${shoppingItem.name}.`;
        
            return;
        }

        itemsToMove.push({
            shoppingItem,
            pantryData: {
                name: shoppingItem.name,
                category,
                quantity: shoppingItem.quantity,
                unit: shoppingItem.unit,
                minimumQuantity,
                location,
                customLocation:
                    location === "Other" ? customLocation : "",
                expiryDate
            }
        });
    }

    confirmMoveBoughtBtn.disabled = true;
    confirmMoveBoughtBtn.textContent = "Moving...";

    let movedCount = 0;
    const failedItems = [];

    for (const entry of itemsToMove){
        try {
            const pantryRes = await fetch(`${API_URL}/pantry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(entry.pantryData)
            });

            if (!pantryRes.ok){
                failedItems.push(entry.shoppingItem.name);
                continue;
            }

            const deleteRes = await fetch(
                `${API_URL}/shopping/${entry.shoppingItem._id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!deleteRes.ok) {
                failedItems.push(entry.shoppingItem.name);
                continue;
            }

            movedCount += 1;
        } catch (error) {
            console.error(error);
            failedItems.push(entry.shoppingItem.name);
        }
    }

    confirmMoveBoughtBtn.disabled = false;
    confirmMoveBoughtBtn.textContent = "Move All to Pantry";

    if (movedCount > 0) {
        showToast(
            `✅ ${movedCount} item${movedCount === 1 ? "" : "s"} moved to pantry.`
        );
    }

    if (failedItems.length > 0) {
        moveBoughtMessage.textContent =
            `Could not move: ${failedItems.join(", ")}.`
    } else {
        closeMoveBoughtModal();
    }

    await loadShoppingItems();
};

const deleteShoppingItem = (id) => {
    const item = shoppingItems.find((item) => item._id === id);

    if (!item) return;

    deleteItemId = id;
    deleteMessage.textContent = `Are you sure you want to remove "${item.name}"?`;
    deleteModal.classList.remove("hidden");
};

const confirmDelete = async () => {
    if(!deleteItemId) return;

    try {
        const res = await fetch(`${API_URL}/shopping/${deleteItemId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if(!res.ok) {
            showToast("❌ Could not remove item.");
            return;
        }

        shoppingItems = shoppingItems.filter(
            (item) => item._id !== deleteItemId
        );

        renderShoppingItems(shoppingItems);
        showToast("🗑️ Item removed.");
    } catch (error) {
        console.error(error);
        showToast("❌ Something went wrong.");
    }

    deleteItemId = null;
    deleteModal.classList.add("hidden");
};

if(moveBoughtItemsList) {
    moveBoughtItemsList.addEventListener("change", (e) => {
        if(!e.target.classList.contains("move-location")) {
            return;
        }

        const itemCard = e.target.closest(".move-item-card");
        const customLocationGroup = itemCard.querySelector(".custom-location-group");
        const customLocationInput = itemCard.querySelector(".move-custom-location");

        if (e.target.value === "Other") {
            customLocationGroup.classList.remove("hidden");
            customLocationInput.required = true;
        } else {
            customLocationGroup.classList.add("hidden");
            customLocationInput.required = false;
            customLocationInput.value = "";
        }
    });
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = shoppingItems.filter((item) =>
            item.name.toLowerCase().includes(searchTerm)
        );
        renderShoppingItems(filteredItems);
    });
}

if (shoppingList){
    shoppingList.addEventListener("click", (e) => {
        if (e.target.classList.contains("check-btn")) {
            toggleBought(e.target.dataset.id);
        }

        if (e.target.classList.contains("delete-btn")) {
            deleteShoppingItem(e.target.dataset.id);
        }
    });
}

if(openShoppingModalBtn) {
    openShoppingModalBtn.addEventListener("click", () => {
        shoppingForm.reset();
        shoppingFormError.textContent = "";
        shoppingMessage.textContent = "";
        shoppingModal.classList.remove("hidden");
        document.getElementById("shoppingName").focus();
    });
}

if (closeShoppingModalBtn) {
    closeShoppingModalBtn.addEventListener("click", () => {
        shoppingModal.classList.add("hidden");
        shoppingForm.reset();
        shoppingFormError.textContent = "";
        shoppingMessage.textContent = "";
    });
}

if (shoppingForm) {
    shoppingForm.addEventListener("submit", addShoppingItem);
}

logoutBtn.addEventListener("click", () => {
    logoutModal.classList.remove("hidden");
});

cancelLogoutBtn.addEventListener("click", () => {
    logoutModal.classList.add("hidden");
});

confirmLogoutBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if(!response.ok) {
            throw new Error("Logout failed");
        }
    } catch (error) {
     console.log("Logout request failed, clearing local session anyway.");
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDelete);
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
        deleteItemId = null;
        deleteModal.classList.add("hidden");
    });
}

if (moveBoughtBtn) {
    moveBoughtBtn.addEventListener("click", openMoveBoughtModal);
}

if (closeMoveBoughtModalBtn) {
    closeMoveBoughtModalBtn.addEventListener(
        "click",
        closeMoveBoughtModal
    );
}

if (cancelMoveBoughtBtn) {
    cancelMoveBoughtBtn.addEventListener(
        "click",
        closeMoveBoughtModal
    );
}

if (confirmMoveBoughtBtn) {
    confirmMoveBoughtBtn.addEventListener(
        "click",
        moveBoughtItemsToPantry
    );
}

loadShoppingItems();