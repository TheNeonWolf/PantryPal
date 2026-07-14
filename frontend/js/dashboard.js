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
const addItemError = document.getElementById("addItemError");
const clickableStatCards = document.querySelectorAll(".clickable-stat");
const dashboardItemsModal = document.getElementById("dashboardItemsModal");
const closeDashboardItemsModalBtn = document.getElementById("closeDashboardItemsModalBtn");
const dashboardItemsModalTitle = document.getElementById("dashboardItemsModalTitle");
const dashboardItemsModalSubtitle = document.getElementById("dashboardItemsModalSubtitle");
const dashboardItemsModalList = document.getElementById("dashboardItemsModalList");
const categoryChartCanvas = document.getElementById("categoryChart");
const categoryChartEmpty = document.getElementById("categoryChartEmpty");
const mostStockedCategory = document.getElementById("mostStockedCategory");
const mostUsedLocation = document.getElementById("mostUsedLocation");
const nextExpiryItem = document.getElementById("nextExpiryItem");
const categoriesUsed = document.getElementById("categoriesUsed");
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
let categoryChart = null;

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

const capitalizeWords = (text) => {
    if (!text) return "";

    return text
        .toLowerCase()
        .split(" ")
        .filter(word => word)
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
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
        renderCategoryChart(items);
        renderPantryInsights(items);
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

        const recentItems = [...items].sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

renderRecentItems(recentItems.slice(0, 5));
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
    const location = item.customLocation
        ? capitalizeWords(item.customLocation)
        : item.location

    expiryPopoverName.textContent = item.name;

    expiryPopoverDate.textContent = formatExpiryDate(item.expiryDate);
    expiryPopoverStatus.textContent = getExpiryStatus(item.expiryDate);
    expiryPopoverRemaining.textContent = getExpiryRemainingText(item.expiryDate);

    expiryPopoverLocation.textContent =
        location || "Not specified";

    expiryPopoverQuantity.textContent =
        `${item.quantity} ${item.unit}`;

    expiryPopover.classList.remove("hidden");
};

const getDashboardFilteredItems = (filter) => {
    if (filter === "expiring"){
        return dashboardItems.filter(
            (item) => getExpiryStatus(item.expiryDate) === "Expiring Soon"
        );
    }

    if (filter === "expired") {
        return dashboardItems.filter(
            (item) => getExpiryStatus(item.expiryDate) === "Expired");
    }

    if (filter === "low") {
        return dashboardItems.filter(
            (item) =>
                Number(item.quantity) <=
                Number(item.minimumQuantity)
        );
    }

    return [];
};

const getDashboardModalDetails = (filter) => {
    const details = {
        expiring: {
            title: "⚠️ Expiring Soon",
            subtitle:
                "These items will expire within the next 3 days."
        },

        expired: {
            title: "❌ Expired Items",
            subtitle:
                "These items have passed their expiry dates."
        },

        low: {
            title: "❗ Running Low",
            subtitle:
                "These items have reached their minimum quantity."
        }
    };

    return details[filter];
};

const renderDashboardModalItems = (
    items,
    filter
) => {
    if (!items.length) {
        dashboardItemsModalList.innerHTML = `
            <div class="dashboard-modal-empty">
                <span>🎉</span>
                <h3>No matching items</h3>
                <p>Your pantry is looking good.</p>
            </div>
        `;

        return;
    }

    dashboardItemsModalList.innerHTML = items
        .map((item) => {
            const icon =
                getCategoryIcon(item.category);

            const status =
                getExpiryStatus(item.expiryDate);

            const location =
                item.location === "Other" &&
                item.customLocation
                    ? item.customLocation
                    : item.location;

            const minimumQuantity =
                Number(item.minimumQuantity) || 0;

            const detailText =
                filter === "low"
                    ? `Minimum: ${minimumQuantity} ${item.unit}`
                    : getExpiryRemainingText(
                        item.expiryDate
                    );

            return `
                <div class="dashboard-modal-item">
                    <div class="dashboard-modal-item-main">
                        <span class="item-category-icon">
                            ${icon}
                        </span>

                        <div>
                            <h4>${item.name}</h4>

                            <p>
                                ${item.quantity} ${item.unit}
                                •
                                ${location}
                            </p>
                        </div>
                    </div>

                    <div class="dashboard-modal-item-details">
                        <span
                            class="
                                badge
                                ${status
                                    .toLowerCase()
                                    .replaceAll(" ", "-")}
                            "
                        >
                            ${status}
                        </span>

                        <small>${detailText}</small>
                    </div>
                </div>
            `;
        })
        .join("");
};

const openDashboardItemsModal = (filter) => {
    const details = getDashboardModalDetails(filter);
    const filteredItems = getDashboardFilteredItems(filter);

    dashboardItemsModalTitle.textContent = details.title;
    dashboardItemsModalSubtitle.textContent = details.subtitle;

    renderDashboardModalItems(
        filteredItems,
        filter
    );

    dashboardItemsModal.classList.remove(
        "hidden"
    );
};

const closeDashboardItemsModal = () => {
    dashboardItemsModal.classList.add(
        "hidden"
    );
};

const getCategoryCounts = (items) => {
    return items.reduce((counts, item) => {
        const category = item.category || "Other";
        counts[category] = (counts[category] || 0) + 1;
        return counts;
    }, {});
};

const getMostCommonEntries = (counts) => {
    const entries = Object.entries(counts);

    if (!entries.length) {
        return [];
    }

    const highestCount = Math.max(
        ...entries.map(([, count]) => count)
    );

    return entries.filter(
        ([, count]) => count === highestCount
    );
};

const getMostCommonEntry = (counts) => {
    const entries = Object.entries(counts);

    if (!entries.length) {
        return null;
    }

    return entries.reduce(
        (largest, current) =>
            current[1] > largest[1]
                ? current
                : largest
    );
};

const renderCategoryChart = (items) => {
    if (!categoryChartCanvas) {
        return;
    }

    const categoryCounts = getCategoryCounts(items);
    const labels = Object.keys(categoryCounts);
    const values = Object.values(categoryCounts);

    if (categoryChart) {
        categoryChart.destroy();
        categoryChart = null;
    }

    if (!labels.length) {
        categoryChartCanvas.classList.add("hidden");
        categoryChartEmpty.classList.remove("hidden");
        return;
    }

    categoryChartCanvas.classList.remove("hidden");
    categoryChartEmpty.classList.add("hidden");

    const backgroundColors = [
        "#3b9b69",
        "#f4b942",
        "#ef7c8e",
        "#5b8def",
        "#9b7ede",
        "#43a6a1",
        "#e58b4a",
        "#7caf5b",
        "#cf6fce",
        "#7a8b99",
        "#c79a62"
    ];

    categoryChart = new Chart(
        categoryChartCanvas,
        {
            type: "doughnut",

            data: {
                labels,

                datasets: [
                    {
                        data: values,
                        backgroundColor:
                            backgroundColors.slice(
                                0,
                                labels.length
                            ),

                        borderColor: "#ffffff",
                        borderWidth: 4,
                        hoverOffset: 10
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "66%",

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 18,
                            font: {
                                size: 13,
                                weight: "600"
                            }
                        }
                    },

                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const count = context.raw;
                                const total =
                                    context.dataset.data.reduce(
                                        (sum, value) =>
                                            sum + value,
                                        0
                                    );

                                const percentage =
                                    Math.round(
                                        (count / total) * 100
                                    );

                                return `${context.label}: ${count} item${
                                    count === 1 ? "" : "s"
                                } (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        }
    );
};

const renderPantryInsights = (items) => {
    if (!items.length) {
        mostStockedCategory.textContent = "No items yet";
        mostUsedLocation.textContent = "No items yet";
        nextExpiryItem.textContent = "No items yet";
        categoriesUsed.textContent = "0";
        return;
    }

    const categoryCounts = getCategoryCounts(items);
    const topCategories = getMostCommonEntries(categoryCounts);

    if (topCategories.length) {
        mostStockedCategory.innerHTML = topCategories
            .map(([category, count]) => {
                const icon = getCategoryIcon(category);

                return `
                    <span class="top-category-item">
                        ${icon} ${category} (${count})
                    </span>
                `;
            })
            .join("");
    }

    const locationCounts = items.reduce(
        (counts, item) => {
            const location =
                item.location === "Other" &&
                item.customLocation
                    ? item.customLocation
                    : item.location || "Not specified";

            counts[location] =
                (counts[location] || 0) + 1;

            return counts;
        },
        {}
    );

    const topLocations = getMostCommonEntries(locationCounts);

    if (topLocations.length) {
        mostUsedLocation.innerHTML = topLocations
            .map(
                ([location, count]) => `
                    <span class="top-location-item">
                        ${location} (${count})
                    </span>
                `
            )
            .join("");
    } else {
        mostUsedLocation.textContent = "Not available";
    }

    const validExpiryItems = items
        .filter((item) => {
            if (!item.expiryDate) {
                return false;
            }

            const expiry =
                new Date(item.expiryDate);

            return !Number.isNaN(
                expiry.getTime()
            );
        })
        .sort(
            (a, b) =>
                new Date(a.expiryDate) -
                new Date(b.expiryDate)
        );

    const upcomingExpiryItems = validExpiryItems.filter(
    (item) => getDaysLeft(item.expiryDate) >= 0
);

if (upcomingExpiryItems.length) {
    const nearestDaysLeft = getDaysLeft(
        upcomingExpiryItems[0].expiryDate
    );

    const nearestExpiryItems =
        upcomingExpiryItems.filter(
            (item) =>
                getDaysLeft(item.expiryDate) ===
                nearestDaysLeft
        );

    let remainingText = `${nearestDaysLeft} days`;

    if (nearestDaysLeft === 0) {
        remainingText = "Today";
    } else if (nearestDaysLeft === 1) {
        remainingText = "1 day";
    }

    nextExpiryItem.innerHTML = nearestExpiryItems
        .map((item) => {
            const icon = getCategoryIcon(item.category);

            return `
                <span class="next-expiry-item">
                    ${icon} ${item.name} — ${remainingText}
                </span>
            `;
        })
        .join("");
    } else {
        nextExpiryItem.textContent =
            "No upcoming expiries";
    }

    categoriesUsed.textContent =
        Object.keys(categoryCounts).length;
};

if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", () => {
        addItemForm.reset();
        addItemError.textContent = "";
        addItemMessage.textContent = "";
        itemCustomLocation.classList.add("hidden");
        itemCustomLocation.value = "";
        addItemModal.classList.remove("hidden");
        document.getElementById("itemName").focus();
    });
}

if (closeAddModalBtn) {
    closeAddModalBtn.addEventListener("click", () => {
        addItemModal.classList.add("hidden");
        addItemForm.reset();
        addItemError.textContent = "";
        addItemMessage.textContent = "";
        itemCustomLocation.classList.add("hidden");
        itemCustomLocation.value = "";
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

        addItemError.textContent = "";
        addItemMessage.textContent = "";

        const itemName = document.getElementById("itemName");
        const itemCategory = document.getElementById("itemCategory");
        const itemQuantity = document.getElementById("itemQuantity");
        const itemUnit = document.getElementById("itemUnit");
        const itemMinimumQuantity = document.getElementById("itemMinimumQuantity");
        const itemExpiryDate = document.getElementById("itemExpiryDate");

        if (!itemName.value.trim()) {
            addItemError.textContent = "Please enter an item name.";
            itemName.focus();
            return;
        }

        if (!itemCategory.value) {
            addItemError.textContent = "Please select a category.";
            itemCategory.focus();
            return;
        }

        if (
            itemQuantity.value === "" ||
            Number(itemQuantity.value) <= 0
        ) {
            addItemError.textContent =
                "Quantity must be greater than 0.";

            itemQuantity.focus();
            return;
        }

        if (!itemUnit.value) {
            addItemError.textContent =
                "Please select a unit.";

            itemUnit.focus();
            return;
        }

        if (
            itemMinimumQuantity.value !== "" &&
            Number(itemMinimumQuantity.value) < 0
        ) {
            addItemError.textContent =
                "Minimum quantity cannot be negative.";

            itemMinimumQuantity.focus();
            return;
        }

        if (!itemLocation.value) {
            addItemError.textContent =
                "Please select a storage location.";

            itemLocation.focus();
            return;
        }

        if (
            itemLocation.value === "Other" &&
            !itemCustomLocation.value.trim()
        ) {
            addItemError.textContent =
                "Please enter a custom storage location.";

            itemCustomLocation.focus();
            return;
        }

        if (!itemExpiryDate.value) {
            addItemError.textContent =
                "Please select an expiry date.";

            itemExpiryDate.focus();
            return;
        }

        const itemData = {
            name: itemName.value.trim(),
            category: itemCategory.value,
            quantity: Number(itemQuantity.value),
            unit: itemUnit.value,

            minimumQuantity:
                itemMinimumQuantity.value === ""
                    ? 0
                    : Number(itemMinimumQuantity.value),

            location: itemLocation.value,

            customLocation:
                itemLocation.value === "Other"
                    ? itemCustomLocation.value.trim()
                    : "",

            expiryDate: itemExpiryDate.value
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
                addItemError.textContent = data.message || "Could not add item.";
                return;
            }

            itemCustomLocation.classList.add("hidden");
            itemCustomLocation.value = "";
            addItemError.textContent = "";
            addItemMessage.textContent = "";
            addItemForm.reset();
            itemCustomLocation.classList.add("hidden");
            itemCustomLocation.value = "";
            addItemModal.classList.add("hidden");
            await loadDashboard();
        } catch (error) {
            console.error(error);
            addItemError.textContent = "Something went wrong. Please try again.";
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

if (closeDashboardItemsModalBtn) {
    closeDashboardItemsModalBtn.addEventListener(
        "click",
        closeDashboardItemsModal
    );
}

if (dashboardItemsModal) {
    dashboardItemsModal.addEventListener(
        "click",
        (e) => {
            if (e.target === dashboardItemsModal) {
                closeDashboardItemsModal();
            }
        }
    );
}

document.addEventListener("click", (e) => {
    const clickedBadge = e.target.classList.contains("expiry-badge");
    const clickedInsidePopover =
        expiryPopover && expiryPopover.contains(e.target);

    if (!clickedBadge && !clickedInsidePopover) {
        expiryPopover.classList.add("hidden");
    }
});

document.addEventListener("keydown", (e) => {
    if (
        e.key === "Escape" &&
        dashboardItemsModal &&
        !dashboardItemsModal.classList.contains(
            "hidden"
        )
    ) {
        closeDashboardItemsModal();
    }
});

clickableStatCards.forEach((card) => {
    card.addEventListener("click", () => {
        openDashboardItemsModal(
            card.dataset.filter
        );
    });

    card.addEventListener("keydown", (e) => {
        if (
            e.key === "Enter" ||
            e.key === " "
        ) {
            e.preventDefault();

            openDashboardItemsModal(
                card.dataset.filter
            );
        }
    });
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        logoutModal.classList.remove("hidden");
    });
}

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