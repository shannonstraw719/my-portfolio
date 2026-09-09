// Get the elements from the page
const taskInput = document.getElementById("taskInput");
const dueDateInput = document.getElementById("dueDateInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-button");
const taskCount = document.getElementById("taskCount");
const clearCompletedButton = document.getElementById("clearCompletedButton");

// Load saved tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText === "") {
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);

    saveTasks();

    taskInput.value = "";
    dueDateInput.value = "";

    displayTasks();
}

// Check if a task is overdue
function isOverdue(task) {
    if (!task.dueDate || task.completed) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate + "T00:00:00");

    return dueDate < today;
}

// Format the date for display
function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// Display tasks
function displayTasks(filter = "all") {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (filter === "active") {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    if (filter === "completed") {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    filteredTasks.forEach(task => {

        // Create task container
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        if (isOverdue(task)) {
            listItem.classList.add("overdue");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            toggleTask(task.id);
        });

        // Task information container
        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        // Task text
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        taskInfo.appendChild(taskText);

        // Due date
        if (task.dueDate) {
            const dueDate = document.createElement("span");
            dueDate.className = "due-date";

            if (isOverdue(task)) {
                dueDate.textContent = `Overdue: ${formatDate(task.dueDate)}`;
            } else {
                dueDate.textContent = `Due: ${formatDate(task.dueDate)}`;
            }

            taskInfo.appendChild(dueDate);
        }

        // Edit button
        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            startEditing(task.id);
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        // Add everything to task
        listItem.appendChild(checkbox);
        listItem.appendChild(taskInfo);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);
    });

    updateTaskCount();
}

// Start editing a task
function startEditing(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    const listItems = document.querySelectorAll(".task-item");

    listItems.forEach(listItem => {

        const taskText = listItem.querySelector(".task-text");

        if (taskText.textContent === task.text) {

            // Create edit input
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.className = "edit-input";
            editInput.value = task.text;

            // Create Save button
            const saveButton = document.createElement("button");
            saveButton.className = "save-button";
            saveButton.textContent = "Save";

            saveButton.addEventListener("click", () => {
                saveEdit(id, editInput.value);
            });

            // Create Cancel button
            const cancelButton = document.createElement("button");
            cancelButton.className = "cancel-button";
            cancelButton.textContent = "Cancel";

            cancelButton.addEventListener("click", () => {
                displayTasks();
            });

            listItem.replaceChild(editInput, listItem.querySelector(".task-info"));

            const editButton = listItem.querySelector(".edit-button");
            const deleteButton = listItem.querySelector(".delete-button");

            editButton.replaceWith(saveButton);
            deleteButton.replaceWith(cancelButton);

            editInput.focus();
        }
    });
}

// Save edited task
function saveEdit(id, newText) {
    const updatedText = newText.trim();

    if (updatedText === "") {
        return;
    }

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                text: updatedText
            };
        }

        return task;
    });

    saveTasks();
    displayTasks();
}

// Update task counter
function updateTaskCount() {
    const remainingTasks = tasks.filter(task => !task.completed).length;

    if (remainingTasks === 1) {
        taskCount.textContent = "1 task remaining";
    } else {
        taskCount.textContent = `${remainingTasks} tasks remaining`;
    }
}

// Complete or uncomplete a task
function toggleTask(id) {
    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    displayTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    displayTasks();
}

// Clear completed tasks
clearCompletedButton.addEventListener("click", () => {

    tasks = tasks.filter(task => !task.completed);

    saveTasks();
    displayTasks();
});

// Add task with button
addTaskButton.addEventListener("click", addTask);

// Add task with Enter
taskInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        addTask();
    }
});

// Filter buttons
filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(button => {
            button.classList.remove("active");
        });

        button.classList.add("active");

        displayTasks(button.dataset.filter);
    });
});

// Display saved tasks when page loads
displayTasks();