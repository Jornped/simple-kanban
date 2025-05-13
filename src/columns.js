import { getTaskList, saveData, setTaskList, getTaskOrder, setTaskOrder } from "./storage.js";

const addColumnButton = document.getElementById("add-column-btn");
const columnsTable = document.querySelector(".kanban-table");
const contextMenu = document.querySelector("#column-context-menu");
let activeColumn = null;

export function initColumns() {
    addColumnButton.addEventListener("click", addColumn);
    initContextMenu();
    renderColumns();
}

function addColumn() {
    const taskList = getTaskList();
    const columnName = prompt("Enter new category name:");
    if (columnName && columnName.trim() !== "") {
        const columnList = getTaskOrder();
        if (columnList.includes(columnName)) {
            alert("Column with such name already exists.");
            return;
        }
        columnList.push(columnName);
        let colElem = createColumnElem(columnName);
        columnsTable.appendChild(colElem);
        taskList[columnName] = [];
        setTaskList(taskList);
        setTaskOrder(columnList);
        saveData();
    }
}

function initContextMenu() {
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const column = event.target.closest('.kanban-column');
        if (column && event.target === column.querySelector('h2')) {
            openContextMenu(event.pageX, event.pageY, column);
            activeColumn = column;
            return;
        }
        closeContextMenu();
    });

    document.addEventListener('click', (event) => {
        if (!contextMenu.contains(event.target))
            closeContextMenu();
    });

    contextMenu.querySelector('[data-action="edit"]').addEventListener('click', handleEdit);
    contextMenu.querySelector('[data-action="delete"]').addEventListener('click', handleDelete);
}

function createColumnElem(columnName) {
    const columnElem = document.createElement("div");
    columnElem.classList.add("kanban-column");
    columnElem.setAttribute("data-category", columnName);

    const columnHeader = document.createElement("h2");
    columnHeader.textContent = columnName;

    const addButton = document.createElement("button");
    addButton.classList.add("add-button");
    addButton.textContent = "+Add";

    columnElem.appendChild(columnHeader);
    columnElem.appendChild(addButton);

    return columnElem;
}

export function renderColumns() {
    const taskOrder = getTaskOrder();
    taskOrder.forEach(colName => {
        let colElem = createColumnElem(colName);
        columnsTable.appendChild(colElem);
    });
}

export function clearColumns() {
    const columns = document.querySelectorAll(".kanban-column");
    columns.forEach(col => {
        col.remove();
    });
}

function openContextMenu(x, y) {
    contextMenu.classList.remove('hidden');
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

function closeContextMenu() {
    contextMenu.classList.add('hidden');
    activeColumn = null;
}

function handleEdit() {
    const column = activeColumn;
    closeContextMenu();
    const columnNameElem = column.querySelector("h2");
    const oldName = columnNameElem.textContent.trim();

    columnNameElem.setAttribute("contenteditable", "true");
    columnNameElem.focus();

    columnNameElem.addEventListener("blur", () => {
        finishEdit();
    }, { once: true });

    columnNameElem.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            columnNameElem.blur();
        }
    });

    function finishEdit() {
        const newName = columnNameElem.textContent.trim();
        if (!newName || newName === oldName) {
            columnNameElem.textContent = oldName;
            return;
        }
        const taskList = getTaskList();
        const taskOrder = getTaskOrder();

        if (taskList[newName]) {
            alert("Column with this name already exists.");
            columnNameElem.textContent = oldName;
            return;
        }

        taskList[newName] = taskList[oldName];
        delete taskList[oldName];
        column.dataset.category = newName;
        setTaskList(taskList);

        const index = taskOrder.indexOf(oldName);
        if (index !== -1)
            taskOrder[index] = newName;
        setTaskOrder(taskOrder);

        saveData();
        columnNameElem.setAttribute("contenteditable", "false");
    }
}

function handleDelete() {
    const column = activeColumn;
    closeContextMenu();
    const columnNameElem = column.querySelector("h2");
    const columnName = columnNameElem.textContent.trim();
    const confirmed = confirm(`Are you sure to delete ${columnName} column?`);
    if (!confirmed)
        return;
    const taskList = getTaskList();
    const taskOrder = getTaskOrder();

    delete taskList[columnName];
    setTaskList(taskList);
    const index = taskOrder.indexOf(columnName);

    if (index !== -1) {
        taskOrder.splice(index, 1);
        setTaskOrder(taskOrder);
    }
    saveData();
    column.remove();
}