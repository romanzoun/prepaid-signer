import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import SignPage from './pages/SignPage'
import MarkdownPage from './pages/MarkdownPage'
import StatusPage from './pages/StatusPage'
import { I18nProvider } from './i18n'
import './index.css'

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign" element={<SignPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/docs/:slug" element={<MarkdownPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </I18nProvider>
  )
}
