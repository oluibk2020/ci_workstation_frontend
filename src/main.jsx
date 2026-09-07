import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import { WalletProvider } from "./context/WalletContext";
import GlobalLoadingSpinner from "./components/common/GlobalLoadingSpinner";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalLoadingSpinner />
      <AuthProvider>
        <WalletProvider>
          <CatalogProvider>
            <App />
          </CatalogProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
