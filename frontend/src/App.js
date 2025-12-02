import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import NewCourseViewer from "./pages/NewCourseViewer";
import NewQuizPlayer from "./pages/NewQuizPlayer";
import NewLeaderboard from "./pages/NewLeaderboard";
import CyberGame from "./pages/CyberGame";
import QuizSelection from "./pages/QuizSelection";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/course/:moduleId" element={
              <ProtectedRoute>
                <NewCourseViewer />
              </ProtectedRoute>
            } />
            <Route path="/challenge/:moduleId" element={
              <ProtectedRoute>
                <NewQuizPlayer />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
                <NewLeaderboard />
              </ProtectedRoute>
            } />
            <Route path="/cybergame" element={
              <ProtectedRoute>
                <CyberGame />
              </ProtectedRoute>
            } />
            <Route path="/quizzes" element={
              <ProtectedRoute>
                <QuizSelection />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
