const addButtonsList = document.querySelectorAll(".add-button");
const addTaskWindow = document.querySelector(".modal-overlay");
const saveTaskButton = addTaskWindow.querySelector(".save-task");
const cancelButton = addTaskWindow.querySelector(".cancel-task");

let parent = null;

let id = 0;

let currentDrag = null;
let isDragging = false;

const placeholder = document.createElement("div");
placeholder.classList.add("task", "placeholder");

let taskList = {
    "Not Started": [

    ],
    "In progress": [

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

    const editButton = createButton("edit-task-btn", "&#9999", () => handleEditTask(taskText));
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
        saveData();
    }
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


function dragNDropTask(task, taskElement) {

    taskElement.addEventListener("mousedown", (event) => {
        if (event.target.closest("button"))
            return;
        taskElement.classList.add("dragging");

        const rect = taskElement.getBoundingClientRect();
        taskElement.style.width = `${rect.width}px`;
        taskElement.style.height = `${rect.height}px`;

        taskElement.style.position = "absolute";
        taskElement.style.zIndex = 1000;

        currentDrag = {
            task: task,
            taskElement: taskElement,
            startX: event.clientX,
            startY: event.clientY,
            startElemPosX: rect.left,
            startElemPosY: rect.top,
            currentElemPosX: rect.left,
            currentElemPosY: rect.top,
        }

        taskElement.style.left = `${currentDrag.startElemPosX}px`;
        taskElement.style.top = `${currentDrag.startElemPosY}px`;

        isDragging = true;
    });

}

document.addEventListener("mousemove", (event) => {
    if (!isDragging)
        return
    const {
        startX,
        startY,
        taskElement
    } = currentDrag;

    const offsetX = event.clientX - startX;
    const offsetY = event.clientY - startY;

    let taskTop = parseInt(taskElement.style.top, 10);
    let taskLeft = parseInt(taskElement.style.left, 10);

    taskTop += offsetY;
    taskLeft += offsetX;

    currentDrag.currentElemPosX = taskLeft;
    currentDrag.currentElemPosY = taskTop;

    taskElement.style.left = `${taskLeft}px`;
    taskElement.style.top = `${taskTop}px`;

    currentDrag.startX = event.clientX;
    currentDrag.startY = event.clientY;

    const rect = taskElement.getBoundingClientRect();
    const midX = currentDrag.currentElemPosX + rect.width / 2;
    const midY = currentDrag.currentElemPosY + rect.height / 2;

    const targetColumn = getColumnAtPosition(midX, midY);

    if (targetColumn) {
        const index = getTaskIndexAtPosition(midY, targetColumn);

        if (index === null) {
            targetColumn.appendChild(placeholder);
        } else {
            const tasks = targetColumn.querySelectorAll(".task:not(.dragging):not(.placeholder)");
            targetColumn.insertBefore(placeholder, tasks[index]);
        }

    }

});

document.addEventListener("mouseup", (event) => {
    if (event.target.closest("button"))
        return;
    if (!isDragging || !currentDrag)
        return;

    isDragging = false;
    const { task, taskElement, currentElemPosX, currentElemPosY } = currentDrag;
    taskElement.classList.remove("dragging");
    const rect = taskElement.getBoundingClientRect();
    const midX = currentElemPosX + rect.width / 2;
    const midY = currentElemPosY + rect.height / 2;

    const targetColumn = getColumnAtPosition(midX, midY);
    if (placeholder.parentElement) {
        placeholder.remove();
    }
    if (targetColumn) {
        targetColumn.appendChild(taskElement);
        Object.keys(taskList).forEach(category => {
            taskList[category] = taskList[category].filter(t => t.id !== task.id);
        });
        const category = targetColumn.dataset.category;
        taskList[category].push({
            id: task.id,
            text: task.text,
        });
        saveData();
    }

    taskElement.style.position = "";
    taskElement.style.zIndex = "";
    taskElement.style.left = "";
    taskElement.style.top = "";
    taskElement.style.width = "";
    taskElement.style.height = "";

    currentDrag = null;
});



function getColumnAtPosition(x, y) {
    const columns = document.querySelectorAll(".kanban-column");
    for (const column of columns) {
        const rect = column.getBoundingClientRect();
        if (
            x > rect.left &&
            x < rect.right &&
            y > rect.top &&
            y < rect.bottom
        ) {
            return column;
        }
    }
    return null;
}

function getTaskIndexAtPosition(midY, column) {
    const tasks = Array.from(column.querySelectorAll(".task:not(.dragging):not(.placeholder)"));

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const rect = task.getBoundingClientRect();
        const taskMiddleY = rect.top + rect.height / 2;

        if (midY < taskMiddleY) {
            return i; // Before index
        }
    }

    return null; // End of column

}