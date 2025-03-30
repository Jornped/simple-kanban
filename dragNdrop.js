let currentDrag = null;
let isDragging = false;

const placeholder = document.createElement("div");
placeholder.classList.add("task", "placeholder");

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

    taskElement.addEventListener("touchstart", (event) => {
        if (event.target.closest("button")) return;

        const { x, y } = getEventCoordinates(event);

        taskElement.classList.add("dragging");

        const rect = taskElement.getBoundingClientRect();
        taskElement.style.width = `${rect.width}px`;
        taskElement.style.height = `${rect.height}px`;

        taskElement.style.position = "absolute";
        taskElement.style.zIndex = 1000;

        currentDrag = {
            task,
            taskElement,
            startX: x,
            startY: y,
            startElemPosX: rect.left,
            startElemPosY: rect.top,
            currentElemPosX: rect.left,
            currentElemPosY: rect.top,
        };

        taskElement.style.left = `${rect.left}px`;
        taskElement.style.top = `${rect.top}px`;

        isDragging = true;

        event.preventDefault();
    }, { passive: false });
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
        updatePlaceholderPosition(midY, targetColumn);
    }

});

document.addEventListener("mouseup", (event) => {
    if (!isDragging || !currentDrag) return;
    event.preventDefault();

    handleDrop();
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
            return i;
        }
    }
    return null;
}

function getEventCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

document.addEventListener("touchmove", (event) => {
    if (!isDragging || !currentDrag) return;

    const { x, y } = getEventCoordinates(event);

    const offsetX = x - currentDrag.startX;
    const offsetY = y - currentDrag.startY;

    let taskTop = parseInt(currentDrag.taskElement.style.top, 10);
    let taskLeft = parseInt(currentDrag.taskElement.style.left, 10);

    taskTop += offsetY;
    taskLeft += offsetX;

    currentDrag.currentElemPosX = taskLeft;
    currentDrag.currentElemPosY = taskTop;

    currentDrag.taskElement.style.left = `${taskLeft}px`;
    currentDrag.taskElement.style.top = `${taskTop}px`;

    currentDrag.startX = x;
    currentDrag.startY = y;

    const rect = currentDrag.taskElement.getBoundingClientRect();
    const midX = currentDrag.currentElemPosX + rect.width / 2;
    const midY = currentDrag.currentElemPosY + rect.height / 2;

    const targetColumn = getColumnAtPosition(midX, midY);

    if (targetColumn) {
        updatePlaceholderPosition(midY, targetColumn);
    }

    event.preventDefault();
}, { passive: false });


document.addEventListener("touchend", (event) => {
    if (!isDragging || !currentDrag) return;
    event.preventDefault();

    handleDrop();
});


function handleDrop() {
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
}

function updatePlaceholderPosition(midY, column) {
    const index = getTaskIndexAtPosition(midY, column);
    if (index === null) {
        column.appendChild(placeholder);
    } else {
        const tasks = column.querySelectorAll(".task:not(.dragging):not(.placeholder)");
        column.insertBefore(placeholder, tasks[index]);
    }
}
