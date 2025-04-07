let currentDrag = null;
let isDragging = false;

const edgeThreshold = 50;
const scrollSpeed = 10;

const placeholder = document.createElement("div");
placeholder.classList.add("task", "placeholder");

function dragNDropTask(task, taskElement) {

    let dragTimeout = null;

    taskElement.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button"))
            return;

        const isTouch = event.pointerType === "touch";
        const { x, y } = getEventCoordinates(event);

        const startDrag = () => {
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
                startElemPosX: rect.left + window.scrollX,
                startElemPosY: rect.top + window.scrollY,
                currentElemPosX: rect.left,
                currentElemPosY: rect.top,
                startScrollY: window.scrollY,
                startScrollX: window.scrollX,
            };

            taskElement.style.left = `${currentDrag.startElemPosX}px`;
            taskElement.style.top = `${currentDrag.startElemPosY}px`;

            isDragging = true;
        };

        if (isTouch) {
            dragTimeout = setTimeout(() => {
                startDrag();
            }, 200);

            const cancel = () => clearTimeout(dragTimeout);

            taskElement.addEventListener("pointerup", cancel, { once: true });
            taskElement.addEventListener("pointercancel", cancel, { once: true });
            taskElement.addEventListener("pointermove", cancel, { once: true });
        } else {
            startDrag();
        }
    });
}

document.addEventListener("mousemove", (event) => {
    if (!isDragging || !currentDrag)
        return;

    tryScrolling();

    const scrollOffsetY = window.scrollY - (currentDrag.startScrollY || 0);
    const scrollOffsetX = window.scrollX - (currentDrag.startScrollX || 0);

    const offsetX = event.clientX - currentDrag.startX + scrollOffsetX;
    const offsetY = event.clientY - currentDrag.startY + scrollOffsetY;

    const taskLeft = currentDrag.startElemPosX + offsetX;
    const taskTop = currentDrag.startElemPosY + offsetY;

    currentDrag.currentElemPosX = taskLeft;
    currentDrag.currentElemPosY = taskTop;

    currentDrag.taskElement.style.left = `${taskLeft}px`;
    currentDrag.taskElement.style.top = `${taskTop}px`;

    const rect = currentDrag.taskElement.getBoundingClientRect();
    const midX = taskLeft + rect.width / 2;
    const midY = taskTop + rect.height / 2;

    const targetColumn = getColumnAtPosition(midX, midY);
    if (targetColumn) {
        updatePlaceholderPosition(midY, targetColumn);
    }

});

document.addEventListener("mouseup", (event) => {
    if (!isDragging || !currentDrag)
        return;
    event.preventDefault();

    handleDrop();
}, { passive: false });

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
    if (!isDragging || !currentDrag)
        return;

    const { x, y } = getEventCoordinates(event);

    tryScrolling();

    const scrollOffsetY = window.scrollY - currentDrag.startScrollY;
    const scrollOffsetX = window.scrollX - currentDrag.startScrollX;

    const offsetX = x - currentDrag.startX + scrollOffsetX;
    const offsetY = y - currentDrag.startY + scrollOffsetY;


    let taskLeft = currentDrag.startElemPosX + offsetX;
    let taskTop = currentDrag.startElemPosY + offsetY;

    currentDrag.currentElemPosX = taskLeft;
    currentDrag.currentElemPosY = taskTop;

    currentDrag.taskElement.style.left = `${taskLeft}px`;
    currentDrag.taskElement.style.top = `${taskTop}px`;

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
    if (!isDragging || !currentDrag)
        return;
    event.preventDefault();

    handleDrop();
}, { passive: false });


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

function tryScrolling() {
    const taskRect = currentDrag.taskElement.getBoundingClientRect();
    const taskTop = taskRect.top;
    const taskBottom = taskRect.bottom;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;

    if (taskTop < edgeThreshold) {
        window.scrollTo({ top: scrollTop - scrollSpeed, behavior: "auto" });
    } else if (taskBottom > windowHeight - edgeThreshold) {
        window.scrollTo({ top: scrollTop + scrollSpeed, behavior: "auto" });
    }
}