const textFiles = import.meta.glob('../data/**/*.json', { eager: true });

let allQuestions = [];
const subjectsMap = {};

Object.keys(textFiles).forEach((path) => {
  const fileData = textFiles[path].default || textFiles[path];
  if (!Array.isArray(fileData)) return;

  fileData.forEach(q => {
    // STRICT: use the question's own fields from the JSON. No folder inference,
    // no keyword guessing. If a question is missing a field, it goes into
    // "Uncategorized" so it's easy to spot and fix in the data instead of
    // silently getting miscategorized.
    const subjectName = (q.subject && q.subject.toString().trim()) || 'Uncategorized';
    const chapterName = (q.chapter && q.chapter.toString().trim()) || 'Uncategorized';

    if (!subjectsMap[subjectName]) {
      subjectsMap[subjectName] = { name: subjectName, totalMcqs: 0, chapters: {} };
    }
    if (!subjectsMap[subjectName].chapters[chapterName]) {
      subjectsMap[subjectName].chapters[chapterName] = { name: chapterName, totalMcqs: 0, questions: [] };
    }

    subjectsMap[subjectName].chapters[chapterName].questions.push(q);
    subjectsMap[subjectName].chapters[chapterName].totalMcqs++;
    subjectsMap[subjectName].totalMcqs++;
    allQuestions.push(q);
  });
});

export const structuredData = Object.values(subjectsMap).map(subject => ({
  ...subject,
  chapters: Object.values(subject.chapters)
}));

export { allQuestions };