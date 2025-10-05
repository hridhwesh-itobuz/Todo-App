import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

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

addButton.addEventListener("click", handleClick);
taskOuterDiv.addEventListener("change", handleCheckbox);
searchInput.addEventListener("keyup", handleSearch);
clearAllButton.addEventListener("click", handleClearAll);
filterAllButton.addEventListener("click", () => setFilter("all"));
filterPendingButton.addEventListener("click", () => setFilter("pending"));
filterCompletedButton.addEventListener("click", () => setFilter("completed"));

function setFilter(filter) {
	currentFilter = filter;
	displayTasks();
}

function handleClearAll() {
	tasks = [];
	displayTasks();
}

function displayTasks() {
	let filteredTasks = tasks;

	// Apply filter
	if (currentFilter === "pending") {
		filteredTasks = tasks.filter((task) => !task.completed);
	} else if (currentFilter === "completed") {
		filteredTasks = tasks.filter((task) => task.completed);
	}

	// Apply search
	const searchTerm = searchInput.value.toLowerCase().trim();
	if (searchTerm.length > 0) {
		filteredTasks = filteredTasks.filter((task) =>
			task.text.toLowerCase().includes(searchTerm)
		);
	}

	renderTasks(filteredTasks);
}

function renderTasks(tasksToRender) {
	taskOuterDiv.innerHTML = "";

	if (tasksToRender.length === 0) {
		taskOuterDiv.innerHTML = `<p class="text-center text-muted">No tasks to show.</p>`;
	} else {
		tasksToRender.forEach((task) => {
			const completedClass = task.completed ? "completed" : "";
			taskOuterDiv.innerHTML += `
        <div class="col task-div">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <input type="checkbox" class="input-check me-3" data-id="${
								task.id
							}" ${task.completed ? "checked" : ""}>
              <div class="flex-column">
                <p class="task-name ${completedClass}" data-id="${task.id}">${
				task.text
			}</p>
                <p class="text-muted" style="font-style: italic; margin-right:10px;">${
									task.date
								}</p>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <span class="priority-tag priority-${task.priority.toLowerCase()}">${
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
	}

	attachDeleteListeners();
	attachEditListeners();
	updateCounters();
}

function updateCounters() {
	const completedTasks = tasks.filter((task) => task.completed).length;
	const uncompletedTasks = tasks.length - completedTasks;

	completedCounter.textContent = completedTasks;
	uncompletedCounter.textContent = uncompletedTasks;

	const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
	progressBar.style.width = `${progress}%`;
	progressBar.setAttribute("aria-valuenow", progress);
}

function handleCheckbox(event) {
	if (event.target.classList.contains("input-check")) {
		const id = event.target.dataset.id;
		const task = tasks.find((t) => t.id == id);
		task.completed = event.target.checked;
		displayTasks();
	}
}

function attachDeleteListeners() {
	document.querySelectorAll(".btn-trash").forEach((button) => {
		button.addEventListener("click", handleDelete);
	});
}

function attachEditListeners() {
	document.querySelectorAll(".btn-edit").forEach((button) => {
		button.addEventListener("click", handleEdit);
	});
}

function handleSearch() {
	displayTasks();
}

function handleEdit(event) {
	const id = event.currentTarget.dataset.id;
	const taskTextElement = document.querySelector(`.task-name[data-id="${id}"]`);

	taskTextElement.contentEditable = true;
	taskTextElement.focus();

	const editButton = event.currentTarget;
	editButton.innerHTML = `<i class="fa fa-save"></i>`;
	editButton.classList.remove("btn-edit");
	editButton.classList.add("btn-save");

	editButton.removeEventListener("click", handleEdit);
	editButton.addEventListener("click", handleSave);
}

function handleSave(event) {
	const id = event.currentTarget.dataset.id;
	const taskTextElement = document.querySelector(`.task-name[data-id="${id}"]`);
	const newText = taskTextElement.textContent.trim();

	if (newText.length === 0) {
		const myModal = new bootstrap.Modal(modalElement);
		myModal.show();
		taskTextElement.focus();
		return;
	}
	const task = tasks.find((t) => t.id == id);
	task.text = newText;
	taskTextElement.contentEditable = false;

	const saveButton = event.currentTarget;
	saveButton.innerHTML = `<i class="fa fa-edit"></i>`;
	saveButton.classList.remove("btn-save");
	saveButton.classList.add("btn-edit");

	displayTasks();
}

function handleDelete(event) {
	const id = event.currentTarget.dataset.id;
	tasks = tasks.filter((t) => t.id != id);
	displayTasks();
}

function handleClick() {
	const newTaskText = taskInput.value.trim();

	if (newTaskText.length === 0) {
		const myModal = new bootstrap.Modal(modalElement);
		myModal.show();
		return;
	}

	const newTask = {
		id: Date.now(),
		text: newTaskText,
		date: new Date().toDateString(),
		completed: false,
		priority: prioritySelect.options[prioritySelect.selectedIndex].text,
	};

	tasks.push(newTask);
	displayTasks();
	taskInput.value = "";

	setTimeout(() => {
		taskOuterDiv.lastElementChild?.scrollIntoView({ behavior: "smooth" });
	}, 100);
}
