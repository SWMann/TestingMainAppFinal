import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginWithDiscord, logout } from '../../../redux/actions/authActions';
import {
    ArrowUpRight,
    Calendar,
    MessageSquare,
    Menu,
    X,
    LogOut,
    Shield,
    FileText,
    Award,
    AlertTriangle,
    Users
} from 'lucide-react';

// Mock data for demonstration
const mockAnnouncements = [
    { id: 1, title: "New Mission Briefing", content: "Operation Starlight begins tomorrow at 0800 hours.", date: "2025-05-08", isPinned: true },
    { id: 2, title: "Updated Combat Protocol", content: "All personnel must review the updated rules of engagement.", date: "2025-05-07" },
    { id: 3, title: "System Maintenance", content: "Comms will be down for scheduled maintenance.", date: "2025-05-06" },
];

const mockEvents = [
    { id: 1, title: "Squad Training Exercise", date: "2025-05-10", time: "0900", location: "Training Deck B" },
    { id: 2, title: "Strategic Briefing", date: "2025-05-11", time: "1400", location: "Command Center" },
    { id: 3, title: "Equipment Inspection", date: "2025-05-12", time: "1000", location: "Armory" },
];

const mockStats = [
    { id: 1, title: "Missions Completed", value: 24, trend: "up" },
    { id: 2, title: "Team Readiness", value: "92%", trend: "up" },
    { id: 3, title: "New Messages", value: 7, trend: "neutral" },
    { id: 4, title: "Next Deployment", value: "6d", trend: "down" },
];

const quickLinks = [
    { id: 1, title: "Forums", icon: <MessageSquare size={18} />, color: "#4FCBF8" },
    { id: 2, title: "Calendar", icon: <Calendar size={18} />, color: "#39FF14" },
    { id: 3, title: "Resources", icon: <FileText size={18} />, color: "#FF6B35" },
    { id: 4, title: "Achievements", icon: <Award size={18} />, color: "#E4D00A" },
];

// Branch colors from style guide
const branchColors = {
    army: "#4B5D46",
    navy: "#1F4287",
    marines: "#CF1020",
    command: "#E4D00A"
};

const Home = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for the digital clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleDiscordLogin = () => {
        dispatch(loginWithDiscord());
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatTime = (time) => {
        // Military time formatter
        return time.padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
    };

    return (
        <div className="min-h-screen bg-[#0C1C2C] text-white overflow-x-hidden"
             style={{fontFamily: "'Titillium Web', sans-serif"}}>

            {/* Starfield Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/stars-background.png')] bg-repeat opacity-40"></div>
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(76, 43, 134, 0.2) 0%, rgba(12, 28, 44, 0.8) 70%)'
                }}></div>
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-[#4FCBF8]/30">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#382C54] flex items-center justify-center clip-hexagon">
                                    <Shield size={18} className="text-[#39FF14]" />
                                </div>
                                <h1 className="text-xl font-bold text-[#4FCBF8]" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                    FRONTIER COMMAND
                                </h1>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-4">
                            {isAuthenticated && (
                                <>
                                    <a href="#" className="px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Dashboard</a>
                                    <a href="#" className="px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Events</a>
                                    <a href="#" className="px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Units</a>
                                    <a href="#" className="px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Forums</a>
                                </>
                            )}

                            {isAuthenticated ? (
                                <div className="flex items-center ml-4">
                                    <img
                                        src={user?.avatar_url || '/default-avatar.png'}
                                        alt="User avatar"
                                        className="w-8 h-8 rounded-full border border-[#4FCBF8]"
                                    />
                                    <span className="ml-2 text-[#E4D00A]">{user?.username}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="ml-4 px-3 py-1 bg-[#382C54] text-[#FF6B35] hover:bg-[#382C54]/80 transition-colors rounded clip-edges flex items-center"
                                    >
                                        <LogOut size={16} className="mr-1" /> Logout
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDiscordLogin}
                                    className="px-4 py-2 bg-[#382C54] text-[#39FF14] hover:bg-[#382C54]/80 transition-colors rounded clip-edges"
                                >
                                    Login with Discord
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute z-20 w-full bg-[#0C1C2C] border-b border-[#4FCBF8]/30">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {isAuthenticated && (
                            <>
                                <a href="#" className="block px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Dashboard</a>
                                <a href="#" className="block px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Events</a>
                                <a href="#" className="block px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Units</a>
                                <a href="#" className="block px-3 py-2 text-[#4FCBF8] hover:text-[#39FF14] transition-colors">Forums</a>
                            </>
                        )}

                        {isAuthenticated ? (
                            <div className="flex items-center justify-between px-3 py-2">
                                <div className="flex items-center">
                                    <img
                                        src={user?.avatar_url || '/default-avatar.png'}
                                        alt="User avatar"
                                        className="w-8 h-8 rounded-full border border-[#4FCBF8]"
                                    />
                                    <span className="ml-2 text-[#E4D00A]">{user?.username}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1 bg-[#382C54] text-[#FF6B35] hover:bg-[#382C54]/80 transition-colors rounded clip-edges flex items-center"
                                >
                                    <LogOut size={16} className="mr-1" /> Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleDiscordLogin}
                                className="w-full px-4 py-2 bg-[#382C54] text-[#39FF14] hover:bg-[#382C54]/80 transition-colors rounded clip-edges"
                            >
                                Login with Discord
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="relative z-10 container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loading-spinner">
                            <div className="h-16 w-16 border-4 border-t-[#39FF14] border-r-[#4FCBF8] border-b-[#FF6B35] border-l-[#E4D00A] rounded-full animate-spin"></div>
                            <p className="mt-4 text-[#4FCBF8]" style={{fontFamily: 'Electrolize, monospace'}}>
                                SYSTEM INITIALIZING...
                            </p>
                        </div>
                    </div>
                ) : isAuthenticated ? (
                    <div className="dashboard">
                        {/* Dashboard Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#4FCBF8]" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                    MISSION CONTROL
                                </h2>
                                <p className="text-[#E4D00A]" style={{fontFamily: 'Electrolize, monospace'}}>
                                    {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString([], {hour12: false})}
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 clip-hexagon bg-[#382C54]/60 px-4 py-2 border border-[#4FCBF8]/30">
                                <p className="text-sm">OPERATOR STATUS: <span className="text-[#39FF14]">ACTIVE</span></p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {mockStats.map(stat => (
                                <div
                                    key={stat.id}
                                    className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 p-4 rounded clip-edges relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-1 h-full bg-[#39FF14]"></div>
                                    <p className="text-sm text-[#4FCBF8]">{stat.title}</p>
                                    <p className="text-2xl font-bold" style={{fontFamily: 'Electrolize, monospace'}}>
                                        {stat.value}
                                    </p>
                                    <div className={`absolute bottom-2 right-2 text-${
                                        stat.trend === 'up' ? '[#39FF14]' :
                                            stat.trend === 'down' ? '[#FF6B35]' : '[#4FCBF8]'
                                    }`}>
                                        {stat.trend === 'up' && '▲'}
                                        {stat.trend === 'down' && '▼'}
                                        {stat.trend === 'neutral' && '■'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Announcements */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 rounded clip-edges p-4 h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-[#4FCBF8]" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                            ANNOUNCEMENTS
                                        </h3>
                                        <a href="#" className="text-[#39FF14] text-sm flex items-center">
                                            View All <ArrowUpRight size={14} className="ml-1" />
                                        </a>
                                    </div>

                                    <div className="space-y-4">
                                        {mockAnnouncements.map(announcement => (
                                            <div
                                                key={announcement.id}
                                                className={`p-3 border-l-4 ${
                                                    announcement.isPinned ? 'border-l-[#FF6B35]' : 'border-l-[#4FCBF8]'
                                                } bg-[#382C54]/20 rounded`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold">
                                                        {announcement.isPinned && (
                                                            <AlertTriangle size={14} className="inline mr-2 text-[#FF6B35]" />
                                                        )}
                                                        {announcement.title}
                                                    </h4>
                                                    <span className="text-xs text-[#4FCBF8]" style={{fontFamily: 'Electrolize, monospace'}}>
                            {formatDate(announcement.date)}
                          </span>
                                                </div>
                                                <p className="mt-2 text-sm">{announcement.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Access & Upcoming Events */}
                            <div className="col-span-1 space-y-8">
                                {/* Quick Access */}
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 rounded clip-edges p-4">
                                    <h3 className="text-xl font-bold text-[#4FCBF8] mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                        QUICK ACCESS
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {quickLinks.map(link => (
                                            <a
                                                key={link.id}
                                                href="#"
                                                className="flex flex-col items-center justify-center p-3 bg-[#382C54]/40 border border-[#4FCBF8]/30 rounded hover:bg-[#382C54]/60 transition-colors"
                                                style={{borderLeft: `3px solid ${link.color}`}}
                                            >
                                                <div className="mb-2 text-[#4FCBF8]">{link.icon}</div>
                                                <span className="text-sm">{link.title}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Upcoming Events */}
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 rounded clip-edges p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-[#4FCBF8]" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                            UPCOMING EVENTS
                                        </h3>
                                        <a href="#" className="text-[#39FF14] text-sm flex items-center">
                                            Calendar <ArrowUpRight size={14} className="ml-1" />
                                        </a>
                                    </div>

                                    <div className="space-y-3">
                                        {mockEvents.map(event => (
                                            <div key={event.id} className="bg-[#382C54]/20 p-3 rounded">
                                                <div className="flex justify-between">
                                                    <h4 className="font-bold">{event.title}</h4>
                                                    <span className="text-xs text-[#39FF14]" style={{fontFamily: 'Electrolize, monospace'}}>
                            {formatTime(event.time)}
                          </span>
                                                </div>
                                                <div className="flex justify-between mt-2 text-sm">
                                                    <span>{formatDate(event.date)}</span>
                                                    <span className="text-[#4FCBF8]">{event.location}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hero-section py-16">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#4FCBF8] mb-4" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                FRONTIER COMMAND NETWORK
                            </h1>
                            <p className="text-xl mb-8">Connect, organize, and engage with your unit across the galaxy</p>

                            <div className="clip-hexagon bg-[#382C54]/60 p-8 border border-[#4FCBF8]/30 max-w-xl mx-auto">
                                <p className="mb-6">Secure access required. Authenticate with Discord credentials to proceed.</p>
                                <button
                                    onClick={handleDiscordLogin}
                                    className="px-6 py-3 bg-[#382C54] text-[#39FF14] hover:bg-[#382C54]/80 transition-colors rounded clip-edges flex items-center justify-center mx-auto"
                                >
                                    <span className="discord-icon mr-2">🎮</span> Login with Discord
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="features-section mt-16">
                            <h2 className="text-2xl font-bold text-center mb-8 text-[#4FCBF8]" style={{fontFamily: 'Orbitron, sans-serif'}}>
                                COMMAND SYSTEM CAPABILITIES
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 p-5 rounded clip-edges">
                                    <Calendar size={32} className="text-[#39FF14] mb-3" />
                                    <h3 className="text-lg font-bold mb-2 text-[#4FCBF8]">Mission Planning</h3>
                                    <p className="text-sm">Schedule and coordinate operations with real-time updates and notifications.</p>
                                </div>
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 p-5 rounded clip-edges">
                                    <Users size={32} className="text-[#39FF14] mb-3" />
                                    <h3 className="text-lg font-bold mb-2 text-[#4FCBF8]">Unit Management</h3>
                                    <p className="text-sm">Organize your forces into structured units with defined command hierarchies.</p>
                                </div>
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 p-5 rounded clip-edges">
                                    <MessageSquare size={32} className="text-[#39FF14] mb-3" />
                                    <h3 className="text-lg font-bold mb-2 text-[#4FCBF8]">Secure Comms</h3>
                                    <p className="text-sm">Encrypted communication channels for sensitive operational discussions.</p>
                                </div>
                                <div className="bg-[#0C1C2C]/80 border border-[#4FCBF8]/30 p-5 rounded clip-edges">
                                    <FileText size={32} className="text-[#39FF14] mb-3" />
                                    <h3 className="text-lg font-bold mb-2 text-[#4FCBF8]">Intelligence Archive</h3>
                                    <p className="text-sm">Access and share mission-critical resources and documentation.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="relative z-10 bg-[#0C1C2C] border-t border-[#4FCBF8]/30 py-4 mt-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-sm text-[#4FCBF8]">© 2025 Frontier Command Network</p>
                        </div>
                        <div className="flex space-x-4">
                            <a href="#" className="text-sm text-[#4FCBF8] hover:text-[#39FF14]">Terms of Service</a>
                            <a href="#" className="text-sm text-[#4FCBF8] hover:text-[#39FF14]">Privacy Policy</a>
                            <a href="#" className="text-sm text-[#4FCBF8] hover:text-[#39FF14]">Support</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* CSS for clip shapes */}
            <style jsx>{`
        .clip-hexagon {
          clip-path: polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
        }
        
        .clip-edges {
          clip-path: polygon(0% 0%, 97% 0%, 100% 30%, 100% 100%, 3% 100%, 0% 70%);
        }
        
        @keyframes glow {
          0% { box-shadow: 0 0 5px #4FCBF8; }
          50% { box-shadow: 0 0 15px #4FCBF8; }
          100% { box-shadow: 0 0 5px #4FCBF8; }
        }
        
        .glow-effect {
          animation: glow 2s infinite;
        }
      `}</style>
        </div>
    );
};

export default Home;