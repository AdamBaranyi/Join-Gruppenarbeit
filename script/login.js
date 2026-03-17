
/**
 * Initializes the login page.
 * Checks if the logo animation has already been played in this browser 
 * and applies the 'no-anim' class to skip it if necessary.
 * @async
 */
async function init() {
    let animationPlayed = localStorage.getItem('animationPlayed');
    
    if (animationPlayed) {
        document.body.classList.add('no-anim');
    } else {
        localStorage.setItem('animationPlayed', 'true');
    }
}

/**
 * Handles the login form submission.
 * Validates inputs, fetches users from Firebase, checks credentials,
 * and redirects on success or shows error on failure.
 * 
 * @async
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();

  let email = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showLoginError();
    return;
  }

  try {
    let response = await fetch(BASE_URL + "/users.json");
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
        loggedInUser.id = id;
        break;
      }
    }

    if (userFound) {
      sessionStorage.setItem("current_user", JSON.stringify(loggedInUser));
      showSuccessMessage();
    } else {
      showLoginError();
    }

  } catch (error) {
    console.error("Fehler beim Login:", error);
    showLoginError();
  }
}

/**
 * Visualizes the login error state by adding error styling to input fields
 * and displaying the error message text.
 */
function showLoginError() {
  document.getElementById('emailGroup').classList.add('input-error');
  document.getElementById('passwordGroup').classList.add('input-error');
  document.getElementById('loginError').classList.remove('d-none');
}

/**
 * Clears the login error state by removing error styling from input fields
 * and hiding the error message text.
 */
function clearLoginError() {
  document.getElementById('emailGroup').classList.remove('input-error');
  document.getElementById('passwordGroup').classList.remove('input-error');
  document.getElementById('loginError').classList.add('d-none');
}

/**
 * Logs in a user as a predefined Guest.
 * Stores a guest user object in session storage and redirects to the summary page.
 */
function guestLogin() {
  sessionStorage.setItem(
    "current_user",
    JSON.stringify({ name: "Guest", email: "guest@join.com" }),
  );
  showSuccessMessage();
}

/**
 * Displays a success message overlay and redirects the user to the summary page
 * after a short animation delay. Sets a flag for the mobile splash greeting.
 */
function showSuccessMessage() {
    let successMessage = document.getElementById('successMessage');
    successMessage.classList.remove('d-none');
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);

    setTimeout(() => {
        sessionStorage.setItem('showSplash', 'true');
        window.location.href = "html/summary.html";
    }, 1500);
}

/**
 * Handles the input event on the password field to switch between the lock and eye-off icon.
 */
function handleLoginPasswordInput() {
  let input = document.getElementById("loginPassword");
  let icon = document.getElementById("passwordToggleIcon");

  if (input.value.length === 0) {
    input.type = "password";
    icon.src = "./assets/imgs/lock.svg";
  } else if (input.type === "password") {
    icon.src = "./assets/imgs/eye-off-line.svg";
  }
}

/**
 * Toggles the visibility of the password input field.
 * Switches the input type between 'password' and 'text' and updates the toggle icon.
 */
function togglePasswordVisibility() {
  let input = document.getElementById("loginPassword");
  let icon = document.getElementById("passwordToggleIcon");

  if (input.value.length === 0) return; // Cannot toggle visibility of empty password

  if (input.type === "password") {
    input.type = "text";
    icon.src = "./assets/imgs/eye-line.svg";
  } else {
    input.type = "password";
    icon.src = "./assets/imgs/eye-off-line.svg";
  }
}
