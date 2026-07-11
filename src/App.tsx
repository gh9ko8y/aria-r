import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Bookshelf from './pages/Bookshelf'
import Excerpts from './pages/Excerpts'
import Echoes from './pages/Echoes'
import Graph from './pages/Graph'
import Playlist from './pages/Playlist'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bookshelf" element={<Bookshelf />} />
        <Route path="/excerpts" element={<Excerpts />} />
        <Route path="/echoes" element={<Echoes />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/playlist" element={<Playlist />} />
      </Route>
    </Routes>
  )
}
