import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Loading from "./components/Loading";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FolderPage from "./pages/FolderPage";
import StudyPage from "./pages/StudyPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <Loading />;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/folder/:folderId" element={<PrivateRoute><FolderPage /></PrivateRoute>} />
          <Route path="/study/:folderId/:setId" element={<PrivateRoute><StudyPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
