import { startRepl } from "../src/repl.js";
import { environment } from "../src/util/environment.js";

const terminal = document.getElementById("terminal");
const cursorElement = document.getElementById("cursor");

environment.consoleWrite = (string) => (terminal.value += string);
environment.consoleError = (string) => (terminal.value += string + "\n");

let cursorLine = 0;

startRepl(async () => {
    let cursor = 0;
    let currentString = "";

    const pressedEnter = new Promise((resolve) => {
        window.onkeydown = (event) => {
            if (event.key === "Enter") {
                terminal.value += "\n";
                cursorLine++;
                return resolve(currentString);
            }
            terminal.value = terminal.value.slice(
                0,
                terminal.value.length - currentString.length
            );
            if (event.key === "Backspace") {
                currentString =
                    currentString.slice(0, cursor - 1) +
                    currentString.slice(cursor);
                cursor = Math.max(cursor - 1, 0);
            } else if (event.key === "ArrowLeft") {
                cursor = Math.max(cursor - 1, 0);
            } else if (event.key === "ArrowRight") {
                cursor = Math.min(cursor + 1, currentString.length);
            } else if (event.key === "ArrowUp") {
                cursor = 0;
            } else if (event.key === "ArrowDown") {
                cursor = currentString.length;
            } else if (event.key.length > 1) return;
            else {
                currentString =
                    currentString.slice(0, cursor) +
                    event.key +
                    currentString.slice(cursor);
                cursor += event.key.length;
            }
            cursorElement.style.left = 2 + (cursor + 3) * 8 + "px";
            cursorElement.style.top = 2 + (cursorLine * 2 + 1) * 15 + "px";
            terminal.value += currentString;
        };
    });
    terminal.value += "$> ";
    cursorElement.style.left = 2 + (cursor + 3) * 8 + "px";
    cursorElement.style.top = 2 + (cursorLine * 2 + 1) * 15 + "px";
    return await pressedEnter;
});
