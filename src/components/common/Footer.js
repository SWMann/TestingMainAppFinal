import React from 'react';
import {
    Shield, Users, Award, Calendar, FileText,
    ExternalLink, ChevronRight, Mail, Globe,
    Github, Twitter, Youtube, MessageSquare
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        organization: [
            { label: 'About Us', path: '/about' },
            { label: 'Command Structure', path: '/command' },
            { label: 'Join Us', path: '/join' },
            { label: 'Contact', path: '/contact' },
        ],
        resources: [
            { label: 'Operations Manual', path: '/standards' },
            { label: 'Training Programs', path: '/training' },
            { label: 'Fleet Registry', path: '/fleet' },
            { label: 'Member Resources', path: '/resources' },
        ],
        community: [
            { label: 'News & Updates', path: '/news' },
            { label: 'Events Calendar', path: '/events' },
            { label: 'Forums', path: '/forums' },
            { label: 'Discord Server', path: '#', external: true },
        ],
        legal: [
            { label: 'Privacy Policy', path: '/privacy' },
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Code of Conduct', path: '/conduct' },
            { label: 'RSI Org Page', path: '#', external: true },
        ]
    };

    const socialLinks = [
        { icon: MessageSquare, label: 'Discord', url: '#' },
        { icon: Twitter, label: 'Twitter', url: '#' },
        { icon: Youtube, label: 'YouTube', url: '#' },
        { icon: Github, label: 'GitHub', url: '#' },
    ];

    return (
        <footer className="site-footer">
            {/* Quick Stats Bar */}
            <div className="footer-stats">
                <div className="stats-container">
                    <div className="stat-item">
                        <Shield size={24} />
                        <div className="stat-content">
                            <span className="stat-value">247</span>
                            <span className="stat-label">Active Members</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Users size={24} />
                        <div className="stat-content">
                            <span className="stat-value">12</span>
                            <span className="stat-label">Active Units</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Award size={24} />
                        <div className="stat-content">
                            <span className="stat-value">1,847</span>
                            <span className="stat-label">Operations Completed</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <Calendar size={24} />
                        <div className="stat-content">
                            <span className="stat-value">Since 2943</span>
                            <span className="stat-label">Years of Service</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="footer-main">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Organization Info */}
                        <div className="footer-section footer-brand">
                            <div className="footer-logo">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3 className="footer-title">5th Expeditionary Group</h3>
                            <p className="footer-description">
                                Elite military organization dedicated to maintaining peace and order throughout the United Empire of Earth.
                                Specializing in rapid deployment and tactical operations across the verse.
                            </p>
                            <div className="footer-social">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.url}
                                        className="social-link"
                                        aria-label={social.label}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <social.icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Organization Links */}
                        <div className="footer-section">
                            <h4 className="footer-section-title">Organization</h4>
                            <ul className="footer-links">
                                {footerLinks.organization.map((link, index) => (
                                    <li key={index}>
                                        <a href={link.path} className="footer-link">
                                            {link.label}
                                            <ChevronRight size={14} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div className="footer-section">
                            <h4 className="footer-section-title">Resources</h4>
                            <ul className="footer-links">
                                {footerLinks.resources.map((link, index) => (
                                    <li key={index}>
                                        <a href={link.path} className="footer-link">
                                            {link.label}
                                            <ChevronRight size={14} />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Community Links */}
                        <div className="footer-section">
                            <h4 className="footer-section-title">Community</h4>
                            <ul className="footer-links">
                                {footerLinks.community.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.path}
                                            className="footer-link"
                                            target={link.external ? "_blank" : undefined}
                                            rel={link.external ? "noopener noreferrer" : undefined}
                                        >
                                            {link.label}
                                            {link.external ? <ExternalLink size={14} /> : <ChevronRight size={14} />}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="footer-section">
                            <h4 className="footer-section-title">Contact Command</h4>
                            <div className="footer-contact">
                                <div className="contact-item">
                                    <Mail size={16} />
                                    <span>command@5thexpedition.org</span>
                                </div>
                                <div className="contact-item">
                                    <Globe size={16} />
                                    <span>www.5thexpedition.org</span>
                                </div>
                                <div className="contact-item">
                                    <MessageSquare size={16} />
                                    <span>Discord: 5thEXP</span>
                                </div>
                            </div>
                            <div className="footer-recruitment">
                                <h5>Join the Elite</h5>
                                <p>Applications open for qualified pilots and ground forces.</p>
                                <a href="/join" className="recruitment-btn">
                                    Apply Now
                                    <ChevronRight size={16} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="footer-container">
                    <div className="footer-bottom-content">
                        <div className="copyright">
                            <p>© 2943-{currentYear} 5th Expeditionary Group. All rights reserved.</p>
                            <p className="disclaimer">This is a fan-made organization for Star Citizen. Not affiliated with Cloud Imperium Games.</p>
                        </div>
                        <div className="footer-bottom-links">
                            {footerLinks.legal.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.path}
                                    className="bottom-link"
                                    target={link.external ? "_blank" : undefined}
                                    rel={link.external ? "noopener noreferrer" : undefined}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;