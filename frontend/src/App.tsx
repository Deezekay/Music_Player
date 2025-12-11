import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Playlist from './pages/Playlist';
import Discover from './pages/Discover';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Artist from './pages/Artist';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import TrackDetails from './pages/TrackDetails';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="discover" element={<Discover />} />
                <Route path="stats" element={<Stats />} />
                <Route path="profile" element={<Profile />} />
                <Route path="artist/:id" element={<Artist />} />
                <Route path="track/:id" element={<TrackDetails />} />
                <Route path="admin" element={<Admin />} />
                <Route path="playlist/:id" element={<Playlist />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}

export default App;
