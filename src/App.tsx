import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Bookshelf from './pages/Bookshelf'
import Excerpts from './pages/Excerpts'
import Essays from './pages/Essays'
import Echoes from './pages/Echoes'
import Graph from './pages/Graph'
import Playlist from './pages/Playlist'
import Timeline from './pages/Timeline'
import Profile from './pages/Profile'
import About from './pages/About'
import Help from './pages/Help'
import Feedback from './pages/Feedback'
import Login from './pages/Login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/excerpts" element={<Excerpts />} />
        <Route path="/essays" element={<Essays />} />
        <Route path="/echoes" element={<Echoes />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/feedback" element={<Feedback />} />
      </Route>
    </Routes>
  )
}
