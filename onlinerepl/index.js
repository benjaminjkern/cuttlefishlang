import { startRepl } from "../src/repl.js";
import { environment } from "../src/util/environment.js";

import "./index.css";

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

library.add(faGithub);
dom.watch();

const terminal = document.getElementById("terminal");
const cursorElement = document.getElementById("cursor");

environment.consoleWrite = (string) => (terminal.value += string);
environment.consoleError = (string) => (terminal.value += string + "\n");
environment.colors = false;

const githubHidden = document.getElementById("github-hidden");
const githubVisual = document.getElementById("github-visual");
githubHidden.onmouseover = () =>
    (githubVisual.style.filter = "drop-shadow(0 0 5px white)");
githubHidden.onmouseout = () => (githubVisual.style.filter = "none");

const getPixels = () => {
    // This is honestly so annoying, it changes depending on device width due to INCONSISTENT rounding errors (Although most of the time its right)

    // These are just every resolution google chrome allows
    const pixels = Math.round(17.5 * window.devicePixelRatio);
    if (window.devicePixelRatio > 0.25 && window.devicePixelRatio < 0.5)
        return pixels - 1;
    if (window.devicePixelRatio > 0.9 && window.devicePixelRatio < 1.05)
        return pixels - 1;
    if (window.devicePixelRatio > 1.05 && window.devicePixelRatio < 1.175)
        return pixels + 1;
    if (window.devicePixelRatio > 1.175 && window.devicePixelRatio < 1.5)
        return pixels - 1;
    if (window.devicePixelRatio > 4) return pixels - 1;
    return pixels;
};

const updateCaret = (currentTerminal) => {
    const selectionStart = Math.max(terminal.selectionStart, currentTerminal);

    const fontWidth = 8;
    const fontHeight = getPixels() / window.devicePixelRatio;

    const totalCharactersWidth = Math.floor(
        (window.innerWidth - 4) / fontWidth
    );
    // const totalCharactersHeight = Math.floor((window.innerHeight - 4) / 15.5);
    const totalXPosition = 3 + selectionStart - currentTerminal;
    let x = totalXPosition % totalCharactersWidth;
    if (x < 0) x += totalCharactersWidth;

    const totalYPosition =
        terminal.value
            .slice(0, selectionStart)
            .split("\n")
            .reduce(
                (p, c) => p + Math.floor(c.length / totalCharactersWidth + 1),
                0
            ) - 1;

    cursorElement.style.width = fontWidth + "px";
    cursorElement.style.height = fontHeight + "px";

    cursorElement.style.left = `${2 + x * fontWidth}px`;
    cursorElement.style.top = `${
        2 + totalYPosition * fontHeight - terminal.scrollTop
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
                if (terminal.selectionStart === currentTerminal)
                    event.preventDefault();
                else if (terminal.selectionStart < currentTerminal) {
                    terminal.selectionStart = currentTerminal;
                } else if (terminal.selectionStart === terminal.selectionEnd) {
                    terminal.selectionStart--;
                }
            } else if (event.key === "ArrowLeft") {
                if (terminal.selectionStart === currentTerminal)
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
