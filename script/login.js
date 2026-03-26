
/**
 * Initializes the login page.
 * Checks if the logo animation has already been played in this browser 
 * and applies the 'no-anim' class to skip it if necessary.
 * @async
 */
async function init() {
    let animationPlayed = localStorage.getItem('animationPlayed');
    
    if (!animationPlayed) {
        localStorage.setItem('animationPlayed', 'true');
    }
}

/**
 * Handles the login form submission.
 * @async
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();

  let email = document.getElementById("loginEmail").value.trim();
  let password = document.getElementById("loginPassword").value;

  if (!validateLoginInputs(email, password)) return;

  await authenticateUser(email, password);
}

/**
 * Validates login inputs.
 * @param {string} email - The email input.
 * @param {string} password - The password input.
 * @returns {boolean} True if valid.
 */
function validateLoginInputs(email, password) {
  if (!email && !password) {
    showLoginError("Please enter your email and password.");
    return false;
  } else if (!email) {
    showLoginError("Please enter your email.");
    return false;
  } else if (!password) {
    showLoginError("Please enter your password.");
    return false;
  }
  return true;
}

/**
 * Authenticates the user with Firebase.
 * @async
 * @param {string} email - The user email.
 * @param {string} password - The user password.
 */
async function authenticateUser(email, password) {
  try {
    let response = await fetch(BASE_URL + "/users.json");
    let users = await response.json();

    let loggedInUser = findUserByCredentials(users, email, password);

    if (loggedInUser) {
      sessionStorage.setItem("current_user", JSON.stringify(loggedInUser));
      showSuccessMessage();
    } else {
      showLoginError("Check your email and password. Please try again.");
    }
  } catch (error) {
    console.error("Fehler beim Login:", error);
    showLoginError("An error occurred during login. Please try again.");
  }
}

/**
 * Finds a user by credentials.
 * @param {Object} users - The users object.
 * @param {string} email - The email to find.
 * @param {string} password - The password to match.
 * @returns {Object|null} The user object or null.
 */
function findUserByCredentials(users, email, password) {
  for (let id in users) {
    if (users[id].email === email && users[id].password === password) {
      let user = users[id];
      user.id = id;
      return user;
    }
  }
  return null;
}

/**
 * Visualizes the login error state by adding error styling to input fields
 * and making the error message visible. If a message is provided, it updates the text dynamically.
 * 
 * @param {string} [msg] - The dynamic validation error message to display.
 */
function showLoginError(msg) {
  document.getElementById('emailGroup').classList.add('input-error');
  document.getElementById('passwordGroup').classList.add('input-error');
  
  let errorElement = document.getElementById('loginError');
  if (msg) {
    errorElement.textContent = msg;
  }
  errorElement.style.visibility = 'visible';
}

/**
 * Clears the login error state by removing error styling from input fields,
 * hiding the error message, and resetting its text content.
 */
function clearLoginError() {
  document.getElementById('emailGroup').classList.remove('input-error');
  document.getElementById('passwordGroup').classList.remove('input-error');
  
  let errorElement = document.getElementById('loginError');
  errorElement.style.visibility = 'hidden';
  errorElement.textContent = "";
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
