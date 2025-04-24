import { getTaskList, saveData, setTaskList, getTaskOrder, setTaskOrder } from "./storage.js";

const addColumnButton = document.getElementById("add-column-btn");
const columnsTable = document.querySelector(".kanban-table");

export function initColumns() {
    const taskList = getTaskList();

    addColumnButton.addEventListener("click", () => {
        const columnName = prompt("Enter new category name:");
        if (columnName && columnName.trim() !== "") {
            const columnList = getTaskOrder();
            if (columnList.includes(columnName)) {
                alert("Колонка с таким именем уже существует.");
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

    });

    renderColumns();
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
