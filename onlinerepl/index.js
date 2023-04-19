import { startRepl } from "../src/repl.js";
import { environment } from "../src/util/environment.js";

const terminal = document.getElementById("terminal");
const cursorElement = document.getElementById("cursor");

environment.consoleWrite = (string) => (terminal.value += string);
environment.consoleError = (string) => (terminal.value += string + "\n");

const totalCharactersWidth = Math.floor((window.innerWidth - 4) / 8);
const totalCharactersHeight = Math.floor((window.innerHeight - 4) / 8);

const updateCaret = (currentTerminal) => {
    const selectionStart = Math.max(terminal.selectionStart, currentTerminal);

    const totalXPosition = 3 + selectionStart - currentTerminal;
    let x = ((totalXPosition - 1) % totalCharactersWidth) + 1;
    if (x < 0) x += totalCharactersWidth - 1;

    const totalYPosition =
        terminal.value
            .slice(0, selectionStart)
            .split("\n")
            .reduce(
                (p, c) => p + Math.ceil(c.length / totalCharactersWidth),
                0
            ) - 1;

    cursorElement.style.left = `${2 + x * 8}px`;
    cursorElement.style.top = `${
        2 + totalYPosition * 15.5 - terminal.scrollTop
    }px`;
};

startRepl(async () => {
    terminal.value += "$> ";

    const currentTerminal = terminal.value.length;
    const pressedEnter = new Promise((resolve) => {
        window.onkeydown = (event) => {
            if (event.key === "Enter") {
                terminal.value += "\n";
                event.preventDefault();
                return resolve(terminal.value.slice(currentTerminal, -1));
            } else if (event.key === "Backspace") {
                if (terminal.value.length === currentTerminal)
                    event.preventDefault();
                else if (terminal.selectionStart < currentTerminal) {
                    terminal.selectionStart = currentTerminal;
                } else if (terminal.selectionStart === terminal.selectionEnd) {
                    terminal.selectionStart--;
                }
            } else if (event.key === "ArrowLeft") {
                if (terminal.value.length === currentTerminal)
                    event.preventDefault();
            } else if (event.key === "ArrowUp") {
                // Should go back in history
                event.preventDefault();
            } else if (event.key === "ArrowDown") {
                // Should go forward in history
                event.preventDefault();
            }
        };

        document.onselectionchange = () => updateCaret(currentTerminal);
        window.onresize = () => updateCaret(currentTerminal);
        terminal.onscroll = () => updateCaret(currentTerminal);
    });
    terminal.scrollTo(0, terminal.scrollHeight);
    return await pressedEnter;
});
