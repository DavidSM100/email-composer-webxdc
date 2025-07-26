import Quill from "quill";
import QuillTableBetter from "quill-table-better";
import BlotFormatter from "quill-blot-formatter-mobile";
import hljs from "highlight.js/lib/core";
import bashLang from "highlight.js/lib/languages/bash";
import cppLang from "highlight.js/lib/languages/cpp";
import csLang from "highlight.js/lib/languages/csharp";
import cssLang from "highlight.js/lib/languages/css";
import diffLang from "highlight.js/lib/languages/diff";
import javaLang from "highlight.js/lib/languages/java";
import javascriptLang from "highlight.js/lib/languages/javascript";
import markdownLang from "highlight.js/lib/languages/markdown";
import phpLang from "highlight.js/lib/languages/php";
import pythonLang from "highlight.js/lib/languages/python";
import rubyLang from "highlight.js/lib/languages/ruby";
import sqlLang from "highlight.js/lib/languages/sql";
import "quill/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";
import "highlight.js/styles/github-dark.css";
import undoImg from "../imgs/undo.svg?raw";
import redoImg from "../imgs/redo.svg?raw";
import clearImg from "../imgs/clear.svg?raw";
import saveImg from "../imgs/save.svg?raw";
import quillStyles from "quill/dist/quill.snow.css?inline";
import tableSyles from "quill-table-better/dist/quill-table-better.css?inline";
import highlightStyles from "highlight.js/styles/github-dark.css?inline";
import localforage from "localforage";

export { startEditor, quillStyles, tableSyles, highlightStyles };

hljs.registerLanguage("bash", bashLang);
hljs.registerLanguage("cpp", cppLang);
hljs.registerLanguage("cs", csLang);
hljs.registerLanguage("css", cssLang);
hljs.registerLanguage("diff", diffLang);
hljs.registerLanguage("java", javaLang);
hljs.registerLanguage("javascript", javascriptLang);
hljs.registerLanguage("markdown", markdownLang);
hljs.registerLanguage("php", phpLang);
hljs.registerLanguage("python", pythonLang);
hljs.registerLanguage("ruby", rubyLang);
hljs.registerLanguage("sql", sqlLang);

const toolbarOptions = [
  ["undo", "redo"],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ size: ["small", false, "large", "huge"] }],
  [
    "bold",
    "italic",
    "underline",
    "strike",
    "code",
    "link",
    { color: [] },
    { background: [] },
  ],
  ["blockquote", "code-block", "image", "table-better"],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }, { direction: "rtl" }, { align: [] }],

  ["clean", "clear", "save"],
];

export const baseConfig = {
  placeholder: "HTML",
  modules: {
    history: {},
    toolbar: {
      container: toolbarOptions,
    },
    syntax: { hljs },
    table: false, // disable table module
    "table-better": {
      toolbarTable: true,
    },
    blotFormatter: {},
  },
  theme: "snow",
};

function startEditor(holder, config) {
  Quill.register(
    {
      "modules/table-better": QuillTableBetter,
    },
    true
  );

  Quill.register("modules/blotFormatter", BlotFormatter);

  let icons = Quill.import("ui/icons");
  icons["undo"] = undoImg;
  icons["redo"] = redoImg;
  icons["clear"] = clearImg;
  icons["save"] = saveImg;

  config.modules.toolbar.handlers = {
    undo: undo,
    redo: redo,
    clear: clear,
    save: save,
  };

  const editor = new Quill(holder, config);

  function undo() {
    editor.history.undo();
  }

  function redo() {
    editor.history.redo();
  }

  function clear() {
    editor.setContents([{ insert: "\n" }]);
    localforage.removeItem("html");
  }

  function save() {
    const htmlDiv = document.getElementById("editor").firstChild;
    if (htmlDiv.classList.contains("ql-blank")) {
      localforage.removeItem("html");
    } else {
      localforage.setItem("html", htmlDiv.innerHTML);
    }
  }

  return editor;
}
