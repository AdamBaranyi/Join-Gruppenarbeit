/**
 * Initializes the summary page by loading templates and setting up the greeting.
 */
async function init() {
    await includeHTML();
    greetUser();
}

/**
 * Greets the user based on the current time of day and updates the user's name and initials.
 * Retrieves user data from session storage to personalize the greeting.
 */
function greetUser() {
    const timeElement = document.getElementById('greeting-time');
    const nameElement = document.getElementById('greeting-name');
    const userInitialsElement = document.querySelector('.user-profile-initials');

    let user = JSON.parse(sessionStorage.getItem('current_user'));
    let userName = 'Guest';
    let userInitials = 'G';

    if (user && user.name) {
        userName = user.name;
        userInitials = getInitials(userName);
    } else if (user && user.email) {
        userName = user.name || 'Guest';
    }

    const hour = new Date().getHours();
    let greetingText = "Good morning,";

    if (hour >= 12 && hour < 18) {
        greetingText = "Good afternoon,";
    } else if (hour >= 18) {
        greetingText = "Good evening,";
    }

    if (timeElement) timeElement.innerText = greetingText;
    if (nameElement) nameElement.innerText = userName;

    if (userInitialsElement) {
        userInitialsElement.innerText = userInitials;
    }
}

/**
 * Extracts the capitalized initials from a full name.
 * 
 * @param {string} name - The full name of the user.
 * @returns {string} The first letter of the first name and the last name, or just the first letter if only one name is present.
 */
function getInitials(name) {
    let parts = name.split(' ');
    let initials = '';
    
    if (parts.length > 0) {
        initials += parts[0].charAt(0);
    }
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    
    return initials.toUpperCase();
}
