import { initJsonHandling } from "./src/jsonHandler.js";
import { loadData } from "./src/storage.js";
import { modalInit } from "./src/modal.js"
import { initTheme } from "./src/theme.js";
import { initRenderTasks } from "./src/tasks.js";


addEventListener("DOMContentLoaded", () => {
    loadData();
    modalInit();
    initTheme();
    initRenderTasks();
    initJsonHandling();
});

