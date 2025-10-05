import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

const API_URL = "http://localhost:5000/tasks";

let tasks = [];
let currentFilter = "all";

const taskInput = document.getElementById("task-input");
const taskOuterDiv = document.getElementById("task-outer-div");
const addButton = document.getElementById("add-task");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchInput = document.getElementById("search-input");
const modalElement = document.getElementById("exampleModal");
const clearAllButton = document.getElementById("clear-all-tasks");
const prioritySelect = document.getElementById("priority-select");
const filterAllButton = document.getElementById("filter-all");
const filterPendingButton = document.getElementById("filter-pending");
const filterCompletedButton = document.getElementById("filter-completed");
const progressBar = document.getElementById("progress-bar");

addButton.addEventListener("click", handleAddTask);
taskOuterDiv.addEventListener("change", handleCheckbox);
searchInput.addEventListener("keyup", displayTasks);
clearAllButton.addEventListener("click", handleClearAll);
filterAllButton.addEventListener("click", () => setFilter("all"));
filterPendingButton.addEventListener("click", () => setFilter("pending"));
filterCompletedButton.addEventListener("click", () => setFilter("completed"));

window.addEventListener("DOMContentLoaded", fetchTasks);

async function fetchTasks() {
	const res = await fetch(API_URL);
	tasks = await res.json();
	displayTasks();
}

function setFilter(filter) {
	currentFilter = filter;
	displayTasks();
}

async function handleAddTask() {
	const title = taskInput.value.trim();
	const priority = prioritySelect.value;

	if (!title) {
		new bootstrap.Modal(modalElement).show();
		return;
	}

	const res = await fetch(API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title, priority }),
	});

	const newTask = await res.json();
	tasks.push(newTask);
	displayTasks();
	taskInput.value = "";
}

async function handleCheckbox(e) {
	if (!e.target.classList.contains("input-check")) return;

	const id = e.target.dataset.id;
	const task = tasks.find((t) => t.id === id);
	if (!task) return;

	task.isCompleted = e.target.checked;

	await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ isCompleted: task.isCompleted }),
	});

	displayTasks();
}

async function handleDelete(e) {
	const id = e.currentTarget.dataset.id;
	await fetch(`${API_URL}/${id}`, { method: "DELETE" });
	tasks = tasks.filter((t) => t.id !== id);
	displayTasks();
}

async function handleClearAll() {
	await fetch(API_URL, { method: "DELETE" });
	tasks = [];
	displayTasks();
}

function renderTasks(tasksToRender) {
	taskOuterDiv.innerHTML = "";

	if (tasksToRender.length === 0) {
		taskOuterDiv.innerHTML = `<p class="text-center text-muted">No tasks to show.</p>`;
		updateCounters();
		return;
	}

	tasksToRender.forEach((task) => {
		taskOuterDiv.innerHTML += `
      <div class="col task-div">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <input type="checkbox" class="input-check me-3" data-id="${
							task.id
						}" ${task.isCompleted ? "checked" : ""}>
            <div class="flex-column">
              <p class="task-name ${
								task.isCompleted ? "completed" : ""
							}" data-id="${task.id}">${task.title}</p>
              <p class="text-muted" style="font-style: italic;">Created: ${new Date(
								task.createdAt
							).toLocaleString()}</p>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="ms-2 priority-tag priority-${task.priority.toLowerCase()}">${
			task.priority
		}</span>
            <button class="btn-edit ms-2" data-id="${
							task.id
						}"><i class="fa fa-edit"></i></button>
            <button class="btn-trash ms-2" data-id="${
							task.id
						}"><i class="fa fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
	});

	document
		.querySelectorAll(".btn-trash")
		.forEach((btn) => btn.addEventListener("click", handleDelete));
	document
		.querySelectorAll(".btn-edit")
		.forEach((btn) => btn.addEventListener("click", handleEdit));

	updateCounters();
}

function displayTasks() {
	let filtered = tasks;

	if (currentFilter === "pending")
		filtered = tasks.filter((t) => !t.isCompleted);
	else if (currentFilter === "completed")
		filtered = tasks.filter((t) => t.isCompleted);

	const searchTerm = searchInput.value.toLowerCase().trim();
	if (searchTerm)
		filtered = filtered.filter((t) =>
			t.title.toLowerCase().includes(searchTerm)
		);

	renderTasks(filtered);
}

function updateCounters() {
	const completed = tasks.filter((t) => t.isCompleted).length;
	completedCounter.textContent = completed;
	uncompletedCounter.textContent = tasks.length - completed;
	const progress = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
	progressBar.style.width = `${progress}%`;
	progressBar.setAttribute("aria-valuenow", progress);
}

function handleEdit(e) {
	const id = e.currentTarget.dataset.id;
	const el = document.querySelector(`.task-name[data-id="${id}"]`);
	el.contentEditable = true;
	el.focus();
	e.currentTarget.innerHTML = `<i class="fa fa-save"></i>`;
	e.currentTarget.onclick = () => handleSave(e.currentTarget, id, el);
}

async function handleSave(btn, id, el) {
	const newTitle = el.textContent.trim();
	if (!newTitle) {
		new bootstrap.Modal(modalElement).show();
		return;
	}

	const res = await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ title: newTitle }),
	});

	const updatedTask = await res.json();
	tasks = tasks.map((t) => (t.id === id ? updatedTask : t));
	el.contentEditable = false;
	btn.innerHTML = `<i class="fa fa-edit"></i>`;
	btn.onclick = handleEdit;
	displayTasks();
}
