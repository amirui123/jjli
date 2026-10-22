import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const boot = document.getElementById("boot");
if (boot) {
  boot.style.opacity = "0";
  window.setTimeout(() => boot.remove(), 400);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
