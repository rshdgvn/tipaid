import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Login from './Pages/Login'
import PrivateRoutes from './Contexts/PrivateRoutes'
import Register from './Pages/Register'
import { AuthProvider } from './Contexts/AuthContext'
import DashBoard from './Pages/DashBoard'



function App() {
  
  return (
    <>
      
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
              
            <Route element={<PrivateRoutes />} >
              <Route path="/" element={<DashBoard />} />
            </Route>
              
          </Routes>
        </AuthProvider>
      </Router>
      
      
      
    </>
  )
}

export default App