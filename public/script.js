
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const signupTab = document.getElementById("signup-tab");
const loginTab = document.getElementById("login-tab");

let csrfToken = "";

function showForm(formName) {
  const isSignup = formName === "signup";

  signupForm.hidden = !isSignup;
  loginForm.hidden = isSignup;

  signupTab.classList.toggle("active", isSignup);
  loginTab.classList.toggle("active", !isSignup);

  clearMessage("signup-message");
  clearMessage("login-message");
}

signupTab.addEventListener("click", () => showForm("signup"));
loginTab.addEventListener("click", () => showForm("login"));

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);

  if (input) {
    input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (error) {
    error.textContent = message;
  }
}

function clearMessage(messageId) {
  document.getElementById(messageId).textContent = "";
}

function showMessage(messageId, message) {
  document.getElementById(messageId).textContent = message;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

async function getCsrfToken() {
  const response = await fetch("/api/csrf-token");
  const data = await response.json();

  if (!response.ok || !data.csrfToken) {
    throw new Error("Could not initialize security. Refresh the page.");
  }

  csrfToken = data.csrfToken;
}

async function sendRequest(url, payload) {
  if (!csrfToken) {
    await getCsrfToken();
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

// Signup
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage("signup-message");

  const nameField = document.getElementById("signup-name");
  const name = nameField ? nameField.value.trim() : "";
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword =
    document.getElementById("confirm-password").value;

  let valid = true;

  if (nameField) {
    showError("signup-name", "signup-name-error", "");
    if (name.length < 2 || name.length > 80) {
      showError(
        "signup-name",
        "signup-name-error",
        "Name must be between 2 and 80 characters."
      );
      valid = false;
    }
  }

  showError("signup-email", "signup-email-error", "");
  showError("signup-password", "signup-password-error", "");
  showError("confirm-password", "confirm-password-error", "");

  if (!isValidEmail(email)) {
    showError(
      "signup-email",
      "signup-email-error",
      "Please enter a valid email address."
    );
    valid = false;
  }

  if (!isStrongPassword(password)) {
    showError(
      "signup-password",
      "signup-password-error",
      "Use at least 8 characters, including a number and a special character."
    );
    valid = false;
  }

  if (!confirmPassword || confirmPassword !== password) {
    showError(
      "confirm-password",
      "confirm-password-error",
      "Passwords do not match."
    );
    valid = false;
  }

  if (!valid) return;

  const button = signupForm.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const result = await sendRequest("/api/register", {
      name,
      email,
      password,
      confirmPassword
    });

    showMessage("signup-message", result.message || "Account created!");

    // Dashboard will be added in a later step.
    window.location.href = "/dashboard.html";
  } catch (error) {
    showMessage("signup-message", error.message);
  } finally {
    button.disabled = false;
  }
});

// Login
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage("login-message");

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  showError("login-email", "login-email-error", "");
  showError("login-password", "login-password-error", "");

  let valid = true;

  if (!isValidEmail(email)) {
    showError(
      "login-email",
      "login-email-error",
      "Please enter a valid email address."
    );
    valid = false;
  }

  if (!password) {
    showError(
      "login-password",
      "login-password-error",
      "Please enter your password."
    );
    valid = false;
  }

  if (!valid) return;

  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const result = await sendRequest("/api/login", {
      email,
      password
    });

    showMessage("login-message", result.message || "Login successful!");

    // Dashboard will be added in a later step.
    window.location.href = "/dashboard.html";
  } catch (error) {
    showMessage("login-message", error.message);
  } finally {
    button.disabled = false;
  }
});

// Get a CSRF token when the page loads.
getCsrfToken().catch((error) => {
  showMessage("signup-message", error.message);
});
