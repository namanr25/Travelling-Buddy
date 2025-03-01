import './App.css';
import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Layout from './Layout.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

import axios from 'axios';
import { UserContextProvider } from './UserContext';
import ProfilePage from './pages/ProfilePage.jsx';
import PlacesPage from './pages/PlacesPage.jsx';
import PlacesFormPage from './pages/PlacesFormPage.jsx';
import PlacePage from "./pages/PlacePage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
import TravelBuddyProfile from './pages/TravelBuddyProfile.jsx';
import PersonalityTestPage from './pages/PersonalityTestPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

axios.defaults.baseURL= 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home Page */}
          <Route index element={<IndexPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Profile */}
          <Route path="/account" element={<ProfilePage />} /> {/* Profile Page with Logout */}

          {/* Places Management */}
          <Route path="/account/places" element={<PlacesPage />} />
          <Route path="/account/places/new" element={<PlacesFormPage />} />
          <Route path="/account/places/:id" element={<PlacesFormPage />} />

          {/* View a Single Place */}
          <Route path="/place/:id" element={<PlacePage />} /> {/* Uses UUID instead of MongoDB _id */}

          {/* Booking Routes */}
          <Route path="/account/bookings" element={<BookingsPage />} />
          <Route path="/account/bookings/:id" element={<BookingPage />} />

          <Route path="/user-profile/:email" element={<TravelBuddyProfile />} />
          
          {/* Personality Test Route */}
          <Route path="/personality-test" element={<PersonalityTestPage />} />
          
          {/* Admin Dashboard Route */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;