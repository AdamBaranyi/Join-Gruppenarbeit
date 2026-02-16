const BASE_URL = "https://join-backend-afae8-default-rtdb.europe-west1.firebasedatabase.app/users";

/**
 * Initializes the login page.
 */
async function init() {
    // Optionally fetch users early if needed, but for now we fetch on login button click to ensure fresh data
}

/**
 * Handles the login form submission.
 * @param {Event} event - The form submission event
 */
async function handleLogin(event) {
  event.preventDefault();

  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;

  try {
    let response = await fetch(BASE_URL + ".json");
    let users = await response.json();

    let userFound = false;
    let loggedInUser = null;

    for (let id in users) {
      if (
        users[id].email === email &&
        users[id].password === password
      ) {
        userFound = true;
        loggedInUser = users[id];
        // Add ID if needed later: loggedInUser.id = id;
        break;
      }
    }

    if (userFound) {
      sessionStorage.setItem("current_user", JSON.stringify(loggedInUser));
      showSuccessMessage();
    } else {
      alert("E-Mail oder Passwort falsch! (Hast du dich registriert?)");
    }

  } catch (error) {
    console.error("Fehler beim Login:", error);
    alert("Ein Fehler ist aufgetreten via Firebase.");
  }
}



/**
 * Logs in as a guest user.
 */
function guestLogin() {
  sessionStorage.setItem(
    "current_user",
    JSON.stringify({ name: "Guest", email: "guest@join.com" }),
  );
  showSuccessMessage();
}

/**
 * Shows the success message and redirects after a delay.
 */
function showSuccessMessage() {
    let successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('d-none');
    // Allow a small delay for the display:block to apply before adding the class for animation
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);

    setTimeout(() => {
        window.location.href = "html/summary.html";
    }, 1500);
}

/**
 * Toggles the visibility of the password input field.
 */
function togglePasswordVisibility() {
  let input = document.getElementById("loginPassword");
  let icon = document.getElementById("passwordToggle");

  if (input.type === "password") {
    input.type = "text";
    // Open Eye (Visible)
    icon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
  } else {
    input.type = "password";
    // Show "Eye Off" (Slash)
    icon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>`;
  }
}
