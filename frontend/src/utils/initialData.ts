import { Brand, Team } from '../types';
import { calculateRankings } from './ranking';

export const INITIAL_TEAMS_RAW: Team[] = Array.from({ length: 15 }, (_, index) => {
  const num = (index + 1).toString().padStart(2, '0');
  return {
    id: (index + 1).toString(),
    teamNumber: `Team ${num}`,
    teamName: `Team ${num}`,
    member1: `Member ${num}-A`,
    member2: `Member ${num}-B`,
    member3: `Member ${num}-C`,
    morphCoins: 10000,
    score: 0,
    brand: '—',
    brandId: null,
    winningBid: null,
    product: '—',
    rank: 1, // initially all tied at 10,000
    cards: [],
  };
});

export const INITIAL_TEAMS = calculateRankings(INITIAL_TEAMS_RAW);

// Helper for generating clean vector logo data URIs
function createBrandLogoSvg(name: string, bg: string, textCol: string, symbol: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" rx="28" fill="${bg}"/>
    <text x="100" y="88" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="46" fill="${textCol}" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
    <text x="100" y="145" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20" letter-spacing="3" fill="${textCol}" text-anchor="middle">${name.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'b1',
    lotNumber: 1,
    name: 'ZOMATO',
    sector: 'Food Tech / Consumer Internet',
    logo: createBrandLogoSvg('ZOMATO', '#e23744', '#ffffff', '🍽️'),
    basePrice: 2500,
    shortDescription: 'A consumer-tech brand built around food discovery, restaurant culture and convenience, with an unusually strong personality and highly recognisable communication style.',
    brandDetails: 'Zomato operates across food discovery, restaurant technology and food-related consumer services. Its brand is known for understanding consumer behaviour, cultural moments and food trends while using humour and highly recognisable communication. It should be treated as more than simply a food-delivery company.',
    status: 'HIDDEN',
  },
  {
    id: 'b2',
    lotNumber: 2,
    name: 'CASHIFY',
    sector: 'Re-commerce / Consumer Technology',
    logo: createBrandLogoSvg('CASHIFY', '#14b8a6', '#ffffff', '📱'),
    basePrice: 2200,
    shortDescription: 'A technology platform built around buying, selling, repairing and giving used electronics another life.',
    brandDetails: 'Cashify operates around the lifecycle of consumer electronics, combining resale, refurbishment, repairs and technology. Its identity connects convenience, affordability, sustainability and circular consumption.',
    status: 'HIDDEN',
  },
  {
    id: 'b3',
    lotNumber: 3,
    name: 'CRED',
    sector: 'Fintech / Lifestyle',
    logo: createBrandLogoSvg('CRED', '#0f172a', '#f8fafc', '💳'),
    basePrice: 2700,
    shortDescription: 'A financial brand that transformed a routine financial activity into a premium lifestyle and rewards experience.',
    brandDetails: 'CRED operates around credit-card payments, rewards and financial behaviour while using premium positioning, unusual advertising and cultural relevance to differentiate itself from traditional financial services.',
    status: 'HIDDEN',
  },
  {
    id: 'b4',
    lotNumber: 4,
    name: 'LENSKART',
    sector: 'Eyewear / Retail Technology',
    logo: createBrandLogoSvg('LENSKART', '#000042', '#00bac6', '👓'),
    basePrice: 2300,
    shortDescription: 'A technology-led eyewear company combining fashion, retail, technology and personalised consumer experiences.',
    brandDetails: 'Lenskart operates across eyewear, online retail, physical stores and technology-enabled shopping experiences. It has positioned eyewear as both a functional necessity and a fashion/lifestyle category.',
    status: 'HIDDEN',
  },
  {
    id: 'b5',
    lotNumber: 5,
    name: 'NYKAA',
    sector: 'Beauty / Retail / E-commerce',
    logo: createBrandLogoSvg('NYKAA', '#fc2779', '#ffffff', '💄'),
    basePrice: 2500,
    shortDescription: 'A beauty-focused retail and technology company that turned beauty shopping into a highly curated consumer experience.',
    brandDetails: 'Nykaa combines e-commerce, physical retail, beauty content, product discovery and a large portfolio of beauty and lifestyle brands. Its identity is strongly connected to aspiration, trends, education, creators and consumer discovery.',
    status: 'HIDDEN',
  },
  {
    id: 'b6',
    lotNumber: 6,
    name: 'URBAN COMPANY',
    sector: 'Consumer Services / Technology',
    logo: createBrandLogoSvg('URBAN CO', '#111827', '#fbbf24', '🛠️'),
    basePrice: 2000,
    shortDescription: 'A technology platform connecting consumers with professionals for services performed in homes and personal spaces.',
    brandDetails: 'Urban Company operates across home cleaning, repairs, beauty, grooming and other consumer services. Instead of selling a conventional physical product, its core value comes from organising fragmented services through technology, trust and convenience.',
    status: 'HIDDEN',
  },
  {
    id: 'b7',
    lotNumber: 7,
    name: 'PATANJALI',
    sector: 'FMCG / Wellness / Ayurveda',
    logo: createBrandLogoSvg('PATANJALI', '#ea580c', '#ffffff', '🌿'),
    basePrice: 2200,
    shortDescription: 'An Indian consumer brand built around Ayurveda, wellness, traditional Indian products and mass-market accessibility.',
    brandDetails: 'Patanjali operates across food, personal care, healthcare, wellness and household categories. Its identity is strongly connected to Indian heritage, natural products, Ayurveda and a value-conscious mass consumer base.',
    status: 'HIDDEN',
  },
  {
    id: 'b8',
    lotNumber: 8,
    name: 'MEGHANA FOODS',
    sector: 'Food / Restaurants / Hospitality',
    logo: createBrandLogoSvg('MEGHANA', '#b91c1c', '#fef08a', '🍛'),
    basePrice: 1900,
    shortDescription: "One of Bengaluru's most recognisable food brands, famous for its Andhra-inspired food and especially its biryani.",
    brandDetails: 'Meghana Foods began in Bengaluru and has grown into a major local food identity, combining traditional flavours with a highly recognisable restaurant experience. Its Bengaluru roots and strong association with biryani make it very different from a national food-tech platform.',
    status: 'HIDDEN',
  },
  {
    id: 'b9',
    lotNumber: 9,
    name: 'ID FRESH FOOD',
    sector: 'Food / FMCG / Ready-to-Cook',
    logo: createBrandLogoSvg('ID FRESH', '#15803d', '#ffffff', '🍲'),
    basePrice: 1900,
    shortDescription: 'A Bengaluru-born food company that built a large business around making traditional Indian food easier to prepare.',
    brandDetails: 'iD Fresh Food is known for products such as ready-to-cook dosa and idli batter and has expanded into other fresh Indian food categories. The brand combines traditional food culture with modern packaging, supply chains and convenience.',
    status: 'HIDDEN',
  },
  {
    id: 'b10',
    lotNumber: 10,
    name: 'LICIOUS',
    sector: 'Food Tech / Meat & Seafood',
    logo: createBrandLogoSvg('LICIOUS', '#dc2626', '#ffffff', '🥩'),
    basePrice: 2200,
    shortDescription: 'A food-tech company that modernised the way consumers buy meat and seafood through a branded, technology-enabled experience.',
    brandDetails: 'Licious built an integrated supply chain around meat and seafood while focusing on quality, convenience, trust and doorstep delivery. It is an interesting example of taking a fragmented traditional category and building a modern consumer brand around it.',
    status: 'HIDDEN',
  },
  {
    id: 'b11',
    lotNumber: 11,
    name: 'BLUESTONE',
    sector: 'Jewellery / E-commerce / Retail',
    logo: createBrandLogoSvg('BLUESTONE', '#1e3a8a', '#93c5fd', '💎'),
    basePrice: 2300,
    shortDescription: 'A jewellery brand that challenged the traditional jewellery-shopping experience through technology, design and modern retail.',
    brandDetails: 'BlueStone operates across online jewellery, physical retail and technology-enabled customer experiences. Its model demonstrates how a high-trust traditional category can be redesigned around convenience, personalisation and modern consumer behaviour.',
    status: 'HIDDEN',
  },
  {
    id: 'b12',
    lotNumber: 12,
    name: 'MOXIE BEAUTY',
    sector: 'Beauty / Skincare',
    logo: createBrandLogoSvg('MOXIE', '#831843', '#fbcfe8', '✨'),
    basePrice: 1800,
    shortDescription: 'A newer Indian beauty brand focused on modern formulations, product innovation and a more contemporary approach to personal care.',
    brandDetails: 'Moxie Beauty represents the newer generation of Indian beauty brands that combine digital-first discovery, product formulation and modern consumer positioning. It gives teams a less obvious brand to research rather than another household name.',
    status: 'HIDDEN',
  },
  {
    id: 'b13',
    lotNumber: 13,
    name: 'BLUE TOKAI',
    sector: 'Coffee / Food & Beverage / Lifestyle',
    logo: createBrandLogoSvg('BLUE TOKAI', '#0284c7', '#ffffff', '☕'),
    basePrice: 2000,
    shortDescription: 'An Indian specialty coffee company that helped make high-quality coffee and coffee culture more accessible to modern consumers.',
    brandDetails: 'Blue Tokai operates across specialty coffee, cafés and packaged products. Its identity is connected to sourcing, roasting, coffee education, craft and the growing premium coffee culture in India.',
    status: 'HIDDEN',
  },
  {
    id: 'b14',
    lotNumber: 14,
    name: 'GIVA',
    sector: 'Jewellery / Fashion / D2C',
    logo: createBrandLogoSvg('GIVA', '#475569', '#f1f5f9', '💍'),
    basePrice: 1900,
    shortDescription: 'A digitally native jewellery brand that made accessible jewellery feel more modern, personal and lifestyle-oriented.',
    brandDetails: 'GIVA operates across jewellery and fashion accessories with a strong digital-first identity and expanding physical presence. It targets younger consumers through accessible pricing, design-led products and frequent discovery.',
    status: 'HIDDEN',
  },
  {
    id: 'b15',
    lotNumber: 15,
    name: 'BLISSCLUB',
    sector: 'Fashion / Activewear / D2C',
    logo: createBrandLogoSvg('BLISSCLUB', '#7c3aed', '#ffffff', '🧘'),
    basePrice: 1700,
    shortDescription: 'A Bengaluru-born activewear brand built around making everyday movement, comfort and fitness clothing more accessible to women.',
    brandDetails: 'BlissClub has built its identity around engineered activewear, comfort and a strong community-led approach. It is an example of a focused consumer brand solving a very specific product problem rather than trying to serve everyone.',
    status: 'HIDDEN',
  },
  {
    id: 'b16',
    lotNumber: 16,
    name: 'DOGSEE CHEW',
    sector: 'Pet Care / Food / D2C',
    logo: createBrandLogoSvg('DOGSEE', '#ca8a04', '#ffffff', '🐾'),
    basePrice: 1700,
    shortDescription: 'A Bengaluru-based pet brand creating specialised chew products and treats for dogs.',
    brandDetails: 'Dogsee Chew operates in the rapidly growing pet-care category and differentiates itself through specialised products and unconventional ingredients. Its business sits at the intersection of pet ownership, nutrition, premiumisation and lifestyle.',
    status: 'HIDDEN',
  },
  {
    id: 'b17',
    lotNumber: 17,
    name: 'LIQUID DEATH',
    sector: 'Beverage / FMCG / Lifestyle',
    logo: createBrandLogoSvg('LIQUID DEATH', '#000000', '#ffffff', '💀'),
    basePrice: 2700,
    shortDescription: 'A water brand that turned an extremely ordinary product into a loud, rebellious and highly recognisable cultural brand.',
    brandDetails: 'Liquid Death deliberately rejects traditional bottled-water marketing and uses humour, entertainment, extreme visual identity and cultural relevance to differentiate itself. It is one of the most creatively flexible brands in the auction.',
    status: 'HIDDEN',
  },
  {
    id: 'b18',
    lotNumber: 18,
    name: 'IKEA',
    sector: 'Furniture / Home / Lifestyle',
    logo: createBrandLogoSvg('IKEA', '#0051ba', '#ffda1a', '🇸🇪'),
    basePrice: 2800,
    shortDescription: 'A global home brand built around accessible design, functionality, self-assembly and creating complete lifestyle environments.',
    brandDetails: 'IKEA sells much more than furniture. Its ecosystem covers home products, storage, food, design and everyday living. Its identity revolves around making good design accessible while encouraging customers to participate in the assembly and creation of their spaces.',
    status: 'HIDDEN',
  },
  {
    id: 'b19',
    lotNumber: 19,
    name: 'JPMORGAN',
    sector: 'Banking / Financial Services / Investment',
    logo: createBrandLogoSvg('JPMORGAN', '#1e293b', '#e2e8f0', '🏛️'),
    basePrice: 3200,
    shortDescription: "One of the world's largest financial institutions, operating across banking, investment, markets and wealth management.",
    brandDetails: 'JPMorgan represents trust, financial expertise, institutional scale, investment and global financial infrastructure rather than a conventional consumer product. It is intentionally included as a difficult wildcard brand.',
    status: 'HIDDEN',
  },
  {
    id: 'b20',
    lotNumber: 20,
    name: 'PATAGONIA',
    sector: 'Outdoor / Apparel / Sustainability',
    logo: createBrandLogoSvg('PATAGONIA', '#1a3644', '#f1a80a', '⛰️'),
    basePrice: 2200,
    shortDescription: 'An outdoor brand whose identity is deeply connected to environmental responsibility, durability and responsible consumption.',
    brandDetails: 'Patagonia combines outdoor products with environmental activism and a strong philosophy around how products are made, used and consumed. Its brand is driven as much by its values as by the products themselves.',
    status: 'HIDDEN',
  },
];

export function createDefaultProductVectorSvg(name: string, category: string = '', bg: string = '#1e1b4b'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#09090b"/>
      </linearGradient>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a855f7" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#6366f1" stop-opacity="0.6"/>
      </linearGradient>
    </defs>
    <rect width="300" height="300" rx="24" fill="url(#bgGrad)"/>
    <circle cx="150" cy="130" r="75" fill="#ffffff" fill-opacity="0.03" stroke="#a855f7" stroke-width="1.5" stroke-opacity="0.3"/>
    
    <!-- Isometric Cube / Product Asset Symbol -->
    <g transform="translate(150, 125)">
      <!-- Top Face -->
      <polygon points="0,-40 38,-18 0,4 -38,-18" fill="#c084fc" opacity="0.9"/>
      <!-- Left Face -->
      <polygon points="-38,-18 0,4 0,46 -38,24" fill="#9333ea" opacity="0.85"/>
      <!-- Right Face -->
      <polygon points="0,4 38,-18 38,24 0,46" fill="#7e22ce" opacity="0.95"/>
      <!-- Center Glowing Core -->
      <circle cx="0" cy="4" r="8" fill="#ffffff" opacity="0.9"/>
    </g>
    
    <text x="150" y="225" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" letter-spacing="3" fill="#ffffff" text-anchor="middle">${name.toUpperCase()}</text>
    <text x="150" y="248" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="10" letter-spacing="2" fill="#c084fc" text-anchor="middle">${(category || 'PRODUCT ASSET').toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createProductImageSvg(name: string, bg: string, icon: string): string {
  return createDefaultProductVectorSvg(name, bg);
}

import { FINAL_20_PRODUCTS } from './productData';

export const INITIAL_PRODUCTS: import('../types').Product[] = FINAL_20_PRODUCTS;

export const INITIAL_ROUND_CONFIG: import('../types').RoundControlState = {
  currentRoundId: 'round_2_product_reveal',
  currentRoundName: 'PRODUCT REVEAL',
  roundNumber: 2,
  infoReleased: false,
  roundStatus: 'LOCKED',
  status: 'LOCKED',
  objective: 'Decrypt the mystery cipher to unlock the MORPH Product Vault, then claim your team\'s exclusive product before other teams take it.',
  rules: '1. Each team can claim exactly ONE product from the inventory.\n2. Once a team confirms a product, it is immediately locked out and removed for all other teams.\n3. Round completion rank is determined strictly by the timestamp of product confirmation.\n4. All team members share the same team vault selection.',
  timeLimit: '15 MINUTES',
  importantNotes: 'The puzzle answer is case-insensitive. After solving the puzzle, the Product Vault unlocks immediately. Act fast to secure your preferred product.',
  instructions: '1. Read the clue and enter the correct answer in the Cipher Decryptor.\n2. Once decrypted, the MORPH Vault will unlock with real-time inventory.\n3. Select your desired product and click "CONFIRM PRODUCT SELECTION".',
  puzzle: {
    type: 'text',
    text: 'DECRYPT CIPHER: Enter the 4-digit master access sequence for the MORPH Vault.',
    imageUrl: '',
    correctAnswer: '1234',
  },
};

export const INITIAL_CARDS: import('../types').MorphCard[] = [
  {
    id: 'card_safe',
    name: 'SAFE',
    price: 2000,
    power: 'Asset Immunity & Penalty Shield',
    description: 'Provides comprehensive immunity against asset reallocation, opposing team swap maneuvers, or penalty coin deductions.',
    maxAvailable: 15,
    purchasedCount: 0,
  },
  {
    id: 'card_swap',
    name: 'SWAP',
    price: 3500,
    power: 'Direct Strategic Asset Exchange',
    description: 'Grants the tactical authorization to initiate a direct brand or product swap proposal with another team under official mediation.',
    maxAvailable: 5,
    purchasedCount: 0,
  },
  {
    id: 'card_intel',
    name: 'INTEL',
    price: 1500,
    power: 'Strategic Forecast & Telemetry Clues',
    description: 'Unlocks classified event telemetry, upcoming evaluation rubrics, and secret stage intelligence before public reveals.',
    maxAvailable: 10,
    purchasedCount: 0,
  },
  {
    id: 'card_boost',
    name: 'BOOST',
    price: 2000,
    power: 'Score Multiplier & Event Advantage',
    description: 'Activates a 1.25x performance multiplier during milestone judge reviews and awards exclusive priority advantages.',
    maxAvailable: 10,
    purchasedCount: 0,
  },
];

export const INITIAL_CARD_ROUND_CONFIG: import('../types').CardRoundControlState = {
  roundName: 'Round 3: Morph Cards Market',
  infoReleased: false,
  purchaseStatus: 'CLOSED',
  roundStatus: 'LOCKED',
  objective: 'Acquire high-impact strategic capability cards from the Morph Card inventory to defend your assets, disrupt rivals, or accelerate your point multipliers.',
  instructions: '1. Evaluate the limited card inventory and strategic functions.\n2. Purchase cards using your team\'s Morph Coins during open trading windows.\n3. Deploy your owned cards strategically during designated stages.',
  rules: '1. Each card has a fixed coin price and maximum supply limit.\n2. Purchases are immediate and non-refundable.\n3. SAFE cards protect against asset reallocation and SWAP attempts.\n4. SWAP cards permit strategic asset exchange subject to safe defense rules.',
  regulations: 'Only registered team accounts with adequate coin balances may acquire cards. All transactions are logged on the audit ledger.',
  timeLimit: '20 Minutes',
  additionalInfo: 'Card inventory updates in real-time as other teams purchase limited supplies.',
};

export const INITIAL_PRODUCT_CREATION_CONFIG: import('../types').ProductCreationConfig = {
  infoReleased: false,
  roundStatus: 'LOCKED',
  title: 'PRODUCT CREATION',
  objective: 'Synthesize your acquired Brand identity and allocated Product core into a market-disrupting product innovation with viable architecture, positioning, and unit economics.',
  instructions: '1. Carefully analyze the case study guidelines and market constraints below.\n2. Leverage your brand ethos, visual language, and engineering capabilities to transform your allocated product.\n3. Prepare your team pitch deck and concept specifications ready for jury evaluation.\n4. Submit your completed work to the official event submission email before the deadline.',
  timeLimit: 'OVERNIGHT / 8 HOURS',
  submissionEmail: 'submissions.morph@event.org',
  submissionInstructions: 'Email your final presentation slide deck (PDF format) and prototype/demo links to the address above. Ensure the email subject is formatted as: "[MORPH-SUBMISSION] Team Number - Brand Name & Product Name". All members should be CC\'d.',
  caseStudy: `### EXECUTIVE CASE STUDY: THE MORPH INNOVATION CHALLENGE

#### 1. STRATEGIC CONTEXT & MARKET IMPERATIVE
In today's hyper-competitive global economy, traditional category boundaries have dissolved. Consumer expectations demand radical cross-pollination between heritage brand philosophies and hardware/software product ecosystems. 

Your organization has acquired a landmark corporate brand identity along with a specialized, single-core product asset from the MORPH Product Vault. The overarching objective of the Product Creation & Overnight Build round is to execute a high-velocity product synthesis: morphing an ordinary commodity or specialized device into an iconic, category-defining flagship.

---

#### 2. CORE EVALUATION PILLARS

1. **BRAND SYNERGY & PHILOSOPHY INTEGRATION (30%)**
   - How authentically does the new product express your assigned brand's core DNA, visual language, materials, and customer promise?
   - Does it honor the legacy of the parent parent while aggressively innovating for future demographics?

2. **PRODUCT ARCHITECTURE & USER EXPERIENCE (25%)**
   - What is the innovative functional leap from the base product?
   - How are ergonomics, human-centered hardware design, companion digital services, and sustainability incorporated?

3. **BUSINESS VIABILITY & VALUE PROPOSITION (25%)**
   - What is the target customer archetype and willingness-to-pay?
   - Outline the pricing strategy, supply chain considerations, and recurring revenue / ecosystem lock-in potential.

4. **PRESENTATION CRAFT & STRATEGIC NARRATIVE (20%)**
   - Coherence of the team pitch deck, technical sketches/mockups, and handling of Q&A during defense hearings.

---

#### 3. DELIVERABLE SPECIFICATIONS & SUBMISSION FORMAT
Teams will defend their concept during the morning adjudication. Each team is expected to synthesize:
- **Product Nomenclature & Tagline**
- **Target Persona & Core Problem Solved**
- **Hardware/Software Feature Architecture**
- **Business Model Canvas Summary**

---
*MORPH Strategic Committee — Confidential Briefing*`,
  caseStudyFileName: 'MORPH_Product_Creation_Brief.txt',
  caseStudyFileType: 'txt',
  additionalNotes: 'All team members must collaborate. Once the live round is initiated by the Admin, the countdown timer will begin.',
};

// Helper for generating clean, stylised illustrated celebrity portrait SVGs
function createCelebrityVectorSvg(
  name: string,
  bgStart: string,
  bgEnd: string,
  accentCol: string,
  symbol: string,
  domainShort: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
    <defs>
      <linearGradient id="bgGrad_${name.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}"/>
        <stop offset="100%" stop-color="${bgEnd}"/>
      </linearGradient>
      <linearGradient id="glowGrad_${name.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accentCol}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${accentCol}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="320" height="320" rx="36" fill="url(#bgGrad_${name.replace(/[^a-zA-Z0-9]/g, '')})"/>
    <circle cx="160" cy="130" r="88" fill="url(#glowGrad_${name.replace(/[^a-zA-Z0-9]/g, '')})"/>
    <circle cx="160" cy="130" r="68" fill="#090d16" stroke="${accentCol}" stroke-width="3" stroke-opacity="0.6"/>
    <text x="160" y="142" font-family="system-ui, -apple-system, sans-serif" font-size="64" text-anchor="middle" dominant-baseline="middle">${symbol}</text>
    <rect x="36" y="228" width="248" height="62" rx="18" fill="#050811" fill-opacity="0.85" stroke="${accentCol}" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="160" y="254" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="14" letter-spacing="2" fill="#ffffff" text-anchor="middle">${name.toUpperCase()}</text>
    <text x="160" y="274" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="10" letter-spacing="1.5" fill="${accentCol}" text-anchor="middle">${domainShort.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const rawCelebrities: Array<Omit<import('../types').CelebrityCard, 'price'> & { price?: number }> = [
  {
    id: 'cel_1',
    celebrityNumber: 1,
    name: 'CARRYMINATI',
    image: createCelebrityVectorSvg('CARRYMINATI', '#0f172a', '#1e1b4b', '#38bdf8', '🎮', 'Digital / Gaming / Comedy'),
    domain: 'Digital Entertainment / Comedy / Gaming',
    price: 2500,
    personalityRating: 9,
    popularityRating: 10,
    businessRelevanceRating: 7,
    publicAppealRating: 8,
    additionalRating: 10,
    additionalRatingLabel: 'VIRALITY',
    description: "One of India's biggest digital creators, known for roasting, gaming, comedy and a highly recognisable internet personality. His strongest asset is the ability to generate attention and connect with internet-native audiences.",
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_2',
    celebrityNumber: 2,
    name: 'PUNEET SUPERSTAR',
    image: createCelebrityVectorSvg('PUNEET SUPERSTAR', '#1c1917', '#451a03', '#f59e0b', '🕶️', 'Internet Culture / Comedy'),
    domain: 'Internet Culture / Comedy / Reality Entertainment',
    price: 1500,
    personalityRating: 10,
    popularityRating: 7,
    businessRelevanceRating: 4,
    publicAppealRating: 8,
    additionalRating: 10,
    additionalRatingLabel: 'CHAOS',
    description: 'An internet personality known for deliberately unfiltered content, exaggerated reactions and an instantly recognisable style. His value comes primarily from memorability, attention and internet culture rather than conventional brand credibility.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_3',
    celebrityNumber: 3,
    name: 'RAKHI SAWANT',
    image: createCelebrityVectorSvg('RAKHI SAWANT', '#2e1065', '#831843', '#f472b6', '👑', 'Reality TV / Entertainment'),
    domain: 'Entertainment / Reality Television / Media',
    price: 1800,
    personalityRating: 10,
    popularityRating: 8,
    businessRelevanceRating: 5,
    publicAppealRating: 7,
    additionalRating: 10,
    additionalRatingLabel: 'ENTERTAINMENT VALUE',
    description: 'A long-standing Indian entertainment personality known for reality television, dramatic public appearances and an ability to remain part of popular conversation. A high-attention, high-risk personality whose value depends heavily on the brand.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_4',
    celebrityNumber: 4,
    name: 'KARAN JOHAR',
    image: createCelebrityVectorSvg('KARAN JOHAR', '#18181b', '#3b0764', '#c084fc', '🎬', 'Film / Media Executive'),
    domain: 'Film / Media / Entertainment',
    price: 3000,
    personalityRating: 9,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 8,
    additionalRating: 10,
    additionalRatingLabel: 'INDUSTRY INFLUENCE',
    description: "Filmmaker, producer, television personality and a highly connected figure in India's entertainment ecosystem. His strength lies in combining celebrity culture, media, storytelling and commercial relationships.",
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_5',
    celebrityNumber: 5,
    name: 'DILJIT DOSANJH',
    image: createCelebrityVectorSvg('DILJIT DOSANJH', '#1e1b4b', '#431407', '#fb923c', '🎤', 'Music / Film / Fashion'),
    domain: 'Music / Film / Fashion',
    price: 3200,
    personalityRating: 9,
    popularityRating: 9,
    businessRelevanceRating: 9,
    publicAppealRating: 10,
    additionalRating: 10,
    additionalRatingLabel: 'CULTURAL REACH',
    description: 'A Punjabi entertainment star who has successfully crossed regional, national and international audiences. His music, fashion, humour and distinctive identity give him strong crossover potential.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_6',
    celebrityNumber: 6,
    name: 'VIRAT KOHLI',
    image: createCelebrityVectorSvg('VIRAT KOHLI', '#064e3b', '#022c22', '#34d399', '🏏', 'Cricket / Sports Icon'),
    domain: 'Cricket / Sports / Lifestyle',
    price: 4000,
    personalityRating: 9,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 9,
    additionalRating: 10,
    additionalRatingLabel: 'INFLUENCE',
    description: "One of India's most commercially powerful sporting personalities, with influence extending into fitness, fashion, food and consumer brands. His competitive image and enormous following make him a premium celebrity asset.",
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_7',
    celebrityNumber: 7,
    name: 'NEERAJ CHOPRA',
    image: createCelebrityVectorSvg('NEERAJ CHOPRA', '#0c4a6e', '#14532d', '#facc15', '🥇', 'Athletics / Olympic Champion'),
    domain: 'Athletics / Sports',
    price: 3000,
    personalityRating: 8,
    popularityRating: 9,
    businessRelevanceRating: 8,
    publicAppealRating: 10,
    additionalRating: 10,
    additionalRatingLabel: 'TRUST',
    description: 'An elite Indian athlete whose achievements have made him a major national sporting figure. His public image is strongly associated with discipline, performance, humility and national pride.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_8',
    celebrityNumber: 8,
    name: 'URFI JAVED',
    image: createCelebrityVectorSvg('URFI JAVED', '#311042', '#701a75', '#e879f9', '✨', 'Fashion / Avant-Garde'),
    domain: 'Fashion / Internet Culture / Entertainment',
    price: 2000,
    personalityRating: 10,
    popularityRating: 8,
    businessRelevanceRating: 6,
    publicAppealRating: 6,
    additionalRating: 10,
    additionalRatingLabel: 'ATTENTION',
    description: 'A highly recognisable Indian internet and fashion personality known for unconventional outfits, experimental visual identity and an ability to generate conversation. Her strongest commercial asset is attention and distinctiveness.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_9',
    celebrityNumber: 9,
    name: 'BABA RAMDEV',
    image: createCelebrityVectorSvg('BABA RAMDEV', '#451a03', '#78350f', '#f59e0b', '🧘‍♂️', 'Wellness / Ayurveda / FMCG'),
    domain: 'Wellness / FMCG / Ayurveda / Media',
    price: 2300,
    personalityRating: 9,
    popularityRating: 9,
    businessRelevanceRating: 9,
    publicAppealRating: 7,
    additionalRating: 10,
    additionalRatingLabel: 'CREDIBILITY',
    description: 'A highly recognisable Indian public figure associated with yoga, Ayurveda, wellness and consumer products. His strongest positioning comes from combining personal visibility with traditional Indian wellness and mass-market consumer behaviour.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_10',
    celebrityNumber: 10,
    name: 'KANYE WEST',
    image: createCelebrityVectorSvg('KANYE WEST', '#18181b', '#3f3f46', '#a1a1aa', '🎹', 'Music / Fashion / Design'),
    domain: 'Music / Fashion / Culture / Entrepreneurship',
    price: 3000,
    personalityRating: 10,
    popularityRating: 10,
    businessRelevanceRating: 9,
    publicAppealRating: 5,
    additionalRating: 10,
    additionalRatingLabel: 'CULTURAL DISRUPTION',
    description: 'A globally influential musician and fashion figure whose career has repeatedly blurred music, fashion, design and entrepreneurship. His cultural influence is enormous, but his polarising public image creates significant brand risk.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_11',
    celebrityNumber: 11,
    name: 'DONALD TRUMP',
    image: createCelebrityVectorSvg('DONALD TRUMP', '#1e293b', '#0f172a', '#fbbf24', '🏛️', 'Media / Politics / Business'),
    domain: 'Politics / Media / Business / Public Culture',
    price: 2800,
    personalityRating: 10,
    popularityRating: 10,
    businessRelevanceRating: 9,
    publicAppealRating: 4,
    additionalRating: 10,
    additionalRatingLabel: 'POLARISATION',
    description: 'A globally recognised public figure whose identity spans business, television, politics and media. His enormous recognition and ability to generate attention come with equally significant reputational and audience risks.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_12',
    celebrityNumber: 12,
    name: 'KEANU REEVES',
    image: createCelebrityVectorSvg('KEANU REEVES', '#1e293b', '#334155', '#94a3b8', '🏍️', 'Film / Global Cinema'),
    domain: 'Film / Entertainment',
    price: 3200,
    personalityRating: 9,
    popularityRating: 9,
    businessRelevanceRating: 7,
    publicAppealRating: 10,
    additionalRating: 10,
    additionalRatingLabel: 'LIKEABILITY',
    description: 'A globally recognised actor whose public image combines major film franchises with an unusually understated and widely admired personality. His strongest asset is trust and cross-generational appeal.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_13',
    celebrityNumber: 13,
    name: 'DWAYNE JOHNSON',
    image: createCelebrityVectorSvg('DWAYNE JOHNSON', '#3f2c1d', '#1c1917', '#f59e0b', '💪', 'Film / Sports / Commerce'),
    domain: 'Film / Sports / Entrepreneurship',
    price: 3800,
    personalityRating: 10,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 9,
    additionalRating: 10,
    additionalRatingLabel: 'COMMERCIAL POWER',
    description: "A former professional wrestler who developed one of the world's strongest personal brands across entertainment, fitness, consumer products and entrepreneurship. His biggest advantage is converting personality into commercial value.",
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_14',
    celebrityNumber: 14,
    name: 'RYAN REYNOLDS',
    image: createCelebrityVectorSvg('RYAN REYNOLDS', '#0c4a6e', '#1e3a8a', '#60a5fa', '🎬', 'Film / Advertising Master'),
    domain: 'Film / Advertising / Entrepreneurship',
    price: 3300,
    personalityRating: 10,
    popularityRating: 9,
    businessRelevanceRating: 10,
    publicAppealRating: 9,
    additionalRating: 10,
    additionalRatingLabel: 'MARKETING INSTINCT',
    description: 'An actor and entrepreneur particularly known for bringing humour and personality into advertising and brand building. He represents an unusually strong connection between celebrity, entertainment and marketing.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_15',
    celebrityNumber: 15,
    name: 'MRBEAST',
    image: createCelebrityVectorSvg('MRBEAST', '#0369a1', '#1e1b4b', '#38bdf8', '⚡', 'Digital Media / Spectacle'),
    domain: 'Digital Media / Entertainment / Entrepreneurship',
    price: 3700,
    personalityRating: 8,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 8,
    additionalRating: 10,
    additionalRatingLabel: 'ATTENTION',
    description: 'A creator who built a massive entertainment ecosystem around spectacle, challenges, philanthropy and highly engineered content. His biggest asset is his ability to capture and convert enormous amounts of attention.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_16',
    celebrityNumber: 16,
    name: 'SNOOP DOGG',
    image: createCelebrityVectorSvg('SNOOP DOGG', '#14532d', '#1e1b4b', '#a3e635', '🎵', 'Music / Lifestyle Icon'),
    domain: 'Music / Entertainment / Lifestyle',
    price: 3000,
    personalityRating: 10,
    popularityRating: 9,
    businessRelevanceRating: 9,
    publicAppealRating: 9,
    additionalRating: 10,
    additionalRatingLabel: 'CULTURAL REACH',
    description: 'A globally recognised musician whose identity has expanded into food, entertainment, lifestyle, collaborations and internet culture. His relaxed personality and recognisable image provide unusual flexibility.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_17',
    celebrityNumber: 17,
    name: 'GORDON RAMSAY',
    image: createCelebrityVectorSvg('GORDON RAMSAY', '#7f1d1d', '#450a0a', '#f87171', '🔥', 'Culinary / Hospitality'),
    domain: 'Food / Hospitality / Television',
    price: 3000,
    personalityRating: 10,
    popularityRating: 9,
    businessRelevanceRating: 10,
    publicAppealRating: 8,
    additionalRating: 10,
    additionalRatingLabel: 'AUTHORITY',
    description: 'A globally recognised chef and television personality whose brand combines culinary expertise, hospitality and an exceptionally distinctive personality. His authority is strongest in food and hospitality.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_18',
    celebrityNumber: 18,
    name: 'RIHANNA',
    image: createCelebrityVectorSvg('RIHANNA', '#4c1d95', '#581c87', '#c084fc', '💎', 'Music / Beauty / Fashion'),
    domain: 'Music / Beauty / Fashion / Entrepreneurship',
    price: 4000,
    personalityRating: 9,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 9,
    additionalRating: 10,
    additionalRatingLabel: 'CULTURAL INFLUENCE',
    description: 'A global music and fashion icon whose personal brand has expanded successfully into beauty, fashion and consumer businesses. She represents one of the strongest examples of celebrity influence becoming a commercial ecosystem.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_19',
    celebrityNumber: 19,
    name: 'JACK BLACK',
    image: createCelebrityVectorSvg('JACK BLACK', '#78350f', '#831843', '#fbbf24', '🎸', 'Film / Comedy / Rock'),
    domain: 'Film / Comedy / Music',
    price: 2600,
    personalityRating: 10,
    popularityRating: 9,
    businessRelevanceRating: 7,
    publicAppealRating: 10,
    additionalRating: 10,
    additionalRatingLabel: 'FUN FACTOR',
    description: 'An actor, comedian and musician whose exaggerated energy and comedic personality make him instantly recognisable. Particularly powerful for products that need entertainment, humour or mass appeal.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
  {
    id: 'cel_20',
    celebrityNumber: 20,
    name: 'ELON MUSK',
    image: createCelebrityVectorSvg('ELON MUSK', '#0f172a', '#1e293b', '#38bdf8', '🚀', 'Deep Tech / Innovation'),
    domain: 'Technology / Entrepreneurship / Innovation',
    price: 4000,
    personalityRating: 10,
    popularityRating: 10,
    businessRelevanceRating: 10,
    publicAppealRating: 6,
    additionalRating: 10,
    additionalRatingLabel: 'DISRUPTION',
    description: 'A highly prominent technology entrepreneur associated with electric vehicles, aerospace, artificial intelligence and other large-scale technology ventures. His influence is enormous, but his polarising public image makes him a high-risk celebrity choice.',
    status: 'AVAILABLE',
    isIdentityRevealed: false,
  },
];

export const INITIAL_CELEBRITIES: import('../types').CelebrityCard[] = rawCelebrities.map((c) => {
  return {
    ...c,
    price: c.price || 3000,
    imageUrl: c.imageUrl || c.image || '',
    domain: c.domain || 'Entertainment & Media',
    ratings: {
      personalityRating: c.personalityRating ?? 8.0,
      popularityRating: c.popularityRating ?? 8.0,
      businessRelevanceRating: c.businessRelevanceRating ?? 8.0,
      publicAppealRating: c.publicAppealRating ?? 8.0,
      additionalRating: c.additionalRating ?? 10.0,
      additionalRatingLabel: c.additionalRatingLabel || 'SPECIAL METRIC',
    },
  };
});

export const INITIAL_CELEBRITY_ROUND_CONFIG: import('../types').CelebrityRoundControlState = {
  roundName: 'Round 5: Celebrity Reveal & Ambassadorship',
  infoReleased: false,
  roundStatus: 'LOCKED',
  objective: 'Acquire an exclusive high-profile celebrity ambassador for your morphed brand & product using your Morph Coins.',
  rules: '1. Exactly 20 mystery celebrity cards exist in the deck.\n2. All identities are strictly masked initially; only analytical rating metrics (0–10) and card prices are visible.\n3. Each celebrity card is unique and can be claimed by ONLY ONE team.\n4. When your team is selected by the Admin Spin Wheel, you can choose and purchase any available mystery card.\n5. Once purchased, the mystery identity remains locked until officially revealed by the Admin.',
  instructions: '1. Study the statistical ratings and prices of the available mystery cards.\n2. When your team is selected by the Admin Spin Wheel, choose your desired mystery card.\n3. Confirm your purchase with your Morph Coins.\n4. The mystery card is assigned to your team and becomes unavailable to others.\n5. Await the Admin\'s live stage reveal to uncover the identity of your celebrity ambassador.',
  regulations: 'Only one celebrity card per team. Purchases are final and deducted from Morph Coins.',
  timeLimit: '30 Minutes',
  additionalInfo: 'Celebrity ratings range from 0 to 10 across key strategic categories. Admin controls the spin wheel and stage reveal.',
  selectedTeamId: null,
  selectedTeamNumber: null,
  selectedAt: null,
  spinHistory: [],
};

// =========================================================================
// ROUND 6: PR CRISIS INITIAL DATA
// =========================================================================
export const INITIAL_PR_CRISIS_CONFIG: import('../types').PrCrisisConfig = {
  roundName: 'ROUND 6: PR CRISIS',
  infoReleased: false,
  roundStatus: 'LOCKED',
  objective: 'Defuse an urgent public relations crisis threatening your morphed product and brand reputation through a calculated executive response and strategic mitigation.',
  crisisCaseText: 'BREAKING CRISIS: An investigative consumer watchdog report has gone viral alleging that a core operational component within your flagship product exhibits severe vulnerability to intermittent power fluctuations and unexpected thermal escalation during peak usage.\n\nOver 350,000 social media impressions have erupted under the trending hashtag #MorphRecall, and major national retail chains are preparing a 24-hour retail moratorium on your entire product catalog unless a transparent corrective action plan, comprehensive warranty remedy, and official executive crisis address are presented to the regulatory jury immediately.',
  deliverables: '1. Executive Crisis Response Statement & Public Address (Press Briefing Script)\n2. Immediate Corrective Action & Consumer Remedy Plan (Warranty, Over-the-air Update, or Replacement Protocol)\n3. Stakeholder & Retail Partner Reassurance Strategy\n4. Long-Term Brand Equity Protection & Trust Restoration Roadmap',
  submissionMethod: 'Present a 3-minute emergency executive briefing to the Jury Panel, followed by 2 minutes of direct inquiry. Digital slides/PDF presentation submission allowed.',
  submissionDeadline: '40 Minutes from Round Activation',
  rules: '1. TEAM SPLIT: Exactly 2 team members must focus on the PR Crisis strategy and presentation. Exactly 1 team member must participate in the MORPH MARKET investment game.\n2. Responses must maintain brand consistency with your assigned brand values and morphed product attributes.\n3. Transparent accountability and strategic ingenuity are prioritized over defensive denial.',
  additionalInstructions: 'Emphasize actionable solutions, consumer trust retention, and financial feasibility. The jury will evaluate response composure, strategic viability, and communication effectiveness.',
  attachmentUrl: '',
  attachmentName: '',
};

// =========================================================================
// ROUND 7: MORPH MARKET INITIAL DATA
// =========================================================================
export const INITIAL_MARKET_ROUND_CONFIG: import('../types').MarketRoundControlState = {
  roundName: 'ROUND 7: MORPH MARKET',
  infoReleased: false,
  roundStatus: 'LOCKED',
  tradingStatus: 'CLOSED',
  objective: 'Allocate capital into high-yield strategic market opportunities and capitalize on real-time simulated market news and volatility.',
  instructions: '1. Exactly 1 team member represents the team on the Morph Market trading terminal.\n2. 5 strategic market expansion opportunities are available with 100 starting index values.\n3. Watch for breaking market news flashes released by Admin that trigger price shifts (+% / -%).\n4. Buy or sell holdings to maximize your team\'s total Morph Coin portfolio value.',
  rules: '1. Exactly 1 designated team trader.\n2. Trading is only permitted when trading status is OPEN.\n3. All investments use available Morph Coins.\n4. Realized and unrealized gains directly affect your final leaderboard valuation.',
  regulations: 'Maximum investment per transaction subject to available liquid Morph Coins. Market news impact takes immediate effect upon admin broadcast.',
  additionalInfo: 'Coordinate closely with team members handling the concurrent PR Crisis strategy.',
};

export const INITIAL_MARKET_OPPORTUNITIES: import('../types').MarketOpportunity[] = [
  {
    id: 'opp_1',
    name: 'MARKET EXPANSION',
    description: 'Scaling physical distribution pipelines and marketing penetration into adjacent domestic consumer territories.',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE',
    changePercent: 0,
  },
  {
    id: 'opp_2',
    name: 'GLOBAL EXPANSION',
    description: 'International export channels, overseas regulatory clearance, and cross-continental freight infrastructure.',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE',
    changePercent: 0,
  },
  {
    id: 'opp_3',
    name: 'LOCAL CAPITALISATION',
    description: 'Hyper-localized regional supply chain hubs, community retailer exclusivity deals, and indigenous manufacturing.',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE',
    changePercent: 0,
  },
  {
    id: 'opp_4',
    name: 'DIGITAL GROWTH',
    description: 'Direct-to-consumer e-commerce scaling, predictive AI customer personalization, and viral digital marketing.',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE',
    changePercent: 0,
  },
  {
    id: 'opp_5',
    name: 'PRODUCT EXPANSION',
    description: 'Broadening the core product ecosystem with modular accessories, companion service subscriptions, and next-gen R&D.',
    startingValue: 100,
    currentValue: 100,
    status: 'ACTIVE',
    changePercent: 0,
  },
];

export const INITIAL_MARKET_NEWS: import('../types').MarketNews[] = [
  {
    id: 'news_1',
    headline: 'Government announces major tax incentives for global export and cross-border trade pipelines.',
    fullText: 'The Ministry of Commerce and International Trade has approved a sweeping fiscal subsidy program providing a 35% tariff waiver and streamlined customs clearance for domestic enterprises expanding into foreign export corridors.',
    affectedOpportunities: [
      {
        opportunityId: 'opp_2',
        opportunityName: 'GLOBAL EXPANSION',
        changePercent: 50,
      },
      {
        opportunityId: 'opp_1',
        opportunityName: 'MARKET EXPANSION',
        changePercent: 20,
      },
    ],
    additionalEffects: 'Global logistics costs decline significantly for active exporters.',
    status: 'DRAFT',
  },
  {
    id: 'news_2',
    headline: 'Severe supply chain congestion and semiconductor freight bottlenecks impact digital retail hardware.',
    fullText: 'A sudden disruption at major regional container terminals has triggered extended component delays, increasing short-term fulfillment overhead and dampening digital tech rollout schedules.',
    affectedOpportunities: [
      {
        opportunityId: 'opp_4',
        opportunityName: 'DIGITAL GROWTH',
        changePercent: -35,
      },
      {
        opportunityId: 'opp_3',
        opportunityName: 'LOCAL CAPITALISATION',
        changePercent: 25,
      },
    ],
    additionalEffects: 'Local supply chains gain immense competitive advantage over overseas dependencies.',
    status: 'DRAFT',
  },
  {
    id: 'news_3',
    headline: 'Major national retail consortium prioritizes domestic indigenous manufacturing and local producers.',
    fullText: 'In response to fluctuating currency exchange rates, the nationwide Retail Alliance has committed 60% of prime shelf real estate exclusively to locally manufactured products.',
    affectedOpportunities: [
      {
        opportunityId: 'opp_3',
        opportunityName: 'LOCAL CAPITALISATION',
        changePercent: 40,
      },
      {
        opportunityId: 'opp_5',
        opportunityName: 'PRODUCT EXPANSION',
        changePercent: 15,
      },
    ],
    additionalEffects: 'Regional brand loyalty index reaches all-time high.',
    status: 'DRAFT',
  },
];

// =========================================================================
// UNIVERSAL JUDGING INITIAL DATA (PR CRISIS & FINAL GROWTH EXPANSION)
// =========================================================================
export const INITIAL_PR_CRISIS_CRITERIA: import('../types').JudgingCriterion[] = [
  {
    id: 'crit_pr_1',
    name: 'Creativity',
    description: 'Originality of the crisis response and innovative mitigation mechanics.',
    weightage: 20,
    order: 1,
  },
  {
    id: 'crit_pr_2',
    name: 'Crisis Understanding',
    description: 'Depth of situational diagnosis, root cause clarity, and stakeholder risk assessment.',
    weightage: 25,
    order: 2,
  },
  {
    id: 'crit_pr_3',
    name: 'Brand Alignment',
    description: 'Consistency with established brand identity, values, and product positioning.',
    weightage: 20,
    order: 3,
  },
  {
    id: 'crit_pr_4',
    name: 'Celebrity Integration',
    description: 'Strategic deployment and authentic alignment of acquired celebrity ambassador in crisis management.',
    weightage: 15,
    order: 4,
  },
  {
    id: 'crit_pr_5',
    name: 'Communication & Execution',
    description: 'Executive poise, public address clarity, press delivery, and stakeholder reassurance.',
    weightage: 20,
    order: 5,
  },
];

// =========================================================================
// ROUND 8: FINAL GROWTH EXPANSION INITIAL DATA
// =========================================================================
export const INITIAL_FINAL_GROWTH_CONFIG: import('../types').FinalGrowthConfig = {
  roundName: 'ROUND 8: FINAL GROWTH EXPANSION',
  infoReleased: false,
  roundStatus: 'LOCKED',
  objective: 'Pitch a comprehensive, 3-to-5 year future growth expansion masterplan to the Executive Boardroom, consolidating your brand equity, product innovation, celebrity ambassadorship, and market capitalization.',
  caseStudyText: `THE MORPH ENTERPRISE EXPANSION MANDATE

EXECUTIVE BRIEFING & INDUSTRY LANDSCAPE:
Over the past operational cycles, your morphed enterprise has successfully secured a foundational brand identity, patented a distinctive morphed product concept, activated tactical strategic assets, endured sudden market volatility, and neutralized high-stakes public relations crises. 

Now, the enterprise faces its defining moment: The Grand Executive Boardroom Presentation for Global Capital Expansion.

THE STRATEGIC CHALLENGE:
Global conglomerate consortia and institutional venture syndicates are allocating a major strategic capital tranche of ₹500 Crores to the single most compelling, scalable, and defensible growth expansion enterprise. 

To win this allocation, your leadership team must present a comprehensive, multi-phase Future Growth Expansion Blueprint addressing four critical pillars:

1. MARKET EXPANSION & HORIZONTAL/VERTICAL SCALING:
Define the next frontier of growth. How will you expand beyond initial early adopters? Will you pursue international cross-border expansion, enter mass-tier domestic tiers, or establish high-margin enterprise B2B channels? Detail the supply chain and logistical infrastructure required to support 10x volume scaling.

2. ECOSYSTEM & PRODUCT LINE BROADENING:
How does your core morphed product evolve over years 2 through 5? Introduce your companion product roadmap, recurring digital service layer, or modular ecosystem enhancements that maximize Customer Lifetime Value (LTV) and defensibility.

3. BRAND, CELEBRITY & MEDIA SYNERGY:
How will your brand leverage its acquired celebrity ambassador and cultural footprint to create an insurmountable competitive moat against legacy competitors and emerging counterfeiters? Detail your omnichannel consumer acquisition and viral storytelling strategy.

4. UNIT ECONOMICS, CAPITAL EFFICIENCY & FINANCIAL SUSTAINABILITY:
Provide plausible unit economics, pricing tiering, gross margin trajectories, and capital allocation efficiency. How will you deploy your Morph Coins balance and project ROI for institutional investors?

BOARDROOM PRESENTATION FORMAT:
Each leadership team will deliver a 5-minute definitive boardroom pitch to the Governing Board, followed by 3 minutes of rigorous executive Q&A cross-examination. All team members must participate actively.`,
  deliverables: '1. Executive Growth Expansion Blueprint & Strategic Masterplan (Slides / PDF)\n2. 5-Year Scaling Roadmap (Market, Product Ecosystem & Geographic Expansion)\n3. Celebrity Ambassador Integration & Cultural Moat Strategy\n4. Financial Projections, Unit Economics & Capital Allocation Model\n5. Live 5-Minute Boardroom Presentation & Executive Q&A Defense',
  rules: '1. ALL team members must participate in the final boardroom presentation.\n2. Pitches are strictly timed to 5 minutes maximum + 3 minutes Q&A.\n3. The strategy must maintain consistency with your established brand, morphed product, and acquired celebrity.\n4. Admin/Jury will evaluate each team against the Universal Judging Rubric.\n5. Scores will be calculated automatically into Morph Coins (Score × 100) and added to your final balance.',
  timeLimit: '45 Minutes Preparation // 5-Minute Boardroom Pitch per Team',
  submissionMethod: 'Present live in the Executive Boardroom before the Jury Panel. Digital slide deck / PDF presentation submitted directly to the Admin console.',
  additionalInstructions: 'Focus on strategic clarity, defensible unit economics, and visionary ambition. Ensure seamless transitions between team speakers during the presentation.',
  attachmentUrl: '',
  attachmentName: '',
};

export const INITIAL_FINAL_GROWTH_CRITERIA: import('../types').JudgingCriterion[] = [
  {
    id: 'crit_fg_1',
    name: 'Strategic Thinking',
    description: 'Visionary clarity, defensible market entry strategy, and strategic roadmap coherence.',
    weightage: 20,
    order: 1,
  },
  {
    id: 'crit_fg_2',
    name: 'Growth Potential',
    description: 'Scalability of model, addressable market size, and customer acquisition velocity.',
    weightage: 25,
    order: 2,
  },
  {
    id: 'crit_fg_3',
    name: 'Financial Understanding',
    description: 'Plausibility of unit economics, margin resilience, and capital allocation efficiency.',
    weightage: 20,
    order: 3,
  },
  {
    id: 'crit_fg_4',
    name: 'Brand & Celebrity Alignment',
    description: 'Synergistic utilization of core brand equity, morphed product, and celebrity endorsement.',
    weightage: 15,
    order: 4,
  },
  {
    id: 'crit_fg_5',
    name: 'Innovation & Moat',
    description: 'Uniqueness of value proposition, competitive barriers to entry, and disruptive edge.',
    weightage: 10,
    order: 5,
  },
  {
    id: 'crit_fg_6',
    name: 'Boardroom Presentation',
    description: 'Executive poise, presentation structuring, time management, and Q&A defense agility.',
    weightage: 10,
    order: 6,
  },
];