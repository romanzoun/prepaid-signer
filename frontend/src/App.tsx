import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SignPage from './pages/SignPage'
import MarkdownPage from './pages/MarkdownPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign" element={<SignPage />} />
        <Route path="/docs/:slug" element={<MarkdownPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
