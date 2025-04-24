import { initJsonHandling } from "./src/jsonHandler.js";
import { loadData } from "./src/storage.js";
import { modalInit } from "./src/modal.js"
import { initTheme } from "./src/theme.js";
import { initRenderTasks } from "./src/tasks.js";
import { initColumns } from "./src/columns.js";

addEventListener("DOMContentLoaded", () => {
    loadData();
    initColumns();
    modalInit();
    initTheme();
    initRenderTasks();
    initJsonHandling();
});

