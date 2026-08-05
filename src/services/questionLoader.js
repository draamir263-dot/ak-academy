const textFiles = import.meta.glob('../data/**/*.json', { eager: true });

let allQuestions = [];
const subjectsMap = {};

// --- SMART AUTO-CATEGORIZATION (last-resort fallback only) ---
function inferCategory(q) {
  if (q.category) return q.category;
  const summary = (q.summary || "").toLowerCase();
  
  if (summary.includes("english")) return "English";
  if (summary.includes("logical") || summary.includes("reasoning") || summary.includes("syllogism")) return "Logical Reasoning";
  
  const physKeywords = ["physics", "mechanics", "kinematics", "circular motion", "projectile", "gravitation", "wave", "sound", "optics", "thermodynamics", "electrostatics", "electricity", "electromagnet", "nuclear", "fluid", "oscillation", "work and energy", "electronics", "circuit", "vector", "force", "momentum", "torque", "angular", "magnetic", "charge", "voltage", "current", "resistance", "capacitor", "inductance", "transformer", "diode", "semi", "photoelectric", "photon", "velocity", "acceleration", "newton", "coulomb", "faraday", "lenz", "ohm", "watt", "joule", "electron volt", "half-life", "radioactive", "fission", "fusion", "binding energy", "atomic physics", "modern physics", "power"];
  if (physKeywords.some(kw => summary.includes(kw))) return "Physics";

  const chemKeywords = ["chemistry", "chemical", "vsepr", "atomic structure", "periodic", "stoichio", "thermochem", "electrochem", "organic", "inorganic", "nomenclature", "polymer", "kinetics", "equilibrium", "solution", "gas laws", "acids and bases", "bonding", "intermolecular", "liquid", "solid state", "oxidation", "reduction", "redox", "mole", "catalyst", "reagent", "functional group", "alkene", "alkyne", "alkane", "benzene", "aromatic", "spectroscop", "chromatography", "buffer", "solubility", "enthalpy", "entropy", "orbital", "quantum", "proton", "neutron", "isotope", "hybridization", "dipole", "polar", "hydrogen bond", "van der waals", "viscosity", "surface tension", "boiling point", "crystal", "isomerism", "carbocation", "carbanion", "radical", "ester", "ether", "alcohol", "phenol", "aldehyde", "ketone", "carboxylic", "amine", "amide", "lipid", "carbohydrate", "protein", "nucleic acid", "dna", "rna", "atp", "enzyme", "vitamin", "hormone", "drug", "poison", "pollut", "environment", "industrial", "fertilizer", "acid rain", "greenhouse", "ozone", "metal", "non-metal", "transition", "alkali", "halogen", "noble gas", "alloy", "corrosion", "rust", "electroplating", "battery", "electrolyte", "anode", "cathode", "salt", "hydrate", "molarity", "molality", "titration", "neutralization", "ph", "hydrolysis", "ligand", "coordination", "chelate", "rate", "order", "activation energy", "collision theory", "arrhenius", "half life", "carbon dating", "mole", "empirical", "structural", "substitution", "addition", "elimination", "hydrolysis", "hydration", "dehydration", "hydrogenation", "halogenation", "nitration", "grignard", "aldol", "ozonolysis", "periodic table", "ionization", "electronegativity", "atomic radius", "flame test", "phosphorus", "sulfur", "nitrogen", "carbon", "oxygen", "hydrogen", "helium", "lithium", "beryllium", "boron", "fluorine", "neon", "sodium", "magnesium", "aluminium", "silicon", "chlorine", "argon", "potassium", "calcium", "scandium", "titanium", "vanadium", "chromium", "manganese", "iron", "cobalt", "nickel", "copper", "zinc", "gallium", "germanium", "arsenic", "selenium", "bromine", "krypton", "rubidium", "strontium", "yttrium", "zirconium", "niobium", "molybdenum", "technetium", "ruthenium", "rhodium", "palladium", "silver", "cadmium", "indium", "tin", "antimony", "tellurium", "iodine", "xenon", "caesium", "barium", "lanthanum", "cerium", "praseodymium", "neodymium", "promethium", "samarium", "europium", "gadolinium", "terbium", "dysprosium", "holmium", "erbium", "thulium", "ytterbium", "lutetium", "hafnium", "tantalum", "tungsten", "rhenium", "osmium", "iridium", "platinum", "gold", "mercury", "thallium", "lead", "bismuth", "polonium", "astatine", "radon", "francium", "radium", "actinium", "thorium", "protactinium", "uranium", "neptunium", "plutonium", "americium", "curium", "berkelium", "californium", "einsteinium", "fermium", "mendelevium", "nobelium", "lawrencium", "rutherfordium", "dubnium", "seaborgium", "bohrium", "hassium", "meitnerium", "darmstadtium", "roentgenium", "copernicium", "nihonium", "flerovium", "moscovium", "livermorium", "tennessine", "oganesson"];
  if (chemKeywords.some(kw => summary.includes(kw))) return "Chemistry";

  return "Biology";
}

Object.keys(textFiles).forEach((path) => {
  const fileData = textFiles[path].default || textFiles[path];
  if (!Array.isArray(fileData)) return;

  const parts = path.split('/');
  parts.pop(); // removes 'part1.json'
  const folderName = parts.pop(); 
  const dataIndex = parts.indexOf('data');
  const subjectName = parts[dataIndex + 1] || 'Unknown';
  const formattedSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);

  if (!subjectsMap[formattedSubject]) {
    subjectsMap[formattedSubject] = { name: formattedSubject, totalMcqs: 0, chapters: {} };
  }

  fileData.forEach(q => {
    // Save the question's OWN academic subject BEFORE overwriting.
    const explicitSubject = q.subject;

    // q.subject gets OVERWRITTEN with the folder name for navigation.
    q.subject = formattedSubject;

    // PRESERVE the original chapter from JSON (e.g. "Enzymes", "Genetics")
    q.originalChapter = q.chapter;

    // KEY FIX: Use the JSON's own "chapter" field for grouping.
    // If the JSON has a chapter field, use it. Otherwise, fall back to folder name.
    const resolvedChapter = (q.chapter && q.chapter.toString().trim() !== '')
      ? q.chapter.toString().trim()
      : folderName;
    q.chapter = resolvedChapter;

    // q.category = the REAL academic subject (Biology, Chemistry, etc.)
    q.category = (explicitSubject && explicitSubject.toString().trim() !== '')
      ? explicitSubject
      : inferCategory(q);

    // Create the chapter entry under the subject using the RESOLVED chapter name
    if (!subjectsMap[formattedSubject].chapters[resolvedChapter]) {
      subjectsMap[formattedSubject].chapters[resolvedChapter] = { name: resolvedChapter, totalMcqs: 0, questions: [] };
    }

    subjectsMap[formattedSubject].chapters[resolvedChapter].questions.push(q);
    subjectsMap[formattedSubject].chapters[resolvedChapter].totalMcqs++;
    subjectsMap[formattedSubject].totalMcqs++;
    allQuestions.push(q);
  });
});

export const structuredData = Object.values(subjectsMap).map(subject => ({
  ...subject,
  chapters: Object.values(subject.chapters)
}));