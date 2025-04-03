const addButtonsList = document.querySelectorAll(".add-button");
const addTaskWindow = document.querySelector(".modal-overlay");
const saveTaskButton = addTaskWindow.querySelector(".save-task");
const cancelButton = addTaskWindow.querySelector(".cancel-task");

let parent = null;

let id = 0;

let taskList = {
    "Not Started": [

    ],
    "In Progress": [

    ],
    "Completed": [

    ],
}

addButtonsList.forEach(button => {
    button.addEventListener("click", () => {
        addTaskWindow.style.display = "flex";
        parent = button.parentElement;
    });
});

cancelButton.addEventListener("click", () => {
    addTaskWindow.querySelector(".task-input").value = "";
    addTaskWindow.style.display = "none";
});

saveTaskButton.addEventListener("click", () => {
    if (!parent) return;

    const taskLabel = addTaskWindow.querySelector(".task-input");
    const taskText = taskLabel.value.trim();
    const category = parent.dataset.category;

    if (taskText === "") {
        taskLabel.classList.add("error");

        setTimeout(() => {
            taskLabel.classList.remove("error");
        }, 400);

        return;
    }
    const taskObj = {
        id: ++id,
        text: taskText
    };
    taskList[category].push(taskObj);

    saveData();

    const newTask = createTaskElement(taskObj);
    parent.appendChild(newTask);

    addTaskWindow.style.display = "none";
    taskLabel.value = "";

    parent = null;
});

addEventListener("DOMContentLoaded", () => {
    id = +localStorage.getItem("id") || 0;
    taskList = JSON.parse(localStorage.getItem("tasks")) || {
        "Not Started": [],
        "In Progress": [],
        "Completed": []
    };
    document.querySelectorAll(".kanban-column").forEach(column => {
        const category = column.dataset.category;
        column.appendChild(renderTasks(taskList[category]));
    });

});

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("id", id);
}

function renderTasks(tasks) {
    const fragment = document.createDocumentFragment();
    tasks.forEach(task => {
        fragment.appendChild(createTaskElement(task));
    });
    return fragment;
}

function createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    const taskText = document.createElement("p");
    taskText.textContent = task.text;

    const editButton = createButton("edit-task-btn", "<span class='tilted-pencil'>&#9999;</span>", () => handleEditTask(taskText));
    const deleteButton = createButton("delete-task-btn", "X", () => handleDeleteTask(task, taskElement));

    taskText.addEventListener("blur", () => handleUpdateTask(task, taskText));
    taskText.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            taskText.blur();
        }
    });

    taskElement.append(taskText, editButton, deleteButton);

    dragNDropTask(task, taskElement);
    return taskElement;
}

function createButton(className, text, onClick) {
    const button = document.createElement("button");
    button.classList.add(className);
    button.innerHTML = text;
    button.addEventListener("click", onClick);
    return button;
}

function handleDeleteTask(task, taskElement) {
    const parentColumn = taskElement.parentElement;
    const columnType = parentColumn.dataset.category;
    const index = taskList[columnType].findIndex(t => t.id === task.id);

    if (index > -1) {
        taskList[columnType].splice(index, 1);
    }
    saveData();
    taskElement.remove();
}

function handleEditTask(taskText) {
    taskText.contentEditable = true;
    taskText.focus();
}

function handleUpdateTask(task, taskText) {
    taskText.contentEditable = false;
    const newText = taskText.textContent.trim();

    if (!newText) {
        taskText.textContent = task.text;
        return;
    }

    const parentColumn = taskText.parentElement.parentElement;
    const columnType = parentColumn.dataset.category;
    const index = taskList[columnType].findIndex(t => t.id === task.id);

    if (index > -1) {
        taskList[columnType][index].text = newText;
        saveData();
    }
}