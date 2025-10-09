export default class Subscriptions {
  taskInput = document.getElementById("taskInput");
  tagsInput = document.getElementById("tagsInput");
  taskOuterDiv = document.getElementById("taskOuterDiv");
  addButton = document.getElementById("addTask");
  completedCounter = document.getElementById("completedCounter");
  uncompletedCounter = document.getElementById("uncompletedCounter");
  searchInput = document.getElementById("searchInput");
  modalElement = document.getElementById("exampleModal");
  clearAllButton = document.getElementById("clearAllTasks");
  prioritySelect = document.getElementById("prioritySelect");
  filterAllButton = document.getElementById("filterAll");
  filterAllPriorityButton = document.getElementById("priorityFilterAll");
  filterLowButton = document.getElementById("priorityFilterLow");
  filterMediumButton = document.getElementById("priorityFilterMedium");
  filterHighButton = document.getElementById("priorityFilterHigh");
  filterPendingButton = document.getElementById("filterPending");
  filterCompletedButton = document.getElementById("filterCompleted");
  progressBar = document.getElementById("progressBar");
}
