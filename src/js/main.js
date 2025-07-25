import { readableSize } from "./util.js";
import localforage from "localforage";
import {
  startEditor,
  baseConfig,
  quillStyles,
  tableSyles,
  highlightStyles,
} from "./editor.js";

const subjectInput = document.getElementById("subject");
const textarea = document.getElementById("text");
const fileBtn = document.getElementById("fileBtn");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
let currentFile = null;

if (window.webxdc.arcanechat) {
  startEditor("#editor", baseConfig);
} else {
  subjectInput.placeholder += " (Only supported in ArcaneChat)";
  subjectInput.disabled = true;
  baseConfig.placeholder += " (Only supported in ArcaneChat)";
  const editor = startEditor("#editor", baseConfig);
  editor.disable();
}

const htmlDiv = document.getElementById("editor").firstChild;

loadSavedData();
async function loadSavedData() {
  const subject = await localforage.getItem("subject");
  const text = await localforage.getItem("text");
  const file = await localforage.getItem("file");
  const html = await localforage.getItem("html");

  subjectInput.value = subject;
  textarea.value = text;
  htmlDiv.innerHTML = html;
  if (file) {
    fileName.textContent = file.name;
    fileSize.textContent = readableSize(file.size);
    currentFile = file;
    fileBtn.textContent = "Remove";
  }
}

fileBtn.onclick = async () => {
  if (currentFile) {
    try {
      await localforage.removeItem("file");
    } catch (err) {
      console.log(err);
    }
    currentFile = null;
    fileBtn.textContent = "Attach file";
    fileName.textContent = "";
    fileSize.textContent = "";
  } else {
    const file = (await window.webxdc.importFiles({}))[0];
    if (file) {
      try {
        await localforage.setItem("file", file);
      } catch (err) {
        console.log(err);
      }
      currentFile = file;
      fileBtn.textContent = "Remove";
      fileName.textContent = file.name;
      fileSize.textContent = readableSize(file.size);
    }
  }
};

subjectInput.oninput = () => {
  localforage.setItem("subject", subjectInput.value);
};

textarea.oninput = () => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight - 2 + "px";
  localforage.setItem("text", textarea.value);
};

const observer = new MutationObserver(saveHtml);
observer.observe(htmlDiv, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true,
});

function saveHtml() {
  if (htmlDiv.classList.contains("ql-blank")) {
    localforage.setItem("html", "");
  } else {
    localforage.setItem("html", htmlDiv.innerHTML);
  }
}

document.getElementById("export").onclick = async () => {
  const subject = subjectInput.value;
  const text = textarea.value;
  const htmlEmpty = htmlDiv.classList.contains("ql-blank");

  if (text || currentFile || !htmlEmpty) {
    let msg = {};
    if (subject) msg.subject = subject;
    if (text) msg.text = text;
    if (currentFile) {
      msg.file = { name: currentFile.name, blob: currentFile };
      if (currentFile.type.startsWith("image")) msg.file.type = "image";
      else if (currentFile.type.startsWith("audio")) msg.file.type = "audio";
      else if (currentFile.type.startsWith("video")) msg.file.type = "video";
    }
    if (!htmlEmpty) {
      const htmlClone = htmlDiv.cloneNode(true);
      const selects = htmlClone.querySelectorAll("select");
      selects.forEach((select) => {
        select.remove();
      });

      let styles = quillStyles;
      if (htmlDiv.querySelector("table")) {
        styles += "\n" + tableSyles;
      }
      if (htmlClone.querySelector(".ql-code-block-container")) {
        styles += "\n" + highlightStyles;
      }

      msg.html = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><style>${styles}</style><div class="ql-container ql-snow"><div class="ql-editor">${htmlClone.innerHTML}</div></div></body></html>`;
    }

    window.webxdc.sendToChat(msg);
  }
};
