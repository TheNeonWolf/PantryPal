const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");

if(!token) {
    window.location.href = "login.html";
}

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const memberSince = document.getElementById("memberSince");
const profileTotalItems = document.getElementById("profileTotalItems");
const logoutBtn = document.getElementById("logoutBtn");
const logoutModal = document.getElementById("logoutModal");
const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");
const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
const openDeleteAccountModalBtn = document.getElementById("openDeleteAccountModalBtn");
const deleteAccountModal = document.getElementById("deleteAccountModal");
const closeDeleteAccountModalBtn = document.getElementById("closeDeleteAccountModalBtn");
const cancelDeleteAccountBtn = document.getElementById("cancelDeleteAccountBtn");
const confirmDeleteAccountBtn = document.getElementById("confirmDeleteAccountBtn");
const deleteAccountConfirmation = document.getElementById("deleteAccountConfirmation");
const deleteAccountMessage = document.getElementById("deleteAccountMessage");

const loadProfile = async () => {
    try {
        const userRes = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if(!userRes.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }

        const userData = await userRes.json();
        const user = userData.user;

        profileName.textContent = user.name;
        profileEmail.textContent = user.email;

        const createdDate = new Date(user.createdAt);
        memberSince.textContent = createdDate.toLocaleDateString("en-SG", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const pantryRes = await fetch(`${API_URL}/pantry`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!pantryRes.ok) {
            throw new Error("Could not load pantry items");
        }

        const pantryData = await pantryRes.json();
        profileTotalItems.textContent = pantryData.items?.length || 0;
    } catch (error) {
        console.error(error);
        profileName.textContent = "Could not load profile";
    }
};

const openDeleteAccountModal = () => {
    deleteAccountConfirmation.value = "";
    deleteAccountMessage.textContent = "";
    confirmDeleteAccountBtn.disabled = true;
    confirmDeleteAccountBtn.textContent = "Permanently Delete";
    deleteAccountModal.classList.remove("hidden");
    deleteAccountConfirmation.focus();
};

const closeDeleteAccountModal = () => {
    deleteAccountModal.classList.add("hidden");
    deleteAccountConfirmation.value = "";
    deleteAccountMessage.textContent = "";
    confirmDeleteAccountBtn.disabled = true;
};

const deleteAccount = async () => {
    if(deleteAccountConfirmation.value.trim() !== "DELETE") {
        deleteAccountMessage.textContent = 'Please type "DELETE" to continue.';
        return;
    }

    confirmDeleteAccountBtn.disabled = true;
    confirmDeleteAccountBtn.textContent = "Deleting...";

    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            deleteAccountMessage.textContent =
                data.message || "Could not delete account.";

            confirmDeleteAccountBtn.disabled = false;
            confirmDeleteAccountBtn.textContent =
                "Permanently Delete";

            return;
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    } catch (error) {
        console.error(error);
        deleteAccountMessage.textContent = "Something went wrong. Please try again.";
        confirmDeleteAccountBtn.disabled = false;
        confirmDeleteAccountBtn.textContent = "Permanently Delete";
    }
};

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

openDeleteAccountModalBtn.addEventListener(
    "click",
    openDeleteAccountModal
);

closeDeleteAccountModalBtn.addEventListener(
    "click",
    closeDeleteAccountModal
);

cancelDeleteAccountBtn.addEventListener(
    "click",
    closeDeleteAccountModal
);

deleteAccountConfirmation.addEventListener("input", () => {
    const isConfirmed = deleteAccountConfirmation.value.trim() === "DELETE";
    confirmDeleteAccountBtn.disabled = !isConfirmed;
    deleteAccountMessage.textContent = "";
});

confirmDeleteAccountBtn.addEventListener(
    "click",
    deleteAccount
);

loadProfile();