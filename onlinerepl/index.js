import { startRepl } from "../src/repl.js";

let pressedEnter = false;
const terminal = document.getElementById("terminal");

terminal.addEventListener("keyup", (event) => {
    console.log(event);
});

startRepl(() => {
    terminal.value += "$> ";
    waitForPressEnter();
});

const waitForPressEnter = () => {};
