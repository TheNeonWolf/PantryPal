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
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const expiryPopover = document.getElementById("expiryPopover");
const closeExpiryPopoverBtn = document.getElementById("closeExpiryPopoverBtn");
const expiryPopoverName = document.getElementById("expiryPopoverName");
const expiryPopoverDate = document.getElementById("expiryPopoverDate");
const expiryPopoverStatus = document.getElementById("expiryPopoverStatus");
const expiryPopoverRemaining = document.getElementById("expiryPopoverRemaining");
const expiryPopoverLocation = document.getElementById("expiryPopoverLocation");
const expiryPopoverQuantity = document.getElementById("expiryPopoverQuantity");

const getCategoryIcon = (category) => {
    const categoryIcons = {
        Fruits: "🍎",
        Vegetables: "🥦",
        Dairy: "🥛",
        Meat: "🥩",
        Seafood: "🐟",
        Grains: "🌾",
        Snacks: "🍪",
        Drinks: "🥤",
        Frozen: "🧊",
        Canned: "🥫",
        Other: "📦"
    };

    return categoryIcons[category] || "📦";
};

let dashboardItems = [];

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
        dashboardItems = data.items || [];
        const items = dashboardItems;
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

        const sortedItems = [...items].sort(
            (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
        );
        renderRecentItems(sortedItems.slice(0, 5));
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
            const icon = getCategoryIcon(item.category);
            const status = getExpiryStatus(item.expiryDate);
            const location =
                item.location === "Other" && item.customLocation
                    ? item.customLocation
                    : item.location;

            return `
                <div class="item-row">
                    <div>
                        <h4>
                            <span class="item-category-icon">${icon}</span>
                            ${item.name}
                        </h4>
                        <p>${item.quantity} ${item.unit} • ${location}</p>
                    </div>
                    <button
                        class="badge clickable expiry-badge ${status
                            .toLowerCase()
                            .replace(" ", "-")}"
                        data-id="${item._id}"
                    >
                        ${status}
                    </button>
                </div>
            `;
        })
        .join("");
};

const formatExpiryDate = (expiryDate) => {
    return new Date(expiryDate).toLocaleDateString("en-SG", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

const getExpiryRemainingText = (expiryDate) => {
    const daysLeft = getDaysLeft(expiryDate);

    if (daysLeft < 0) {
        const daysAgo = Math.abs(daysLeft);
        return `Expired ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
    }

    if (daysLeft === 0) {
        return "Expires today";
    }

    if (daysLeft === 1){
        return "1 day remaining";
    }

    return `${daysLeft} days remaining`;
};

const openExpiryPopover = (item) => {
    const location = item.customLocation || item.location;

    expiryPopoverName.textContent = item.name;

    expiryPopoverDate.textContent =
        formatExpiryDate(item.expiryDate);

    expiryPopoverStatus.textContent =
        getExpiryStatus(item.expiryDate);

    expiryPopoverRemaining.textContent =
        getExpiryRemainingText(item.expiryDate);

    expiryPopoverLocation.textContent =
        location || "Not specified";

    expiryPopoverQuantity.textContent =
        `${item.quantity} ${item.unit}`;

    expiryPopover.classList.remove("hidden");
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

if(itemsList) {
    itemsList.addEventListener("click", (e) => {
        if (!e.target.classList.contains("expiry-badge")) {
            return;
        }

        const item = dashboardItems.find(
            (item) => item._id === e.target.dataset.id
        );

        if(item) {
            openExpiryPopover(item);
        }
    });
}

if (closeExpiryPopoverBtn) {
    closeExpiryPopoverBtn.addEventListener("click", () => {
        expiryPopover.classList.add("hidden");
    });
}

document.addEventListener("click", (e) => {
    const clickedBadge = e.target.classList.contains("expiry-badge");
    const clickedInsidePopover =
        expiryPopover && expiryPopover.contains(e.target);

    if (!clickedBadge && !clickedInsidePopover) {
        expiryPopover.classList.add("hidden");
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

loadDashboard();