
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-logo">
                    <Link to="/">Community Platform</Link>
                </div>

                <div className="footer-links">
                    <div className="footer-section">
                        <h3>Platform</h3>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Resources</h3>
                        <ul>
                            <li><Link to="/help">Help Center</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Connect</h3>
                        <ul>
                            <li><a href="https://discord.gg/" target="_blank" rel="noopener noreferrer">Discord</a></li>
                            <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {currentYear} Community Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;