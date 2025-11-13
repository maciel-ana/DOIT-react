import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import LoginCadastro from './Components/LoginCadastro.jsx'
import { BrowserRouter, Routes, Router, Route } from 'react-router-dom'
import ResetPassword from './Components/ResetPassword.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />}/>
        <Route path='/login' element={<LoginCadastro />}/>
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
