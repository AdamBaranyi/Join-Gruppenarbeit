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
  const elements = getSplashElements();

  prepareSplashScreen(elements);
  startSplashTransition(
    elements.greetingContainer,
    elements.summaryContent,
    elements.mobileSidebar,
    elements.metricsContainer,
    elements.headerContainer,
  );
}

/**
 * Gets all splash screen related elements.
 * @returns {Object} Object containing all splash elements.
 */
function getSplashElements() {
  return {
    mobileSidebar: document.querySelector(".mobile-sidebar"),
    summaryContent: document.querySelector(".summary-content"),
    metricsContainer: document.querySelector(".metrics-container"),
    headerContainer: document.querySelector(".summary-header-container"),
    greetingContainer: document.querySelector(".greeting-container")
  };
}

/**
 * Prepares the splash screen by showing greeting and hiding dashboard.
 * @param {Object} elements - The splash elements object.
 */
function prepareSplashScreen(elements) {
  if (elements.summaryContent) elements.summaryContent.classList.add("splash-active");
  showGreetingForSplash(elements.greetingContainer);
  hideDashboardElements(elements.mobileSidebar, elements.metricsContainer, elements.headerContainer);
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
    const onComplete = () => showDashboard(summaryContent, mobileSidebar, metricsContainer, headerContainer);
    fadeOutGreeting(greetingContainer, onComplete);
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
  const elements = getGreetingElements();
  const userData = getUserDataFromSession();
  const greetingText = formatGreetingText(userData.userName);

  updateGreetingDisplay(elements, greetingText, userData);
}

/**
 * Gets all greeting-related DOM elements.
 * @returns {Object} Object containing greeting elements.
 */
function getGreetingElements() {
  return {
    timeElement: document.getElementById("greeting-time"),
    nameElement: document.getElementById("greeting-name"),
    userInitialsElement: document.querySelector(".user-profile-initials")
  };
}

/**
 * Gets user data from session storage.
 * @returns {Object} Object with userName and userInitials.
 */
function getUserDataFromSession() {
  let user = JSON.parse(sessionStorage.getItem("current_user"));
  let userName = "Guest";
  let userInitials = "G";

  if (user && user.name) {
    userName = user.name;
    userInitials = getInitials(userName);
  }

  return { userName, userInitials };
}

/**
 * Formats the greeting text based on user name.
 * @param {string} userName - The user's name.
 * @returns {string} The formatted greeting text.
 */
function formatGreetingText(userName) {
  let greetingText = getGreetingByTime();
  if (userName === "Guest") {
    greetingText = greetingText.slice(0, -1) + "!";
  }
  return greetingText;
}

/**
 * Updates the greeting display elements.
 * @param {Object} elements - The greeting elements.
 * @param {string} greetingText - The greeting text.
 * @param {Object} userData - The user data object.
 */
function updateGreetingDisplay(elements, greetingText, userData) {
  if (elements.timeElement) elements.timeElement.innerText = greetingText;
  if (elements.userInitialsElement) elements.userInitialsElement.innerText = userData.userInitials;

  if (elements.nameElement) {
    elements.nameElement.innerText = userData.userName === "Guest" ? "" : userData.userName;
  }
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
 * Fetches all tasks from Firebase and calculates metrics.
 */
async function loadSummaryMetrics() {
  try {
    const tasks = await fetchTasksFromFirebase();
    const metrics = calculateTaskMetrics(tasks);
    const earliestUrgentDate = findEarliestUrgentDate(tasks);

    updateSummaryUI(metrics, earliestUrgentDate);
  } catch (e) {
    console.error("Error loading summary metrics:", e);
  }
}

/**
 * Fetches tasks from Firebase.
 * @async
 * @returns {Array} The tasks array.
 */
async function fetchTasksFromFirebase() {
  const response = await fetch(BASE_URL + "/tasks.json");
  const data = (await response.json()) || {};
  return Object.values(data);
}

/**
 * Calculates task metrics from tasks array.
 * @param {Array} tasks - The tasks array.
 * @returns {Object} The metrics object.
 */
function calculateTaskMetrics(tasks) {
  let metrics = {
    total: tasks.length,
    todo: 0,
    inProgress: 0,
    awaitingFeedback: 0,
    done: 0,
    urgent: 0,
  };

  tasks.forEach((task) => {
    incrementStatusMetric(metrics, task.status);
    if (task.priority === "Urgent") metrics.urgent++;
  });

  return metrics;
}

/**
 * Increments the metric for a specific status.
 * @param {Object} metrics - The metrics object.
 * @param {string} status - The task status.
 */
function incrementStatusMetric(metrics, status) {
  if (status === "todo") metrics.todo++;
  else if (status === "inProgress") metrics.inProgress++;
  else if (status === "awaitingFeedback") metrics.awaitingFeedback++;
  else if (status === "done") metrics.done++;
}

/**
 * Finds the earliest urgent task date.
 * @param {Array} tasks - The tasks array.
 * @returns {Date|null} The earliest date or null.
 */
function findEarliestUrgentDate(tasks) {
  let earliestDate = null;

  tasks.forEach((task) => {
    if (task.priority === "Urgent" && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      if (!earliestDate || taskDate < earliestDate) {
        earliestDate = taskDate;
      }
    }
  });

  return earliestDate;
}



/**
 * Updates the summary HTML numbers and the urgent deadline text.
 *
 * @param {Object} metrics - Object mapping statuses to numbers.
 * @param {Date|null} earliestUrgentDate - The earliest Date object among urgent tasks.
 */
function updateSummaryUI(metrics, earliestUrgentDate) {
  updateMetricsDisplay(metrics);
  updateUrgentDateDisplay(earliestUrgentDate);
}

/**
 * Updates all metric displays with current values.
 * @param {Object} metrics - The metrics object.
 */
function updateMetricsDisplay(metrics) {
  document.getElementById("metric-board").innerText = metrics.total;
  document.getElementById("metric-progress").innerText = metrics.inProgress;
  document.getElementById("metric-feedback").innerText = metrics.awaitingFeedback;
  document.getElementById("metric-urgent").innerText = metrics.urgent;
  document.getElementById("metric-todo").innerText = metrics.todo;
  document.getElementById("metric-done").innerText = metrics.done;
}

/**
 * Updates the urgent date display.
 * @param {Date|null} earliestUrgentDate - The earliest urgent date.
 */
function updateUrgentDateDisplay(earliestUrgentDate) {
  const dateDisplay = document.getElementById("urgent-date-display");

  if (earliestUrgentDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    dateDisplay.innerText = earliestUrgentDate.toLocaleDateString("en-US", options);
  } else {
    dateDisplay.innerText = "No upcoming deadline";
  }
}
