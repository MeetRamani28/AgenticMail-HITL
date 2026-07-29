import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#090d16",
          color: "#22d3ee",
          border: "1px solid rgba(6, 182, 212, 0.4)",
          fontFamily: "monospace",
          fontSize: "12px",
        },
      }}
    />
    <App />
  </React.StrictMode>
);