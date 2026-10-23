
async function loadDashboard() {
  try {
    const response = await fetch("/api/me");
    const data = await response.json();

    if (response.status === 401) {
      window.location.replace("/");
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "Could not load your profile.");
    }

    document.getElementById("user-name").textContent =
      data.user.name || "User";

    document.getElementById("user-email").textContent =
      data.user.email;
  } catch (error) {
    document.getElementById("dashboard-message").textContent =
      "Could not load your profile. Please refresh the page.";
  }
}

async function logout() {
  const button = document.getElementById("logout-button");
  button.disabled = true;

  try {
    const tokenResponse = await fetch("/api/csrf-token");
    const tokenData = await tokenResponse.json();

    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "X-CSRF-Token": tokenData.csrfToken
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Logout failed.");
    }

    window.location.replace("/");
  } catch (error) {
    document.getElementById("dashboard-message").textContent =
      error.message || "Could not log out. Please try again.";
    button.disabled = false;
  }
}

document.getElementById("logout-button").addEventListener("click", logout);

loadDashboard();
