import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Analysis from './pages/Analysis.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import History from './pages/History.jsx'
import ResumeDetail from './pages/ResumeDetail.jsx'
import Chat from './pages/Chat.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes/:id"
          element={
            <ProtectedRoute>
              <ResumeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}
