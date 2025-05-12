import logo from './logo.svg';
import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useRoutes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from './redux/actions/authActions';

// Components
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';

// Routes configuration
import routes from './routes';


// AppRoutes component to use the useRoutes hook
const AppRoutes = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return useRoutes(routes(isAuthenticated));
};

const App = () => {
  const dispatch = useDispatch();

  // Load user on initial render if authenticated
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
      <Router>
        <div className="app-container">
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </Router>
  );
};

export default App;