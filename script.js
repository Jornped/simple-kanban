const addButtonsList = document.querySelectorAll(".add-button");
const addTaskWindow = document.querySelector(".modal-overlay");
const saveTaskButton = addTaskWindow.querySelector(".save-task");
const cancelButton = addTaskWindow.querySelector(".cancel-task");

let parent = null;

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

    if (taskText === "") {
        taskLabel.classList.add("error");

        setTimeout(() => {
            taskLabel.classList.remove("error");
        }, 400); // Убираем эффект через 400 мс

        return; // Не даем добавить пустой таск
    }

    const newTask = document.createElement("div");
    newTask.classList.add("task");

    const taskTextElement = document.createElement("p");
    taskTextElement.textContent = taskText;

    const editButton = document.createElement("button");
    editButton.classList.add("edit-task-btn");
    editButton.innerHTML = "&#9999";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-task-btn");
    deleteButton.textContent = "X";

    newTask.appendChild(taskTextElement);
    newTask.appendChild(editButton);
    newTask.appendChild(deleteButton);

    parent.appendChild(newTask);
    addTaskWindow.style.display = "none";
    taskLabel.value = "";
});
