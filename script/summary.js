/* Initialization */

/**
 * Initializes the summary page by loading templates,
 * setting the active navigation item, greeting the user,
 * triggering the mobile splash screen only after login,
 * and loading task metrics.
 */
async function init() {
  await includeHTML();
  setActiveNavItem();
  greetUser();
  await loadSummaryMetrics();

  let shouldSplash = sessionStorage.getItem("showSplash") === "true";
  if (window.innerWidth <= 850 && shouldSplash) {
    sessionStorage.removeItem("showSplash");
    handleMobileSplash();
  } else {
    ensureDashboardVisible();
  }
  window.addEventListener("resize", handleResize);
}

/**
 * Handles viewport resize events.
 * Ensures the dashboard remains visible when switching between
 * desktop and mobile views (e.g., Chrome DevTools responsive mode).
 */
function handleResize() {
  ensureDashboardVisible();
}

/**
 * Adds the 'dashboard-ready' class to metrics and header containers
 * so they remain visible after a viewport change.
 */
function ensureDashboardVisible() {
  const metricsContainer = document.querySelector(".metrics-container");
  const headerContainer = document.querySelector(".summary-header-container");
  if (metricsContainer) metricsContainer.classList.add("dashboard-ready");
  if (headerContainer) headerContainer.classList.add("dashboard-ready");
}

/* Mobile Splash Screen */

/**
 * Handles the mobile splash screen animation.
 * Shows a centered greeting for 2 seconds, then fades it out
 * and reveals the dashboard content (metrics, header, sidebar).
 */
function handleMobileSplash() {
  const mobileSidebar = document.querySelector(".mobile-sidebar");
  const summaryContent = document.querySelector(".summary-content");
  const metricsContainer = document.querySelector(".metrics-container");
  const headerContainer = document.querySelector(".summary-header-container");
  const greetingContainer = document.querySelector(".greeting-container");

  if (summaryContent) summaryContent.classList.add("splash-active");
  showGreetingForSplash(greetingContainer);
  hideDashboardElements(mobileSidebar, metricsContainer, headerContainer);
  startSplashTransition(
    greetingContainer,
    summaryContent,
    mobileSidebar,
    metricsContainer,
    headerContainer,
  );
}

/**
 * Makes the greeting container visible for the splash screen.
 * Required because CSS hides it by default on mobile.
 *
 * @param {HTMLElement|null} greetingContainer - The greeting section element.
 */
function showGreetingForSplash(greetingContainer) {
  if (greetingContainer) {
    greetingContainer.style.display = "flex";
    greetingContainer.style.opacity = "1";
  }
}

/**
 * Hides dashboard elements by adding the 'splash-hidden' CSS class.
 *
 * @param {HTMLElement|null} mobileSidebar - The mobile bottom navigation.
 * @param {HTMLElement|null} metricsContainer - The metrics cards section.
 * @param {HTMLElement|null} headerContainer - The "Join 360" header section.
 */
function hideDashboardElements(
  mobileSidebar,
  metricsContainer,
  headerContainer,
) {
  if (mobileSidebar) mobileSidebar.classList.add("splash-hidden");
  if (metricsContainer) metricsContainer.classList.add("splash-hidden");
  if (headerContainer) headerContainer.classList.add("splash-hidden");
}

/**
 * Starts the timed splash transition: fades out the greeting after 2s,
 * then reveals the dashboard after an additional 0.5s fade.
 *
 * @param {HTMLElement|null} greetingContainer - The greeting section element.
 * @param {HTMLElement|null} summaryContent - The main summary content wrapper.
 * @param {HTMLElement|null} mobileSidebar - The mobile bottom navigation.
 * @param {HTMLElement|null} metricsContainer - The metrics cards section.
 * @param {HTMLElement|null} headerContainer - The "Join 360" header section.
 */
function startSplashTransition(
  greetingContainer,
  summaryContent,
  mobileSidebar,
  metricsContainer,
  headerContainer,
) {
  setTimeout(() => {
    fadeOutGreeting(greetingContainer, () => {
      showDashboard(
        summaryContent,
        mobileSidebar,
        metricsContainer,
        headerContainer,
      );
    });
  }, 2000);
}

/**
 * Fades out the greeting container and executes a callback when done.
 *
 * @param {HTMLElement|null} greetingContainer - The greeting section element.
 * @param {Function} onComplete - Callback to run after the fade completes.
 */
function fadeOutGreeting(greetingContainer, onComplete) {
  if (!greetingContainer) return;
  greetingContainer.style.opacity = "0";
  greetingContainer.style.transition = "opacity 0.5s ease-out";
  setTimeout(() => {
    greetingContainer.classList.add("splash-hidden");
    onComplete();
  }, 500);
}

/**
 * Reveals the dashboard by removing splash classes and adding visibility classes.
 *
 * @param {HTMLElement|null} summaryContent - The main summary content wrapper.
 * @param {HTMLElement|null} mobileSidebar - The mobile bottom navigation.
 * @param {HTMLElement|null} metricsContainer - The metrics cards section.
 * @param {HTMLElement|null} headerContainer - The "Join 360" header section.
 */
function showDashboard(
  summaryContent,
  mobileSidebar,
  metricsContainer,
  headerContainer,
) {
  if (summaryContent) summaryContent.classList.remove("splash-active");
  if (mobileSidebar) mobileSidebar.classList.remove("splash-hidden");
  if (metricsContainer) metricsContainer.classList.add("dashboard-ready");
  if (headerContainer) headerContainer.classList.add("dashboard-ready");
}

/* Greeting Logic */

/**
 * Greets the user based on the current time of day.
 * Retrieves user data from sessionStorage to personalize
 * the greeting text, user name, and profile initials.
 */
function greetUser() {
  const timeElement = document.getElementById("greeting-time");
  const nameElement = document.getElementById("greeting-name");
  const userInitialsElement = document.querySelector(".user-profile-initials");

  let user = JSON.parse(sessionStorage.getItem("current_user"));
  let userName = "Guest";
  let userInitials = "G";

  if (user && user.name) {
    userName = user.name;
    userInitials = getInitials(userName);
  }

  let greetingText = getGreetingByTime();

  if (userName === "Guest") {
    greetingText = greetingText.slice(0, -1) + "!";
    if (nameElement) nameElement.innerText = "";
  } else {
    if (nameElement) nameElement.innerText = userName;
  }

  if (timeElement) timeElement.innerText = greetingText;
  if (userInitialsElement) userInitialsElement.innerText = userInitials;
}

/**
 * Returns a time-appropriate greeting string based on the current hour.
 *
 * @returns {string} "Good morning,", "Good afternoon,", or "Good evening,"
 */
function getGreetingByTime() {
  const hour = new Date().getHours();
  if (hour >= 18) return "Good evening,";
  if (hour >= 12) return "Good afternoon,";
  return "Good morning,";
}

/* Utility Functions */

/**
 * Extracts capitalized initials from a full name.
 * Returns the first letter of the first and last name parts.
 *
 * @param {string} name - The full name of the user.
 * @returns {string} Uppercase initials (e.g., "AB" for "Adam Baranyi").
 */
function getInitials(name) {
  let parts = name.split(" ");
  let initials = "";
  if (parts.length > 0) {
    initials += parts[0].charAt(0);
  }
  if (parts.length > 1) {
    initials += parts[parts.length - 1].charAt(0);
  }
  return initials.toUpperCase();
}

/* Firebase Metrics Integration */

/**
 * Fetches all tasks from Firebase and calculates the totals
 * for various statuses and priorities, as well as the
 * upcoming deadline for urgent tasks, to update the UI.
 */
async function loadSummaryMetrics() {
  try {
    const response = await fetch(BASE_URL + "/tasks.json");
    const data = (await response.json()) || {};
    const tasks = Object.values(data);

    let metrics = {
      total: tasks.length,
      todo: 0,
      inProgress: 0,
      awaitingFeedback: 0,
      done: 0,
      urgent: 0,
    };

    let earliestUrgentDate = null;

    tasks.forEach((task) => {
      if (task.status === "todo") metrics.todo++;
      else if (task.status === "inProgress") metrics.inProgress++;
      else if (task.status === "awaitingFeedback") metrics.awaitingFeedback++;
      else if (task.status === "done") metrics.done++;

      if (task.priority === "Urgent") {
        metrics.urgent++;

        if (task.dueDate) {
          const taskDate = new Date(task.dueDate);
          if (!earliestUrgentDate || taskDate < earliestUrgentDate) {
            earliestUrgentDate = taskDate;
          }
        }
      }
    });

    updateSummaryUI(metrics, earliestUrgentDate);
  } catch (e) {
    console.error("Error loading summary metrics:", e);
  }
}



/**
 * Updates the summary HTML numbers and the urgent deadline text.
 *
 * @param {Object} metrics - Object mapping statuses to numbers.
 * @param {Date|null} earliestUrgentDate - The earliest Date object among urgent tasks.
 */
function updateSummaryUI(metrics, earliestUrgentDate) {
  document.getElementById("metric-board").innerText = metrics.total;
  document.getElementById("metric-progress").innerText = metrics.inProgress;
  document.getElementById("metric-feedback").innerText =
    metrics.awaitingFeedback;
  document.getElementById("metric-urgent").innerText = metrics.urgent;
  document.getElementById("metric-todo").innerText = metrics.todo;
  document.getElementById("metric-done").innerText = metrics.done;

  const dateDisplay = document.getElementById("urgent-date-display");
  if (earliestUrgentDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    dateDisplay.innerText = earliestUrgentDate.toLocaleDateString(
      "en-US",
      options,
    );
  } else {
    dateDisplay.innerText = "No upcoming deadline";
  }
}
