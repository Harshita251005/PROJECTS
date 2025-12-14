import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import CreateTeam from './pages/CreateTeam';
import SubmitProject from './pages/SubmitProject';
import Messages from './pages/Messages';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';



import LiveLeaderboard from './pages/LiveLeaderboard';
import EventManage from './pages/EventManage';
import EventEdit from './pages/EventEdit';
import Users from './pages/Users';
import SupportTickets from './pages/SupportTickets';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboardPage from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/Users';
import AdminEventsPage from './pages/admin/Events';
import AdminAuditPage from './pages/admin/Audit';
import AdminSystemPage from './pages/admin/System';
import AdminMessagesPage from './pages/admin/Messages';
import AdminLeaderboardPage from './pages/admin/Leaderboard';
import AdminAnnouncementsPage from './pages/admin/Announcements';
import Progress from './pages/Progress';

// Organizer Pages
import OrganizerLayout from './layouts/OrganizerLayout';
import OrganizerDashboardPage from './pages/organizer/Dashboard';
import OrganizerEventsPage from './pages/organizer/Events';


function App() {
  return (
    <AuthProvider>
      <SocketProvider>

          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                },
                success: {
                  iconTheme: {
                    primary: '#0ea5e9',
                    secondary: '#f1f5f9',
                  },
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams"
                element={
                  <ProtectedRoute>
                    <Teams />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/create"
                element={
                  <ProtectedRoute>
                    <CreateTeam />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teams/:id"
                element={
                  <ProtectedRoute>
                    <TeamDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute roles={['organizer']}>
                    <CreateEvent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/manage"
                element={
                  <ProtectedRoute roles={['organizer']}>
                    <EventManage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute roles={['organizer']}>
                    <EventEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/submit"
                element={
                  <ProtectedRoute>
                    <SubmitProject />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminDashboardPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminUsersPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminEventsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAuditPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/system"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminSystemPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminMessagesPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaderboard"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminLeaderboardPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/announcements"
                element={
                  <ProtectedRoute>
                    <AdminLayout>
                      <AdminAnnouncementsPage />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              {/* Placeholder routes for now */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout>
                      <div className="text-white">Page under construction</div>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Organizer Routes */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute roles={['organizer']}>
                    <OrganizerLayout>
                      <OrganizerDashboardPage />
                    </OrganizerLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/events"
                element={
                  <ProtectedRoute roles={['organizer']}>
                    <OrganizerLayout>
                      <OrganizerEventsPage />
                    </OrganizerLayout>
                  </ProtectedRoute>
                }
              />


              <Route path="/events/:id/leaderboard" element={<LiveLeaderboard />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>

      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
