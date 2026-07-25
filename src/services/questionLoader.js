const textFiles = import.meta.glob('../data/**/*.json', { eager: true });

let allQuestions = [];
const subjectsMap = {};

// --- NEW: SMART AUTO-CATEGORIZATION ---
// This automatically figures out the subject based on the summary, so you don't have to edit your JSONs!
function inferCategory(q) {
  if (q.category) return q.category; // If it already has a category, keep it
  const summary = (q.summary || "").toLowerCase();
  
  if (summary.startsWith("english")) return "English";
  if (summary.startsWith("logical")) return "Logical Reasoning";
  
  // Check Chemistry
  const chemKeywords = ["chemistry", "chemical", "vsepr", "atomic structure", "periodic", "stoichio", "thermochem", "electrochem", "organic", "inorganic", "nomenclature", "polymer", "kinetics", "equilibrium", "solution", "gas laws", "acids and bases", "bonding", "intermolecular"];
  if (chemKeywords.some(kw => summary.startsWith(kw))) return "Chemistry";
  
  // Check Physics
  const physKeywords = ["physics", "mechanics", "kinematics", "circular motion", "projectile", "gravitation", "wave", "sound", "optics", "thermodynamics", "electrostatics", "current electricity", "electromagnetism", "nuclear", "modern physics", "fluid", "oscillations", "work and energy", "electronics", "properties of water"];
  if (physKeywords.some(kw => summary.startsWith(kw))) return "Physics";

  // If none of the above, it's Biology
  return "Biology";
}

Object.keys(textFiles).forEach((path) => {
  const fileData = textFiles[path].default || textFiles[path];
  if (!Array.isArray(fileData)) return;

  const parts = path.split('/');
  parts.pop(); // removes 'part1.json'
  const chapterName = parts.pop(); 
  const dataIndex = parts.indexOf('data');
  const subjectName = parts[dataIndex + 1] || 'Unknown';
  const formattedSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

  if (!subjectsMap[formattedSubject]) {
    subjectsMap[formattedSubject] = { name: formattedSubject, totalMcqs: 0, chapters: {} };
  }

  if (!subjectsMap[formattedSubject].chapters[chapterName]) {
    subjectsMap[formattedSubject].chapters[chapterName] = { name: chapterName, totalMcqs: 0, questions: [] };
  }

  fileData.forEach(q => {
    q.subject = formattedSubject;
    q.chapter = chapterName;
    
    // --- APPLY AUTO-CATEGORY ---
    q.category = inferCategory(q);

    subjectsMap[formattedSubject].chapters[chapterName].questions.push(q);
    subjectsMap[formattedSubject].chapters[chapterName].totalMcqs++;
    subjectsMap[formattedSubject].totalMcqs++;
    allQuestions.push(q);
  });
});

export const structuredData = Object.values(subjectsMap).map(subject => ({
  ...subject,
  chapters: Object.values(subject.chapters)
}));