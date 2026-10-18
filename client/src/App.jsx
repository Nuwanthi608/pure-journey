import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logoImg from './assets/logo.jpg';
import homeBgImg from './assets/home.jpg';
import EcoAnalytics from './components/EcoAnalytics';
import ExportUtilities from './components/ExportUtilities';
import AIItinerary from './components/AIItinerary';

// Coastal/Beach-only keywords for validation
const coastalTripTypes = ['Beach Vacation', 'Island Hopping', 'Cruise Travel'];
const inlandLandlockedDestinations = ['kandy', 'nuwara eliya', 'nuwaraeliya', 'ella', 'sigiriya', 'dambulla', 'badulla', 'matale', 'kurunegala'];

// Comprehensive Packing List Categories (1 to 163)
const packingCategoriesList = [
  "General", "Clothing", "Footwear", "Personal Care", "Hygiene & Sanitation", "Hydration", "Food & Snacks", "Dining", "Travel Documents", "Money & Payments",
  "Electronics", "Chargers & Accessories", "First Aid", "Personal Medication", "Safety & Emergency", "Weather Protection", "Bags & Luggage", "Travel Accessories", "Navigation", "Camping Gear",
  "Sleeping Gear", "Shelter", "Hiking Gear", "Trekking Accessories", "Swimming Gear", "Beach Essentials", "Water Sports Equipment", "Sports & Fitness", "Exercise Accessories", "Entertainment",
  "Books & Reading", "Photography Gear", "Videography Equipment", "Baby Essentials", "Kids Essentials", "Pet Supplies", "Business Essentials", "Work & Study Essentials", "Religious Essentials", "Cultural Essentials",
  "Cleaning Supplies", "Laundry Supplies", "Outdoor Accessories", "Cooking Equipment", "Kitchen Utensils", "Food Storage", "Waterproof Storage", "Travel Organizers", "Luggage Accessories", "Documents & Tickets",
  "Health & Wellness", "Skincare", "Hair Care", "Dental Care", "Sun Protection", "Insect Protection", "Sleep Accessories", "Comfort Items", "Travel Pillows & Blankets", "Rain Gear",
  "Cold Weather Gear", "Hot Weather Essentials", "Emergency Equipment", "Repair Tools", "Multi-tools & Knives", "Lighting Equipment", "Power Banks & Batteries", "Navigation Devices", "Maps & Guides", "Vehicle Essentials",
  "Road Trip Essentials", "Cycling Equipment", "Motorcycle Accessories", "Public Transport Essentials", "Flight Essentials", "Cruise Essentials", "Boat & Ferry Essentials", "Hiking Safety Equipment", "Climbing Equipment", "Fishing Equipment",
  "Wildlife Watching Gear", "Gardening Equipment", "Picnic Essentials", "Festival Essentials", "Event Accessories", "Wedding Essentials", "Special Occasion Items", "Formal Wear", "Swimwear", "Beachwear",
  "Accessories & Jewelry", "Watches", "Eyewear", "Footwear Care", "Clothing Accessories", "Travel Security", "Locks & Anti-theft", "Cash & Valuables", "Gifts & Souvenirs", "Reusable Items",
  "Eco-Friendly Supplies", "Waste Management", "Recycling Supplies", "Portable Appliances", "Travel Gadgets", "SIM & Connectivity", "Offline Entertainment", "Journaling & Stationery", "Art & Creative Supplies", "Language & Learning Tools",
  "Medical & Health Records", "Allergy Essentials", "Menstrual Care", "Baby Feeding Supplies", "Baby Changing Supplies", "Child Safety Items", "Pet Food & Feeding", "Pet Hygiene", "Pet Safety", "Medication Storage",
  "Water Purification", "Portable Toiletries", "Hand Washing Supplies", "Portable Shower Equipment", "Toilet Accessories", "Camping Fire Supplies", "Tent Accessories", "Sleeping Bags & Mats", "Hammocks", "Camp Furniture",
  "Portable Stoves & Fuel", "Fire Safety Equipment", "Outdoor Cooking Accessories", "Cooler Bags & Ice Packs", "Food Preparation Tools", "Reusable Tableware", "Travel Cutlery", "Drinkware", "Travel Mugs & Thermoses", "Snacks & Energy Food",
  "Special Diet Foods", "Baby Food", "Sports Nutrition", "Hydration Packs", "Water Bottles & Flasks", "Travel Towels", "Quick-Dry Gear", "Waterproof Clothing", "Thermal Wear", "Modest Clothing",
  "Religious Clothing", "Traditional Clothing", "Work Uniforms", "Protective Clothing", "Safety Footwear", "Travel Insurance Documents", "Reservations & Booking Details", "Maps & Travel Guides", "Local Currency", "Identification & Permits",
  "Emergency Contacts", "Travel Checklists", "Miscellaneous"
];

// Rich Frontend Default Items Bank for selected Trip Types
const frontendPackingItemsBank = {
  Camping: [
    { id: 'c1', item_name: "Eco-Friendly Camping Tent", category: "Shelter" },
    { id: 'c2', item_name: "Sleeping Bag & Thermal Mat", category: "Sleeping Gear" },
    { id: 'c3', item_name: "Solar-Powered Lantern & Headlamp", category: "Lighting Equipment" },
    { id: 'c4', item_name: "Portable Gas Stove with Refillable Canister", category: "Portable Stoves & Fuel" },
    { id: 'c5', item_name: "Stainless Steel Reusable Water Bottle", category: "Water Bottles & Flasks" },
    { id: 'c6', item_name: "Reusable Travel Cutlery & Plate Set", category: "Reusable Tableware" },
    { id: 'c7', item_name: "Biodegradable Soap & Hand Wash", category: "Hygiene & Sanitation" },
    { id: 'c8', item_name: "Multi-Tool Pocket Knife", category: "Multi-tools & Knives" },
    { id: 'c9', item_name: "Waterproof Matches / Fire Starter", category: "Camping Fire Supplies" },
    { id: 'c10', item_name: "First Aid Kit & Mosquito Repellent", category: "First Aid" },
    { id: 'c11', item_name: "Portable Power Bank (Solar)", category: "Power Banks & Batteries" },
    { id: 'c12', item_name: "Trash Bags for Zero-Waste Litter Collection", category: "Waste Management" }
  ],
  "Beach Vacation": [
    { id: 'b1', item_name: "Re-usable Swimwear & Quick-Dry Towel", category: "Swimwear" },
    { id: 'b2', item_name: "Eco-Friendly Reef-Safe Sunscreen", category: "Sun Protection" },
    { id: 'b3', item_name: "UV Protection Sunglasses & Sun Hat", category: "Eyewear" },
    { id: 'b4', item_name: "Insulated Thermal Flask for Cold Drinks", category: "Travel Mugs & Thermoses" },
    { id: 'b5', item_name: "Waterproof Dry Bag for Electronics", category: "Waterproof Storage" },
    { id: 'b6', item_name: "Reusable Cloth Beach Tote Bag", category: "Bags & Luggage" },
    { id: 'b7', item_name: "Flip-Flops / Water Shoes", category: "Footwear" },
    { id: 'b8', item_name: "Aloe Vera After-Sun Gel", category: "Skincare" }
  ],
  "Hiking & Trekking": [
    { id: 'h1', item_name: "Sturdy Waterproof Hiking Boots", category: "Footwear" },
    { id: 'h2', item_name: "Hydration Bladder / Backpack Pack", category: "Hydration Packs" },
    { id: 'h3', item_name: "Trekking Poles & Grip Gloves", category: "Trekking Accessories" },
    { id: 'h4', item_name: "Lightweight Rain Jacket & Cover", category: "Rain Gear" },
    { id: 'h5', item_name: "High-Energy Trail Mix & Protein Bars", category: "Snacks & Energy Food" },
    { id: 'h6', item_name: "GPS Navigation Device / Offline Trail Map", category: "Navigation Devices" },
    { id: 'h7', item_name: "Compact Emergency Whistle & First Aid", category: "Hiking Safety Equipment" }
  ]
};

// Knowledge base for location recommendations based on Destination AND Trip Type
const destinationAttractions = {
  nuwaraeliya: {
    "Hiking & Trekking": [
      { name: "Horton Plains & World's End", category: 'Eco Trail & Hiking' },
      { name: 'Single Tree Hill', category: 'Hiking Peak' },
      { name: 'Cone Forest Trail', category: 'Nature Walk' }
    ],
    "Camping": [
      { name: 'Horton Plains Campsite Zones', category: 'Wild Camping' },
      { name: 'Pedro Estate Camping Base', category: 'Nature Camp' }
    ],
    "Wellness & Relaxation": [
      { name: 'Gregory Lake Peaceful Walkways', category: 'Relaxation' },
      { name: 'Victoria Park Botanical Meditation', category: 'Wellness' }
    ],
    "Cultural & Heritage": [
      { name: 'Seetha Amman Temple', category: 'Historical Heritage' },
      { name: 'Hakgala Botanical Gardens', category: 'Historic Garden' }
    ]
  },
  kandy: {
    "Cultural & Heritage": [
      { name: 'Temple of the Sacred Tooth Relic', category: 'Heritage Site' },
      { name: 'Kandy National Museum', category: 'History & Culture' },
      { name: 'Kandy City Center & Cultural Show', category: 'Urban Heritage' }
    ],
    "Hiking & Trekking": [
      { name: 'Udawatta Kele Sanctuary', category: 'Forest Trek' },
      { name: 'Bahirawakanda Temple Hill Hike', category: 'Scenic Hill Climb' }
    ],
    "Wellness & Relaxation": [
      { name: 'Royal Botanical Gardens (Peradeniya)', category: 'Nature Healing' },
      { name: 'Kandy Lake Sunset Walk', category: 'Calm Environment' }
    ],
    "Camping": [
      { name: 'Udawatta Kele Forest Edge Campsite', category: 'Wild Camping' },
      { name: 'Knuckles Mountain Range Base Camp (Kandy side)', category: 'Adventure Camping' }
    ]
  },
  ella: {
    "Hiking & Trekking": [
      { name: "Little Adam's Peak", category: 'Mountain Hiking' },
      { name: 'Ella Rock', category: 'Adventure Trail' }
    ],
    "Cultural & Heritage": [
      { name: 'Nine Arches Bridge', category: 'Colonial Architecture' },
      { name: 'Ravana Cave & Temple', category: 'Ancient Heritage' }
    ]
  },
  mirissa: {
    "Beach Vacation": [
      { name: 'Mirissa Main Beach', category: 'Sun & Ocean Swim' },
      { name: 'Secret Beach Mirissa', category: 'Private Cove' }
    ],
    "Island Hopping": [
      { name: 'Mirissa Eco Whale Watching Tour', category: 'Marine Adventure' },
      { name: 'Parrot Rock Island', category: 'Coastal View' }
    ],
    "Wellness & Relaxation": [
      { name: 'Coconut Tree Hill Yoga Spot', category: 'Meditation & Sunset' }
    ]
  }
};

const tripTypesList = [
  "Adventure",
  "Beach Vacation",
  "Nature & Wildlife",
  "Cultural & Heritage",
  "Family Trip",
  "Solo Travel",
  "Friends Trip",
  "Road Trip",
  "Camping",
  "Hiking & Trekking",
  "City Exploration",
  "Religious & Spiritual",
  "Food & Culinary",
  "Photography Trip",
  "Wellness & Relaxation",
  "Romantic Getaway",
  "Educational Trip",
  "Business Travel",
  "Eco Tourism",
  "Budget-Friendly Travel",
  "Luxury Travel",
  "Backpacking",
  "Group Travel",
  "Slow Travel",
  "Eco-Friendly Travel",
  "Off-the-Beaten-Path",
  "Wildlife Safari",
  "Island Hopping",
  "Cruise Travel"
];

const transportTypesList = [
  "Car",
  "Van",
  "Bus",
  "Train",
  "Tuk-Tuk",
  "Motorcycle",
  "Bicycle",
  "Scooter",
  "Three-Wheeler",
  "Taxi",
  "Private Driver",
  "Tourist Bus",
  "Minibus",
  "Public Transit",
  "Jeep",
  "Bicycle Rental",
  "Boat",
  "Walking",
  "Ride-Sharing Service"
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true' || location.pathname === '/dashboard';
  });
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || 'user@purejourney.lk');
  const [authMode, setAuthMode] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const [destination, setDestination] = useState('');
  const [tripType, setTripType] = useState('Camping');
  const [days, setDays] = useState(1);
  const [members, setMembers] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('Moderate Standard 🌿');
  const [transportMode, setTransportMode] = useState('Train');

  const [generatedTrip, setGeneratedTrip] = useState(null);

  const [items, setItems] = useState([]);
  const [plasticEstimate, setPlasticEstimate] = useState(0);
  const [tripsHistory, setTripsHistory] = useState([]);
  
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    }
    fetchTripsHistory();
    loadDefaultItems('Camping');
  }, [location.pathname]);

  const fetchTripsHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trips');
      setTripsHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const loadDefaultItems = async (type) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/items/${type}`);
      let fetched = response.data || [];
      const presetItems = frontendPackingItemsBank[type] || frontendPackingItemsBank['Camping'];
      
      const combined = [...fetched];
      presetItems.forEach(p => {
        if (!combined.some(c => c.item_name.toLowerCase() === p.item_name.toLowerCase())) {
          combined.push(p);
        }
      });

      const itemsWithCheck = combined.map(item => ({ ...item, checked: false }));
      setItems(itemsWithCheck);
    } catch (err) {
      console.error('Error loading items, using fallback:', err);
      const fallbackList = frontendPackingItemsBank[type] || frontendPackingItemsBank['Camping'];
      setItems(fallbackList.map(item => ({ ...item, checked: false })));
    }
  };

  const isLengthValid = passwordInput.length > 0 && passwordInput.length <= 5;
  const hasUpper = /[A-Z]/.test(passwordInput);
  const hasLower = /[a-z]/.test(passwordInput);
  const hasNoNumbersOrSymbols = !/[^a-zA-Z]/.test(passwordInput);
  const isPasswordValid = isLengthValid && hasUpper && hasLower && hasNoNumbersOrSymbols;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'register' && !isPasswordValid) {
      alert('⚠️ Password violates the rules. Maximum length is 5 characters (Capital + Simple letters only).');
      return;
    }

    try {
      if (authMode === 'register') {
        await axios.post('http://localhost:5000/api/register', {
          name: nameInput,
          email: emailInput,
          password: passwordInput
        });
        alert('✅ Registration successful! Please log in with your credentials.');
        setAuthMode('login');
        setPasswordInput('');
      } else {
        await axios.post('http://localhost:5000/api/login', {
          email: emailInput,
          password: passwordInput
        });
        setIsLoggedIn(true);
        setUserEmail(emailInput);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', emailInput);
        setShowAuthModal(false);
        alert('🎉 Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setEmailInput('');
    setPasswordInput('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/dashboard') {
      navigate('/dashboard');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const yOffset = -95;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const yOffset = -95;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!destination.trim()) {
      alert('Please enter a destination to search on Google Maps!');
      return;
    }
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
    window.open(mapsUrl, '_blank');
  };

  const checkGeographicIncompatibility = () => {
    if (!destination || !destination.trim()) return null;
    const destLower = destination.toLowerCase();
    
    const isLandlocked = inlandLandlockedDestinations.some(place => destLower.includes(place));
    const isCoastalTrip = coastalTripTypes.includes(tripType);

    if (isLandlocked && isCoastalTrip) {
      return `⚠️ Note: "${destination}" is an inland/mountainous region and does not have a coastline for "${tripType}". We recommend selecting Nature, Cultural, Hiking, or Wellness trips for this area!`;
    }

    return null;
  };

  // Updated function to filter attractions based on BOTH Destination AND Trip Type
  const getFilteredAttractions = (destName, currentTripType) => {
    if (!destName || !destName.trim()) return null;
    const destKey = destName.toLowerCase().replace(/[^a-z0-9]/g, '');
    let matchedPlaceKey = '';
    
    for (const key in destinationAttractions) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (destKey.includes(cleanKey) || cleanKey.includes(destKey)) {
        matchedPlaceKey = key;
        break;
      }
    }

    if (matchedPlaceKey && destinationAttractions[matchedPlaceKey]) {
      const locationObj = destinationAttractions[matchedPlaceKey];
      
      // If specific trip type exists for this location, return those attractions
      if (locationObj[currentTripType]) {
        return locationObj[currentTripType];
      }

      // Otherwise, fallback to combining all attractions available for this destination
      let allPlaces = [];
      for (const cat in locationObj) {
        allPlaces = allPlaces.concat(locationObj[cat]);
      }
      return allPlaces;
    }

    // Default dynamic fallback if destination not explicitly pre-configured
    const capitalizedDest = destName.charAt(0).toUpperCase() + destName.slice(1);
    return [
      { name: `${capitalizedDest} ${currentTripType} Spot & Main Area`, category: currentTripType },
      { name: `${capitalizedDest} Ancient Heritage & Historical Site`, category: 'Cultural & Heritage' },
      { name: `${capitalizedDest} Eco Nature Reserve & Park`, category: 'Nature & Wildlife' },
      { name: `${capitalizedDest} Scenic Viewpoint & Trail`, category: 'Hiking & Trekking' }
    ];
  };

  const handleGenerateTrip = async (e) => {
    e.preventDefault();
    if (!destination.trim()) {
      alert('Please enter a target destination for your trip!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/trips', {
        destination: destination,
        trip_type: tripType,
        days: days,
        members: members,
        start_date: startDate || null,
        budget_level: budgetLevel,
        transport_mode: transportMode
      });

      await loadDefaultItems(tripType);
      setPlasticEstimate(days * members * 2);

      setGeneratedTrip({
        destination: destination,
        tripType: tripType,
        days: days,
        members: members,
        startDate: startDate,
        budgetLevel: budgetLevel,
        transportMode: transportMode
      });

      fetchTripsHistory();

      setTimeout(() => {
        scrollToSection('results-section');
      }, 100);

    } catch (err) {
      console.error('Error generating trip:', err);
      alert('Failed to connect to backend server.');
    }
  };

  const toggleCheck = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      item_name: newItemName,
      category: newCategory,
      item_type: tripType,
      checked: false
    };

    try {
      await axios.post('http://localhost:5000/api/items', {
        item_name: newItemName,
        category: newCategory,
        item_type: tripType
      });
    } catch (err) {
      console.log('Saved to state (offline/fallback mode)');
    }

    setItems([...items, newItem]);
    setNewItemName('');
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
    } catch (err) {
      console.log('Deleted from local view');
    }
    setItems(items.filter(item => item.id !== id));
  };

  const liveAttractions = getFilteredAttractions(destination, tripType);
  const geoWarning = checkGeographicIncompatibility();

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, boxSizing: 'border-box', backgroundColor: '#f4f8f5' }}>
      
      {/* Navigation Bar */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 99999, 
        background: '#1b5e20', 
        padding: '16px 70px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '100px', 
        boxSizing: 'border-box',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.2)',
        borderBottom: '4px solid #81c784'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '28px', fontWeight: '900', color: '#ffffff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          <img src={logoImg} alt="Logo" style={{ width: '58px', height: '58px', borderRadius: '14px', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: '0 3px 10px rgba(0,0,0,0.3)' }} />
          <span>Pure <span style={{ color: '#a5d6a7', fontWeight: '700', fontSize: '20px' }}>Journey</span></span>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <Link to="/" style={{ color: location.pathname === '/' ? '#a5d6a7' : '#ffffff', textDecoration: 'none', fontWeight: '800', fontSize: '16px', transition: 'all 0.2s' }}>
            Home
          </Link>

          {isLoggedIn ? (
            <>
              <span onClick={() => scrollToSection('planner-section')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>Plan Trip</span>
              <span onClick={() => scrollToSection('analytics-section')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>Analytics</span>
              <span onClick={() => scrollToSection('itinerary-section')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>AI Itinerary</span>
              <span onClick={() => scrollToSection('packing-section')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>Packing List</span>
              <span onClick={() => scrollToSection('history-section')} style={{ color: '#ffffff', cursor: 'pointer', fontWeight: '800', fontSize: '16px' }}>History</span>
              <button onClick={handleLogout} style={{ background: '#e53935', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '30px', cursor: 'pointer', fontWeight: '800', fontSize: '15px', boxShadow: '0 4px 14px rgba(229,57,53,0.3)' }}>
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuthModal(true)} style={{ background: '#2e7d32', color: 'white', border: '2px solid #ffffff', padding: '12px 30px', borderRadius: '30px', fontWeight: '800', fontSize: '17px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.2)' }}>
              Get Started 🌱
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ marginTop: '80px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                width: '100%', 
                minHeight: '85vh', 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3)), url(${homeBgImg})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                display: 'flex', 
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '80px 80px 80px 40px', 
                boxSizing: 'border-box'
              }}>
                <div style={{ maxWidth: '620px', textAlign: 'left', color: '#ffffff', textShadow: '0 3px 12px rgba(0,0,0,0.85)', background: 'rgba(15, 36, 16, 0.65)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2e7d32', padding: '8px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    🌿 EMPOWERING ENVIRONMENTAL CONSERVATION
                  </div>
                  <h1 style={{ fontSize: '52px', fontWeight: '900', lineHeight: '1.15', margin: '0 0 20px 0', letterSpacing: '-1.5px', color: '#ffffff' }}>
                    Travel Green, <br />
                    <span style={{ color: '#a5d6a7', fontStyle: 'italic' }}>Leave No Plastic Behind.</span>
                  </h1>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '700', fontSize: '15px', color: '#ffffff' }}>🌱 Pure Journey — Protect Nature, Travel Responsibly.</p>
                  <button onClick={() => { if(isLoggedIn) navigate('/dashboard'); else setShowAuthModal(true); }} style={{ background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '16px 42px', borderRadius: '35px', fontSize: '17px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,0,0,0.4)' }}>
                    {isLoggedIn ? 'Explore Dashboard 🚀' : 'Start Planning Free 🌱'}
                  </button>
                </div>
              </div>
            </div>
          } />

          <Route path="/dashboard" element={
            <div style={{ width: '100%', maxWidth: '1150px', margin: '30px auto', padding: '0 20px', boxSizing: 'border-box', flex: 1, color: '#2d3748' }}>
              
              {/* Trip Planner Form Section */}
              <div id="planner-section" style={{ background: '#ffffff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '30px', border: '1px solid #e8eee9' }}>
                <h2 style={{ color: '#1b5e20', marginTop: 0, fontSize: '26px', fontWeight: '800', marginBottom: '22px', letterSpacing: '-0.5px' }}>✨ Plan a New Sustainable Trip</h2>
                
                <form onSubmit={handleGenerateTrip}>
                  
                  {/* 1. Destination Input */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '15px' }}>Destination Location:</label>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <input 
                        type="text" 
                        placeholder="Enter destination (e.g. Kandy, Nuwara Eliya, Ella, Mirissa)" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        required 
                        style={{ flex: 1, padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' }} 
                      />
                      <button 
                        type="button" 
                        onClick={handleOpenGoogleMaps} 
                        style={{ background: '#1976d2', color: 'white', border: 'none', padding: '14px 22px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                      >
                        📍 Search Google Maps
                      </button>
                    </div>
                  </div>

                  {/* 2. Trip Type & Travel Style Dropdown */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '15px' }}>Trip Type & Travel Style:</label>
                    <select 
                      value={tripType} 
                      onChange={(e) => { setTripType(e.target.value); loadDefaultItems(e.target.value); }} 
                      style={{ padding: '14px 18px', width: '100%', borderRadius: '12px', border: '1px solid #cbd5e0', fontSize: '15px', backgroundColor: '#fff' }}
                    >
                      {tripTypesList.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Geographic Incompatibility Warning Alert */}
                  {geoWarning && (
                    <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px 16px', borderRadius: '10px', border: '1px solid #feb2b2', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
                      {geoWarning}
                    </div>
                  )}

                  {/* 4. Recommended Places (Filtered by Destination & Trip Type) & Map Preview */}
                  {liveAttractions && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                      <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '16px', border: '1px solid #c6f6d5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ color: '#1b5e20', margin: '0 0 14px 0', fontSize: '17px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          📍 Recommended <u>{tripType}</u> Places in <u>{destination}</u>:
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                          {liveAttractions.map((place, idx) => (
                            <div key={idx} style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontWeight: '700', color: '#2e7d32', fontSize: '15px', marginBottom: '4px' }}>🌿 {place.name}</div>
                              <small style={{ color: '#718096', fontSize: '12px', fontWeight: '600' }}>Category: {place.category}</small>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <h4 style={{ color: '#1b5e20', margin: '0 0 14px 0', fontSize: '17px', fontWeight: '800' }}>🗺️ Location Map Preview: {destination}</h4>
                        <iframe
                          title="Destination Map Preview"
                          width="100%"
                          height="300"
                          style={{ border: 0, borderRadius: '12px' }}
                          loading="lazy"
                          allowFullScreen
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(destination)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* 5. Dates, Budget & Transport */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '14px' }}>Trip Start Date:</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '12px 16px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '14px' }}>Budget Level:</label>
                      <select value={budgetLevel} onChange={(e) => setBudgetLevel(e.target.value)} style={{ padding: '12px 16px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}>
                        <option value="Eco Budget 🎒">Eco Budget 🎒</option>
                        <option value="Moderate Standard 🌿">Moderate Standard 🌿</option>
                        <option value="Luxury Eco-Resort ✨">Luxury Eco-Resort ✨</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '14px' }}>Transport Mode:</label>
                      <select 
                        value={transportMode} 
                        onChange={(e) => setTransportMode(e.target.value)} 
                        style={{ padding: '12px 16px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff' }}
                      >
                        {transportTypesList.map((mode, idx) => (
                          <option key={idx} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 6. Members & Days */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '26px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '14px' }}>Number of Days:</label>
                      <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} style={{ padding: '12px 16px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#2d3748', fontSize: '14px' }}>Number of Members:</label>
                      <input type="number" min="1" value={members} onChange={(e) => setMembers(e.target.value)} style={{ padding: '12px 16px', width: '100%', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <button type="submit" style={{ background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)', color: 'white', padding: '16px', border: 'none', borderRadius: '12px', cursor: 'pointer', width: '100%', fontWeight: '800', fontSize: '17px', boxShadow: '0 4px 15px rgba(46,125,50,0.3)' }}>
                    🚀 Generate Zero-Waste Plan & Packing List
                  </button>
                </form>
              </div>

              {generatedTrip && plasticEstimate > 0 && (
                <div id="results-section">
                  <div style={{ background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', padding: '30px', borderRadius: '16px', marginBottom: '30px', borderLeft: '8px solid #2e7d32', boxShadow: '0 8px 20px rgba(0,0,0,0.04)' }}>
                    <h3 style={{ color: '#1b5e20', margin: '0 0 10px 0', fontSize: '22px', fontWeight: '800' }}>🌍 Environmental Impact & Waste Reduction</h3>
                    <p style={{ margin: 0, color: '#1b5e20', fontSize: '17px', lineHeight: '1.6' }}>
                      By choosing reusable gear and <strong>{generatedTrip.transportMode}</strong> for this <strong>{generatedTrip.tripType}</strong> to <strong>{generatedTrip.destination}</strong>, you will prevent approximately <strong style={{ fontSize: '20px', color: '#2e7d32' }}>{plasticEstimate} single-use plastic items</strong> from harming nature!
                    </p>
                  </div>
                </div>
              )}

              {/* 📊 Eco Analytics Dashboard Component */}
              <div id="analytics-section">
                <EcoAnalytics trips={tripsHistory} />
              </div>

              {/* 🤖 AI-Powered Itinerary Generator Component */}
              <div id="itinerary-section">
                <AIItinerary destination={destination} tripType={tripType} days={days} />
              </div>

              {/* Packing Section */}
              <div id="packing-section" style={{ background: '#ffffff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '30px', border: '1px solid #e8eee9' }}>
                <h2 style={{ color: '#1b5e20', marginTop: 0, fontSize: '26px', fontWeight: '800', marginBottom: '20px' }}>🎒 Recommended Reusable Packing List ({tripType})</h2>
                
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <li key={item.id} onClick={() => toggleCheck(item.id)} style={{ background: item.checked ? '#f0fff4' : '#f7fafc', padding: '14px 18px', margin: '10px 0', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? '#a0aec0' : '#2d3748', transition: 'all 0.2s' }}>
                      <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.checked ? '✅ ' : '🔲 '} {item.item_name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ background: '#e6fffa', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', color: '#234e52', fontWeight: '700' }}>{item.category}</span>
                        <button onClick={(e) => handleDeleteItem(item.id, e)} title="Delete Item" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.7 }}>
                          🗑️
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Custom Item Form with All 163 Categories Support */}
                <form onSubmit={handleAddCustomItem} style={{ marginTop: '25px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
                  <h4 style={{ color: '#2d3748', margin: '0 0 14px 0', fontSize: '17px', fontWeight: '700' }}>➕ Add Custom Item to List</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      placeholder="Item Name (e.g. Bamboo Toothbrush)" 
                      value={newItemName} 
                      onChange={(e) => setNewItemName(e.target.value)} 
                      style={{ padding: '12px 16px', flex: 2, minWidth: '220px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px' }} 
                    />
                    <select 
                      value={newCategory} 
                      onChange={(e) => setNewCategory(e.target.value)} 
                      style={{ padding: '12px 16px', flex: 1, minWidth: '200px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px', backgroundColor: '#fff' }}
                    >
                      {packingCategoriesList.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button type="submit" style={{ background: '#0288d1', color: 'white', border: 'none', padding: '12px 26px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                      Add
                    </button>
                  </div>
                </form>

                {/* Export Utilities Component */}
                <ExportUtilities items={items} destination={destination} tripType={tripType} />
              </div>

              {/* History Section */}
              <div id="history-section" style={{ background: '#ffffff', padding: '35px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '30px', border: '1px solid #e8eee9' }}>
                <h2 style={{ color: '#1b5e20', marginTop: 0, fontSize: '26px', fontWeight: '800', marginBottom: '18px' }}>📜 Previous Trips History</h2>
                {tripsHistory.length === 0 ? (
                  <p style={{ color: '#a0aec0', fontSize: '15px' }}>No saved trips yet.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                      <thead>
                        <tr style={{ background: '#f7fafc', textAlign: 'left', color: '#4a5568' }}>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>ID</th>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>Destination</th>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>Trip Type & Style</th>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>Start Date</th>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>Budget</th>
                          <th style={{ padding: '14px', borderBottom: '2px solid #e2e8f0', fontSize: '14px', fontWeight: '700' }}>Transport</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tripsHistory.map((trip) => (
                          <tr key={trip.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                            <td style={{ padding: '14px', color: '#718096', fontSize: '14px' }}>{trip.id}</td>
                            <td style={{ padding: '14px', fontWeight: '700', color: '#2e7d32', fontSize: '14px' }}>{trip.destination || 'N/A'}</td>
                            <td style={{ padding: '14px', fontWeight: '600', color: '#2d3748', fontSize: '14px' }}>{trip.trip_type}</td>
                            <td style={{ padding: '14px', color: '#718096', fontSize: '14px' }}>{trip.start_date ? trip.start_date.split('T')[0] : 'N/A'}</td>
                            <td style={{ padding: '14px', color: '#718096', fontSize: '14px' }}>{trip.budget_level || 'Moderate'}</td>
                            <td style={{ padding: '14px', color: '#718096', fontSize: '14px' }}>{trip.transport_mode || 'Public'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          } />
        </Routes>
      </div>

      {/* Login Modal Popup */}
      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', color: '#2d3748', width: '100%', maxWidth: '420px', padding: '35px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: '#f0f0f0', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
            
            <div style={{ display: 'flex', borderBottom: '2px solid #edf2f7', marginBottom: '24px' }}>
              <button onClick={() => setAuthMode('login')} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'login' ? '3px solid #2e7d32' : 'none', fontWeight: '800', color: authMode === 'login' ? '#2e7d32' : '#a0aec0', cursor: 'pointer', fontSize: '16px' }}>
                Login
              </button>
              <button onClick={() => setAuthMode('register')} style={{ flex: 1, padding: '10px', background: 'none', border: 'none', borderBottom: authMode === 'register' ? '3px solid #2e7d32' : 'none', fontWeight: '800', color: authMode === 'register' ? '#2e7d32' : '#a0aec0', cursor: 'pointer', fontSize: '16px' }}>
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <h3 style={{ marginTop: 0, color: '#1b5e20', fontSize: '22px', fontWeight: '800', marginBottom: '20px' }}>{authMode === 'login' ? 'Welcome Back 👋' : 'Create Account 🌱'}</h3>
              
              {authMode === 'register' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '6px', color: '#4a5568', textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" placeholder="John Doe" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' }} />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '6px', color: '#4a5568', textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" placeholder="user@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e0', fontSize: '15px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', marginBottom: '6px', color: '#4a5568', textTransform: 'uppercase' }}>Password</label>
                <input 
                  type="password" 
                  placeholder="Max 5 letters (e.g. Abcde)" 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: `1px solid ${authMode === 'register' && passwordInput.Title > 0 && !isPasswordValid ? '#e53935' : '#cbd5e0'}`, 
                    fontSize: '15px', 
                    boxSizing: 'border-box' 
                  }} 
                />
                
                {authMode === 'register' && (
                  <div style={{ marginTop: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ color: isLengthValid ? '#2e7d32' : '#e53935', fontWeight: '700', marginBottom: '4px' }}>
                      {isLengthValid ? '✅' : '❌'} Maximum 5 characters long (1 to 5)
                    </div>
                    <div style={{ color: hasUpper ? '#2e7d32' : '#e53935', fontWeight: '700', marginBottom: '4px' }}>
                      {hasUpper ? '✅' : '❌'} At least one uppercase letter (A-Z)
                    </div>
                    <div style={{ color: hasLower ? '#2e7d32' : '#e53935', fontWeight: '700', marginBottom: '4px' }}>
                      {hasLower ? '✅' : '❌'} At least one lowercase letter (a-z)
                    </div>
                    <div style={{ color: hasNoNumbersOrSymbols ? '#2e7d32' : '#e53935', fontWeight: '700' }}>
                      {hasNoNumbersOrSymbols ? '✅' : '❌'} NO numbers or symbols allowed
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={authMode === 'register' && !isPasswordValid}
                style={{ 
                  width: '100%', 
                  background: (authMode === 'register' && !isPasswordValid) ? '#a0aec0' : '#2e7d32', 
                  color: 'white', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  fontWeight: '800', 
                  fontSize: '16px', 
                  cursor: (authMode === 'register' && !isPasswordValid) ? 'not-allowed' : 'pointer', 
                  boxShadow: '0 5px 15px rgba(46,125,50,0.3)' 
                }}
              >
                {authMode === 'login' ? 'Log In to Dashboard' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#0a1d0b', color: '#8fa891', textAlign: 'center', padding: '30px 20px', marginTop: 'auto', width: '100%' }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: '700', fontSize: '15px', color: '#ffffff' }}>🌱 Pure Journey — Protect Nature, Travel Responsibly.</p>
        <p style={{ margin: 0, fontSize: '13px', color: '#668068' }}>© 2026 All Rights Reserved. Built with React, Node.js & MySQL.</p>
      </footer>

    </div>
  );
}

export default App;