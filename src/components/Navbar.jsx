import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Navbar() {
  const { currentUser, user, isPremium, expiryDate, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // --- SEARCH FEATURE STATE ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchType, setSearchType] = useState('mcq'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chaptersList, setChaptersList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedResultId, setExpandedResultId] = useState(null);
  const [searchStatus, setSearchStatus] = useState(''); // To show loading progress

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/', { replace: true });
  };

  const daysLeft = expiryDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
  const userName = currentUser?.email ? currentUser.email.split('@')[0] : 'Account';
  const canUpgrade = user?.currentPlan && user.currentPlan !== '1_year' && user.currentPlan !== 'none';

  // The collections where your subjects are stored
  const SUBJECT_COLLECTIONS = [
    'biology', 'Biology', 
    'chemistry', 'Chemistry', 
    'physics', 'Physics', 
    'logical reasoning', 'Logical Reasoning', 'logical_reasoning',
    'past papers', 'Past Papers', 'past_papers',
    'guess paper', 'Guess Paper', 'guess_papers',
    'mcqs', 'chapters' // Fallbacks
  ];

  // 1. Fetch All Unique Chapters Across All Subjects
  useEffect(() => {
    if (isSearchOpen && chaptersList.length === 0) {
      const fetchAllChapters = async () => {
        setSearchStatus('Loading chapters from all subjects...');
        const uniqueChapters = new Set();

        for (const colName of SUBJECT_COLLECTIONS) {
          try {
            const snap = await getDocs(collection(db, colName));
            snap.docs.forEach(doc => {
              const data = doc.data();
              // Extract chapter names wherever they might be saved
              if (data.chapter) uniqueChapters.add(data.chapter);
              if (data.chapterName) uniqueChapters.add(data.chapterName);
              if (data.name) uniqueChapters.add(data.name); 
              if (data.title) uniqueChapters.add(data.title);
            });
          } catch (error) {
            // Collection doesn't exist, ignore and move to next
          }
        }

        const formattedChapters = Array.from(uniqueChapters)
          .filter(Boolean) // Remove empties
          .map(ch => ({ id: ch, name: ch }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setChaptersList(formattedChapters);
        setSearchStatus('');
      };
      
      fetchAllChapters();
    }
  }, [isSearchOpen, chaptersList.length]);

  // 2. Handle the Deep Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && searchType === 'chapter') return;
    if (searchType === 'mcq' && !selectedChapter) {
      alert("Please select a chapter first!");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setExpandedResultId(null);
    setSearchStatus('Scanning subjects for matches...');

    // Break the user's search into individual lowercase words for fuzzy matching
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(t => t.trim() !== '');

    try {
      if (searchType === 'chapter') {
        // Search Chapters locally
        const filtered = chaptersList.filter(c => 
          searchTerms.every(term => c.name.toLowerCase().includes(term))
        );
        setSearchResults(filtered);

      } else {
        // Search MCQs across all subjects
        let allMatchedMcqs = [];

        for (const colName of SUBJECT_COLLECTIONS) {
          try {
            const snap = await getDocs(collection(db, colName));
            
            snap.docs.forEach(doc => {
              const data = doc.data();
              const mcqChapter = data.chapter || data.chapterName || data.name || '';
              
              // Only look inside the selected chapter
              if (mcqChapter !== selectedChapter) return;

              const textToSearch = (data.question || data.statement || data.text || '').toLowerCase();
              
              // FUZZY MATCH: Every word the user typed must exist somewhere in the question
              const isMatch = searchTerms.every(term => textToSearch.includes(term));
              
              if (isMatch && textToSearch.trim() !== '') {
                allMatchedMcqs.push({ id: doc.id, subjectFrom: colName, ...data });
              }
            });
          } catch (error) {
             // Ignore non-existent collections
          }
        }
        
        setSearchResults(allMatchedMcqs);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
    
    setIsSearching(false);
    setSearchStatus('');
  };

  return (
    <>
      <nav className="bg-blue-900 shadow-sm border-b border-blue-800 sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" replace className="flex items-center space-x-2 mr-2">
                <span className="text-2xl">🩺</span>
                <span className="font-extrabold text-xl text-white hidden sm:block">AK Academy</span>
              </Link>

              {/* SEARCH BUTTON */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-blue-100 hover:text-white hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2 border border-blue-700/50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span className="hidden sm:inline">Search</span>
              </button>

              <Link to="/" replace className="text-blue-200 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              
              {currentUser && (
                <Link to="/dashboard" replace className="text-blue-200 hover:text-white px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {currentUser && currentUser.email?.toLowerCase() === "draamir308@gmail.com" && (
                <Link 
                  to="/admin" 
                  className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  Admin
                </Link>
              )}
              
              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <span className="w-6 h-6 bg-white text-blue-900 rounded-full flex items-center justify-center text-xs uppercase">
                      {userName.charAt(0)}
                    </span>
                    <span className="hidden sm:block capitalize">{userName}</span>
                    <span className="text-xs">▼</span>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50">
                      <p className="text-xs text-gray-400 font-semibold uppercase">Logged in as</p>
                      <p className="font-bold text-gray-800 mb-4 break-all">{currentUser.email}</p>
                      
                      {isPremium ? (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4 text-center">
                          <p className="text-sm font-bold text-green-700">⭐ Premium Active</p>
                          <p className="text-xs text-gray-500 mt-1">{daysLeft} days remaining</p>
                          
                          {canUpgrade && (
                            <Link 
                              to="/payment" 
                              onClick={() => setShowDropdown(false)} 
                              className="block mt-3 bg-blue-600 text-white text-xs font-bold py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Upgrade your plan
                            </Link>
                          )}
                        </div>
                      ) : (
                        user?.paymentStatus === 'rejected' ? (
                          <div className="bg-red-50 border border-red-500 p-3 rounded-lg mb-4 text-center">
                            <p className="text-sm font-bold text-red-700">Payment Rejected ❌</p>
                            <p className="text-xs text-gray-700 mt-1 font-medium">Wrong Transaction ID.</p>
                            <Link to="/payment" onClick={() => setShowDropdown(false)} className="block mt-2 text-xs text-blue-600 underline font-semibold">
                              Submit correct ID here
                            </Link>
                          </div>
                        ) : (
                          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-center">
                            <p className="text-sm font-bold text-red-700">Account Expired</p>
                            <Link to="/payment" onClick={() => setShowDropdown(false)} className="block mt-1 text-xs text-blue-600 underline font-semibold">
                              Click here to recharge
                            </Link>
                          </div>
                        )
                      )}

                      <button 
                        onClick={handleLogout}
                        className="w-full bg-red-500 text-white py-2 rounded-md text-sm font-semibold hover:bg-red-600"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-yellow-400 text-blue-900 px-3 sm:px-4 py-2 rounded-md text-sm font-bold hover:bg-yellow-500 transition-colors"
                >
                  Log In
                </Link>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* --- GLOBAL SEARCH MODAL OVERLAY --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header & Tabs */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSearchType('mcq'); setSearchResults([]); }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${searchType === 'mcq' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  Search MCQs
                </button>
                <button 
                  onClick={() => { setSearchType('chapter'); setSearchResults([]); }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${searchType === 'chapter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  Search Chapter
                </button>
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Search Input Area */}
            <div className="p-5">
              <form onSubmit={handleSearch} className="flex flex-col gap-3">
                
                {/* Step 1: Show Chapter Dropdown IF searching for MCQ */}
                {searchType === 'mcq' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Select Chapter</label>
                    <select 
                      value={selectedChapter} 
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Choose a Chapter --</option>
                      {chaptersList.map((chap, idx) => (
                        <option key={idx} value={chap.name}>{chap.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 2: Search Input field */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    {searchType === 'mcq' ? '2. Type Question Keyword' : 'Type Chapter Name'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={searchType === 'mcq' ? "e.g., cell, thermodynamics, atoms..." : "e.g., Biology Chapter 1"}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      type="submit" 
                      disabled={isSearching}
                      className="bg-blue-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-70 transition-colors whitespace-nowrap"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Loading Status Indicator */}
            {searchStatus && (
              <div className="px-5 py-2 text-sm text-blue-600 font-semibold bg-blue-50 animate-pulse">
                {searchStatus}
              </div>
            )}

            {/* Results Area */}
            <div className="bg-gray-50 border-t border-gray-200 p-5 overflow-y-auto max-h-[50vh]">
              {searchResults.length === 0 && !isSearching && !searchStatus && (
                <div className="text-center text-gray-400 py-8">
                  {searchQuery ? 'No matches found in the database.' : 'Search results will appear here.'}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Found {searchResults.length} Results</p>
                  
                  {searchResults.map((item, index) => (
                    <div key={item.id || index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Clickable Header */}
                      <div 
                        onClick={() => searchType === 'mcq' ? setExpandedResultId(expandedResultId === item.id ? null : item.id) : null}
                        className={`p-4 ${searchType === 'mcq' ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                      >
                        <h4 className="font-bold text-gray-800">
                          {searchType === 'chapter' ? item.name : (item.question || item.statement || item.text)}
                        </h4>
                        
                        {searchType === 'mcq' && (
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                              Found in: {item.subjectFrom}
                            </span>
                            <p className="text-xs text-blue-600 font-semibold">
                              {expandedResultId === item.id ? 'Close Details ▲' : 'View Full MCQ ▼'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expanded MCQ Content (Shows all options & answer) */}
                      {searchType === 'mcq' && expandedResultId === item.id && (
                        <div className="p-4 bg-blue-50/50 border-t border-blue-100">
                          
                          {/* Handles Array options (if you used lists) */}
                          {Array.isArray(item.options) && (
                            <ul className="space-y-2 mb-4">
                              {item.options.map((opt, i) => (
                                <li key={i} className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">
                                  {String.fromCharCode(65 + i)}) {opt}
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Handles Object options (optionA, optionB, etc) */}
                          {!Array.isArray(item.options) && (item.optionA || item.option1) && (
                            <div className="space-y-2 mb-4">
                              <div className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">A) {item.optionA || item.option1}</div>
                              <div className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">B) {item.optionB || item.option2}</div>
                              <div className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">C) {item.optionC || item.option3}</div>
                              <div className="text-sm text-gray-700 bg-white p-2 border border-gray-200 rounded">D) {item.optionD || item.option4}</div>
                            </div>
                          )}

                          <div className="mt-3 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-bold border border-green-200 shadow-sm">
                            Correct Answer: {item.correctAnswer || item.answer || 'Not specified'}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}