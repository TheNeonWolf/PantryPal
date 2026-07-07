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

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.html";
    });
}

loadProfile();