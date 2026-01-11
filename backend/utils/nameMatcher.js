// utils/nameMatcher.js

// Common plant names with variations and misspellings
const plantNameVariations = {
  // Roses
  "rose": ["roses", "roze", "roos", "flower rose", "rosa"],
  "roses": ["rose", "rozes", "rosses"],
  
  // Sunflowers
  "sunflower": ["sun flower", "sunflowers", "sunflover", "sunflwr"],
  "sunflowers": ["sunflower", "sun flowers"],
  
  // Tulsi/Holy Basil
  "tulsi": ["holy basil", "tulasi", "tulsee", "thulasi", "tulshi"],
  "holy basil": ["tulsi", "sacred basil", "tulasi"],
  
  // Money Plant
  "money plant": ["pothos", "devil's ivy", "money tree", "pothos plant", "epipremnum"],
  "pothos": ["money plant", "devil's ivy", "golden pothos"],
  
  // Snake Plant
  "snake plant": ["mother in law's tongue", "sansevieria", "viper's bowstring hemp", "snakeplant"],
  "sansevieria": ["snake plant", "mother in law tongue"],
  
  // Aloe Vera
  "aloe vera": ["aloe", "aloe barbadensis", "aloe plant", "alovera", "aloevera"],
  "aloe": ["aloe vera", "aloe plant"],
  
  // Lavender
  "lavender": ["lavendar", "lavander", "lavendula", "english lavender"],
  
  // Jasmine
  "jasmine": ["jasmin", "jessamine", "jasminum", "common jasmine"],
  
  // Tomato
  "tomato": ["tomatoes", "tamatar", "tomato plant", "tomatos"],
  
  // Mint
  "mint": ["mint plant", "pudina", "mentha", "spearmint", "peppermint"],
  
  // Spider Plant
  "spider plant": ["chlorophytum", "airplane plant", "ribbon plant", "spider ivy"],
  
  // Peace Lily
  "peace lily": ["spathiphyllum", "white sails", "spathe flower", "peace-lily"],
  
  // Add more common plants...
  "orchid": ["orchids", "orchidaceae", "phalaenopsis"],
  "cactus": ["cacti", "cactuses", "cactaceae"],
  "basil": ["sweet basil", "basil plant", "tulsi", "ocimum"],
  "fern": ["ferns", "boston fern", "maidenhair fern"],
  "bamboo": ["bamboo plant", "lucky bamboo", "bambusa"]
};

// Fuzzy string matching function
export const fuzzyMatchPlantName = (inputName) => {
  const cleanInput = inputName.toLowerCase().trim();
  
  // Direct match
  if (plantNameVariations[cleanInput]) {
    return cleanInput;
  }
  
  // Check variations
  for (const [correctName, variations] of Object.entries(plantNameVariations)) {
    if (variations.includes(cleanInput)) {
      return correctName;
    }
    
    // Check if input contains the correct name or vice versa
    if (cleanInput.includes(correctName) || correctName.includes(cleanInput)) {
      return correctName;
    }
  }
  
  // Calculate similarity for close matches
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [correctName] of Object.entries(plantNameVariations)) {
    const score = calculateSimilarity(cleanInput, correctName);
    if (score > bestScore && score > 0.7) { // 70% similarity threshold
      bestScore = score;
      bestMatch = correctName;
    }
  }
  
  return bestMatch || inputName; // Return original if no good match
};

// Levenshtein distance-based similarity calculation
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Levenshtein distance algorithm
const levenshteinDistance = (str1, str2) => {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  );
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Get suggestions for autocomplete
export const getPlantSuggestions = (input) => {
  if (!input || input.length < 2) return [];
  
  const cleanInput = input.toLowerCase();
  const suggestions = new Set();
  
  // Check direct matches and variations
  for (const [correctName, variations] of Object.entries(plantNameVariations)) {
    if (correctName.includes(cleanInput) || cleanInput.includes(correctName)) {
      suggestions.add(correctName);
    }
    
    for (const variation of variations) {
      if (variation.includes(cleanInput) || cleanInput.includes(variation)) {
        suggestions.add(correctName);
      }
    }
  }
  
  return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
};