const exportButton = document.getElementById("export-json");
const importButton = document.getElementById("import-json");
const importInput = document.getElementById("import-input");

exportButton.addEventListener("click", () => {
    const data = {
        id,
        tasks: taskList
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
            if (!data.tasks || typeof data.id !== "number") {
                alert("Invalid JSON structure.");
                return;
            }

            id = data.id;
            taskList = data.tasks;
            saveData();

            document.querySelectorAll(".kanban-column").forEach(column => {
                const category = column.dataset.category;
                Array.from(column.children).forEach(child => {
                    if (!child.classList.contains("add-button") && child.tagName !== "H2") {
                        child.remove();
                    }
                });

                column.appendChild(renderTasks(taskList[category]));
            });


        } catch (err) {
            alert("Failed to import JSON");
        }
    };
    reader.readAsText(file);
});
