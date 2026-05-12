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
      <div className="container header-content">
        {/* Mobile Header Look */}
        <div className="mobile-user-header">
          <div className="user-info-mini">
            <div className="avatar-circle-sm">
              {user ? user.email.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="user-text">
              <span className="hi-text">Hi,</span>
              <span className="user-name-text">{user ? user.email.split('@')[0] : 'Guest User'}</span>
            </div>
          </div>
          <button className="notif-btn"><i className="far fa-bell"></i></button>
        </div>

        <Link to="/" className="logo-container desktop-only">
          <img src={logo} alt="Medicare Logo" className="logo-img" />
        </Link>
        
        <div className="search-container">
          <div className="pill-search-bar">
            <i className="fas fa-search search-icon-left"></i>
            <input type="text" placeholder="Search anything..." />
            <button className="filter-icon-btn desktop-only"><i className="fas fa-sliders-h"></i></button>
          </div>
        </div>

        <button className="mobile-menu-toggle desktop-only" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li className="dropdown">
              <a href="#">Medicines <i className="fas fa-chevron-down"></i></a>
              <ul className="dropdown-menu">
                <li><Link to="/medicines/kids">Kids Medicines</Link></li>
                <li><Link to="/medicines/adults">Adults Medicines</Link></li>
                <li><Link to="/medicines/elders">Elders Medicines</Link></li>
              </ul>
            </li>
            <li><Link to="/play-zone">Play Zone</Link></li>
            <li><a href="#">Doctor Finder</a></li>
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
      </div>
    </header>
  );
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
      {/* Hero Section */}
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
                    onClick={() => setView(game.id)}
                  >
                    <span className="pz-game-icon">{game.icon}</span>
                    <h3>{game.title}</h3>
                    <p>{game.desc}</p>
                    <button className="pz-play-btn">Play Now</button>
                  </motion.div>
                ))}
                
                {/* New Games */}
                <motion.div 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="pz-game-card"
                  style={{ '--game-color': '#FEF3C7' }}
                  onClick={() => setView('nutri')}
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
                  onClick={() => setView('organ-guess')}
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

// --- New Game Components ---

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

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <a href="#" className="view-all-link">View All <i className="fas fa-chevron-right"></i></a>
          </div>

          <div className="featured-grid">
            {[
              { name: 'Mediprin', sub: 'Cold Relief', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&h=200&auto=format&fit=crop' },
              { name: 'Vita-C Syrup', sub: 'Vitamin Supplement', img: 'https://images.unsplash.com/photo-1550573105-4584e8d75472?q=80&w=300&h=200&auto=format&fit=crop' },
              { name: 'Amoxicol', sub: 'Antibiotic', img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=300&h=200&auto=format&fit=crop' }
            ].map((prod, i) => (
              <div key={i} className="featured-card">
                <div className="featured-img-box">
                  <img src={prod.img} alt={prod.name} />
                </div>
                <h3>{prod.name}</h3>
                <p>{prod.sub}</p>
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
                <div key={prod.id} className="e-product-card">
                  <div className="e-card-header">
                    <span className="e-badge">{prod.category}</span>
                    <button className="wishlist-btn"><i className="far fa-heart"></i></button>
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
                      <button className="e-add-btn">
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
          <Route 
            path="/play-zone" 
            element={<PlayZonePage user={user} totalPoints={userPoints} onUpdatePoints={handleUpdatePoints} />} 
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

export default App;
