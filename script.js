const addButtonsList = document.querySelectorAll(".add-button");
const addTaskWindow = document.querySelector(".modal-overlay");
const saveTaskButton = addTaskWindow.querySelector(".save-task");
const cancelButton = addTaskWindow.querySelector(".cancel-task");

let parent = null;

let id = 0;

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

    taskList[category].push({
        "id": ++id,
        "text": taskText,
    });

    saveData();

    const newTask = createTaskElement({ text: taskText });
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

    const editButton = document.createElement("button");
    editButton.classList.add("edit-task-btn");
    editButton.innerHTML = "&#9999"; // Карандаш

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-task-btn");
    deleteButton.textContent = "X";

    taskElement.appendChild(taskText);
    taskElement.appendChild(editButton);
    taskElement.appendChild(deleteButton);

    return taskElement;
}
