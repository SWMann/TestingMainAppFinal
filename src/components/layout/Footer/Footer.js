import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-logo">
                    <Link to="/">5TH EXPEDITIONARY GROUP</Link>
                </div>

                <div className="footer-links">
                    <div className="footer-section">
                        <h3>Navigation</h3>
                        <ul>
                            <li><Link to="/">Command</Link></li>
                            <li><Link to="/roster">Personnel</Link></li>
                            <li><Link to="/operations">Operations</Link></li>
                            <li><Link to="/units">Fleet</Link></li>
                            <li><Link to="/documents">Intel</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Resources</h3>
                        <ul>
                            <li><Link to="/training">Flight School</Link></li>
                            <li><Link to="/documents">SOPs</Link></li>
                            <li><Link to="/awards">Commendations</Link></li>
                            <li><Link to="/ships">Fleet Registry</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Connect</h3>
                        <ul>
                            <li><a href="https://discord.gg/" target="_blank" rel="noopener noreferrer">Discord</a></li>
                            <li><a href="https://robertsspaceindustries.com/" target="_blank" rel="noopener noreferrer">RSI</a></li>
                            <li><Link to="/contact">Contact Command</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {currentYear} 5th Expeditionary Group. All rights reserved. Star Citizen® is a trademark of Cloud Imperium Games.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;