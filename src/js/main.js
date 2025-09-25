import "../scss/styles.scss";
import * as bootstrap from "bootstrap";

let tasks = [];

const taskInput = document.getElementById("task-input");
const taskOuterDiv = document.getElementById("task-outer-div");
const addButton = document.getElementById("add-task");
const completedCounter = document.getElementById("completed-counter");
const uncompletedCounter = document.getElementById("uncompleted-counter");
const searchInput = document.getElementById("search-input");
const modalElement = document.getElementById("exampleModal");

addButton.addEventListener("click", handleClick);
taskOuterDiv.addEventListener("change", handleCheckbox);
searchInput.addEventListener("keyup", handleSearch);
document.addEventListener("DOMContentLoaded", renderTasks);
const clearAllButton = document.getElementById("clear-all-tasks");
clearAllButton.addEventListener("click", handleClearAll);

function handleClearAll() {
  tasks = [];

  renderTasks();
}
function renderTasks(tasksToRender = tasks) {
  //taskOuterDiv.innerHTML = "";

  tasksToRender.forEach((task) => {
    const completedClass = task.completed ? "completed" : "";

    const originalIndex = tasks.indexOf(task);

    taskOuterDiv.innerHTML += `
      <div class="col task-div">
        <div class="d-flex justify-content-between">
          <div class="col-7 d-flex justify-content-around justify-content-sm-start todo-list-body">
           <input type="checkbox" class="input-check" data-index="${originalIndex}" ${
      task.completed ? "checked" : ""
    }>
           <div class="flex-column ms-sm-2">
            <p class="task-name ${completedClass}" data-index="${originalIndex}">
                ${task.text}
            </p>
            <p
              class="text-muted"
              style="font-style: italic"
              id="set-date"
            >${task.date}</p>
            </div>
          </div>
          <button class="col-2 btn-edit" data-index="${originalIndex}">
            <i class="fa fa-edit"></i>
          </button>
          <button class="col-2 btn-trash" data-index="${originalIndex}">
            <i class="fa fa-trash"></i>
          </button>
        </div>
        <hr />
      </div>
    `;
  });

  attachDeleteListeners();
  attachEditListeners();
  updateCounters();
}

function updateCounters() {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const uncompletedTasks = tasks.length - completedTasks;

  completedCounter.textContent = completedTasks;
  uncompletedCounter.textContent = uncompletedTasks;
}

function handleCheckbox(event) {
  if (event.target.classList.contains("input-check")) {
    const index = event.target.dataset.index;
    const taskNameElement = document.querySelector(
      `.task-name[data-index="${index}"]`
    );

    taskNameElement.classList.toggle("completed");
    tasks[index].completed = event.target.checked;
    updateCounters();
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

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  let filteredTasks = tasks;

  if (searchTerm.length > 0) {
    filteredTasks = tasks.filter((task) =>
      task.text.toLowerCase().includes(searchTerm)
    );
  }
  renderTasks(filteredTasks);
}

function handleEdit(event) {
  const index = event.currentTarget.dataset.index;
  const taskTextElement = document.querySelector(
    `.task-name[data-index="${index}"]`
  );

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
  const index = event.currentTarget.dataset.index;
  const taskTextElement = document.querySelector(
    `.task-name[data-index="${index}"]`
  );
  const newText = taskTextElement.textContent.trim();

  if (newText.length === 0) {
    const myModal = new bootstrap.Modal(modalElement);
    myModal.show();
    taskTextElement.focus();
    return;
  }
  tasks[index].text = newText;

  taskTextElement.contentEditable = false;

  const saveButton = event.currentTarget;
  saveButton.innerHTML = `<i class="fa fa-edit"></i>`;
  saveButton.classList.remove("btn-save");
  saveButton.classList.add("btn-edit");

  renderTasks();
}

function handleDelete(event) {
  const index = event.currentTarget.dataset.index;
  tasks.splice(index, 1);
  renderTasks();
}

function handleClick() {
  const newTaskText = taskInput.value.trim();

  if (newTaskText.length === 0) {
    const myModal = new bootstrap.Modal(modalElement);
    myModal.show();
    return;
  }

  const newTask = {
    text: newTaskText,
    date: new Date().toDateString(),
    completed: false,
  };

  tasks.push(newTask);
  renderTasks();
  taskInput.value = "";
}
