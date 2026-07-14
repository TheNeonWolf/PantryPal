const API_URL = "http://localhost:5000/api";

const passwordInput =
    document.getElementById("password") ||
    document.getElementById("loginPassword");

const togglePasswordBtn =
    document.getElementById("togglePasswordBtn");

if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {

        const hidden =
            passwordInput.type === "password";

        passwordInput.type = hidden ? "text" : "password";

        togglePasswordBtn.textContent =
            hidden ? "Hide" : "Show";
    });
}

// Register

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

if(registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok){
                message.textContent = data.message || "Registration failed";
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html"
        } catch (error) {
            message.textContent = "Something went wrong. Please try again."
        }
    });
}


// Login

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if(loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            });

            const data = await res.json();

            if(!res.ok){
                loginMessage.textContent =
                    data.message || "Invalid email or password";
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "dashboard.html";
        } catch (error) {
            console.error(error);
            loginMessage.textContent =
                "Something went wrong. Please try again.";
        }
    });
}