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
const WhatsAppInterface = lazy(() => import("./components/WhatsAppInterface"));
const UserProfile = lazy(() => import("./components/UserProfile"));

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                <p className="text-lg">Loading Cosmic Chat...</p>
              </div>
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
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <WhatsAppInterface />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen bg-gray-900 p-8">
                      <UserProfile />
                    </div>
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
