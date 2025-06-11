import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
// 🆕 Ajoute l’import Montserrat pour toute l’app (Google Fonts)
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
