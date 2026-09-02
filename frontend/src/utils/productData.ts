import { Product } from '../types';

export function makeProductSvg(
  bgGradStart: string,
  bgGradEnd: string,
  accentColor: string,
  svgIllustrationContent: string
): string {
  const rawSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
    <defs>
      <linearGradient id="bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}"/>
        <stop offset="100%" stop-color="${bgGradEnd}"/>
      </linearGradient>
      <linearGradient id="shine_grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <filter id="card_shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <rect width="300" height="300" rx="28" fill="url(#bg_grad)"/>
    <circle cx="150" cy="145" r="95" fill="${accentColor}" fill-opacity="0.08"/>
    <circle cx="150" cy="145" r="70" fill="#000000" fill-opacity="0.2"/>
    <g filter="url(#card_shadow)">
      ${svgIllustrationContent}
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvg)}`;
}

export const FINAL_20_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'UNDERWEAR',
    category: 'Fashion / Apparel',
    image: makeProductSvg('#18181b', '#09090b', '#a855f7', `
      <g transform="translate(150, 145)">
        <!-- Folded Boxer Briefs Silhouette -->
        <path d="M -58,-38 L 58,-38 L 54,26 L 24,36 L 0,16 L -24,36 L -54,26 Z" fill="#27272a" stroke="#52525b" stroke-width="2.5"/>
        <!-- Waistband with Stitching -->
        <path d="M -58,-38 L 58,-38 L 56,-20 L -56,-20 Z" fill="#3f3f46" stroke="#71717a" stroke-width="1.5"/>
        <line x1="-54" y1="-29" x2="54" y2="-29" stroke="#a1a1aa" stroke-width="1.5" stroke-dasharray="4,2"/>
        <!-- Fabric Fold Shadow & Seams -->
        <path d="M -16,-20 C -16,5 -22,20 -38,32" stroke="#71717a" stroke-width="1.5" fill="none"/>
        <path d="M 16,-20 C 16,5 22,20 38,32" stroke="#71717a" stroke-width="1.5" fill="none"/>
        <path d="M 0,-20 L 0,16" stroke="#52525b" stroke-width="1.5"/>
        <!-- Soft highlight -->
        <path d="M -45,-15 L 45,-15 L 40,0 L -40,0 Z" fill="url(#shine_grad)"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A completely ordinary pair of underwear. Its simplicity is intentional — teams must figure out how their brand could credibly enter this category.',
    status: 'AVAILABLE',
  },
  {
    id: 'p2',
    name: 'INSTANT NOODLES',
    category: 'Food / FMCG',
    image: makeProductSvg('#450a0a', '#09090b', '#ef4444', `
      <g transform="translate(150, 145)">
        <!-- Steam Curls -->
        <path d="M -12,-65 Q -6,-78 -12,-90" stroke="#fee2e2" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
        <path d="M 8,-60 Q 14,-72 8,-85" stroke="#fee2e2" stroke-width="2" fill="none" opacity="0.6" stroke-linecap="round"/>
        <!-- Chopsticks -->
        <line x1="48" y1="-80" x2="-22" y2="-28" stroke="#d97706" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="52" y1="-88" x2="-18" y2="-34" stroke="#b45309" stroke-width="4.5" stroke-linecap="round"/>
        <!-- Curly Noodle Strands -->
        <path d="M -22,-26 Q -8,-40 8,-26 Q 22,-12 36,-26" stroke="#fbbf24" stroke-width="3.5" fill="none"/>
        <path d="M -16,-20 Q 0,-34 16,-20 Q 30,-6 42,-20" stroke="#fde047" stroke-width="3.5" fill="none"/>
        <!-- Cup Body -->
        <path d="M -46,-22 L 46,-22 L 32,48 L -32,48 Z" fill="#dc2626" stroke="#f87171" stroke-width="2"/>
        <ellipse cx="0" cy="-22" rx="46" ry="10" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
        <ellipse cx="0" cy="-22" rx="40" ry="7" fill="#fbbf24"/>
        <!-- Label Band -->
        <rect x="-28" y="0" width="56" height="24" rx="4" fill="#ffffff" opacity="0.95"/>
        <line x1="-20" y1="8" x2="20" y2="8" stroke="#dc2626" stroke-width="3"/>
        <line x1="-15" y1="16" x2="15" y2="16" stroke="#ea580c" stroke-width="2"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A packaged ready-to-eat noodle product that can be positioned around convenience, flavour, culture, affordability or premiumisation.',
    status: 'AVAILABLE',
  },
  {
    id: 'p3',
    name: 'PICKLE JAR',
    category: 'Food / FMCG',
    image: makeProductSvg('#362503', '#09090b', '#eab308', `
      <g transform="translate(150, 145)">
        <!-- Traditional Glass Jar Body -->
        <rect x="-44" y="-35" width="88" height="90" rx="16" fill="#ca8a04" fill-opacity="0.3" stroke="#fef08a" stroke-width="2"/>
        <rect x="-40" y="-30" width="80" height="80" rx="12" fill="#854d0e" fill-opacity="0.85"/>
        <!-- Mustard / Oil Spice Gradient Base -->
        <ellipse cx="0" cy="40" rx="35" ry="8" fill="#713f12"/>
        <!-- Pickled Mango / Lime Chunks & Chili -->
        <circle cx="-18" cy="-5" r="13" fill="#a16207" stroke="#eab308" stroke-width="1.5"/>
        <circle cx="16" cy="5" r="14" fill="#ca8a04" stroke="#facc15" stroke-width="1.5"/>
        <circle cx="-6" cy="20" r="12" fill="#a16207" stroke="#eab308" stroke-width="1.5"/>
        <!-- Red Chili in oil -->
        <path d="M 12,-15 Q 22,-5 18,15" stroke="#ef4444" stroke-width="4" fill="none" stroke-linecap="round"/>
        <!-- Glass Jar Highlights -->
        <path d="M -36,-25 L -36,40" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
        <!-- Golden Metal Screw Lid -->
        <rect x="-48" y="-52" width="96" height="18" rx="5" fill="#eab308" stroke="#fef08a" stroke-width="2"/>
        <line x1="-42" y1="-43" x2="42" y2="-43" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Yellow Cotton Cloth Cover string tie -->
        <path d="M -50,-40 Q 0,-34 50,-40" stroke="#dc2626" stroke-width="2" fill="none"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A jar of pickles — familiar, nostalgic and highly adaptable across regional flavours, premium food, gifting and everyday consumption.',
    status: 'AVAILABLE',
  },
  {
    id: 'p4',
    name: 'SOCKS',
    category: 'Fashion / Apparel',
    image: makeProductSvg('#1e1b4b', '#09090b', '#6366f1', `
      <g transform="translate(150, 145)">
        <!-- Pair of Folded Ribbed Crew Socks -->
        <!-- Back Sock -->
        <path d="M -10,-55 L 20,-55 L 20,-10 C 20,15 32,25 45,35 L 28,52 C 10,40 -2,22 -2,-5 Z" fill="#3730a3" stroke="#818cf8" stroke-width="2"/>
        <!-- Front Sock -->
        <path d="M -30,-48 L 0,-48 L 0,-5 C 0,20 12,30 25,40 L 8,57 C -10,45 -22,27 -22,0 Z" fill="#4f46e5" stroke="#a5b4fc" stroke-width="2.5"/>
        <!-- Ribbed Cuff Stripes -->
        <line x1="-28" y1="-42" x2="-2" y2="-42" stroke="#facc15" stroke-width="2"/>
        <line x1="-28" y1="-36" x2="-2" y2="-36" stroke="#ffffff" stroke-width="2"/>
        <line x1="-28" y1="-30" x2="-2" y2="-30" stroke="#facc15" stroke-width="2"/>
        <!-- Heel and Toe Contrast Patches -->
        <path d="M -22,-3 C -20,14 -12,18 -2,12" stroke="#f43f5e" stroke-width="3" fill="none"/>
        <ellipse cx="16" cy="48" rx="8" ry="6" fill="#f43f5e"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A basic pair of socks that can move between fashion, sport, comfort, lifestyle and functional design.',
    status: 'AVAILABLE',
  },
  {
    id: 'p5',
    name: 'TOILET PAPER',
    category: 'Household / FMCG',
    image: makeProductSvg('#0f172a', '#09090b', '#38bdf8', `
      <g transform="translate(150, 145)">
        <!-- Lower Roll Body -->
        <rect x="-38" y="-10" width="76" height="55" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <ellipse cx="0" cy="45" rx="38" ry="12" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Top Oval Surface -->
        <ellipse cx="0" cy="-10" rx="38" ry="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Inner Cardboard Core Tube -->
        <ellipse cx="0" cy="-10" rx="12" ry="5" fill="#78350f" stroke="#a16207" stroke-width="1.5"/>
        <ellipse cx="0" cy="-10" rx="9" ry="3.5" fill="#451a03"/>
        <!-- Hanging Sheet of Paper -->
        <path d="M 38,-10 L 38,35 C 38,55 52,65 52,65 L 30,55" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Embossed Pattern Lines -->
        <line x1="-25" y1="10" x2="25" y2="10" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="-25" y1="26" x2="25" y2="26" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="3,3"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'An extremely ordinary household essential. The challenge is figuring out why a particular brand would want to own this category.',
    status: 'AVAILABLE',
  },
  {
    id: 'p6',
    name: 'CHOCOLATE BAR',
    category: 'Food / FMCG',
    image: makeProductSvg('#3b1704', '#09090b', '#d97706', `
      <g transform="translate(150, 145)">
        <!-- Chocolate Block Body -->
        <rect x="-46" y="-50" width="92" height="100" rx="8" fill="#451a03" stroke="#78350f" stroke-width="2"/>
        <!-- 3D Chocolate Squares Grid -->
        <rect x="-40" y="-44" width="36" height="26" rx="3" fill="#58240c" stroke="#78350f" stroke-width="1"/>
        <rect x="4" y="-44" width="36" height="26" rx="3" fill="#58240c" stroke="#78350f" stroke-width="1"/>
        <rect x="-40" y="-12" width="36" height="26" rx="3" fill="#58240c" stroke="#78350f" stroke-width="1"/>
        <rect x="4" y="-12" width="36" height="26" rx="3" fill="#58240c" stroke="#78350f" stroke-width="1"/>
        <!-- Golden Foil Wrapper partially peeled -->
        <polygon points="-50,-10 50,5 50,56 -50,56" fill="#eab308" stroke="#fef08a" stroke-width="1.5"/>
        <polygon points="-50,-10 0,5 -20,15" fill="#ca8a04"/>
        <!-- Outer Matte Red/Purple Outer Sleeve -->
        <rect x="-50" y="15" width="100" height="42" rx="4" fill="#dc2626" stroke="#ef4444" stroke-width="1.5"/>
        <line x1="-35" y1="36" x2="35" y2="36" stroke="#fbbf24" stroke-width="2"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A familiar chocolate product that can be repositioned around indulgence, gifting, nostalgia, health, luxury or mass consumption.',
    status: 'AVAILABLE',
  },
  {
    id: 'p7',
    name: 'EGGS',
    category: 'Food / FMCG',
    image: makeProductSvg('#2e1c0c', '#09090b', '#f59e0b', `
      <g transform="translate(150, 145)">
        <!-- Cardboard Egg Carton Bottom -->
        <rect x="-56" y="5" width="112" height="40" rx="8" fill="#78716c" stroke="#a8a29e" stroke-width="2"/>
        <!-- Carton Divider Ridges -->
        <path d="M -56,5 Q -38,15 -20,5 Q 0,15 20,5 Q 38,15 56,5" stroke="#57534e" stroke-width="2" fill="none"/>
        <!-- 4 Farm Fresh Eggs in Carton -->
        <!-- Egg 1 -->
        <ellipse cx="-38" cy="-8" rx="14" ry="18" fill="#fed7aa" stroke="#fb923c" stroke-width="1.5"/>
        <!-- Egg 2 -->
        <ellipse cx="-13" cy="-12" rx="14" ry="19" fill="#ffedd5" stroke="#fdba74" stroke-width="1.5"/>
        <!-- Egg 3 -->
        <ellipse cx="13" cy="-10" rx="14" ry="18" fill="#fed7aa" stroke="#fb923c" stroke-width="1.5"/>
        <!-- Egg 4 -->
        <ellipse cx="38" cy="-6" rx="14" ry="17" fill="#ffedd5" stroke="#fdba74" stroke-width="1.5"/>
        <!-- Egg Highlights -->
        <ellipse cx="-16" cy="-16" rx="3" ry="5" fill="#ffffff" opacity="0.6"/>
        <ellipse cx="10" cy="-14" rx="3" ry="5" fill="#ffffff" opacity="0.6"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A carton of everyday eggs. No gimmicks — teams have to discover the business opportunity hidden inside an incredibly ordinary product.',
    status: 'AVAILABLE',
  },
  {
    id: 'p8',
    name: 'ICE CUBES',
    category: 'Food / Beverage / Household',
    image: makeProductSvg('#082f49', '#09090b', '#38bdf8', `
      <g transform="translate(150, 145)">
        <!-- Large Front Isometric Ice Cube -->
        <!-- Top Face -->
        <polygon points="0,-45 35,-25 0,-5 -35,-25" fill="#bae6fd" stroke="#e0f2fe" stroke-width="2"/>
        <!-- Left Face -->
        <polygon points="-35,-25 0,-5 0,35 -35,15" fill="#7dd3fc" stroke="#e0f2fe" stroke-width="2"/>
        <!-- Right Face -->
        <polygon points="0,-5 35,-25 35,15 0,35" fill="#38bdf8" stroke="#e0f2fe" stroke-width="2"/>
        <!-- Transparent Refraction Highlights & Bubbles inside ice -->
        <circle cx="-12" cy="5" r="3" fill="#ffffff" opacity="0.8"/>
        <circle cx="14" cy="10" r="4" fill="#ffffff" opacity="0.8"/>
        <line x1="-20" y1="-15" x2="-8" y2="15" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/>
        <!-- Secondary Smaller Ice Cube behind -->
        <polygon points="25,-60 50,-45 25,-30 0,-45" fill="#e0f2fe" opacity="0.8"/>
        <polygon points="0,-45 25,-30 25,-5 0,-20" fill="#bae6fd" opacity="0.8"/>
        <polygon points="25,-30 50,-45 50,-20 25,-5" fill="#7dd3fc" opacity="0.8"/>
        <!-- Condensation Droplets -->
        <circle cx="-42" cy="20" r="2.5" fill="#38bdf8"/>
        <circle cx="42" cy="24" r="3" fill="#38bdf8"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'Packaged ice cubes designed for drinks, events, hospitality, travel or everyday use.',
    status: 'AVAILABLE',
  },
  {
    id: 'p9',
    name: 'BUTTER',
    category: 'Food / FMCG',
    image: makeProductSvg('#422006', '#09090b', '#facc15', `
      <g transform="translate(150, 145)">
        <!-- Ceramic Butter Dish Base -->
        <ellipse cx="0" cy="38" rx="60" ry="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Golden Block of Butter (Isometric block) -->
        <polygon points="-40,-10 0,-30 40,-10 0,10" fill="#fde047" stroke="#facc15" stroke-width="1.5"/>
        <polygon points="-40,-10 0,10 0,34 -40,14" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
        <polygon points="0,10 40,-10 40,14 0,34" fill="#ca8a04" stroke="#a16207" stroke-width="1.5"/>
        <!-- Delicate Butter Curl / Shaving on top -->
        <path d="M -8,-18 C 0,-32 16,-28 10,-12 C 6,-4 0,-10 -6,-16" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
        <!-- Soft Golden Glow Highlight -->
        <line x1="-28" y1="-5" x2="-6" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A conventional tub or block of butter that can be positioned around cooking, indulgence, nutrition, premium food or convenience.',
    status: 'AVAILABLE',
  },
  {
    id: 'p10',
    name: 'SUNSCREEN',
    category: 'Beauty / Personal Care',
    image: makeProductSvg('#0c4a6e', '#09090b', '#f59e0b', `
      <g transform="translate(150, 145)">
        <!-- Sleek Skincare Squeeze Tube -->
        <path d="M -30,-45 L 30,-45 L 24,25 C 20,38 12,42 0,42 C -12,42 -20,38 -24,25 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <!-- Heat-sealed Top Ridge -->
        <rect x="-32" y="-54" width="64" height="9" rx="2" fill="#0369a1" stroke="#38bdf8" stroke-width="1.5"/>
        <!-- Flip Top Cap -->
        <rect x="-16" y="42" width="32" height="16" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Sun Shield Badge -->
        <circle cx="0" cy="-5" r="15" fill="#f59e0b" stroke="#fde047" stroke-width="1.5"/>
        <path d="M 0,-14 L 0,4 M -9,-5 L 9,-5 M -6,-11 L 6,1 M -6,1 L 6,-11" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <!-- SPF 50+ Text indicator -->
        <text x="0" y="24" font-family="system-ui, sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle" letter-spacing="1">SPF 50+</text>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A consumer skincare product designed to protect skin from UV exposure, with opportunities around beauty, sport, travel and everyday lifestyle.',
    status: 'AVAILABLE',
  },
  {
    id: 'p11',
    name: 'ELECTRIC TOOTHBRUSH',
    category: 'Consumer Electronics / Personal Care',
    image: makeProductSvg('#042f2e', '#09090b', '#2dd4bf', `
      <g transform="translate(150, 145)">
        <!-- Charging Dock Base -->
        <ellipse cx="0" cy="50" rx="35" ry="10" fill="#0f172a" stroke="#14b8a6" stroke-width="2"/>
        <ellipse cx="0" cy="48" rx="28" ry="6" fill="#134e4a"/>
        <!-- Toothbrush Handle Body -->
        <rect x="-14" y="-20" width="28" height="70" rx="8" fill="#115e59" stroke="#5eead4" stroke-width="2"/>
        <!-- Power Button with LED ring -->
        <circle cx="0" cy="5" r="5" fill="#0f766e" stroke="#2dd4bf" stroke-width="1.5"/>
        <circle cx="0" cy="5" r="2.5" fill="#99f6e4"/>
        <!-- Metal Drive Shaft -->
        <rect x="-4" y="-38" width="8" height="18" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
        <!-- Replaceable Brush Head -->
        <path d="M -6,-38 L 6,-38 L 4,-65 C 4,-72 -4,-72 -4,-65 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <!-- Bristles Clusters -->
        <rect x="4" y="-72" width="10" height="16" rx="2" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A powered toothbrush combining everyday oral care with convenience, technology and potentially smart features.',
    status: 'AVAILABLE',
  },
  {
    id: 'p12',
    name: 'SLIPPERS',
    category: 'Fashion / Lifestyle',
    image: makeProductSvg('#311042', '#09090b', '#c084fc', `
      <g transform="translate(150, 145)">
        <!-- Pair of Plush Indoor Slide Slippers -->
        <!-- Left Slipper (Angled) -->
        <g transform="translate(-20, 0) rotate(-10)">
          <!-- Thick Cushioned Sole -->
          <ellipse cx="0" cy="15" rx="24" ry="42" fill="#4c1d95" stroke="#a855f7" stroke-width="2"/>
          <ellipse cx="0" cy="12" rx="21" ry="38" fill="#581c87"/>
          <!-- Cozy Padded Upper Band -->
          <path d="M -22,-10 C -22,-35 22,-35 22,-10 C 22,2 -22,2 -22,-10 Z" fill="#7e22ce" stroke="#d8b4fe" stroke-width="2"/>
          <path d="M -15,-18 Q 0,-30 15,-18" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.6"/>
        </g>
        <!-- Right Slipper (Angled) -->
        <g transform="translate(25, 10) rotate(12)">
          <ellipse cx="0" cy="15" rx="24" ry="42" fill="#4c1d95" stroke="#a855f7" stroke-width="2"/>
          <ellipse cx="0" cy="12" rx="21" ry="38" fill="#581c87"/>
          <path d="M -22,-10 C -22,-35 22,-35 22,-10 C 22,2 -22,2 -22,-10 Z" fill="#7e22ce" stroke="#d8b4fe" stroke-width="2"/>
          <path d="M -15,-18 Q 0,-30 15,-18" stroke="#f5d0fe" stroke-width="2" fill="none" opacity="0.6"/>
        </g>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'Comfortable everyday footwear primarily associated with home, relaxation and casual use.',
    status: 'AVAILABLE',
  },
  {
    id: 'p13',
    name: 'DISH SOAP',
    category: 'Household / FMCG',
    image: makeProductSvg('#064e3b', '#09090b', '#10b981', `
      <g transform="translate(150, 145)">
        <!-- Translucent Liquid Soap Bottle -->
        <path d="M -24,-30 C -24,-30 -35,-10 -35,25 C -35,45 -20,52 0,52 C 20,52 35,45 35,25 C 35,-10 24,-30 24,-30 Z" fill="#047857" stroke="#34d399" stroke-width="2"/>
        <!-- Clear Liquid Level inside -->
        <path d="M -30,0 C -20,6 20,-4 30,2 L 32,25 C 32,42 18,48 0,48 C -18,48 -32,42 -32,25 Z" fill="#10b981" opacity="0.8"/>
        <!-- Push-Pull Dispenser Cap -->
        <rect x="-12" y="-45" width="24" height="15" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
        <rect x="-6" y="-55" width="12" height="10" rx="2" fill="#ef4444" stroke="#f87171" stroke-width="1"/>
        <!-- Soap Bubbles -->
        <circle cx="38" cy="-20" r="10" fill="#6ee7b7" fill-opacity="0.3" stroke="#a7f3d0" stroke-width="1.5"/>
        <circle cx="48" cy="-38" r="6" fill="#6ee7b7" fill-opacity="0.3" stroke="#a7f3d0" stroke-width="1.5"/>
        <circle cx="-38" cy="-10" r="8" fill="#6ee7b7" fill-opacity="0.3" stroke="#a7f3d0" stroke-width="1.5"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A basic household cleaning product used to wash dishes and kitchenware.',
    status: 'AVAILABLE',
  },
  {
    id: 'p14',
    name: 'ELECTRIC MOSQUITO RACKET',
    category: 'Household / Electronics',
    image: makeProductSvg('#042f2e', '#09090b', '#2dd4bf', `
      <g transform="translate(150, 140)">
        <!-- Oval Racket Head Frame -->
        <ellipse cx="0" cy="-30" rx="42" ry="50" fill="#0f766e" stroke="#2dd4bf" stroke-width="3"/>
        <!-- Electric Mesh Wire Grid -->
        <ellipse cx="0" cy="-30" rx="35" ry="42" fill="#134e4a" stroke="#5eead4" stroke-width="1"/>
        <line x1="-28" y1="-30" x2="28" y2="-30" stroke="#99f6e4" stroke-width="1" opacity="0.6"/>
        <line x1="-22" y1="-50" x2="22" y2="-50" stroke="#99f6e4" stroke-width="1" opacity="0.6"/>
        <line x1="-22" y1="-10" x2="22" y2="-10" stroke="#99f6e4" stroke-width="1" opacity="0.6"/>
        <line x1="0" y1="-65" x2="0" y2="5" stroke="#99f6e4" stroke-width="1" opacity="0.6"/>
        <!-- Electric Spark Zap -->
        <path d="M -6,-40 L 4,-30 L -2,-25 L 8,-15" stroke="#fde047" stroke-width="2.5" fill="none"/>
        <!-- Sturdy Handle -->
        <rect x="-8" y="20" width="16" height="55" rx="5" fill="#115e59" stroke="#2dd4bf" stroke-width="1.5"/>
        <circle cx="0" cy="42" r="3" fill="#f43f5e"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A handheld electric device designed to eliminate mosquitoes. Extremely specific, highly practical and deliberately unusual.',
    status: 'AVAILABLE',
  },
  {
    id: 'p15',
    name: 'THERMOS / FLASK',
    category: 'Lifestyle / Kitchen / Travel',
    image: makeProductSvg('#1e293b', '#09090b', '#38bdf8', `
      <g transform="translate(150, 145)">
        <!-- Insulated Vacuum Flask Body -->
        <rect x="-26" y="-42" width="52" height="96" rx="12" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
        <!-- Stainless Steel Metallic Finish Stripe -->
        <rect x="-26" y="-10" width="52" height="25" fill="#475569"/>
        <line x1="-20" y1="-42" x2="-20" y2="54" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
        <!-- Screw Insulated Cap with carry loop -->
        <rect x="-22" y="-62" width="44" height="20" rx="4" fill="#0f172a" stroke="#cbd5e1" stroke-width="1.5"/>
        <path d="M 0,-62 C 16,-62 16,-76 0,-76 C -16,-76 -16,-62 0,-62 Z" fill="none" stroke="#f59e0b" stroke-width="3"/>
        <!-- Temperature indicator ring -->
        <circle cx="0" cy="-52" r="4" fill="#38bdf8"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'An insulated bottle designed to maintain the temperature of hot or cold drinks.',
    status: 'AVAILABLE',
  },
  {
    id: 'p16',
    name: 'FRENCH-FRIED ONIONS',
    category: 'Food / FMCG / Snacks',
    image: makeProductSvg('#451a03', '#09090b', '#f59e0b', `
      <g transform="translate(150, 145)">
        <!-- Snack Container/Pouch -->
        <path d="M -42,-15 L 42,-15 L 34,48 L -34,48 Z" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
        <ellipse cx="0" cy="-15" rx="42" ry="10" fill="#92400e" stroke="#f59e0b" stroke-width="1.5"/>
        <!-- Heap of Golden Crispy Crisps -->
        <!-- Crispy Strip 1 -->
        <path d="M -25,-25 Q -10,-45 5,-30" stroke="#fde047" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Crispy Strip 2 -->
        <path d="M -10,-32 Q 10,-50 25,-35" stroke="#facc15" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Crispy Strip 3 -->
        <path d="M -30,-15 Q -15,-30 0,-18" stroke="#eab308" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <!-- Crispy Ring Loop -->
        <ellipse cx="14" cy="-24" rx="10" ry="6" fill="none" stroke="#fde047" stroke-width="3.5"/>
        <!-- Salt & Herb seasoning specks -->
        <circle cx="-12" cy="-20" r="1.5" fill="#ffffff"/>
        <circle cx="18" cy="-28" r="1.5" fill="#16a34a"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'Crispy packaged fried onions used as a topping, ingredient, snack or flavour enhancer.',
    status: 'AVAILABLE',
  },
  {
    id: 'p17',
    name: 'BISCUIT TIN',
    category: 'Food / Gifting / FMCG',
    image: makeProductSvg('#1e1b4b', '#09090b', '#fbbf24', `
      <g transform="translate(150, 145)">
        <!-- Royal Blue Embossed Metal Tin -->
        <rect x="-46" y="-10" width="92" height="55" rx="8" fill="#1e3a8a" stroke="#fbbf24" stroke-width="2"/>
        <!-- Embossed Gold Filigree on Tin -->
        <rect x="-38" y="-2" width="76" height="38" rx="4" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,2"/>
        <!-- Tin Lid (Tilted/Open) -->
        <ellipse cx="0" cy="-10" rx="46" ry="12" fill="#1e40af" stroke="#fbbf24" stroke-width="2"/>
        <ellipse cx="0" cy="-12" rx="38" ry="9" fill="#2563eb"/>
        <!-- Golden Butter Biscuits inside tin -->
        <circle cx="-18" cy="-22" r="12" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
        <circle cx="-18" cy="-22" r="2" fill="#854d0e"/>
        <!-- Pretzel/Swirl Biscuit -->
        <circle cx="16" cy="-20" r="13" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
        <path d="M 10,-20 Q 16,-26 22,-20" stroke="#854d0e" stroke-width="1.5" fill="none"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A traditional tin containing biscuits, with possibilities around gifting, nostalgia, premiumisation and collectability.',
    status: 'AVAILABLE',
  },
  {
    id: 'p18',
    name: 'ICE CREAM TUB',
    category: 'Food / FMCG',
    image: makeProductSvg('#4c0519', '#09090b', '#f43f5e', `
      <g transform="translate(150, 145)">
        <!-- Ice Cream Tub Body -->
        <path d="M -42,-15 L 42,-15 L 34,48 L -34,48 Z" fill="#e11d48" stroke="#fb7185" stroke-width="2"/>
        <!-- Tub Rim -->
        <ellipse cx="0" cy="-15" rx="42" ry="9" fill="#ffe4e6" stroke="#f43f5e" stroke-width="1.5"/>
        <!-- Swirl Scoop of Ice Cream -->
        <ellipse cx="0" cy="-22" rx="36" ry="18" fill="#fda4af" stroke="#f43f5e" stroke-width="1.5"/>
        <circle cx="-12" cy="-30" r="14" fill="#fbcfe8"/>
        <circle cx="12" cy="-32" r="15" fill="#fecdd3"/>
        <circle cx="0" cy="-38" r="13" fill="#ffe4e6"/>
        <!-- Strawberry Sauce Drizzle -->
        <path d="M -18,-25 Q -8,-15 -14,-5" stroke="#9f1239" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M 6,-30 Q 14,-15 8,-2" stroke="#9f1239" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A conventional tub of ice cream designed for sharing or individual consumption.',
    status: 'AVAILABLE',
  },
  {
    id: 'p19',
    name: 'DISH SPONGE',
    category: 'Household / Cleaning',
    image: makeProductSvg('#14532d', '#09090b', '#eab308', `
      <g transform="translate(150, 145)">
        <!-- Top Green Abrasive Scourer Pad (Isometric) -->
        <polygon points="-46,-20 0,-40 46,-20 0,0" fill="#15803d" stroke="#22c55e" stroke-width="1.5"/>
        <polygon points="-46,-20 0,0 0,10 -46,-10" fill="#166534" stroke="#22c55e" stroke-width="1"/>
        <polygon points="0,0 46,-20 46,-10 0,10" fill="#14532d" stroke="#22c55e" stroke-width="1"/>
        <!-- Bottom Thick Yellow Cellulose Sponge Base -->
        <polygon points="-46,-10 0,10 0,35 -46,15" fill="#facc15" stroke="#eab308" stroke-width="1.5"/>
        <polygon points="0,10 46,-10 46,15 0,35" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
        <!-- Sponge Porous Texture Pits -->
        <circle cx="-25" cy="5" r="2.5" fill="#ca8a04"/>
        <circle cx="-12" cy="18" r="3" fill="#ca8a04"/>
        <circle cx="20" cy="10" r="3" fill="#a16207"/>
        <circle cx="28" cy="22" r="2" fill="#a16207"/>
        <!-- Sudsy Soap Bubbles on edge -->
        <circle cx="-42" cy="-25" r="6" fill="#ffffff" opacity="0.7"/>
        <circle cx="-48" cy="-18" r="4" fill="#ffffff" opacity="0.7"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A basic kitchen sponge used for washing dishes and cleaning surfaces.',
    status: 'AVAILABLE',
  },
  {
    id: 'p20',
    name: 'PLASTIC CHAIR',
    category: 'Furniture / Home',
    image: makeProductSvg('#1e1b4b', '#09090b', '#38bdf8', `
      <g transform="translate(150, 145)">
        <!-- Iconic Monobloc Moulded Plastic Chair -->
        <!-- Curved Backrest with Ventilated Slits -->
        <path d="M -26,-55 C -28,-62 28,-62 26,-55 L 22,-5 L -22,-5 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
        <!-- Vertical Vent Slots on Backrest -->
        <rect x="-14" y="-48" width="4" height="30" rx="2" fill="#0369a1"/>
        <rect x="-2" y="-48" width="4" height="30" rx="2" fill="#0369a1"/>
        <rect x="10" y="-48" width="4" height="30" rx="2" fill="#0369a1"/>
        <!-- Contoured Seat Pan -->
        <polygon points="-30,-5 30,-5 38,12 -38,12" fill="#0369a1" stroke="#38bdf8" stroke-width="2"/>
        <!-- 4 Moulded Tapered Legs -->
        <!-- Back Left Leg -->
        <line x1="-20" y1="5" x2="-26" y2="48" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
        <!-- Back Right Leg -->
        <line x1="20" y1="5" x2="26" y2="48" stroke="#0284c7" stroke-width="5" stroke-linecap="round"/>
        <!-- Front Left Leg -->
        <line x1="-34" y1="12" x2="-38" y2="54" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round"/>
        <!-- Front Right Leg -->
        <line x1="34" y1="12" x2="38" y2="54" stroke="#38bdf8" stroke-width="5.5" stroke-linecap="round"/>
      </g>
    `),
    productImageUrl: '',
    shortDescription: 'A simple everyday plastic chair. Its deliberately ordinary nature makes it one of the hardest products to creatively position.',
    status: 'AVAILABLE',
  },
];
