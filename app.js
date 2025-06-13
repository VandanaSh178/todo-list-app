// JavaScript to make the to-do app interactive

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskList = document.querySelector(".task-list");
const progressBar = document.querySelector(".progress");
const statsNumber = document.getElementById("numbers");
const toggleThemeBtn = document.getElementById("toggleTheme");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let filter = "all";
let timerIntervals = {};
let confettiFired = false;

// Load tasks from localStorage
const savedTasks = localStorage.getItem("todoTasks");
if (savedTasks) {
  tasks = JSON.parse(savedTasks);
}

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-theme");
}

// Add task
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (taskText !== "") {
    tasks.push({
      text: taskText,
      completed: false,
      priority: priority,
      duration: 1500,
      timeLeft: 1500,
      timerRunning: false,
    });
    taskInput.value = "";
    prioritySelect.value = "medium";
    renderTasks();
  }
});

// Toggle task completion or delete task
function handleTaskAction(e, index) {
  if (e.target.type === "checkbox") {
    tasks[index].completed = e.target.checked;
  } else if (e.target.classList.contains("delete-btn")) {
    clearInterval(timerIntervals[index]);
    delete timerIntervals[index];
    tasks.splice(index, 1);
  }
  renderTasks();
}

// Filter tasks
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    renderTasks();
  });
});

// Toggle theme
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  const currentTheme = document.body.classList.contains("light-theme") ? "light" : "dark";
  localStorage.setItem("theme", currentTheme);
});

// Render task list
function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;
  if (filter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  } else if (filter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""}>
      <span>${task.text}</span>
      <span class="priority-badge ${task.priority}">${task.priority}</span>
      <span class="timer" id="timer-${index}">${formatTime(task.timeLeft)}</span>
      <button class="start-timer" data-index="${index}">▶️</button>
      <button class="delete-btn">&times;</button>
    `;

    li.querySelector("input").addEventListener("change", (e) => handleTaskAction(e, index));
    li.querySelector(".delete-btn").addEventListener("click", (e) => handleTaskAction(e, index));
    li.querySelector(".start-timer").addEventListener("click", () => toggleTimer(index));

    taskList.appendChild(li);
  });

  updateStats();
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// Update progress and stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  statsNumber.textContent = `${completed} / ${total}`;
  progressBar.style.width = `${percentage}%`;

  if (percentage === 100 && total > 0 && !confettiFired) {
    confettiFired = true;
    fireConfetti();
  } else if (percentage < 100) {
    confettiFired = false;
  }
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00ff99', '#ff33cc', '#3333ff', '#ffff00']
  });
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = (seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function toggleTimer(index) {
  const task = tasks[index];

  if (task.timerRunning) {
    clearInterval(timerIntervals[index]);
    task.timerRunning = false;
  } else {
    task.timerRunning = true;
    timerIntervals[index] = setInterval(() => {
      if (task.timeLeft > 0) {
        task.timeLeft--;
        document.getElementById(`timer-${index}`).textContent = formatTime(task.timeLeft);
        localStorage.setItem("todoTasks", JSON.stringify(tasks));
      } else {
        clearInterval(timerIntervals[index]);
        task.timerRunning = false;
        alert(`⏰ Time's up for: "${task.text}"`);
      }
    }, 1000);
  }
}

// Initial render
renderTasks();