/**
 * Includes HTML templates into the current page.
 * Searches for elements with 'w3-include-html' attribute and loads the corresponding file.
 * Dynamically switches between 'sidebar.html' and 'sidebar_guest.html' based on login status.
 * @async
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html");
        
        // Dynamic sidebar loading (skip mobile_sidebar which should always load as-is)
        if (!file.includes('mobile_sidebar.html') && 
            (file.includes('sidebar_guest.html') || file.includes('sidebar.html'))) {
            let user = sessionStorage.getItem('current_user');
            if (user) {
                file = '../assets/templates/sidebar.html';
            } else {
                file = '../assets/templates/sidebar_guest.html';
            }
        }

        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}

/**
 * Initializes the page by including HTML templates and setting up UI state.
 * Calls includeHTML(), setActiveNavItem(), and updateHeaderVisibility().
 * @async
 */
async function init() {
    await includeHTML();
    setActiveNavItem();
    updateHeaderVisibility();
}

/**
 * Updates the visibility of header elements based on login status.
 * Sets the user initials in the profile badge if logged in.
 * Hides the profile container and help icon if not logged in.
 */
function updateHeaderVisibility() {
    let user = JSON.parse(sessionStorage.getItem('current_user'));
    let profileContainer = document.querySelector('.user-profile-container');
    let helpIcon = document.querySelector('.help-icon');

    if (user) {
        if (profileContainer) {
            profileContainer.classList.remove('d-none');
            // Set Initials
            let initialsElement = profileContainer.querySelector('.user-profile-initials');
            if (initialsElement) {
                if (user.name === 'Guest') {
                    initialsElement.textContent = 'G';
                } else {
                    let nameParts = user.name.split(' ');
                    let initials = nameParts[0].charAt(0);
                    if (nameParts.length > 1) {
                        initials += nameParts[1].charAt(0);
                    }
                    initialsElement.textContent = initials.toUpperCase();
                }
            }
        }
        if (helpIcon) helpIcon.classList.remove('d-none');
    } else {
        // Hide profile container and help icon if not logged in
        if (profileContainer) profileContainer.classList.add('d-none');
        if (helpIcon) helpIcon.classList.add('d-none');
    }
}

/**
 * Navigates back based on login status.
 * If logged in -> Redirects to Summary page.
 * If not logged in -> Redirects to Login page.
 */
function goBack() {
    if (sessionStorage.getItem('current_user')) {
        window.location.href = '../html/summary.html';
    } else {
        window.location.href = '../index.html';
    }
}

/**
 * Highlights the sidebar nav link that matches the current page.
 * Adds the 'active' class to the corresponding anchor tag in the sidebar.
 */
function setActiveNavItem() {
    let currentPage = window.location.pathname.split('/').pop();
    // Select both desktop sidebar links and mobile sidebar links
    let navLinks = document.querySelectorAll('.sidebar-nav a, .mobile-sidebar .nav-item');
    
    for (let i = 0; i < navLinks.length; i++) {
        let linkHref = navLinks[i].getAttribute('href');
        // Handle potential path differences (e.g. ./summary.html vs summary.html)
        if (linkHref && (linkHref === currentPage || linkHref.endsWith('/' + currentPage))) {
            navLinks[i].classList.add('active');
        }
    }
}

/**
 * Toggles the visibility of the profile dropdown menu.
 * Prevents event propagation to avoid immediate closing via window click listener.
 * @param {Event} event - The click event.
 */
function toggleProfileMenu(event) {
    event.stopPropagation();
    document.getElementById('profile-dropdown').classList.toggle('d-none');
}

/**
 * Logs out the current user.
 * Removes the user from session storage and redirects to the login page.
 */
function logout() {
    sessionStorage.removeItem('current_user');
    window.location.href = '../index.html';
}

/**
 * Closes the profile dropdown menu if the user clicks outside of the profile container.
 * @param {Event} event - The window click event.
 */
window.onclick = function(event) {
    if (!event.target.closest('.user-profile-container')) {
        let dropdowns = document.getElementsByClassName("profile-dropdown");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('d-none')) {
                openDropdown.classList.add('d-none');
            }
        }
    }
}
