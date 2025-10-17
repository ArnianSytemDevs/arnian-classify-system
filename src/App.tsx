import { HashRouter, Routes, Route } from 'react-router'
import Home from './pages/Home/Home'
import Dashboard from './pages/dashboard/Dashboard'
import Classify from './pages/Classify/Classify'
import './i18n'

function App() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classify" element={<Classify />} />
      </Routes>
    </HashRouter>
  )
}

export default App
