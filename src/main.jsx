import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { UsersProvider } from "./context/UsersContext";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import { WalletProvider } from "./context/WalletContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <UsersProvider>
        <AuthProvider>
          <WalletProvider>
            <CatalogProvider>
              <App />
            </CatalogProvider>
          </WalletProvider>
        </AuthProvider>
      </UsersProvider>
    </BrowserRouter>
  </StrictMode>
);
