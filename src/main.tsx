import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {AuthProvider} from "./context/AuthContext.tsx";
import { LoadingProvider } from "../src/context/loadingcontext.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <LoadingProvider>
    <AuthProvider>
    <App />
    </AuthProvider>
  </LoadingProvider>
);

