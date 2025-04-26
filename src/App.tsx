import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import routes from "tempo-routes";

// Lazy load components for better performance
const Home = lazy(() => import("./components/home"));
const AuthForm = lazy(() => import("./components/AuthForm"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const LandingPage = lazy(() => import("./components/LandingPage"));

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              Loading...
            </div>
          }
        >
          <>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthForm />} />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}
            </Routes>
            {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
          </>
        </Suspense>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
