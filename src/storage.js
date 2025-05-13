let _id = 0;

export function getId() {
    return _id;
}

export function setId(id) {
    _id = id;
}

let _taskOrder = ["Not Started", "In Progress", "Completed"];
let _tasks = {
    "Not Started": [

    ],
    "In Progress": [

    ],
    "Completed": [

    ],
}

export function getTaskOrder() {
    return JSON.parse(JSON.stringify(_taskOrder));
}

export function setTaskOrder(taskOrder) {
    _taskOrder = taskOrder;
}

export function getTaskList() {
    return JSON.parse(JSON.stringify(_tasks));
}

export function setTaskList(newTaskList) {
    // TODO: Add better validation
    if (typeof newTaskList !== "object" || newTaskList === null)
        return false;
    _tasks = newTaskList;
    return true;
}

export function saveData() {
    localStorage.setItem("tasks", JSON.stringify(getTaskList()));
    localStorage.setItem("id", getId());
    localStorage.setItem("taskOrder", JSON.stringify(getTaskOrder()));
}


export function loadData() {
    _id = +localStorage.getItem("id") || 0;
    _tasks = JSON.parse(localStorage.getItem("tasks")) || {
        "Not Started": [],
        "In Progress": [],
        "Completed": []
    };
    _taskOrder = JSON.parse(localStorage.getItem("taskOrder")) ||
        ["Not Started", "In Progress", "Completed"];
}