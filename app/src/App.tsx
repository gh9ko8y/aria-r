import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Layout from './components/Layout'

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'))
const Bookshelf = lazy(() => import('./pages/Bookshelf'))
const Excerpts = lazy(() => import('./pages/Excerpts'))
const Essays = lazy(() => import('./pages/Essays'))
const Echoes = lazy(() => import('./pages/Echoes'))
const Graph = lazy(() => import('./pages/Graph'))
const Playlist = lazy(() => import('./pages/Playlist'))
const Timeline = lazy(() => import('./pages/Timeline'))
const Profile = lazy(() => import('./pages/Profile'))
const About = lazy(() => import('./pages/About'))
const Help = lazy(() => import('./pages/Help'))
const Feedback = lazy(() => import('./pages/Feedback'))
const Login = lazy(() => import('./pages/Login'))
const Record = lazy(() => import('./pages/Record'))

// 加载指示器
function Loading() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-[#5B7E71] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Auth page — no layout */}
        <Route path="/login" element={<Login />} />

        {/* Main app pages — with sidebar layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/bookshelf" element={<Bookshelf />} />
          <Route path="/record" element={<Record />} />
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
    </Suspense>
  )
}
