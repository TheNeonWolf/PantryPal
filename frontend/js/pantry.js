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

let pantryItems = [];

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

                        <button class="edit-btn" data-id="${item._id}">
                            Edit
                        </button>

                        <button class="delete-btn" data-id="${item._id}">
                            Remove
                        </button>
                    </div>
                </div>
            `;
        })
        .join("");
};

const deleteItem = async (id) => {
    const confirmDelete = confirm("Are you sure you want to remove this item?");

    if(!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/pantry/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("Could not delete item.");
            return;
        }

        pantryItems = pantryItems.filter((item) => item._id !== id);
        renderItems(pantryItems);
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
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
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
}

if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", () => {
        editItemModal.classList.add("hidden");
    });
}

if (editItemForm) {
    editItemForm.addEventListener("submit", updateItem);
}

loadPantryItems();