import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import GoalDetail from './pages/GoalDetail';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';

function Protected({ children }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}

function AppRoutes() {
    const init = useAuthStore((s) => s.init);

    useEffect(() => {
        init();
    }, []);

    return (
        <Routes>
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/"             element={<Protected><Dashboard /></Protected>} />
            <Route path="/projects"     element={<Protected><Projects /></Protected>} />
            <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
            <Route path="/goals/:id"    element={<Protected><GoalDetail /></Protected>} />
            <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <ToastContainer />
        </BrowserRouter>
    );
}

createRoot(document.getElementById('app')).render(<App />);
