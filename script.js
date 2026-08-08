// Get references to the input field, button, and task list
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");

// Key used to store tasks in localStorage
const STORAGE_KEY = "todo-tasks";

// Our task list lives in memory while the page is open
let tasks = [];

// Track which filter is currently selected
let currentFilter = "all";

// Save the current task list to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Return only the tasks that match the current filter
function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter(function (task) {
      return !task.completed;
    });
  }

  if (currentFilter === "completed") {
    return tasks.filter(function (task) {
      return task.completed;
    });
  }

  return tasks;
}

// Show tasks on the page based on the current filter
function renderTasks() {
  const filteredTasks = getFilteredTasks();

  taskList.innerHTML = "";

  filteredTasks.forEach(function (task) {
    taskList.appendChild(createTaskElement(task));
  });
}

// Update which filter button looks selected
function updateFilterButtons() {
  filterButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

// Switch to a different filter
function setFilter(filter) {
  currentFilter = filter;
  updateFilterButtons();
  renderTasks();
}

// Load saved tasks when the page opens
function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  // If nothing is saved yet, start with an empty list
  if (!savedTasks) {
    tasks = [];
    renderTasks();
    return;
  }

  tasks = JSON.parse(savedTasks);
  renderTasks();
}

// Build one task element from a task object
function createTaskElement(task) {
  const taskItem = document.createElement("li");
  taskItem.className = "task-item";
  taskItem.dataset.id = task.id;

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  const taskTextElement = document.createElement("span");
  taskTextElement.className = "task-text";
  taskTextElement.textContent = task.text;

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", editTask);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", deleteTask);

  const taskActions = document.createElement("div");
  taskActions.className = "task-actions";
  taskActions.appendChild(editBtn);
  taskActions.appendChild(deleteBtn);

  taskItem.appendChild(taskTextElement);
  taskItem.appendChild(taskActions);
  taskItem.addEventListener("click", toggleComplete);

  return taskItem;
}

// This function runs when the user clicks "Add Task"
function addTask() {
  const taskText = taskInput.value.trim();

  // Don't add empty tasks
  if (taskText === "") {
    return;
  }

  const newTask = {
    id: Date.now(),
    text: taskText,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
}

// Toggle the "completed" state when a task is clicked
function toggleComplete(event) {
  // Don't toggle while the user is editing this task
  if (event.currentTarget.classList.contains("editing")) {
    return;
  }

  const taskItem = event.currentTarget;
  const taskId = Number(taskItem.dataset.id);
  const task = tasks.find(function (item) {
    return item.id === taskId;
  });

  if (!task) {
    return;
  }

  task.completed = !task.completed;
  saveTasks();
  renderTasks();
}

// Let the user edit a task's text
function editTask(event) {
  event.stopPropagation();

  const taskItem = event.currentTarget.closest(".task-item");
  const taskId = Number(taskItem.dataset.id);
  const task = tasks.find(function (item) {
    return item.id === taskId;
  });

  if (!task || taskItem.classList.contains("editing")) {
    return;
  }

  taskItem.classList.add("editing");

  const taskTextElement = taskItem.querySelector(".task-text");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task-edit-input";
  editInput.value = task.text;

  taskTextElement.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  function finishEdit(shouldSave) {
    if (shouldSave) {
      const newText = editInput.value.trim();

      // Don't allow an empty task
      if (newText === "") {
        alert("Task cannot be empty.");
        editInput.focus();
        return;
      }

      task.text = newText;
      saveTasks();
    }

    renderTasks();
  }

  editInput.addEventListener("keydown", function (event) {
    event.stopPropagation();

    if (event.key === "Enter") {
      finishEdit(true);
    }

    if (event.key === "Escape") {
      finishEdit(false);
    }
  });
}

// Remove only the clicked task from the list
function deleteTask(event) {
  event.stopPropagation();

  const taskItem = event.currentTarget.closest(".task-item");
  const taskId = Number(taskItem.dataset.id);

  tasks = tasks.filter(function (item) {
    return item.id !== taskId;
  });

  saveTasks();
  renderTasks();
}

// Load saved tasks as soon as the page opens
loadTasks();

// Run addTask when the button is clicked
addBtn.addEventListener("click", addTask);

// Run setFilter when a filter button is clicked
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    setFilter(button.dataset.filter);
  });
});
