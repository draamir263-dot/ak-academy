// ============================================================
// questionLoader.js
// Groups MCQs by FOLDER name for navigation.
// Filtering by JSON fields (chapter/subject/difficulty)
// happens downstream in TestBuilder.jsx & TestEngine.jsx.
// ============================================================

const questionFiles = import.meta.glob('/src/data/**/*.json', { eager: true });

function formatName(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function inferCategory(q) {
  if (!q) return 'General';
  const text = `${q.question || ''} ${q.optionA || ''} ${q.optionB || ''} ${q.optionC || ''} ${q.optionD || ''}`.toLowerCase();
  if (text.includes('cell') || text.includes('gene') || text.includes('dna') || text.includes('enzyme') || text.includes('protein') || text.includes('biolog')) return 'Biology';
  if (text.includes('atom') || text.includes('mole') || text.includes('reaction') || text.includes('chemi') || text.includes('bond') || text.includes('organic')) return 'Chemistry';
  if (text.includes('force') || text.includes('velocity') || text.includes('energy') || text.includes('physi') || text.includes('wave') || text.includes('newton')) return 'Physics';
  if (text.includes('grammar') || text.includes('vocabulary') || text.includes('english') || text.includes('synonym') || text.includes('antonym')) return 'English';
  if (text.includes('logical') || text.includes('reasoning') || text.includes('syllogism') || text.includes('analytical')) return 'Logical Reasoning';
  return 'General';
}

const structuredData = [];
const subjectsMap = {};

for (const filePath of Object.keys(questionFiles)) {
  const fileModule = questionFiles[filePath];
  const fileData = fileModule.default || fileModule;

  // Extract folder structure from path
  // /src/data/Biology/Genetics/mcqs.json  -> subjectFolder=Biology, chapterFolder=Genetics
  // /src/data/MIX MCQS/mcqs.json          -> subjectFolder=MIX MCQS, chapterFolder=MIX MCQS
  // /src/data/ChapterName/filename.json    -> depends on folder name
  const pathPart = filePath.replace('/src/data/', '').replace(/\.json$/, '');
  const parts = pathPart.split('/');

  let subjectFolder, chapterFolder;

  if (parts.length === 1) {
    // /src/data/filename.json  (file directly in data folder)
    subjectFolder = 'General';
    chapterFolder = parts[0];
  } else if (parts.length === 2) {
    // /src/data/FolderName/filename.json
    subjectFolder = parts[0];
    chapterFolder = parts[0]; // same folder = subject and chapter are the same
  } else if (parts.length >= 3) {
    // /src/data/SubjectName/ChapterName/filename.json
    subjectFolder = parts[0];
    chapterFolder = parts[1];
  }

  // Get questions array from JSON
  const questions = Array.isArray(fileData) ? fileData : (fileData.questions || []);
  if (questions.length === 0) continue;

  const formattedSubject = formatName(subjectFolder);
  const chapterName = formatName(chapterFolder);

  // Initialize subject
  if (!subjectsMap[formattedSubject]) {
    subjectsMap[formattedSubject] = {
      name: formattedSubject,
      totalMcqs: 0,
      chapters: {},
    };
  }

  // Initialize chapter under this subject
  if (!subjectsMap[formattedSubject].chapters[chapterName]) {
    subjectsMap[formattedSubject].chapters[chapterName] = {
      name: chapterName,
      totalMcqs: 0,
      questions: [],
    };
  }

  // Process each question
  for (const q of questions) {
    // ===== CRITICAL: Save JSON's original fields BEFORE overwriting =====
    q.originalChapter = q.chapter;          // JSON's "chapter" field (e.g., "Enzymes", "Genetics", "Syllogisms")
    q.category = q.subject || inferCategory(q);  // JSON's "subject" field (e.g., "Biology", "Logical Reasoning")

    // Now overwrite with folder name for NAVIGATION grouping
    q.chapter = chapterName;      // Folder name used for routing
    q.subject = formattedSubject;  // Parent folder used for routing

    subjectsMap[formattedSubject].chapters[chapterName].questions.push(q);
    subjectsMap[formattedSubject].chapters[chapterName].totalMcqs++;
    subjectsMap[formattedSubject].totalMcqs++;
  }
}

// Convert maps to arrays for export
for (const subjectKey of Object.keys(subjectsMap)) {
  const subject = subjectsMap[subjectKey];
  structuredData.push({
    name: subject.name,
    totalMcqs: subject.totalMcqs,
    chapters: Object.values(subject.chapters),
  });
}

export { structuredData };
