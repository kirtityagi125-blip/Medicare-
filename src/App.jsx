import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './App.css';
import logo from './assets/logo.png';
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';

// --- Data ---
const medicineProducts = [
  // Kids
  { 
    id: 1, 
    name: 'Pedia-Relief Syrup', 
    desc: 'Fast acting fever & pain relief for infants and children.', 
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'kids',
    category: 'Fever & Pain',
    price: 12.99,
    rating: 4.8,
    badges: ['Pediatric Approved', 'Sugar Free']
  },
  { 
    id: 2, 
    name: 'Gripe Water Plus', 
    desc: 'Natural herbal remedy for tummy troubles and colic.', 
    img: 'https://images.unsplash.com/photo-1631549916768-4119b295f78b?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'kids',
    category: 'Digestion',
    price: 8.50,
    rating: 4.5,
    badges: ['Safe for Kids', '100% Natural']
  },
  { 
    id: 3, 
    name: 'Smarty-Vites', 
    desc: 'Daily essential multivitamins for healthy growth.', 
    img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'kids',
    category: 'Supplements',
    price: 15.25,
    rating: 4.9,
    badges: ['Pediatric Approved', 'Great Taste']
  },
  { 
    id: 14, 
    name: 'Cough-Away Syrup', 
    desc: 'Soothing honey-based cough syrup for kids.', 
    img: 'https://images.unsplash.com/photo-1550573105-4584e8d75472?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'kids',
    category: 'Cough & Cold',
    price: 10.99,
    rating: 4.7,
    badges: ['Non-Drowsy', 'Honey Based']
  },
  
  // Adults
  { 
    id: 4, 
    name: 'Essential Multivitamins', 
    desc: 'Complete daily nutrition with 24 essential vitamins and minerals.', 
    img: 'https://images.unsplash.com/photo-1616671285412-878f7e7707e7?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Vitamins',
    price: 24.99,
    rating: 4.9,
    badges: ['Doctor Recommended', 'Best Seller']
  },
  { 
    id: 5, 
    name: 'Immuno-Boost Zinc', 
    desc: 'Advanced immunity support with Zinc and Vitamin C.', 
    img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Immunity Boosters',
    price: 19.50,
    rating: 4.8,
    badges: ['Daily Wellness', 'Sugar Free']
  },
  { 
    id: 15, 
    name: 'Omega-3 Fish Oil', 
    desc: 'High-potency heart and brain health support.', 
    img: 'https://images.unsplash.com/photo-1550573105-4584e8d75472?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Vitamins',
    price: 28.00,
    rating: 4.9,
    badges: ['Triple Strength', 'Mercury Free']
  },
  { 
    id: 6, 
    name: 'Pure Whey Protein', 
    desc: 'Premium post-workout recovery with high biological value protein.', 
    img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Protein Supplements',
    price: 45.00,
    rating: 4.7,
    badges: ['Best Seller', 'Lab Tested']
  },
  
  // Elders
  { 
    id: 7, 
    name: 'Joint-Flex Gold Gel', 
    desc: 'Advanced cooling gel for instant joint pain relief and flexibility.', 
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'Joint Care',
    price: 32.00,
    rating: 4.9,
    badges: ['Doctor Trusted', 'Senior Safe']
  },
  { 
    id: 8, 
    name: 'Cardio-Care BP Plus', 
    desc: 'Clinically tested support for heart health and circulation.', 
    img: 'https://images.unsplash.com/photo-1631549916768-4119b295f78b?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'BP Support',
    price: 28.75,
    rating: 4.7,
    badges: ['Senior Safe', 'Daily Care']
  },
  { 
    id: 9, 
    name: 'Gluco-Balance Tabs', 
    desc: 'Natural support for maintaining healthy blood sugar levels.', 
    img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'Diabetes Care',
    price: 24.99,
    rating: 4.5,
    badges: ['Doctor Trusted', 'Natural Formula']
  },
  { 
    id: 12, 
    name: 'Calcium D3 Gold', 
    desc: 'Essential bone density support for senior skeletal health.', 
    img: 'https://images.unsplash.com/photo-1616671285412-878f7e7707e7?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'Calcium Supplements',
    price: 22.50,
    rating: 4.8,
    badges: ['Daily Care', 'Bone Health']
  },
  { 
    id: 16, 
    name: 'Eye-Vision Guard', 
    desc: 'Lutein based formula for supporting aging eyesight.', 
    img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'Daily Care',
    price: 35.00,
    rating: 4.6,
    badges: ['Clinically Tested', 'Senior Safe']
  },
  { 
    id: 13, 
    name: 'Mobility-Max Tabs', 
    desc: 'Targeted support for muscle strength and senior mobility.', 
    img: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'elders',
    category: 'Mobility Support',
    price: 38.00,
    rating: 4.7,
    badges: ['Senior Safe', 'Extra Strength']
  },
  { 
    id: 10, 
    name: 'Pro-Relief Pain Tabs', 
    desc: 'Fast acting relief for muscular pain, joint ache and headaches.', 
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Pain Relief',
    price: 14.99,
    rating: 4.6,
    badges: ['Fast Acting', 'Doctor Recommended']
  },
  { 
    id: 11, 
    name: 'Glow-Up Collagen', 
    desc: 'Support skin elasticity and hydration from within.', 
    img: 'https://images.unsplash.com/photo-1631549916768-4119b295f78b?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Skin Care',
    price: 35.50,
    rating: 4.8,
    badges: ['Daily Wellness', 'Anti-Aging']
  },
  { 
    id: 19, 
    name: 'Herbal Sleep Support', 
    desc: 'Melatonin-free blend for restful, natural sleep cycles.', 
    img: 'https://images.unsplash.com/photo-1550573105-4584e8d75472?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Daily Wellness',
    price: 18.00,
    rating: 4.6,
    badges: ['Natural Blend', 'Non-Habit Forming']
  },
  { 
    id: 20, 
    name: 'Mega-D3 + K2', 
    desc: 'Essential for calcium absorption and bone strength.', 
    img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'adults',
    category: 'Vitamins',
    price: 15.99,
    rating: 4.9,
    badges: ['High Potency', 'Lab Tested']
  },
  { 
    id: 21, 
    name: 'Deep Breath Tabs', 
    desc: 'Respiratory support with natural eucalyptus and menthol.', 
    img: 'https://images.unsplash.com/photo-1616671285412-878f7e7707e7?q=80&w=300&h=200&auto=format&fit=crop', 
    ageGroup: 'kids',
    category: 'Cough & Cold',
    price: 9.50,
    rating: 4.5,
    badges: ['Sugar Free', 'Fast Relief']
  }
];

// --- Play Zone Data ---
const gameLobbyData = [
  { id: 'mcq', title: 'Health MCQ Quiz', icon: '📝', desc: '5 tricky questions to test your knowledge.', color: '#FEE2E2' },
  { id: 'jumbled', title: 'Jumbled Words', icon: '🔠', desc: 'Rearrange health terms within time.', color: '#F0FDF4' },
  { id: 'memory', title: 'Memory Match', icon: '🧩', desc: 'Match organs with their functions.', color: '#EFF6FF' },
  { id: 'image', title: 'Identify Medicine', icon: '📸', desc: 'Recognize the correct medicine type.', color: '#FAF5FF' },
];

const jumbledWordsData = [
  { word: 'LIVER', hint: 'The body\'s primary filtration system.' },
  { word: 'LUNGS', hint: 'Essential for breathing and oxygenation.' },
  { word: 'TABLET', hint: 'A common solid form of medicine.' },
  { word: 'SYRUP', hint: 'Sweet liquid medicine for kids.' },
  { word: 'IMMUNITY', hint: 'Your body\'s defense against germs.' },
  { word: 'VITAMIN', hint: 'Nutrients needed for healthy growth.' },
  { word: 'KIDNEY', hint: 'Organ that filters waste from blood.' },
  { word: 'HEART', hint: 'Pumps blood throughout your body.' },
];

const mcqQuestions = [
  { q: "Which organ cleans toxins from blood?", options: ["Stomach", "Lungs", "Liver", "Bladder"], correct: 2 },
  { q: "Which vitamin improves immunity?", options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin K"], correct: 2 },
  { q: "Smoking mainly damages which organ?", options: ["Eyes", "Lungs", "Ears", "Skin"], correct: 1 },
  { q: "Which food is rich in iron?", options: ["Apples", "Spinach", "Rice", "Cucumbers"], correct: 1 },
  { q: "What is the normal body temperature in Celsius?", options: ["35°C", "37°C", "39°C", "41°C"], correct: 1 },
  { q: "Which part of the body is affected by cataracts?", options: ["Heart", "Ears", "Eyes", "Teeth"], correct: 2 },
];

const memoryCardsData = [
  { id: 1, type: 'organ', name: 'Heart', matchId: 'pump', icon: '❤️' },
  { id: 2, type: 'function', name: 'Pumps Blood', matchId: 'pump', icon: '🩸' },
  { id: 3, type: 'organ', name: 'Lungs', matchId: 'breath', icon: '🫁' },
  { id: 4, type: 'function', name: 'Breathing', matchId: 'breath', icon: '🌬️' },
  { id: 5, type: 'organ', name: 'Brain', matchId: 'memory', icon: '🧠' },
  { id: 6, type: 'function', name: 'Memory', matchId: 'memory', icon: '💾' },
  { id: 7, type: 'medicine', name: 'Antibiotic', matchId: 'germs', icon: '💊' },
  { id: 8, type: 'usage', name: 'Fights Germs', matchId: 'germs', icon: '🦠' },
];

const imageGamesData = [
  { id: 1, type: 'Tablet', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&h=200&auto=format&fit=crop' },
  { id: 2, type: 'Syrup', img: 'https://images.unsplash.com/photo-1550573105-4584e8d75472?q=80&w=300&h=200&auto=format&fit=crop' },
  { id: 3, type: 'Capsule', img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&h=200&auto=format&fit=crop' },
  { id: 4, type: 'Injection', img: 'https://images.unsplash.com/photo-1579154235884-332c3ef46883?q=80&w=300&h=200&auto=format&fit=crop' },
  { id: 5, type: 'Mask', img: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=300&h=200&auto=format&fit=crop' },
];

const doctorData = [
  { 
    id: 1, 
    name: 'Dr. Sarah Wilson', 
    specialty: 'Pediatrician', 
    clinic: 'Kids Care Clinic', 
    rating: 4.9, 
    exp: '12 years', 
    dist: '1.2 km', 
    coords: [19.0760, 72.8777], // Mumbai example
    img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 2, 
    name: 'Dr. Rajesh Khanna', 
    specialty: 'Cardiologist', 
    clinic: 'Heart Center', 
    rating: 4.8, 
    exp: '20 years', 
    dist: '2.5 km', 
    coords: [19.0820, 72.8888],
    img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 3, 
    name: 'Dr. Elena Gilbert', 
    specialty: 'Dermatologist', 
    clinic: 'Skin Glow Hospital', 
    rating: 4.7, 
    exp: '8 years', 
    dist: '0.8 km', 
    coords: [19.0650, 72.8666],
    img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop'
  },
  { 
    id: 4, 
    name: 'Dr. Michael Chen', 
    specialty: 'Eye Specialist', 
    clinic: 'Vision Plus', 
    rating: 4.9, 
    exp: '15 years', 
    dist: '3.1 km', 
    coords: [19.0950, 72.8999],
    img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop'
  }
];

// --- Components ---

const BottomNav = () => {
  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className="nav-item active">
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      <Link to="/play-zone" className="nav-item">
        <i className="fas fa-gamepad"></i>
        <span>Games</span>
      </Link>
      <Link to="/find-doctor" className="nav-item">
        <i className="fas fa-user-md"></i>
        <span>Doctors</span>
      </Link>
      <Link to="/medicines/kids" className="nav-item">
        <i className="fas fa-pills"></i>
        <span>Shop</span>
      </Link>
      <Link to="#" className="nav-item">
        <i className="fas fa-user-md"></i>
        <span>Doctors</span>
      </Link>
    </div>
  );
};

const Navbar = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isPlayZone = location.pathname === '/play-zone';
  
  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <header className={`header ${isPlayZone ? 'nav-cream' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Brand Logo */}
          <Link to="/" className="logo-container">
            <img src={logo} alt="Medicare Logo" className="logo-img" />
          </Link>
          
          {/* Global Search (Hidden on Mobile, or inside menu) */}
          <div className="search-container desktop-only">
            <div className="pill-search-bar">
              <input type="text" placeholder="Search medicines, health products..." />
              <button><i className="fas fa-search"></i></button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="nav desktop-only">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li className="dropdown">
                <a href="#">Medicines <i className="fas fa-chevron-down"></i></a>
                <ul className="dropdown-menu">
                  <li><Link to="/medicines/kids">Kids Medicines</Link></li>
                  <li><Link to="/medicines/adults">Adults Medicines</Link></li>
                  <li><Link to="/medicines/elders">Elders Medicines</Link></li>
                  <li><Link to="/eye-test" style={{color: '#7c3aed', fontWeight: '700'}}><i className="fas fa-eye"></i> Free Eye Test</Link></li>
                </ul>
              </li>
              <li><Link to="/play-zone">Play Zone</Link></li>
              <li><Link to="/find-doctor">Doctor Finder</Link></li>
              <li className="nav-auth-btns">
                {user ? (
                  <div className="user-profile-dropdown">
                    <div className="avatar-circle">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="dropdown-content glass-effect">
                      <div className="dropdown-header">
                        <p className="user-name-label">{user.email.split('@')[0]}</p>
                        <p className="user-email-label">{user.email}</p>
                      </div>
                      <hr />
                      <button onClick={onLogout} className="logout-dropdown-btn">
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="login-btn" onClick={onLoginClick}>Login</button>
                    <button className="signup-btn" onClick={onSignupClick}>Sign Up</button>
                  </>
                )}
              </li>
            </ul>
          </nav>

          {/* Mobile Specific Header Row (Visible ONLY on Mobile) */}
          <div className="mobile-header-row">
            <div className="m-user-info">
              <div className="m-avatar">
                {user ? user.email.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="m-greeting">Hi, {user ? user.email.split('@')[0] : 'Guest'}</span>
            </div>
            <button className="m-notif-btn"><i className="far fa-bell"></i></button>
          </div>
        </div>

        {/* Mobile Search Bar (Below Header) */}
        <div className="mobile-search-bar">
          <div className="m-search-pill">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search medicines..." />
          </div>
        </div>
      </div>
    </header>
  );
};


// --- Doctor Finder Component ---
const DoctorFinderPage = () => {
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredDoctors = doctorData.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="doctor-finder-container">
      <div className="df-header">
        <div className="container">
          <div className="df-header-content">
            <div className="df-title">
              <h1>Find Nearby Doctors</h1>
              <p>Search by specialty or name to find the best healthcare near you.</p>
            </div>
            <div className="df-search-box glass-effect">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Ex: Pediatrician, Cardiologist..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn-primary">Search</button>
            </div>
          </div>
        </div>
      </div>

      <div className="df-main container">
        <div className="df-grid">
          <div className="df-list-section">
            <div className="list-stats">
              <span>{filteredDoctors.length} Doctors found near you</span>
            </div>
            <div className="doctor-cards-container">
              {filteredDoctors.map(doctor => (
                <motion.div 
                  key={doctor.id}
                  className={`df-card glass-effect ${activeDoctor?.id === doctor.id ? 'active' : ''}`}
                  whileHover={{ y: -5 }}
                  onClick={() => setActiveDoctor(doctor)}
                >
                  <img src={doctor.img} alt={doctor.name} className="df-doc-img" />
                  <div className="df-doc-info">
                    <div className="df-doc-header">
                      <h3>{doctor.name}</h3>
                      <span className="dist-tag"><i className="fas fa-map-marker-alt"></i> {doctor.dist}</span>
                    </div>
                    <p className="df-specialty">{doctor.specialty}</p>
                    <div className="df-meta">
                      <span><i className="fas fa-briefcase"></i> {doctor.exp} Exp</span>
                      <span className="df-rating"><i className="fas fa-star"></i> {doctor.rating}</span>
                    </div>
                    <p className="df-clinic"><i className="fas fa-hospital"></i> {doctor.clinic}</p>
                    <div className="df-actions">
                      <button className="btn-primary btn-sm">Book Appointment</button>
                      <button className="btn-outline btn-sm">View Profile</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="df-map-section desktop-only">
            <div className="map-placeholder glass-effect">
              <div className="map-overlay">
                <i className="fas fa-map-marked-alt"></i>
                <p>Interactive Map View</p>
                <span className="map-hint">Visualizing clinics in your area</span>
              </div>
              
              {filteredDoctors.map(doctor => (
                <motion.div 
                  key={doctor.id}
                  className={`map-marker ${activeDoctor?.id === doctor.id ? 'active' : ''}`}
                  style={{ 
                    top: `${40 + (doctor.id * 10)}%`, 
                    left: `${30 + (doctor.id * 15)}%` 
                  }}
                >
                  <i className="fas fa-user-md"></i>
                  {activeDoctor?.id === doctor.id && (
                    <div className="marker-popup glass-effect">
                      <strong>{doctor.name}</strong>
                      <span>{doctor.clinic}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProtectedRoute = ({ user, children, onAuthRequired }) => {
  if (!user) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div className="login-prompt-card glass-effect" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', borderRadius: '30px' }}>
          <i className="fas fa-lock" style={{ fontSize: '50px', color: '#5c3d2e', marginBottom: '20px' }}></i>
          <h2>Login Required</h2>
          <p>You need to be logged in to access this feature. Join the MediPurple community today!</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn-primary" onClick={onAuthRequired}>Login / Sign Up</button>
            <Link to="/" className="btn-secondary">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

const PlayZonePage = ({ user, totalPoints, onUpdatePoints }) => {
  const [view, setView] = useState('lobby');
  const [lastResults, setLastResults] = useState(null);

  const getLevel = () => {
    if (totalPoints >= 500) return 'Health Master';
    if (totalPoints >= 250) return 'Wellness Expert';
    if (totalPoints >= 100) return 'Health Learner';
    return 'Beginner';
  };

  const handleGameEnd = async (results) => {
    const earnedPoints = results.filter(r => r.correct).length * 10;
    setLastResults(results);
    
    if (earnedPoints > 0) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      if (user) {
        onUpdatePoints(earnedPoints);
      }
    }
    setView('results');
  };

  return (
    <div className="play-zone-container">
      <section className="pz-hero">
        <div className="container">
          <div className="pz-hero-content">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="pz-hero-icon">🎮</div>
              <h1>Health Play Zone</h1>
              <p>Play, learn, and earn health reward points.</p>
            </motion.div>
            <div className="pz-stats-box glass-effect">
              <div className="pz-stat">
                <span className="pz-stat-label">Total Points</span>
                <span className="pz-stat-value">{totalPoints} HP</span>
              </div>
              <div className="pz-stat-divider"></div>
              <div className="pz-stat">
                <span className="pz-stat-label">Rank</span>
                <span className="pz-stat-value">{getLevel()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container pz-main">
        <AnimatePresence mode="wait">
          {view === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="pz-lobby-header">
                <div className="pz-daily-badge">Daily Challenge: Brain Booster 🧠</div>
              </div>
              <div className="pz-game-grid">
                {gameLobbyData.map((game) => (
                  <motion.div 
                    key={game.id} 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    className="pz-game-card"
                    style={{ '--game-color': game.color }}
                    onClick={() => {
                      if (!user) onAuthRequired();
                      else setView(game.id);
                    }}
                  >
                    <span className="pz-game-icon">{game.icon}</span>
                    <h3>{game.title}</h3>
                    <p>{game.desc}</p>
                    <button className="pz-play-btn">Play Now</button>
                  </motion.div>
                ))}
                <motion.div 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="pz-game-card"
                  style={{ '--game-color': '#FEF3C7' }}
                  onClick={() => {
                    if (!user) onAuthRequired();
                    else setView('nutri');
                  }}
                >
                  <span className="pz-game-icon">🍎</span>
                  <h3>Nutri-Sort</h3>
                  <p>Sort foods into Healthy or Junk categories.</p>
                  <button className="pz-play-btn">Play Now</button>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="pz-game-card"
                  style={{ '--game-color': '#ECFDF5' }}
                  onClick={() => {
                    if (!user) onAuthRequired();
                    else setView('organ-guess');
                  }}
                >
                  <span className="pz-game-icon">🫀</span>
                  <h3>Organ Hunt</h3>
                  <p>Identify the organ based on its function.</p>
                  <button className="pz-play-btn">Play Now</button>
                </motion.div>
              </div>
              
              <Leaderboard points={totalPoints} level={getLevel()} />
              <RedeemPoints />
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <GameSummary results={lastResults} onBack={() => setView('lobby')} />
            </motion.div>
          )}

          {view === 'mcq' && <MCQGame onEnd={handleGameEnd} />}
          {view === 'jumbled' && <JumbledWordsGame onEnd={handleGameEnd} />}
          {view === 'memory' && <MemoryMatchGame onEnd={handleGameEnd} />}
          {view === 'image' && <ImageIdentifyGame onEnd={handleGameEnd} />}
          {view === 'nutri' && <NutriSortGame onEnd={handleGameEnd} />}
          {view === 'organ-guess' && <OrganGuessGame onEnd={handleGameEnd} />}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Mini Game Components ---

const NutriSortGame = ({ onEnd }) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const items = useMemo(() => [
    { name: 'Apple', type: 'Healthy', icon: '🍎' },
    { name: 'Pizza', type: 'Junk', icon: '🍕' },
    { name: 'Spinach', type: 'Healthy', icon: '🥬' },
    { name: 'Burger', type: 'Junk', icon: '🍔' },
    { name: 'Carrot', type: 'Healthy', icon: '🥕' },
    { name: 'Soda', type: 'Junk', icon: '🥤' },
    { name: 'Donut', type: 'Junk', icon: '🍩' },
    { name: 'Fish', type: 'Healthy', icon: '🐟' },
  ].sort(() => Math.random() - 0.5).slice(0, 5), []);

  const handleSort = (type) => {
    const isCorrect = type === items[index].type;
    const newResult = {
      question: `Sort ${items[index].name} ${items[index].icon}`,
      answer: type,
      correctAnswer: items[index].type,
      correct: isCorrect
    };

    const newResults = [...results, newResult];
    if (index < 4) {
      setIndex(index + 1);
      setResults(newResults);
    } else {
      onEnd(newResults);
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
      <div className="pz-game-header">
        <h3>Item {index + 1} of 5</h3>
      </div>
      <div className="pz-game-card-wide glass-effect text-center">
        <h2 style={{fontSize: '60px', marginBottom: '20px'}}>{items[index].icon}</h2>
        <h3>{items[index].name}</h3>
        <p>Is this Healthy or Junk?</p>
        <div className="pz-mcq-options">
          <button className="pz-option-btn" onClick={() => handleSort('Healthy')} style={{borderColor: '#10B981'}}>Healthy 🥦</button>
          <button className="pz-option-btn" onClick={() => handleSort('Junk')} style={{borderColor: '#EF4444'}}>Junk 🍟</button>
        </div>
      </div>
    </motion.div>
  );
};

const OrganGuessGame = ({ onEnd }) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const questions = useMemo(() => [
    { organ: 'Heart', hint: 'Pumps blood to the whole body.', icon: '❤️' },
    { organ: 'Lungs', hint: 'Takes in oxygen and releases CO2.', icon: '🫁' },
    { organ: 'Stomach', hint: 'Breaks down food with acid.', icon: '🥣' },
    { organ: 'Brain', hint: 'Controls every thought and action.', icon: '🧠' },
    { organ: 'Kidney', hint: 'Filters waste from your blood.', icon: '🧼' },
  ].sort(() => Math.random() - 0.5), []);

  const handleGuess = (guess) => {
    const isCorrect = guess === questions[index].organ;
    const newResult = {
      question: questions[index].hint,
      answer: guess,
      correctAnswer: questions[index].organ,
      correct: isCorrect
    };

    const newResults = [...results, newResult];
    if (index < 4) {
      setIndex(index + 1);
      setResults(newResults);
    } else {
      onEnd(newResults);
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="pz-game-header">
        <h3>Guess {index + 1} of 5</h3>
      </div>
      <div className="pz-game-card-wide glass-effect text-center">
        <div className="pz-hero-icon" style={{filter: 'grayscale(1)', opacity: 0.3}}>❓</div>
        <h3>Which organ?</h3>
        <p className="hint" style={{fontSize: '20px', fontWeight: '700', color: '#1E1B4B'}}>{questions[index].hint}</p>
        <div className="pz-mcq-options">
          {['Heart', 'Lungs', 'Stomach', 'Brain', 'Kidney', 'Liver'].sort(() => Math.random() - 0.5).map(opt => (
            <button key={opt} className="pz-option-btn" onClick={() => handleGuess(opt)}>{opt}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Mini Game Components ---

const GameSummary = ({ results, onBack }) => {
  const correctCount = results.filter(r => r.correct).length;
  const total = results.length;
  const points = correctCount * 10;

  return (
    <div className="pz-game-card-wide glass-effect text-center results-summary">
      <div className="completion-icon">🏆</div>
      <h2>Game Complete!</h2>
      <div className="score-main">
        <span className="score-circle">{correctCount}/{total}</span>
        <p>You earned <strong>{points} Health Points!</strong></p>
      </div>

      <div className="results-list">
        <h3>Correct Answers:</h3>
        {results.map((res, i) => (
          <div key={i} className={`result-row ${res.correct ? 'res-correct' : 'res-wrong'}`}>
            <span className="res-q">Q: {res.question}</span>
            <span className="res-ans">Ans: {res.answer} {res.correct ? '✅' : `(Correct: ${res.correctAnswer}) ❌`}</span>
          </div>
        ))}
      </div>

      <button className="pz-play-btn mt-30" onClick={onBack}>Back to Lobby</button>
    </div>
  );
};

const MCQGame = ({ onEnd }) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const questions = useMemo(() => [...mcqQuestions].sort(() => Math.random() - 0.5).slice(0, 5), []);

  const handleAnswer = (i) => {
    const isCorrect = i === questions[index].correct;
    const newResult = {
      question: questions[index].q,
      answer: questions[index].options[i],
      correctAnswer: questions[index].options[questions[index].correct],
      correct: isCorrect
    };
    
    const newResults = [...results, newResult];
    if (index < 4) {
      setIndex(index + 1);
      setResults(newResults);
    } else {
      onEnd(newResults);
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
      <div className="pz-game-header">
        <h3>Question {index + 1} of 5</h3>
        <div className="pz-progress-mini"><div style={{ width: `${(index+1)*20}%` }}></div></div>
      </div>
      <div className="pz-game-card-wide glass-effect">
        <h4>{questions[index].q}</h4>
        <div className="pz-mcq-options">
          {questions[index].options.map((opt, i) => (
            <button key={i} className="pz-option-btn" onClick={() => handleAnswer(i)}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const JumbledWordsGame = ({ onEnd }) => {
  const [index, setIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState([]);
  const words = useMemo(() => [...jumbledWordsData].sort(() => Math.random() - 0.5).slice(0, 5), []);

  const scrambled = useMemo(() => {
    let s = words[index].word.split('').sort(() => Math.random() - 0.5).join('');
    while (s === words[index].word) s = words[index].word.split('').sort(() => Math.random() - 0.5).join('');
    return s;
  }, [index, words]);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    
    // Validate: only allow letters from the scrambled word
    // And don't allow using a letter more times than it appears
    const targetWord = words[index].word;
    const charCount = {};
    [...targetWord].forEach(c => charCount[c] = (charCount[c] || 0) + 1);
    
    const inputCount = {};
    let isValid = true;
    for (const char of val) {
      if (!charCount[char]) {
        isValid = false;
        break;
      }
      inputCount[char] = (inputCount[char] || 0) + 1;
      if (inputCount[char] > charCount[char]) {
        isValid = false;
        break;
      }
    }
    
    if (isValid || val === '') {
      setUserInput(val);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const isCorrect = userInput.toUpperCase() === words[index].word;
    const newResult = {
      question: `Scrambled: ${scrambled}`,
      answer: userInput.toUpperCase(),
      correctAnswer: words[index].word,
      correct: isCorrect
    };

    const newResults = [...results, newResult];
    if (index < 4) {
      setIndex(index + 1);
      setUserInput('');
      setResults(newResults);
    } else {
      onEnd(newResults);
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
      <div className="pz-game-header">
        <h3>Word {index + 1} of 5</h3>
        <div className="pz-progress-mini"><div style={{ width: `${(index+1)*20}%` }}></div></div>
      </div>
      <div className="pz-game-card-wide glass-effect text-center">
        <h3>Unscramble the Word</h3>
        <div className="scrambled-box">{scrambled}</div>
        <p className="hint">💡 Hint: {words[index].hint}</p>
        <form onSubmit={handleSubmit} className="jumbled-form">
          <input 
            type="text" 
            value={userInput} 
            onChange={handleInputChange} 
            placeholder="Type word here..."
            autoFocus
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </motion.div>
  );
};

const MemoryMatchGame = ({ onEnd }) => {
  const [cards, setCards] = useState(() => [...memoryCardsData].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const handleFlip = (i) => {
    if (flipped.length === 2 || matched.includes(i) || flipped.includes(i)) return;
    const newFlipped = [...flipped, i];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      if (cards[newFlipped[0]].matchId === cards[newFlipped[1]].matchId) {
        setMatched([...matched, ...newFlipped]);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            onEnd([
              { question: 'Memory Match', answer: `${moves + 1} moves`, correctAnswer: '< 10 moves', correct: moves < 10 }
            ]);
          }, 1000);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h3 className="text-center mb-20">Memory Match - Moves: {moves}</h3>
      <div className="memory-grid">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            className={`memory-card ${flipped.includes(i) || matched.includes(i) ? 'flipped' : ''}`}
            onClick={() => handleFlip(i)}
            whileTap={{ scale: 0.9 }}
          >
            <div className="card-front">?</div>
            <div className="card-back">
              <span>{card.icon}</span>
              <p>{card.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ImageIdentifyGame = ({ onEnd }) => {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const questions = useMemo(() => [...imageGamesData].sort(() => Math.random() - 0.5).slice(0, 5), []);

  const handleChoice = (choice) => {
    const isCorrect = choice === questions[index].type;
    const newResult = {
      question: `Identify Image #${index + 1}`,
      answer: choice,
      correctAnswer: questions[index].type,
      correct: isCorrect
    };

    const newResults = [...results, newResult];
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setResults(newResults);
    } else {
      onEnd(newResults);
    }
  };

  return (
    <motion.div className="pz-game-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="pz-game-header">
        <h3>Identify {index + 1} of {questions.length}</h3>
      </div>
      <div className="pz-game-card-wide glass-effect text-center">
        <h3>What is this?</h3>
        <div className="pz-identify-img">
          <img src={questions[index].img} alt="Medicine" />
        </div>
        <div className="pz-image-options">
          {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Mask'].map(type => (
            <button key={type} onClick={() => handleChoice(type)}>{type}</button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Leaderboard = ({ userPoints, userLevel, user }) => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaders(users);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="pz-leaderboard">
      <h2 className="pz-section-title">Global Leaderboard</h2>
      <div className="pz-lb-card glass-effect">
        {leaders.map((p, i) => (
          <div key={p.id} className={`pz-lb-item ${user && p.id === user.uid ? 'highlight' : ''}`}>
            <div className="pz-lb-rank">#{i+1}</div>
            <div className="pz-lb-name">{p.displayName || p.email?.split('@')[0] || 'Player'}</div>
            <div className="pz-lb-points">{p.points || 0} HP</div>
            <div className="pz-lb-badge">{p.rank || 'Beginner'}</div>
          </div>
        ))}
        {leaders.length === 0 && <p className="text-center p-20">No players yet. Be the first!</p>}
      </div>
    </section>
  );
};

const RedeemPoints = () => (
  <section className="pz-redeem">
    <h2 className="pz-section-title">Redeem Rewards</h2>
    <div className="pz-redeem-grid">
      <div className="pz-reward-card">
        <div className="reward-val">🎟️ 5% OFF</div>
        <p>Medicine Coupon</p>
        <button disabled>100 HP</button>
      </div>
      <div className="pz-reward-card">
        <div className="reward-val">🚚 FREE</div>
        <p>Delivery</p>
        <button disabled>250 HP</button>
      </div>
      <div className="pz-reward-card">
        <div className="reward-val">👨‍⚕️ FREE</div>
        <p>Consultation</p>
        <button disabled>500 HP</button>
      </div>
    </div>
  </section>
);

// --- Main App Logic ---

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-full-container hero-content-wrapper">
          <div className="hero-text-content">
            <span className="hero-tag">MORE THAN MEDICINES</span>
            <h1 className="hero-title">Care You Can <br /> Trust.</h1>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => navigate('/medicines/adults')}>Shop Medicines <i className="fas fa-arrow-right"></i></button>
              <button className="btn-secondary">Find a Doctor <i className="fas fa-arrow-right"></i></button>
            </div>
          </div>
          
          <div className="trust-bar glass-effect">
            <div className="trust-item">
              <div className="trust-icon"><i className="fas fa-shield-alt"></i></div>
              <div className="trust-info">
                <strong>Trusted Quality</strong>
                <span>100% Genuine Medicines</span>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon"><i className="fas fa-user-md"></i></div>
              <div className="trust-info">
                <strong>Expert Support</strong>
                <span>Pharmacists You Can Trust</span>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon"><i className="fas fa-truck"></i></div>
              <div className="trust-info">
                <strong>Fast Delivery</strong>
                <span>On Time, Every Time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <a href="#" className="view-all-link">View All <i className="fas fa-chevron-right"></i></a>
          </div>

          <div className="category-grid">
            {[
              { icon: 'fa-tooth', title: 'Oral Care', count: '120 Products', color: '#FDF8F3' },
              { icon: 'fa-baby', title: 'Baby Care', count: '85 Products', color: '#F7E9D7' },
              { icon: 'fa-tint', title: 'Diabetes', count: '45 Products', color: '#FDF8F3' },
              { icon: 'fa-female', title: 'Women Care', count: '60 Products', color: '#F7E9D7' },
              { icon: 'fa-pump-soap', title: 'Personal Care', count: '200 Products', color: '#FDF8F3' },
              { icon: 'fa-heartbeat', title: 'Health Devices', count: '30 Products', color: '#F7E9D7' }
            ].map((cat, i) => (
              <div key={i} className="category-card" style={{ '--bg-color': cat.color }}>
                <div className="cat-icon-box">
                  <i className={`fas ${cat.icon}`}></i>
                </div>
                <h3>{cat.title}</h3>
                <p>{cat.count}</p>
                <a href="#" className="cat-link">Explore <i className="fas fa-arrow-right"></i></a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eye Test Promo Section (Moved Up) */}
      <section className="eye-test-promo">
        <div className="container">
          <div className="promo-card glass-effect">
            <div className="promo-text">
              <span className="promo-tag">New Feature</span>
              <h2>Check Your Vision for Free</h2>
              <p>Quick, easy, and digital. Take our interactive eye test to screen your visual health in minutes.</p>
              <button className="btn-primary" onClick={() => navigate('/eye-test')}>Start Free Test <i className="fas fa-arrow-right"></i></button>
            </div>
            <div className="promo-visual">
              <i className="fas fa-eye"></i>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <a href="#" className="view-all-link">View All <i className="fas fa-chevron-right"></i></a>
          </div>

          <div className="featured-grid">
            {medicineProducts.slice(0, 3).map((prod) => (
              <div 
                key={prod.id} 
                className="featured-card" 
                onClick={() => navigate(`/product/${prod.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="featured-img-box">
                  <img src={prod.img} alt={prod.name} />
                </div>
                <h3>{prod.name}</h3>
                <p>{prod.category}</p>
                <div className="e-price" style={{marginTop: '10px'}}>${prod.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Product Range Section */}
      <section className="product-range-section">
        <div className="container">
          <h2 className="section-title">Our Product Range</h2>
          <div className="range-grid">
            <div className="range-card range-blue">
              <div className="range-icon"><i className="fas fa-tablets"></i></div>
              <h3>Tablets</h3>
            </div>
            <div className="range-card range-white">
              <div className="range-icon"><i className="fas fa-capsules"></i></div>
              <h3>Capsules</h3>
            </div>
            <div className="range-card range-blue">
              <div className="range-icon"><i className="fas fa-prescription-bottle"></i></div>
              <h3>Syrups</h3>
            </div>
            <div className="range-card range-white">
              <div className="range-icon"><i className="fas fa-syringe"></i></div>
              <h3>Injections</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Specialized Care Selection Section */}
      <section className="age-filter-section">
        <div className="container">
          <div className="filter-header">
            <h2 className="section-title" style={{color: '#5C3D2E'}}>Specialized Care</h2>
            <p className="filter-note">Finding the right care for every generation.</p>
            
            <div className="age-toggle-tabs">
              <Link to="/medicines/kids" className="toggle-btn kids">
                <div className="toggle-icon"><i className="fas fa-baby"></i></div>
                <span>Kids</span>
              </Link>
              <Link to="/medicines/adults" className="toggle-btn adults">
                <div className="toggle-icon"><i className="fas fa-user"></i></div>
                <span>Adults</span>
              </Link>
              <Link to="/medicines/elders" className="toggle-btn elders">
                <div className="toggle-icon"><i className="fas fa-user-tie"></i></div>
                <span>Elders</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="features-section">
        <div className="container feature-grid">
          {[
            { icon: 'fa-truck', title: 'Free Delivery', desc: 'On orders over $50' },
            { icon: 'fa-shield-alt', title: '100% Secure', desc: 'Secure payment gateway' },
            { icon: 'fa-user-md', title: 'Expert Advice', desc: 'Talk to our pharmacists' },
            { icon: 'fa-undo', title: 'Easy Returns', desc: '14 days return policy' }
          ].map((feat, i) => (
            <div key={i} className="feature-item">
              <div className="feat-icon"><i className={`fas ${feat.icon}`}></i></div>
              <div className="feat-text">
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

const MedicinePage = () => {
  const { ageGroup } = useParams();
  const navigate = useNavigate();
  const filteredProducts = medicineProducts.filter(prod => prod.ageGroup === ageGroup);
  
  const displayTitle = ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1);

  const sidebarFilters = {
    kids: ['Fever & Pain', 'Cough & Cold', 'Vitamins', 'Digestion', 'Skin Care'],
    adults: ['Vitamins', 'Immunity Boosters', 'Pain Relief', 'Protein Supplements', 'Skin Care', 'Lifestyle Care'],
    elders: ['Joint Care', 'Diabetes Care', 'BP Support', 'Calcium Supplements', 'Heart Health', 'Mobility Support']
  };

  const currentFilters = sidebarFilters[ageGroup] || [];

  return (
    <div className={`medicine-catalog-page theme-${ageGroup}`}>
      {/* Compact Themed Hero */}
      <section className="catalog-hero-compact">
        <div className="container">
          <div className="catalog-header-content">
            <div className="catalog-text">
              <span className="catalog-tag">Pharmacy / {displayTitle} Care</span>
              <h1 className="catalog-title">{displayTitle} Care</h1>
              <p className="catalog-subtitle">
                {ageGroup === 'elders' 
                  ? 'Trusted healthcare products for senior wellness and daily care.' 
                  : ageGroup === 'adults'
                  ? 'Essential healthcare and wellness products for adults.'
                  : `Specialized medicine and healthcare products for ${ageGroup}.`}
              </p>
            </div>
            
            <div className="catalog-search-box">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder={ageGroup === 'elders' ? "Search elderly healthcare products..." : `Search ${displayTitle} medicines...`} 
                />
                <button className="search-btn">Find</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="catalog-main-layout">
        <div className="container layout-grid">
          <aside className="catalog-sidebar">
            <div className="sidebar-widget">
              <h3>Categories</h3>
              <ul>
                {currentFilters.map((f, i) => (
                  <li key={i}><label><input type="checkbox" /> {f}</label></li>
                ))}
              </ul>
            </div>

            <div className="sidebar-widget">
              <h3>Price Range</h3>
              <ul>
                <li><label><input type="radio" name="price" /> Under $20</label></li>
                <li><label><input type="radio" name="price" /> $20 - $50</label></li>
                <li><label><input type="radio" name="price" /> Above $50</label></li>
              </ul>
            </div>

            <div className="sidebar-promo">
              <i className="fas fa-prescription"></i>
              <h4>Need Advice?</h4>
              <p>Consult with our expert pharmacists for free.</p>
              <button>Chat Now</button>
            </div>
          </aside>

          <main className="catalog-content">
            <div className="content-toolbar">
              <p>Showing <strong>{filteredProducts.length}</strong> products</p>
              <select className="sort-select">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>

            <div className="catalog-product-grid">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="e-product-card"
                  onClick={() => navigate(`/product/${prod.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="e-card-header">
                    <span className="e-badge">{prod.category}</span>
                    <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); /* Wishlist logic */ }}><i className="far fa-heart"></i></button>
                  </div>
                  <div className="e-product-img">
                    <img src={prod.img} alt={prod.name} />
                  </div>
                  <div className="e-product-details">
                    <div className="e-rating">
                      <i className="fas fa-star"></i>
                      <span>{prod.rating}</span>
                    </div>
                    <h3>{prod.name}</h3>
                    <p>{prod.desc}</p>
                    <div className="e-badges">
                      {prod.badges.map((b, i) => (
                        <span key={i} className="h-badge">{b}</span>
                      ))}
                    </div>
                    <div className="e-card-footer">
                      <div className="e-price">
                        <span className="currency">$</span>
                        <span className="amount">{prod.price.toFixed(2)}</span>
                      </div>
                      <button className="e-add-btn" onClick={(e) => { e.stopPropagation(); /* Add to cart logic */ }}>
                        <i className="fas fa-shopping-cart"></i>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

const ProductDetailPage = ({ user, onAuthRequired }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = medicineProducts.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(product?.img);

  // Scroll to top on mount or when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) setActiveImg(product.img);
  }, [id, product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const relatedProducts = useMemo(() => {
    // 1. Try same category
    let related = medicineProducts.filter(p => p.category === product.category && p.id !== product.id);
    
    // 2. If not enough, add from same age group
    if (related.length < 4) {
      const sameAge = medicineProducts.filter(p => p.ageGroup === product.ageGroup && p.id !== product.id && !related.find(r => r.id === p.id));
      related = [...related, ...sameAge];
    }
    
    // 3. Still not enough? Add random ones
    if (related.length < 4) {
      const others = medicineProducts.filter(p => p.id !== product.id && !related.find(r => r.id === p.id));
      related = [...related, ...others];
    }
    
    return related.slice(0, 8);
  }, [product]);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link> <i className="fas fa-chevron-right" style={{fontSize: '10px'}}></i>
          <Link to={`/medicines/${product.ageGroup}`}>{product.ageGroup.charAt(0).toUpperCase() + product.ageGroup.slice(1)} Care</Link> <i className="fas fa-chevron-right" style={{fontSize: '10px'}}></i>
          <span>{product.name}</span>
        </div>

        {/* Secondary Nav (Sticky) */}
        <nav className="product-secondary-nav glass-effect">
          <div className="container">
            <ul>
              <li><a href="#top"><i className="fas fa-arrow-up"></i> Top</a></li>
              <li><a href="#about">About this item</a></li>
              <li><a href="#similar">Similar</a></li>
              <li><a href="#info">Product information</a></li>
              <li><a href="#brand">From the Brand</a></li>
              <li><a href="#reviews">Reviews</a></li>
            </ul>
          </div>
        </nav>

        <div id="top" className="product-detail-grid">
          {/* Left: Image Section */}
          <div className="product-image-section sticky-sidebar">
            <motion.div 
              className="main-image-container glass-effect"
              key={activeImg}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img src={activeImg} alt={product.name} />
              <div className="zoom-hint"><i className="fas fa-search-plus"></i> Click to zoom</div>
            </motion.div>
            <div className="thumbnail-grid">
              {[product.img, product.img, product.img, product.img].map((img, i) => (
                <div 
                  key={i} 
                  className={`thumb-item glass-effect ${activeImg === img && i === 0 ? 'active' : ''}`}
                  onClick={() => setActiveImg(img)}
                >
                  <img src={img} alt={`view-${i}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="product-info-section">
            <div className="info-header">
              <span className="info-category">{product.category}</span>
              <div className="info-rating">
                <div className="stars">
                  {[1,2,3,4,5].map(s => (
                    <i key={s} className={`fas fa-star ${s <= Math.floor(product.rating) ? 'active' : ''}`}></i>
                  ))}
                </div>
                <span>({product.rating})</span>
                <span className="review-count">| 1.2k+ Sold</span>
              </div>
            </div>

            <h1 className="product-title">{product.name}</h1>
            <p className="product-short-desc">{product.desc}</p>

            <div className="product-badges-row">
              {product.badges.map((b, i) => (
                <span key={i} className="info-badge"><i className="fas fa-shield-alt"></i> {b}</span>
              ))}
            </div>

            <div className="price-container">
              <span className="price-tag">${product.price.toFixed(2)}</span>
              <span className="mrp-tag">MRP: ${(product.price * 1.2).toFixed(2)}</span>
              <span className="discount-tag">20% OFF</span>
            </div>

            <div className="offers-section">
              <p><strong>Available Offers:</strong></p>
              <ul>
                <li><i className="fas fa-tag"></i> 10% instant discount on HDFC Cards</li>
                <li><i className="fas fa-tag"></i> Flat $5 cashback on first order</li>
              </ul>
            </div>

            <div className="stock-status">
              <i className="fas fa-circle" style={{fontSize: '8px'}}></i> In Stock - Ships in 24 hours
            </div>

            <div className="action-row">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><i className="fas fa-minus"></i></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}><i className="fas fa-plus"></i></button>
              </div>
              <button className="add-to-cart-btn btn-primary" onClick={() => { if(!user) onAuthRequired(); else alert('Added to cart!'); }}>
                <i className="fas fa-shopping-bag"></i> Add to Cart
              </button>
            </div>

            <button className="buy-now-btn btn-secondary" onClick={() => { if(!user) onAuthRequired(); else alert('Proceeding to buy...'); }}>Buy Now</button>

            <div className="trust-badges-detail">
              <div className="t-badge">
                <i className="fas fa-undo"></i>
                <span>7 Days Return</span>
              </div>
              <div className="t-badge">
                <i className="fas fa-truck"></i>
                <span>Free Delivery</span>
              </div>
              <div className="t-badge">
                <i className="fas fa-check-double"></i>
                <span>Verified Seller</span>
              </div>
            </div>

            <div className="delivery-check glass-effect">
              <h4><i className="fas fa-map-marker-alt"></i> Check Delivery</h4>
              <div className="check-input">
                <input type="text" placeholder="Enter Pincode" />
                <button>Check</button>
              </div>
              <p>Usually delivers in 3-5 business days.</p>
            </div>

            {/* NEW: Frequently Bought Together */}
            <div className="bought-together glass-effect">
              <h4>Frequently Bought Together</h4>
              <div className="bought-items">
                <div className="bought-item-main">
                  <img src={product.img} alt={product.name} />
                </div>
                <i className="fas fa-plus"></i>
                {medicineProducts.filter(p => p.id !== product.id).slice(0, 1).map(rp => (
                  <div key={rp.id} className="bought-item-extra">
                    <img src={rp.img} alt={rp.name} />
                    <div className="bought-item-info">
                      <span>{rp.name}</span>
                      <strong>${rp.price.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bought-total">
                <p>Total Price: <strong>${(product.price + (medicineProducts.filter(p => p.id !== product.id)[0]?.price || 0)).toFixed(2)}</strong></p>
                <button className="add-all-btn">Add both to cart</button>
              </div>
            </div>
          </div>
        </div>

        {user ? (
          <>
            {/* About This Item Section */}
            <section id="about" className="product-section-block">
              <h2 className="block-title">About this item</h2>
              <div className="about-content glass-effect">
                <ul>
                  <li><strong>Advanced Formula:</strong> Specifically developed for {product.ageGroup} to provide maximum benefit.</li>
                  <li><strong>Fast Acting:</strong> Designed for rapid absorption to provide quick relief.</li>
                  <li><strong>Safety First:</strong> No artificial colors, preservatives, or GMO ingredients.</li>
                  <li><strong>Doctor Recommended:</strong> Trusted by healthcare professionals worldwide.</li>
                  <li><strong>Premium Quality:</strong> Manufactured in state-of-the-art GMP certified facilities.</li>
                </ul>
              </div>
            </section>


            {/* Product Information Section */}
            <section id="info" className="product-section-block">
              <h2 className="block-title">Product information</h2>
              <div className="info-table-container glass-effect">
                <table className="info-table">
                  <tbody>
                    <tr><td><strong>Category</strong></td><td>{product.category}</td></tr>
                    <tr><td><strong>Age Group</strong></td><td>{product.ageGroup.charAt(0).toUpperCase() + product.ageGroup.slice(1)}</td></tr>
                    <tr><td><strong>Form</strong></td><td>{product.category.includes('Syrup') ? 'Liquid' : 'Tablet/Capsule'}</td></tr>
                    <tr><td><strong>Storage</strong></td><td>Store in a cool, dry place away from sunlight</td></tr>
                    <tr><td><strong>Quantity</strong></td><td>30 Units / 100ml</td></tr>
                    <tr><td><strong>Country of Origin</strong></td><td>India</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* From the Brand Section */}
            <section id="brand" className="product-section-block brand-block">
              <div className="brand-content glass-effect">
                <div className="brand-logo-large">
                  <i className="fas fa-heart"></i> MediPurple
                </div>
                <div className="brand-text">
                  <h3>Commitment to Care</h3>
                  <p>At MediPurple, we believe that health is the foundation of a happy life. Our mission is to provide premium, accessible healthcare products that you can trust for your entire family, from infants to elders.</p>
                  <div className="brand-features">
                    <span><i className="fas fa-leaf"></i> 100% Organic</span>
                    <span><i className="fas fa-microscope"></i> Lab Tested</span>
                    <span><i className="fas fa-award"></i> Award Winning</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="product-section-block">
              <div className="reviews-header">
                <h2 className="block-title">Customer Reviews</h2>
                <div className="overall-rating">
                  <div className="rating-number">{product.rating}</div>
                  <div className="stars">
                    {[1,2,3,4,5].map(s => (
                      <i key={s} className={`fas fa-star ${s <= Math.floor(product.rating) ? 'active' : ''}`}></i>
                    ))}
                  </div>
                  <span>Based on 1.2k+ reviews</span>
                </div>
              </div>
              <div className="reviews-list">
                {[
                  { user: 'Amit K.', rating: 5, date: 'May 10, 2026', comment: 'Excellent product! Helped me recover quickly.' },
                  { user: 'Sneha P.', rating: 4, date: 'May 05, 2026', comment: 'Very effective, though the taste is a bit strong.' },
                  { user: 'John D.', rating: 5, date: 'April 28, 2026', comment: 'Best in the market. Highly recommended for daily use.' }
                ].map((rev, i) => (
                  <div key={i} className="review-card glass-effect">
                    <div className="rev-user">
                      <div className="rev-avatar">{rev.user.charAt(0)}</div>
                      <div className="rev-info">
                        <strong>{rev.user}</strong>
                        <span>{rev.date}</span>
                      </div>
                    </div>
                    <div className="rev-rating">
                      {[1,2,3,4,5].map(s => <i key={s} className={`fas fa-star ${s <= rev.rating ? 'active' : ''}`}></i>)}
                    </div>
                    <p className="rev-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
              <button className="write-review-btn">Write a Review</button>
            </section>

            {/* Similar Products Section */}
            {relatedProducts.length > 0 && (
              <section id="similar" className="product-section-block">
                <h2 className="block-title">Similar Items You May Like</h2>
                <div className="similar-grid">
                  {relatedProducts.map(rp => (
                    <div key={rp.id} className="similar-card glass-effect" onClick={() => { navigate(`/product/${rp.id}`); window.scrollTo(0,0); }}>
                      <img src={rp.img} alt={rp.name} />
                      <div className="similar-info">
                        <h4>{rp.name}</h4>
                        <div className="s-rating">
                          <i className="fas fa-star"></i>
                          <span>{rp.rating}</span>
                        </div>
                        <div className="s-price">${rp.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="details-locked-card glass-effect">
            <div className="locked-icon">
              <i className="fas fa-lock"></i>
            </div>
            <h3>Detailed Insights Locked</h3>
            <p>Join the MediPurple community to unlock detailed product composition, expert reviews, and personalized health comparisons.</p>
            <button className="btn-primary" onClick={onAuthRequired}>Login to Unlock Full Details</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid-container">
      <div className="footer-column brand-col">
        <div className="footer-logo">
          <i className="fas fa-heart"></i>
          <span>Moving Medicine</span>
        </div>
        <p className="footer-desc">Your trusted partner for all medical needs.</p>
      </div>

      <div className="footer-column">
        <h3>Quick Links</h3>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>

      <div className="footer-column">
        <h3>Support</h3>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms & Conditions</a></li>
          <li><a href="#">Returns</a></li>
        </ul>
      </div>

      <div className="footer-column">
        <h3>Newsletter</h3>
        <div className="footer-newsletter">
          <input type="email" placeholder="Your Email" />
          <button className="subscribe-btn">Subscribe</button>
        </div>
      </div>
    </div>

    <div className="footer-bottom-bar">
      <div className="container">
        <p>© 2026 Moving Medicine. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch points from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserPoints(userDoc.data().points || 0);
        } else {
          // Point initialization will now happen during Signup in AuthModal
          setUserPoints(0);
        }
      } else {
        setUserPoints(0);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdatePoints = async (pointsToAdd) => {
    if (!user) return;
    const newTotal = userPoints + pointsToAdd;
    setUserPoints(newTotal);
    
    let rank = 'Beginner';
    if (newTotal >= 500) rank = 'Health Master';
    else if (newTotal >= 250) rank = 'Wellness Expert';
    else if (newTotal >= 100) rank = 'Health Learner';

    await updateDoc(doc(db, "users", user.uid), {
      points: increment(pointsToAdd),
      rank: rank
    });
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <Router>
      <div className="app">
        <Navbar 
          user={user} 
          onLoginClick={() => setShowAuthModal('login')} 
          onSignupClick={() => setShowAuthModal('signup')} 
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/medicines/:ageGroup" element={<MedicinePage />} />
          <Route path="/product/:id" element={<ProductDetailPage onAuthRequired={() => setShowAuthModal('login')} user={user} />} />
          <Route path="/eye-test" element={<EyeTestPage user={user} onAuthRequired={() => setShowAuthModal('login')} />} />
          <Route path="/find-doctor" element={<DoctorFinderPage />} />
          <Route 
            path="/play-zone" 
            element={<PlayZonePage user={user} totalPoints={userPoints} onUpdatePoints={handleUpdatePoints} onAuthRequired={() => setShowAuthModal('login')} />} 
          />
        </Routes>
        <Footer />
        <BottomNav />

        <AnimatePresence>
          {showAuthModal && (
            <AuthModal 
              type={showAuthModal} 
              onClose={() => setShowAuthModal(null)} 
              onSwitch={() => setShowAuthModal(showAuthModal === 'login' ? 'signup' : 'login')}
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
};

const AuthModal = ({ type, onClose, onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (type === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user details to Firestore
        await setDoc(doc(db, "users", user.uid), {
          displayName: name,
          email: email,
          points: 0,
          rank: 'Beginner',
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      console.error("Auth Error:", err.code, err.message);
      let msg = err.message;
      if (err.code === 'auth/invalid-email') msg = "Invalid email format. Please use name@example.com";
      if (err.code === 'auth/weak-password') msg = "Password is too weak. Use at least 6 characters.";
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered. Please login instead.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = "Invalid email or password.";
      setError(msg.replace('Firebase:', '').replace(/\(auth.*\)\.?/, ''));
    }
  };

  return (
    <motion.div 
      className="auth-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="auth-modal glass-effect"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="close-modal" onClick={onClose}>&times;</button>
        <div className="auth-header">
          <i className={`fas ${type === 'signup' ? 'fa-user-plus' : 'fa-lock'}`}></i>
          <h2>{type === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
          <p>{type === 'signup' ? 'Join Moving Medicine today' : 'Login to your health dashboard'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {type === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="auth-submit-btn">
            {type === 'signup' ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          {type === 'signup' ? 'Already have an account?' : 'New to Moving Medicine?'}
          <button onClick={onSwitch}>
            {type === 'signup' ? 'Login' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EyeTestPage = ({ user, onAuthRequired }) => {
  const [step, setStep] = useState('intro');
  const [results, setResults] = useState({ acuity: null, color: null, astigmatism: null });

  const nextStep = (key, value) => {
    setResults({ ...results, [key]: value });
    if (step === 'intro') setStep('acuity');
    else if (step === 'acuity') setStep('color');
    else if (step === 'color') setStep('astigmatism');
    else if (step === 'astigmatism') setStep('results');
  };

  return (
    <div className="eye-test-page">
      <div className="container">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="test-card intro-card glass-effect">
              <div className="test-icon">👁️</div>
              <h1>Free Digital Eye Test</h1>
              <p>Check your visual acuity, color perception, and focus in 2 minutes. This is a screening tool, not a medical diagnosis.</p>
              <div className="test-prep">
                <span><i className="fas fa-desktop"></i> Sit at arm's length</span>
                <span><i className="fas fa-lightbulb"></i> Ensure good lighting</span>
                <span><i className="fas fa-glasses"></i> Wear your glasses/lenses</span>
              </div>
              <button className="start-test-btn" onClick={() => {
                if (!user) onAuthRequired();
                else setStep('acuity');
              }}>Start Test Now</button>
            </motion.div>
          )}

          {step === 'acuity' && (
            <motion.div key="acuity" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="test-card acuity-card glass-effect">
              <h2>1. Visual Acuity Test</h2>
              <p>Can you clearly read the smallest row of letters below?</p>
              <div className="snellen-chart">
                <div className="s-row row-1">E</div>
                <div className="s-row row-2">F P</div>
                <div className="s-row row-3">T O Z</div>
                <div className="s-row row-4">L P E D</div>
                <div className="s-row row-5">P E C F D</div>
                <div className="s-row row-6">E D F C Z P</div>
                <div className="s-row row-7">F E L O P Z D</div>
              </div>
              <div className="test-actions">
                <button onClick={() => nextStep('acuity', 'good')}>I can read all rows</button>
                <button onClick={() => nextStep('acuity', 'fair')}>I can read most rows</button>
                <button onClick={() => nextStep('acuity', 'poor')}>It's blurry / I can't read</button>
              </div>
            </motion.div>
          )}

          {step === 'color' && (
            <motion.div key="color" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="test-card color-card glass-effect">
              <h2>2. Color Perception</h2>
              <p>What number do you see in the circle below?</p>
              <div className="ishihara-plate">
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png" alt="Color test" />
              </div>
              <div className="test-actions grid-actions">
                {[12, 74, 9, 71].map(n => (
                  <button key={n} onClick={() => nextStep('color', n === 74 ? 'perfect' : 'incorrect')}>{n}</button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'astigmatism' && (
            <motion.div key="astigmatism" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="test-card astig-card glass-effect">
              <h2>3. Astigmatism Test</h2>
              <p>Look at the pattern below. Do all lines look equally dark and sharp?</p>
              <div className="astig-chart">
                <div className="fan-line" style={{transform: 'rotate(0deg)'}}></div>
                <div className="fan-line" style={{transform: 'rotate(30deg)'}}></div>
                <div className="fan-line" style={{transform: 'rotate(60deg)'}}></div>
                <div className="fan-line" style={{transform: 'rotate(90deg)'}}></div>
                <div className="fan-line" style={{transform: 'rotate(120deg)'}}></div>
                <div className="fan-line" style={{transform: 'rotate(150deg)'}}></div>
              </div>
              <div className="test-actions">
                <button onClick={() => nextStep('astigmatism', 'normal')}>Yes, all lines are sharp</button>
                <button onClick={() => nextStep('astigmatism', 'check')}>No, some lines are blurrier</button>
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="test-card results-card glass-effect">
              <div className="res-header">
                <div className="res-score-circle">
                  <span>85%</span>
                  <p>Vision Score</p>
                </div>
                <div className="res-title">
                  <h1>Test Completed!</h1>
                  <p>Here is your preliminary vision report.</p>
                </div>
              </div>
              
              <div className="res-details">
                <div className="res-item">
                  <i className="fas fa-eye"></i>
                  <div>
                    <strong>Visual Acuity</strong>
                    <span>{results.acuity === 'good' ? 'Normal Vision' : 'Needs Attention'}</span>
                  </div>
                </div>
                <div className="res-item">
                  <i className="fas fa-palette"></i>
                  <div>
                    <strong>Color Vision</strong>
                    <span>{results.color === 'perfect' ? 'Perfect Perception' : 'Mild Deficiency detected'}</span>
                  </div>
                </div>
                <div className="res-item">
                  <i className="fas fa-bullseye"></i>
                  <div>
                    <strong>Astigmatism</strong>
                    <span>{results.astigmatism === 'normal' ? 'No distortion' : 'Focus issues detected'}</span>
                  </div>
                </div>
              </div>

              <div className="res-advice glass-effect">
                <h4><i className="fas fa-info-circle"></i> Next Steps</h4>
                <p>Your results suggest overall good vision, but we recommend a professional eye exam once a year.</p>
                <div className="res-btns">
                  <Link to="/product/16" className="btn-primary">View Eye Care Products</Link>
                  <button className="btn-secondary" onClick={() => setStep('intro')}>Retake Test</button>
                </div>
              </div>

              <p className="disclaimer">Disclaimer: This digital test is for educational purposes and cannot replace a comprehensive medical examination by an optometrist.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
