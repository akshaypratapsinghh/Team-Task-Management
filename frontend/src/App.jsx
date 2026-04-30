import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import { getUserFromStorage } from './auth';

const PrivateRoute = ({ children }) => {
  const user = getUserFromStorage();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/projects/:projectId" element={<PrivateRoute><ProjectPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
