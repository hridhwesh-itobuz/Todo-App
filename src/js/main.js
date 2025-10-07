import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

const API_URL = "http://localhost:3000/tasks";

let tasks = [];
let currentFilter = "all";
let priorityFilter = "all";

const taskInput = document.getElementById("task-input");
const tagsInput = document.getElementById("tags-input");
const taskOuterDiv = document.getElementById("task-outer-div");
const addButton = document.getElementById("add-task");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchInput = document.getElementById("search-input");
const modalElement = document.getElementById("exampleModal");
const clearAllButton = document.getElementById("clear-all-tasks");
const prioritySelect = document.getElementById("priority-select");
const filterAllButton = document.getElementById("filter-all");
const filterAllPriorityButton = document.getElementById("priority-filter-all");
const filterLowButton = document.getElementById("filter-low");
const filterMediumButton = document.getElementById("filter-medium");
const filterHighButton = document.getElementById("filter-high");
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
filterAllPriorityButton.addEventListener("click", () =>
  setPriorityFilter("all")
);
filterLowButton.addEventListener("click", () => setPriorityFilter("low"));
filterMediumButton.addEventListener("click", () => setPriorityFilter("medium"));
filterHighButton.addEventListener("click", () => setPriorityFilter("high"));
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
function setPriorityFilter(filter) {
  priorityFilter = filter;
  displayTasks();
}

async function handleAddTask() {
  const title = taskInput.value.trim();
  const priority = prioritySelect.value;
  const tagsValue = tagsInput.value;
  const tags = tagsValue
    ? tagsValue.split(/[\s,]+/).map((tag) => tag.trim().toLowerCase())
    : [];

  if (!title) {
    new bootstrap.Modal(modalElement).show();
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, tags }),
  });

  const newTask = await res.json();
  tasks.push(newTask);

  displayTasks();
  taskInput.value = "";
  tagsInput.value = "";
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
      <div class="col task-div" data-id="${task.id}">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <input type="checkbox" class="input-check me-3" data-id="${
              task.id
            }" ${task.isCompleted ? "checked" : ""}>
            <div class="flex-column">
              <p class="task-name ${
                task.isCompleted ? "completed" : ""
              }" data-id="${task.id}">${task.title}</p>
              <p class="text-muted mb-0" style="font-style: italic;">Created: ${new Date(
                task.createdAt
              ).toLocaleString()}</p>
			  <p class="text-muted" style="font-style: italic;">Updated: ${new Date(
          task.updatedAt
        ).toLocaleString()}</p>
			   <div class="d-flex flex-wrap tags-container">
            ${(task.tags ?? [])
              .map(
                (tag) =>
                  `<span class="badge bg-info text-dark me-1" title="Tag: ${tag}">#${tag}</span>`
              )
              .join("")}
          </div>
            </div>
          </div>
          <div class="d-flex align-items-center">
<span class="ms-2 priority-tag priority-display priority-${task.priority.toLowerCase()}">${
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

  if (currentFilter === "pending") {
    filtered = filtered.filter((t) => !t.isCompleted);
  } else if (currentFilter === "completed") {
    filtered = filtered.filter((t) => t.isCompleted);
  }

  if (priorityFilter !== "all") {
    filtered = filtered.filter(
      (t) => t.priority.toLowerCase() === priorityFilter
    );
  }

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filtered = filtered.filter((t) =>
      t.title.toLowerCase().includes(searchTerm)
    );
  }

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
  const taskElement = document.querySelector(`.col.task-div[data-id="${id}"]`);

  const titleEl = taskElement.querySelector(".task-name");
  titleEl.contentEditable = true;
  titleEl.focus();

  const priorityTagEl = taskElement.querySelector(".priority-display");
  if (priorityTagEl) {
    const currentPriority = priorityTagEl.textContent;
    const prioritySelectHtml = `
      <select class="form-select form-select-sm ms-2 editable-priority-select">
        <option value="high" ${
          currentPriority === "high" ? "selected" : ""
        }>High</option>
        <option value="medium" ${
          currentPriority === "medium" ? "selected" : ""
        }>Medium</option>
        <option value="low" ${
          currentPriority === "low" ? "selected" : ""
        }>Low</option>
      </select>
    `;
    priorityTagEl.outerHTML = prioritySelectHtml;
  }

  const tagsContainerEl = taskElement.querySelector(".tags-container");
  if (tagsContainerEl) {
    const currentTags = Array.from(tagsContainerEl.querySelectorAll(".badge"))
      .map((el) => el.textContent.substring(1))
      .join(", ");
    const tagsInputHtml = `<input type="text" class="form-control form-control-sm ms-2 editable-tags-input" value="${currentTags}" placeholder="Add tags...">`;
    tagsContainerEl.outerHTML = tagsInputHtml;
  }

  const editBtn = e.currentTarget;
  editBtn.innerHTML = `<i class="fa fa-save"></i>`;
  editBtn.onclick = () => handleSave(editBtn, id, taskElement);
}

async function handleSave(btn, id, taskElement) {
  const newTitle = taskElement.querySelector(".task-name").textContent.trim();
  const newPriority = taskElement.querySelector(
    ".editable-priority-select"
  ).value;
  const newTagsValue = taskElement.querySelector(".editable-tags-input").value;

  const newTags = newTagsValue
    ? newTagsValue.split(/[\s,]+/).map((tag) => tag.trim().toLowerCase())
    : [];

  if (!newTitle) {
    new bootstrap.Modal(modalElement).show();
    return;
  }

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTitle,
      priority: newPriority,
      tags: newTags,
    }),
  });

  const updatedTask = await res.json();
  tasks = tasks.map((t) => (t.id === id ? updatedTask : t));

  btn.innerHTML = `<i class="fa fa-edit"></i>`;
  btn.onclick = handleEdit;
  displayTasks();
}
