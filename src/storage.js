let _id = 0;

export function getId() {
    return _id;
}

export function setId(id) {
    _id = id;
}

let _taskList = {
    "Not Started": [

    ],
    "In Progress": [

    ],
    "Completed": [

    ],
}

export function getTaskList() {
    return JSON.parse(JSON.stringify(_taskList));
}

export function setTaskList(newTaskList) {
    // TODO: Add better validation
    if (typeof newTaskList !== "object" || newTaskList === null)
        return false;
    _taskList = newTaskList;
    return true;
}

export function saveData() {
    localStorage.setItem("tasks", JSON.stringify(getTaskList()));
    localStorage.setItem("id", getId());
}


export function loadData() {
    _id = +localStorage.getItem("id") || 0;
    _taskList = JSON.parse(localStorage.getItem("tasks")) || {
        "Not Started": [],
        "In Progress": [],
        "Completed": []
    };
}