import { renderTasks } from "./tasks.js";
import { getId, getTaskList, setId, setTaskList, saveData, getTaskOrder, setTaskOrder } from "./storage.js";
import { renderColumns, clearColumns } from "./columns.js";

export function initJsonHandling() {
    const exportButton = document.getElementById("export-json");
    const importButton = document.getElementById("import-json");
    const importInput = document.getElementById("import-input");

    exportButton.addEventListener("click", () => {
        const data = {
            id: getId(),
            tasks: getTaskList(),
            order: getTaskOrder(),
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "kanban-data.json";
        a.click();

        URL.revokeObjectURL(url);
    });

    importButton.addEventListener("click", () => {
        importInput.click();
    });

    importInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const isValidStructure = data &&
                    typeof data === "object" &&
                    typeof data.id === "number" &&
                    data.tasks && typeof data.tasks === "object" &&
                    Array.isArray(data.order);

                if (!isValidStructure) {
                    alert("Invalid JSON structure.");
                    return;
                }
                setId(data.id);
                setTaskList(data.tasks);
                console.log(data.order);
                setTaskOrder(data.order);
                saveData();

                clearColumns();
                renderColumns();

                const taskList = getTaskList();
                const taskOrder = getTaskOrder();

                taskOrder.forEach(category => {
                    const column = document.querySelector(`.kanban-column[data-category="${category}"]`);
                    if (column) {
                        Array.from(column.children).forEach(child => {
                            if (!child.classList.contains("add-button") && child.tagName !== "H2") {
                                child.remove();
                            }
                        });
                        column.appendChild(renderTasks(taskList[category] || []));
                    }
                });

            } catch (err) {
                alert("Failed to import JSON");
            }
        };
        reader.readAsText(file);
    });
}