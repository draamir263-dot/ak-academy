// questionLoader.js — DO NOT CHANGE (folder-based grouping)
// This file groups MCQs by FOLDER name for navigation.
// The filtering by JSON fields (chapter, subject, difficulty) happens
// downstream in TestBuilder.jsx and TestEngine.jsx.

const questionFiles = import.meta.glob('/src/data/**/*.json', { eager: true });

function formatName(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function inferCategory(q) {
  if (!q) return 'General';
  const text = `${q.question || ''} ${q.optionA || ''} ${q.optionB || ''}`.toLowerCase();
  if (text.includes('cell') || text.includes('gene') || text.includes('dna') || text.includes('enzyme') || text.includes('protein') || text.includes('biology')) return 'Biology';
  if (text.includes('atom') || text.includes('mole') || text.includes('reaction') || text.includes('chemistry') || text.includes('bond')) return 'Chemistry';
  if (text.includes('force') || text.includes('velocity') || text.includes('energy') || text.includes('physics') || text.includes('wave')) return 'Physics';
  if (text.includes('grammar') || text.includes('vocabulary') || text.includes('english')) return 'English';
  if (text.includes('logical') || text.includes('reasoning') || text.includes('syllogism')) return 'Logical Reasoning';
  return 'General';
}

const structuredData = [];
const subjectsMap = {};

for (const filePath of Object.keys(questionFiles)) {
  const fileModule = questionFiles[filePath];
  const fileData = fileModule.default || fileModule;

  // Extract folder structure from path
  // e.g., /src/data/Biology/Genetics/mcqs.json
  //   subjectFolder = Biology, chapterFolder = Genetics
  const parts = filePath.replace('/src/data/', '').replace('.json', '').split('/');

  let subjectFolder, chapterFolder, explicitSubject;

  if (parts.length === 1) {
    // File directly in /src/data/filename.json
    subjectFolder = 'General';
    chapterFolder = parts[0];
  } else if (parts.length === 2) {
    // /src/data/ChapterName/filename.json  OR  /src/data/SubjectName/filename.json
    // Check if the folder is a known subject
    const knownSubjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning',
      'Mathematics', 'General Knowledge', 'Islamiyat', 'Pakistan Studies'];
    const folderName = formatName(parts[0]);
    if (knownSubjects.some(s => folderName.toLowerCase().includes(s.toLowerCase()))) {
      subjectFolder = folderName;
      chapterFolder = parts[1];
    } else {
      subjectFolder = 'General';
      chapterFolder = parts[0];
      explicitSubject = undefined;
    }
  } else {
    // /src/data/SubjectName/ChapterName/filename.json
    subjectFolder = formatName(parts[0]);
    chapterFolder = formatName(parts[1]);
  }

  // Get questions array from JSON
  const questions = Array.isArray(fileData) ? fileData : (fileData.questions || []);

  if (questions.length === 0) continue;

  const formattedSubject = formatName(subjectFolder);
  const chapterName = formatName(chapterFolder);

  // Initialize subject if not exists
  if (!subjectsMap[formattedSubject]) {
    subjectsMap[formattedSubject] = {
      name: formattedSubject,
      totalMcqs: 0,
      chapters: {},
    };
  }

  // Initialize chapter if not exists
  if (!subjectsMap[formattedSubject].chapters[chapterName]) {
    subjectsMap[formattedSubject].chapters[chapterName] = {
      name: chapterName,
      totalMcqs: 0,
      questions: [],
    };
  }

  // Process each question
  for (const q of questions) {
    // SAVE JSON's original fields BEFORE overwriting
    q.originalChapter = q.chapter;   // JSON's "chapter" field (e.g., "Enzymes", "Genetics")
    q.category = q.subject || inferCategory(q);  // JSON's "subject" field (e.g., "Biology", "Chemistry")

    // Overwrite with folder name for NAVIGATION grouping
    q.chapter = chapterName;    // Folder name for navigation
    q.subject = formattedSubject;  // Parent folder for navigation

    subjectsMap[formattedSubject].chapters[chapterName].questions.push(q);
    subjectsMap[formattedSubject].chapters[chapterName].totalMcqs++;
    subjectsMap[formattedSubject].totalMcqs++;
  }
}

// Convert maps to arrays
for (const subjectKey of Object.keys(subjectsMap)) {
  const subject = subjectsMap[subjectKey];
  structuredData.push({
    name: subject.name,
    totalMcqs: subject.totalMcqs,
    chapters: Object.values(subject.chapters),
  });
}

export { structuredData };