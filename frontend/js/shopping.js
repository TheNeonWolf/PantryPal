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

let shoppingItems = [];

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
                            ${item.isBought ? "Undo" : "Bought"}
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

    const itemData = {
        name: document.getElementById("shoppingName").value.trim(),
        quantity: Number(document.getElementById("shoppingQuantity").value),
        unit: document.getElementById("shoppingUnit").value,
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
        shoppingModal.classList.add("hidden");
        shoppingMessage.textContent = "";
        loadShoppingItems();
    } catch (error) {
        console.error(error);
        shoppingMessage.textContent = "Something went wrong.";
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

const deleteShoppingItem = async (id) => {
    const confirmDelete = confirm("Remove this item from your shopping list?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${API_URL}/shopping/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            alert("Could not remove item.");
            return;
        }

        shoppingItems = shoppingItems.filter((item) => item._id !== id);
        renderShoppingItems(shoppingItems);
    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
};

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
        shoppingModal.classList.remove("hidden");
    });
}

if (closeShoppingModalBtn) {
    closeShoppingModalBtn.addEventListener("click", () => {
        shoppingModal.classList.add("hidden");
    });
}

if (shoppingForm) {
    shoppingForm.addEventListener("submit", addShoppingItem);
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.log("Logout request failed.");
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
}

loadShoppingItems();