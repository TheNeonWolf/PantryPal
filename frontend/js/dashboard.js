const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");
const user = storedUser ? JSON.parse(storedUser) : null;

if(!token) {
    window.location.href = "login.html";
}

const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

if(user && welcomeText) {
    welcomeText.textContent = `Welcome back, ${user.name} 👋`;
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