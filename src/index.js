import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Registered from "./pages/Registered";
import NoPage from "./pages/404";
import Dashboard from "./pages/Dashboard";
import "./index.scss";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="registered" element={<Registered />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

root.render(<App />);
