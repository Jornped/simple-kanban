import { getTaskList } from './storage.js'
import { dragNDropTask } from "./dragNdrop.js";
import { setTaskList, saveData } from './storage.js';

export function initRenderTasks() {
    document.querySelectorAll(".kanban-column").forEach(column => {
        const category = column.dataset.category;
        column.appendChild(renderTasks(getTaskList()[category]));
    });
}

export function renderTasks(tasks) {
    const fragment = document.createDocumentFragment();

    if (!Array.isArray(tasks)) {
        console.warn("Expected tasks to be array, got:", tasks);
        return fragment;
    }

    tasks.forEach(task => {
        fragment.appendChild(createTaskElement(task));
    });
    return fragment;
}

export function createTaskElement(task) {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    const taskText = document.createElement("p");
    taskText.textContent = task.text;

    const editButton = createButton("edit-task-btn", "<span class='tilted-pencil'>&#9999;</span>", () => handleEditTask(taskText));
    const deleteButton = createButton("delete-task-btn", "X", () => handleDeleteTask(task, taskElement));

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("task-buttons");
    buttonContainer.append(editButton, deleteButton);

    taskText.addEventListener("blur", () => handleUpdateTask(task, taskText));
    taskText.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            taskText.blur();
        }
    });

    taskElement.append(taskText, buttonContainer);

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
    const taskList = getTaskList();
    const index = taskList[columnType].findIndex(t => t.id === task.id);

    if (index > -1) {
        taskList[columnType].splice(index, 1);
        setTaskList(taskList);
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
    const taskList = getTaskList();
    const parentColumn = taskText.parentElement.parentElement;
    const columnType = parentColumn.dataset.category;
    const index = taskList[columnType].findIndex(t => t.id === task.id);

    if (index > -1) {
        taskList[columnType][index].text = newText;
        setTaskList(taskList);
        saveData();
    }
}