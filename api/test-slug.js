// Test script for slug generation
// Run: node api/test-slug.js

// Transliteration map for Cyrillic to Latin
const translitMap = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

// Helper function to transliterate Cyrillic to Latin
function transliterate(text) {
  return text.split('').map(char => {
    const lower = char.toLowerCase();
    return translitMap[lower] || char;
  }).join('');
}

function generateUniqueSlug(name, existingGirls) {
  // Transliterate Cyrillic to Latin
  const transliterated = transliterate(name);
  
  // Convert to kebab-case
  const baseSlug = transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Generate short ID (6 chars)
  const shortId = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${shortId}`;
  
  // Check if slug exists (should be very rare with random ID)
  const exists = existingGirls.some(g => g.slug === slug);
  if (exists) {
    // Retry with new random ID
    return generateUniqueSlug(name, existingGirls);
  }
  
  return slug;
}

// Test cases
const testNames = [
  'Анна',
  'Super Girl',
  'Мария-Луиза',
  'AI Assistant 2024',
  'Кэтрин О\'Хара',
  'Test!!!###',
  '   Spaces   Around   ',
  'Multiple---Dashes',
  'CamelCaseExample',
  'Японский 日本語 Test',
  '123 Numbers 456'
];

const existingGirls = [];

console.log('🧪 Testing slug generation:\n');

testNames.forEach(name => {
  const slug = generateUniqueSlug(name, existingGirls);
  existingGirls.push({ slug }); // Add to avoid duplicates in test
  
  // Validate pattern
  const isValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
  const status = isValid ? '✅' : '❌';
  
  console.log(`${status} "${name}"`);
  console.log(`   → ${slug}`);
  console.log(`   Length: ${slug.length}, Valid: ${isValid}\n`);
});

// Test collision handling
console.log('\n🔄 Testing collision handling:');
const collisionTest = Array(10).fill('Test Name');
const collisionSlugs = new Set();

collisionTest.forEach((name, i) => {
  const slug = generateUniqueSlug(name, []);
  collisionSlugs.add(slug);
  console.log(`${i + 1}. ${slug}`);
});

console.log(`\n✅ Generated ${collisionSlugs.size} unique slugs from ${collisionTest.length} identical names`);

