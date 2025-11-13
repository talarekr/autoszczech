import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import CarDetails from "./pages/CarDetails";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ClientPanel from "./pages/ClientPanel";
import { AuthProvider } from "./contexts/AuthContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import "./index.css";
import "./i18n"; // ← tutaj dodajemy inicjalizację tłumaczeń

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <InventoryProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="offer/:id" element={<CarDetails />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="admin" element={<Admin />} />
              <Route path="panel" element={<ClientPanel />} />
            </Route>
          </Routes>
        </AuthProvider>
      </InventoryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
