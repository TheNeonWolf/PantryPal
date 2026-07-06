const API_URL = "http://localhost:5000/api";

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