const API_BASE_URL = "https://tudo-app-with-authentication-3.onrender.com";

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const todoForm = document.getElementById("todo-form");
const todoSection = document.getElementById("todo-section");
const authSection = document.getElementById("auth-section");
const todoList = document.getElementById("todo-list");
const logoutButton = document.getElementById("logout-button");
const messageEl = document.getElementById("message");

let authToken = localStorage.getItem("todoAuthToken") || null;

function showMessage(text, success = true) {
  messageEl.textContent = text;
  messageEl.style.color = success ? "#0f766e" : "#b91c1c";
}

function setAuthState(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("todoAuthToken", token);
    authSection.classList.add("hidden");
    todoSection.classList.remove("hidden");
    loadTodos();
  } else {
    localStorage.removeItem("todoAuthToken");
    authSection.classList.remove("hidden");
    todoSection.classList.add("hidden");
    todoList.innerHTML = "";
  }
}

async function registerUser(event) {
  event.preventDefault();
  const username = document.getElementById("register-username").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || "Registration failed");

    showMessage("Registration successful. Please login.");
    registerForm.reset();
  } catch (error) {
    showMessage(error.message, false);
  }
}

async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.error || "Login failed");

    setAuthState(data.token);
    showMessage("Login successful.");
    loginForm.reset();
  } catch (error) {
    showMessage(error.message, false);
  }
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`
  };
}

async function loadTodos() {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      headers: getAuthHeaders()
    });
    const todos = await response.json();
    if (!response.ok) throw new Error(todos.message || "Unable to load todos");
    renderTodos(todos);
  } catch (error) {
    showMessage(error.message, false);
  }
}

function renderTodos(todos) {
  todoList.innerHTML = "";
  if (!todos.length) {
    todoList.innerHTML = '<li class="todo-item">No todos yet. Add one!</li>';
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item ${todo.completed ? "completed" : ""}`;
    item.innerHTML = `
      <span class="title">${todo.title}</span>
      <div class="todo-actions">
        <button data-action="toggle" data-id="${todo._id}">${todo.completed ? "Undo" : "Complete"}</button>
        <button data-action="delete" data-id="${todo._id}" class="secondary">Delete</button>
      </div>
    `;
    todoList.appendChild(item);
  });
}

async function addTodo(event) {
  event.preventDefault();
  const title = document.getElementById("todo-title").value.trim();
  if (!title) return;

  try {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    const todo = await response.json();
    if (!response.ok) throw new Error(todo.message || "Unable to add todo");

    document.getElementById("todo-title").value = "";
    loadTodos();
    showMessage("Todo added successfully.");
  } catch (error) {
    showMessage(error.message, false);
  }
}

async function handleTodoClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;
  if (!id || !action) return;

  if (action === "toggle") {
    await toggleTodo(id);
  } else if (action === "delete") {
    await deleteTodo(id);
  }
}

async function toggleTodo(id) {
  try {
    const todoItem = document.querySelector(`button[data-id='${id}']`).closest(".todo-item");
    const completed = todoItem.classList.contains("completed");
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ completed: !completed })
    });
    const todo = await response.json();
    if (!response.ok) throw new Error(todo.message || "Unable to update todo");
    loadTodos();
  } catch (error) {
    showMessage(error.message, false);
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Unable to delete todo");
    loadTodos();
    showMessage("Todo deleted.");
  } catch (error) {
    showMessage(error.message, false);
  }
}

function logout() {
  setAuthState(null);
  showMessage("Logged out successfully.");
}

registerForm.addEventListener("submit", registerUser);
loginForm.addEventListener("submit", loginUser);
todoForm.addEventListener("submit", addTodo);
todoList.addEventListener("click", handleTodoClick);
logoutButton.addEventListener("click", logout);

setAuthState(authToken);
