import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import CarDetails from "./pages/CarDetails";
import "./index.css";
import "./i18n"; // ← tutaj dodajemy inicjalizację tłumaczeń

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="car/:id" element={<CarDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
