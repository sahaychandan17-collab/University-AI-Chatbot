// =========================================================
// ABES Engineering College - Login Controller
// =========================================================

const API_BASE = "http://127.0.0.1:8000";

const loginForm = document.getElementById("loginForm");
const studentIdInput = document.getElementById("studentId");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("message");


// =========================================================
// QUICK DEMO LOGIN
// =========================================================

function fillCredentials(id, pass) {

    if (studentIdInput) {
        studentIdInput.value = id;
    }

    if (passwordInput) {
        passwordInput.value = pass;
    }

    if (studentIdInput) {
        studentIdInput.focus();
    }

    hideMessage();
}


// =========================================================
// MESSAGE HANDLING
// =========================================================

function showMessage(text, type = "error") {

    if (!messageBox) return;

    messageBox.style.display = "block";
    messageBox.className = `message-box ${type}`;
    messageBox.textContent = text;
}


function hideMessage() {

    if (!messageBox) return;

    messageBox.style.display = "none";
    messageBox.textContent = "";
    messageBox.className = "message-box";
}


// =========================================================
// CLEAR OLD SESSION
// =========================================================

function clearOldSession() {

    localStorage.removeItem("abes_token");
    localStorage.removeItem("abes_role");
    localStorage.removeItem("abes_user");

}


// =========================================================
// LOGIN
// =========================================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        hideMessage();

        const usernameOrId = studentIdInput.value.trim();
        const password = passwordInput.value;

        if (!usernameOrId || !password) {

            showMessage(
                "Please enter your Student ID and password.",
                "error"
            );

            return;
        }


        // Loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Authenticating...</span>";


        try {

            const response = await fetch(
                `${API_BASE}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username_or_id: usernameOrId,
                        password: password
                    })
                }
            );


            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                data = {};
            }


            // Login failed
            if (!response.ok) {

                const errorMessage =
                    data.detail ||
                    "Invalid Student ID or password.";

                showMessage(errorMessage, "error");

                submitBtn.disabled = false;
                submitBtn.innerHTML =
                    "<span>Sign In to Portal</span>";

                return;
            }


            // Validate token
            if (!data.access_token) {

                showMessage(
                    "Login response did not contain a valid access token.",
                    "error"
                );

                submitBtn.disabled = false;
                submitBtn.innerHTML =
                    "<span>Sign In to Portal</span>";

                return;
            }


            // =================================================
            // SUCCESSFUL LOGIN
            // =================================================

            clearOldSession();


            localStorage.setItem(
                "abes_token",
                data.access_token
            );

            localStorage.setItem(
                "abes_role",
                data.role || "student"
            );

            localStorage.setItem(
                "abes_user",
                JSON.stringify(data.user || {})
            );


            showMessage(
                "Login successful! Opening your student portal...",
                "success"
            );


            submitBtn.innerHTML =
                "<span>Opening Portal...</span>";


            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(() => {

                if (data.role === "admin") {

                    window.location.replace("admin.html");

                } else {

                    window.location.replace("dashboard.html");

                }

            }, 600);


        } catch (error) {

            console.error(
                "Login communication error:",
                error
            );


            showMessage(
                "Unable to connect to the portal. Please make sure the FastAPI server is running.",
                "error"
            );


            submitBtn.disabled = false;

            submitBtn.innerHTML =
                "<span>Sign In to Portal</span>";
        }

    });

}


// =========================================================
// PREVENT ACCESS TO DASHBOARD AFTER LOGOUT
// =========================================================

window.addEventListener("pageshow", function () {

    const token = localStorage.getItem("abes_token");

    if (!token) {
        // Stay on login page.
        return;
    }

});