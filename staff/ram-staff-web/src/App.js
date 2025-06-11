import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RecherchePage from './pages/RecherchePage';
import DetailVoyagePage from './pages/DetailVoyagePage';
import DetailBagagePage from './pages/DetailBagagePage';
import AdminDashboard from './pages/AdminPage'; // à créer

const SIDEBAR_CLOSED = 56;
const SIDEBAR_OPEN = 220;

function MainLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main
        style={{
          marginLeft: SIDEBAR_OPEN,
          transition: "margin-left 0.22s cubic-bezier(.4,0,.2,1)",
          minHeight: "100vh",
          background: "#F5F6FA"
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        const email = currentUser.email?.toLowerCase() || "";
        setIsAdmin(email === 'admin123@ram.com');
      } else {
        setIsAdmin(false);
      }
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen text-ramRed">
        <div className="text-xl font-bold animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login n'affiche pas la sidebar */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />

        {/* Admin uniquement */}
        {isAdmin && (
          <Route
            path="/admin"
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            }
          />
        )}

        {/* Pages accessibles uniquement aux utilisateurs connectés */}
        <Route
          path="/"
          element={
            user ? (
              <MainLayout>
                <RecherchePage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/voyage/:id"
          element={
            user ? (
              <MainLayout>
                <DetailVoyagePage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/bagage/:id"
          element={
            user ? (
              <MainLayout>
                <DetailBagagePage />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Route catch-all pour rediriger vers /login si non trouvé */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </Router>
  );
}
