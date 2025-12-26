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
import TransportCalculator from "./pages/TransportCalculator";
import Contact from "./pages/Contact";
import HowToBuy from "./pages/HowToBuy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
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
              <Route path="how-to-buy" element={<HowToBuy />} />
              <Route path="offer/:id" element={<CarDetails />} />
              <Route path="register" element={<Register />} />
              <Route path="login" element={<Login />} />
              <Route path="admin" element={<Admin />} />
              <Route path="panel" element={<ClientPanel />} />
              <Route path="transport-calculator" element={<TransportCalculator />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<Terms />} />
            </Route>
          </Routes>
        </AuthProvider>
      </InventoryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
