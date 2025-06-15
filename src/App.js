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

    // Suppress ResizeObserver loop errors
    const resizeObserverErrorHandler = (e) => {
        // Ignore ResizeObserver errors that don't affect functionality
        if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
            e.message === 'ResizeObserver loop limit exceeded') {
            // Prevent error from reaching the console
            e.stopImmediatePropagation();
            e.preventDefault();
            return true;
        }
    };

// Add error handler
    window.addEventListener('error', resizeObserverErrorHandler);

  return (
      <Router>
        <div className="app-container">
          <main className="main-content">
              <Header />
            <AppRoutes />
          </main>
        </div>
      </Router>
  );
};

export default App;