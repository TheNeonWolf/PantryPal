const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;

if(!token) {
    window.location.href = "login.html";
}

const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");
const totalItemsEl = document.getElementById("totalItems");
const expiringSoonEl = document.getElementById("expiringSoon");
const expiredItemsEl = document.getElementById("expiredItems");
const runningLowEl = document.getElementById("runningLow");
const itemsList = document.getElementById("itemsList");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const closeAddModalBtn = document.getElementById("closeAddModalBtn");
const addItemModal = document.getElementById("addItemModal");
const addItemForm = document.getElementById("addItemForm");
const itemLocation = document.getElementById("itemLocation");
const itemCustomLocation = document.getElementById("itemCustomLocation");
const addItemMessage = document.getElementById("addItemMessage");

if(user && welcomeText) {
    welcomeText.textContent = `Welcome back, ${user.name} 👋`;
}

const getDaysLeft = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil((expiry - today) / (1000*60*60*24));
};

const getExpiryStatus = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);
    if (daysLeft < 0) return "Expired";
    if (daysLeft <= 3) return "Expiring Soon";
    return "Fresh";
};

const loadDashboard = async () => {
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
        const items = data.items || [];
        totalItemsEl.textContent = items.length;

        const expiringSoon = items.filter(
            (item) => getExpiryStatus(item.expiryDate) === "Expiring Soon"
        );

        const expired = items.filter(
            (item) => getExpiryStatus(item.expiryDate) === "Expired"
        );

        const runningLow = items.filter(
            (item) => item.quantity <= item.minimumQuantity
        );

        expiringSoonEl.textContent = expiringSoon.length;
        expiredItemsEl.textContent = expired.length;
        runningLowEl.textContent = runningLow.length;

        renderRecentItems(items.slice(0, 5));
    } catch (error) {
        console.error(error);
        itemsList.innerHTML = `<p class="empty-text">Could not load items.</p>`;
    }
};

const renderRecentItems = (items) => {
    if (!items.length) {
        itemsList.innerHTML = `<p class="empty-text">No items yet.</p>`;
        return;
    }

    itemsList.innerHTML = items
        .map((item) => {
            const status = getExpiryStatus(item.expiryDate);
            const location =
                item.location === "Other" && item.customLocation
                    ? item.customLocation
                    : item.location;

            return `
                <div class="item-row">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${item.quantity} ${item.unit} • ${location}</p>
                    </div>
                    <span class="badge ${status
                        .toLowerCase()
                        .replace(" ", "-")}">
                        ${status}
                    </span>
                </div>
            `;
        })
        .join("");
};

if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", () => {
        addItemModal.classList.remove("hidden");
    });
}

if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener("click", () => {
        addItemModal.classList.add("hidden");
    });
}

if (itemLocation) {
    itemLocation.addEventListener("change", () => {
        if (itemLocation.value === "Other") {
            itemCustomLocation.classList.remove("hidden");
        } else {
            itemCustomLocation.classList.add("hidden");
            itemCustomLocation.value = "";
        }
    });
}

if (addItemForm) {
    addItemForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const itemData = {
            name: document.getElementById("itemName").value.trim(),
            category: document.getElementById("itemCategory").value,
            quantity: Number(document.getElementById("itemQuantity").value),
            unit: document.getElementById("itemUnit").value,
            minimumQuantity: Number(document.getElementById("itemMinimumQuantity").value) || 1,
            location: document.getElementById("itemLocation").value,
            customLocation: document.getElementById("itemCustomLocation").value.trim(),
            expiryDate: document.getElementById("itemExpiryDate").value,
        }; 

        try {
            const res = await fetch(`${API_URL}/pantry`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(itemData)
            });

            const data = await res.json();

            if (!res.ok){
                addItemMessage.textContent = data.message || "Could not add item.";
                return;
            }

            addItemForm.reset();
            addItemModal.classList.add("hidden");
            addItemMessage.textContent = "";
            loadDashboard();
        } catch (error) {
            addItemMessage.textContent = "Something went wrong.";
        }
    });
}

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

loadDashboard();