import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { Sparkles, Zap, Edit3, Music } from "lucide-react";
import "./HomeScreen.css";

/**
 * Hook for Magnetic Effect - Memoized
 */
function useMagnetic(ref, strength = 30) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = element.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const x = (e.clientX - centerX) / width * strength;
      const y = (e.clientY - centerY) / height * strength;

      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, strength]);

  return position;
}

/**
 * Magnetic Wrapper Component - Memoized
 */
const Magnetic = memo(function Magnetic({ children, className = "", strength = 20 }) {
  const ref = useRef(null);
  const transform = useMagnetic(ref, strength);

  return (
    <div 
      ref={ref}
      className={`magnetic-wrapper ${className}`}
      style={{ 
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }}
    >
      {children}
    </div>
  );
});

/**
 * Floating Music Particles Component - Lazy Loaded & Optimized
 * Reduced from 15 to 8 particles for better performance
 */
const MusicParticles = memo(function MusicParticles() {
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay particle rendering for faster initial load
    const timer = setTimeout(() => {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDuration: `${20 + Math.random() * 15}s`,
        animationDelay: `-${Math.random() * 15}s`,
        opacity: 0.08 + Math.random() * 0.12,
        size: 12 + Math.random() * 16,
      }));
      setParticles(newParticles);
      setIsVisible(true);
    }, 500); // Delay 500ms after mount

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="music-particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="music-particle"
          style={{
            left: p.left,
            top: p.top,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        >
          <Music />
        </div>
      ))}
    </div>
  );
});

/**
 * Artist data for HomeScreen
 */
const ARTISTS = [
  {
    id: "Patitucci",
    name: "John Patitucci",
    image: "/images/artists/patitucci.png",
    subtitle: "Modern Jazz Bass",
    color: "gold",
    techniques: ["Linear 11ths (Maj)", "Linear 11ths (Min)"],
    description: "Arpegios en tresillos extendidos",
    gradient: "linear-gradient(135deg, #C9A554 0%, #E0C285 100%)",
    accentColor: "#C9A554",
  },
  {
    id: "Wooten",
    name: "Victor Wooten",
    image: "/images/artists/wooten.png",
    subtitle: "Advanced Slap Tech",
    color: "red",
    techniques: ["Double Thumbing", "Open Hammer Pluck"],
    description: "Técnicas de slap avanzadas",
    gradient: "linear-gradient(135deg, #EF4444 0%, #F97316 100%)",
    accentColor: "#EF4444",
  },
  {
    id: "Flea",
    name: "Flea (RHCP)",
    image: "/images/artists/flea.png",
    subtitle: "Funk-Punk Slap Bass",
    color: "orange",
    techniques: ["Slap & Pop Octaves", "Ghost Notes Groove"],
    description: "Higher Ground • Give It Away",
    gradient: "linear-gradient(135deg, #F97316 0%, #FACC15 100%)",
    accentColor: "#F97316",
  },
  {
    id: "Jaco",
    name: "Jaco Pastorius",
    image: "/images/artists/jaco.png",
    subtitle: "Fretless Fingerstyle",
    color: "blue",
    techniques: ["Natural Harmonics", "Artificial Harmonics"],
    description: "Portrait of Tracy • The Chicken",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
    accentColor: "#3B82F6",
  },
];

/**
 * Modern Artist Card Component - Memoized for Performance
 */
const ArtistCard = memo(function ArtistCard({ artist, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 8 degrees - reduced for performance)
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleClick = useCallback(() => {
    onClick(artist.id);
  }, [onClick, artist.id]);

  return (
    <div className="artist-card-wrapper">
      <button
        ref={cardRef}
        className="artist-card-button group"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.03 : 1})`,
          boxShadow: isHovered
            ? `0 25px 50px -12px ${artist.accentColor}50, 0 15px 30px -15px ${artist.accentColor}70`
            : "0 10px 30px -5px rgba(0,0,0,0.4)",
        }}
        aria-label={`Select ${artist.name} exercises`}
      >
        {/* Artist Image Background - Lazy loaded */}
        <div
          className="absolute inset-0"
          style={imgError ? { background: artist.gradient } : undefined}
        >
          {!imgError && (
            <img
              src={artist.image}
              alt={artist.name}
              loading="lazy"
              decoding="async"
              className="artist-card-image"
              onError={() => setImgError(true)}
            />
          )}
          <div className="artist-card-gradient" />
        </div>

        {/* Shine effect on hover */}
        <div className={`artist-card-shine ${isHovered ? 'active' : ''}`} />

        {/* Content */}
        <div className="artist-card-content">
          {/* Header */}
          <div className="flex justify-between items-start mb-auto">
            <div className="artist-card-subtitle">
              {artist.subtitle}
            </div>
            <div className="artist-card-sparkle">
              <Sparkles size={18} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="mt-8">
            <h3 className="artist-card-title">
              {artist.name}
            </h3>
            
            <div className="artist-card-divider" />

            <p className="artist-card-description">
              {artist.description}
            </p>
          </div>

          {/* Techniques */}
          <div className="artist-card-techniques">
            {artist.techniques.map((tech, i) => (
              <span key={i} className="artist-card-tech-tag">
                {tech}
              </span>
            ))}
          </div>

          {/* Action indicator */}
          <div className="artist-card-action">
            <span className="uppercase tracking-widest text-xs">Explore</span>
            <Zap size={18} className="fill-current" />
          </div>
        </div>
      </button>
    </div>
  );
});

/**
 * Main HomeScreen Component - Optimized for Performance
 * @param {boolean} isPowerSaving - If true, skip particles and expensive effects
 */
function HomeScreen({ onSelectArtist, onSelectCustomBuilder, isPowerSaving = false }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  // Throttled mouse tracking using requestAnimationFrame
  // Skip when power saving is active
  useEffect(() => {
    let isUpdating = false;

    const updateMousePos = (ev) => {
      mousePosRef.current = { x: ev.clientX, y: ev.clientY };
      
      // Skip rAF updates when power saving is active
      if (!isUpdating && !isPowerSaving) {
        isUpdating = true;
        rafRef.current = requestAnimationFrame(() => {
          setMousePos(mousePosRef.current);
          isUpdating = false;
        });
      }
    };

    // Don't even attach listener if power saving is active
    if (!isPowerSaving) {
      window.addEventListener('mousemove', updateMousePos, { passive: true });
    }
    
    return () => {
      window.removeEventListener('mousemove', updateMousePos);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPowerSaving]);

  const handleCustomBuilderClick = useCallback(() => {
    onSelectCustomBuilder();
  }, [onSelectCustomBuilder]);

  return (
    <div
      className="home-screen-bg min-h-screen relative overflow-hidden"
      style={{
        "--mouse-x": `${mousePos.x}px`,
        "--mouse-y": `${mousePos.y}px`,
      }}
    >
      <div className="spotlight-overlay" />
      <div className="grain-overlay" />
      {/* Skip particles when power saving is active */}
      {!isPowerSaving && <MusicParticles />}

      {/* Radial gradient overlays - Optimized with reduced blur */}
      <div className="radial-glow-gold" />
      <div className="radial-glow-blue" />

      {/* Main Content */}
      <div className="landscape-compact-container relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="landscape-compact-header text-center mb-8 sm:mb-12 lg:mb-16 relative px-4 max-w-5xl mx-auto">
          {/* Logo */}
          <Magnetic strength={30}>
            <div className="logo-container">
              <img
                src="/logo.png"
                alt="Bass Academy Logo"
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover"
                loading="eager"
              />
            </div>
          </Magnetic>

          {/* Main Title */}
          <h1 className="landscape-compact-title home-title font-['Playfair_Display'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-3 sm:mb-4 tracking-tight leading-none drop-shadow-2xl">
            <span className="home-title-bass">Bass</span>
            <span className="home-title-academy">Academy</span>
          </h1>

          {/* Subtitle */}
          <div className="landscape-compact-subtitle home-subtitle flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg lg:text-xl font-light tracking-[0.2em] uppercase mb-2 drop-shadow-lg">
            <span className="font-semibold home-subtitle-text">
              Master the Legends
            </span>
            <span className="hidden sm:inline home-subtitle-dot">•</span>
            <span className="font-bold home-subtitle-year">
              2026
            </span>
          </div>

          {/* Description */}
          <p className="landscape-compact-description home-description text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-['Inter'] drop-shadow-md">
            Aprende técnicas de los mejores bajistas del mundo con ejercicios
            interactivos
          </p>
        </header>

        {/* Custom Builder Highlight Card */}
        <div className="max-w-5xl w-full mb-8 sm:mb-10 px-4 sm:px-6 relative z-10">
          <button
            onClick={handleCustomBuilderClick}
            className="custom-builder-card group w-full relative overflow-hidden rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-8 text-left transition-all duration-500 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#C9A554]/30 cursor-rock"
          >
            {/* Shine effect */}
            <div className="custom-builder-shine absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Holographic Wireframe Grid */}
            <div className="holo-wireframe" />

            <div className="relative flex items-center gap-4 sm:gap-6">
              {/* Icon */}
              <div className="custom-builder-icon flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Edit3 className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 custom-builder-icon-color" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="custom-builder-title text-xl sm:text-2xl lg:text-3xl font-bold font-['Playfair_Display'] group-hover:text-[#C9A554] transition-colors">
                    Custom Builder
                  </h3>
                  <span className="custom-builder-badge px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wide">
                    New
                  </span>
                </div>
                <p className="custom-builder-desc text-sm sm:text-base">
                  Crea tus propios ejercicios de bajo nota por nota
                </p>
              </div>
              
              {/* Arrow */}
              <div className="custom-builder-arrow flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-all duration-300">
                <Zap className="w-5 h-5 custom-builder-zap" />
              </div>
            </div>
          </button>
        </div>

        {/* Artist Grid */}
        <div className="artist-grid-container landscape-compact-grid max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-6 relative z-10 mb-8">
          {ARTISTS.map((artist) => (
            <div key={artist.id} className="artist-card-animate">
              <ArtistCard
                artist={artist}
                onClick={onSelectArtist}
              />
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <footer className="landscape-compact-footer mt-8 sm:mt-10 text-white/40 text-xs sm:text-sm px-4 text-center relative z-10 font-['Inter']">
          Selecciona un artista para comenzar tu entrenamiento profesional
        </footer>
      </div>
    </div>
  );
}

export default HomeScreen;

