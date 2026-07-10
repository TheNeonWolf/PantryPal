const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token){
    window.location.href = "login.html";
}

const pantryList = document.getElementById("pantryList");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");
const editItemModal = document.getElementById("editItemModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const editItemForm = document.getElementById("editItemForm");
const editItemMessage = document.getElementById("editItemMessage");
const lowStockModal = document.getElementById("lowStockModal");
const closeLowStockModalBtn = document.getElementById("closeLowStockModalBtn");
const dismissLowStockBtn = document.getElementById("dismissLowStockBtn");
const addLowStockToShoppingBtn = document.getElementById("addLowStockToShoppingBtn");
const lowStockMessage = document.getElementById("lowStockMessage");
const shoppingQuantityModal = document.getElementById("shoppingQuantityModal");
const closeShoppingQuantityModalBtn = document.getElementById("closeShoppingQuantityModalBtn");
const shoppingQuantityMessage = document.getElementById("shoppingQuantityMessage");
const shoppingQuantityForm = document.getElementById("shoppingQuantityForm");
const shoppingQuantityInput = document.getElementById("shoppingQuantityInput");
const toast = document.getElementById("toast");
const deleteModal = document.getElementById("deleteModal");
const deleteMessage = document.getElementById("deleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");

let shoppingItemToAdd = null;
let lowStockItemToAdd = null;
let deleteItemId = null;
let pantryItems = [];

const showToast = (message) => {
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show")

    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
    }, 2500);
}

const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);

    if (daysLeft < 0) return "Expired";
    if (daysLeft <= 3) return "Expiring Soon";
    return "Fresh";
};

const renderItems = (items) => {
    if (!items.length) {
        pantryList.innerHTML = `<p class="empty-text">No items found.</p>`;
        return;
    }

    pantryList.innerHTML = items
        .map((item) => {
            const status = getExpiryStatus(item.expiryDate);
            const location = item.customLocation || item.location;

            return `
                <div class="item-row">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.quantity} ${item.unit} • ${location}</p>
                    </div>

                    <div class="item-actions">
                        <span class="badge ${status.toLowerCase().replace(" ", "-")}">
                            ${status}
                        </span>

                        <button class="shopping-btn" data-id="${item._id}">
                            ➕ List
                        </button>

                        <button class="edit-btn" data-id="${item._id}">
                            ✏️ Edit
                        </button>

                        <button class="delete-btn" data-id="${item._id}">
                            ❌ Remove
                        </button>
                    </div>
                </div>
            `;
        })
        .join("");
};

const deleteItem = (id) => {
    const item = pantryItems.find(
        (item) => item._id === id
    );
    if(!item) return;
    deleteItemId = id;

    deleteMessage.textContent =
        `Are you sure you want to remove "${item.name}"?`;
    deleteModal.classList.remove("hidden");
};

const confirmDelete = async () => {
    if(!deleteItemId) return;

    try {
        const res = await fetch(
            `${API_URL}/pantry/${deleteItemId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        ); 

        if(!res.ok) {
            showToast("❌ Could not remove item.");
            return;
        }

        pantryItems = pantryItems.filter(
            (item) => item._id !== deleteItemId
        );

        renderItems(pantryItems);
        showToast("🗑️ Item removed.");
    } catch (error) {
        console.error(error);
        showToast("❌ Something went wrong.");
    }

    deleteItemId = null;
    deleteModal.classList.add("hidden");
};

const openShoppingQuantityModal  = async (id) => {
    const item = pantryItems.find((item) => item._id === id);

    if(!item) return;

    shoppingItemToAdd = item;

    const suggestedQuantity = Math.max(
        (item.minimumQuantity || 1)  - item.quantity,
        1
    );

    shoppingQuantityMessage.textContent =
        `Add ${item.name} to your shopping list. Choose quantity (${item.unit}):`;

    shoppingQuantityInput.value = suggestedQuantity;
    shoppingQuantityModal.classList.remove("hidden");
};

const addToShoppingList = async (quantity) => {
    if(!shoppingItemToAdd) return;

    const shoppingItem = {
        name: shoppingItemToAdd.name,
        quantity: Number(quantity),
        unit: shoppingItemToAdd.unit
    };

    try {
        const res = await fetch(`${API_URL}/shopping`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(shoppingItem),
        });

        if (!res.ok) {
            alert("Could not add item to shopping list.");
            return;
        }

        shoppingQuantityModal.classList.add("hidden");
        shoppingItemToAdd = null;
        shoppingQuantityForm.reset();
        showToast(`✅ ${shoppingItem.name} added to shopping list.`);
    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
};

const openEditModal = (id) => {
    const item = pantryItems.find((item) => item._id === id);

    if (!item) return;

    document.getElementById("editItemId").value = item._id;
    document.getElementById("editItemName").value = item.name;
    document.getElementById("editItemQuantity").value = item.quantity;
    document.getElementById("editItemUnit").value = item.unit;
    document.getElementById("editItemExpiryDate").value =
        item.expiryDate.split("T")[0];
    
    editItemModal.classList.remove("hidden");
};

const updateItem = async (e) => {
    e.preventDefault();

    const id = document.getElementById("editItemId").value;

    const updatedData = {
        name: document.getElementById("editItemName").value.trim(),
        quantity: Number(document.getElementById("editItemQuantity").value),
        unit: document.getElementById("editItemUnit").value,
        expiryDate: document.getElementById("editItemExpiryDate").value
    };

    try {
        const res = await fetch(`${API_URL}/pantry/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        const data = await res.json();

        if (!res.ok) {
            editItemMessage.textContent = data.message || "Could not update item.";
            return;
        }

        editItemModal.classList.add("hidden");
        editItemMessage.textContent = "";
        
        const updatedItem = data.item;
        if(updatedItem.quantity <= updatedItem.minimumQuantity) {
            lowStockItemToAdd = updatedItem;
            lowStockMessage.textContent = `${updatedItem.name} is running low. Add it to your shopping list?`;
            lowStockModal.classList.remove("hidden");
        }
        loadPantryItems();
    } catch (error) {
        console.error(error);
        editItemMessage.textContent = "Something went wrong.";
    }
};

const loadPantryItems = async () => {
    try {
        const res = await fetch(`${API_URL}/pantry`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        const data = await res.json();
        pantryItems = data.items || [];

        renderItems(pantryItems);
    } catch (error) {
        console.error(error);
        pantryList.innerHTML = `<p class="empty-text">Could not load pantry items.</p>`;
    }
};

searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredItems = pantryItems.filter((item) => {
        const location = item.customLocation || item.location;

        return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            location.toLowerCase().includes(searchTerm)
        );
    });

    renderItems(filteredItems);
});

pantryList.addEventListener("click", (e) => {
    if(e.target.classList.contains("delete-btn")) {
        const id = e.target.dataset.id;
        deleteItem(id);
    }

    if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;
        openEditModal(id);
    }

    if (e.target.classList.contains("shopping-btn")) {
        const id = e.target.dataset.id;
        openShoppingQuantityModal(id);
    }
});

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

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", () => {
        editItemModal.classList.add("hidden");
    });
}

if (editItemForm) {
    editItemForm.addEventListener("submit", updateItem);
}

if (closeLowStockModalBtn) {
    closeLowStockModalBtn.addEventListener("click", () => {
        lowStockModal.classList.add("hidden");
        lowStockItemToAdd = null;
    });
}

if (dismissLowStockBtn) {
    dismissLowStockBtn.addEventListener("click", () => {
        lowStockModal.classList.add("hidden");
        lowStockItemToAdd = null;
    });
}

if (addLowStockToShoppingBtn) {
    addLowStockToShoppingBtn.addEventListener("click", () => {
        if (!lowStockItemToAdd) return;

        shoppingItemToAdd = lowStockItemToAdd;

        const suggestedQuantity = Math.max(
            (lowStockItemToAdd.minimumQuantity || 1) - lowStockItemToAdd.quantity,
            1
        );

        shoppingQuantityMessage.textContent =
            `Add ${lowStockItemToAdd.name} to your shopping list. Choose quantity (${lowStockItemToAdd.unit}):`;

        shoppingQuantityInput.value = suggestedQuantity;

        lowStockModal.classList.add("hidden");
        shoppingQuantityModal.classList.remove("hidden");
        lowStockItemToAdd = null;
    });
}

if (closeShoppingQuantityModalBtn) {
    closeShoppingQuantityModalBtn.addEventListener("click", () => {
        shoppingQuantityModal.classList.add("hidden");
        shoppingItemToAdd = null;
        shoppingQuantityForm.reset();
    });
}

if (shoppingQuantityForm) {
    shoppingQuantityForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        await addToShoppingList(shoppingQuantityInput.value);
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener(
        "click",
        confirmDelete
    );
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {

        deleteItemId = null;

        deleteModal.classList.add("hidden");

    });
}

loadPantryItems();