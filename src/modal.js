import { getId, setId, getTaskList, setTaskList, saveData } from "./storage.js"
import { createTaskElement } from "./tasks.js";
export function modalInit() {

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
        const category = parent.dataset.category;

        if (taskText === "") {
            taskLabel.classList.add("error");

            setTimeout(() => {
                taskLabel.classList.remove("error");
            }, 400);

            return;
        }
        const newId = getId() + 1;
        setId(newId);
        const taskObj = {
            id: newId,
            text: taskText
        };
        const taskList = getTaskList();
        taskList[category].push(taskObj);
        setTaskList(taskList);
        saveData();

        const newTask = createTaskElement(taskObj);
        parent.appendChild(newTask);

        addTaskWindow.style.display = "none";
        taskLabel.value = "";

        parent = null;
    });
}
