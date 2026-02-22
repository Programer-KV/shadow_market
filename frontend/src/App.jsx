import { useState } from 'react';
import { shadowxmarket_backend } from 'declarations/shadowxmarket_backend';
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import EmailConfirmPage from "./pages/EmailConfirmPage";
import SetPasswordPage from "./pages/SetPasswordPage";
import OperatorRegisteredPage from "./pages/OperatorRegisteredPage";
import TerminalPage from "./pages/TerminalPage";
import VaultPage from "./pages/VaultPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />

      <Route path="/home" element={<Home />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/email-confirm" element={<EmailConfirmPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/operator-registered" element={<OperatorRegisteredPage />} />
      <Route path="/terminal" element={<TerminalPage />} />
      <Route path="/vault" element={<VaultPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;