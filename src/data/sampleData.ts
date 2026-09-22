import { Category, StorageLocation, VaultItem } from '../types';

// Helper to create cute playful SVG data URIs
function makeSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_electronics', name: 'Electronics', icon: 'Cpu', color: '#FF5C00', description: 'Microcontrollers, sensors, ICs, & wiring' },
  { id: 'cat_lego', name: 'LEGO', icon: 'Boxes', color: '#F59E0B', description: 'Sets, minifigs, Technic gears, & bulk bricks' },
  { id: 'cat_robotics', name: 'Robotics', icon: 'Bot', color: '#EC4899', description: 'Motors, servos, chassis, ESCs, & batteries' },
  { id: 'cat_tools', name: 'Tools', icon: 'Wrench', color: '#3B82F6', description: 'Soldering, screwdrivers, pliers, & multimeters' },
  { id: 'cat_mechanical', name: 'Mechanical', icon: 'Cog', color: '#8B5CF6', description: 'Bearings, shafts, pulleys, springs, & gears' },
  { id: 'cat_books', name: 'Books', icon: 'BookOpen', color: '#10B981', description: 'Technical manuals, datasheets, & guides' },
  { id: 'cat_gaming', name: 'Gaming', icon: 'Gamepad2', color: '#6366F1', description: 'Retro consoles, cartridges, mods, & parts' },
  { id: 'cat_hardware', name: 'Hardware', icon: 'Nut', color: '#64748B', description: 'M2/M3/M4 screws, nuts, standoffs, & washers' },
  { id: 'cat_misc', name: 'Miscellaneous', icon: 'Archive', color: '#14B8A6', description: 'Spare parts and general physical items' },
];

export const DEFAULT_LOCATIONS: StorageLocation[] = [
  { id: 'loc_ws', name: 'Workshop', path: 'Workshop', createdAt: Date.now() - 86400000 * 30 },
  { id: 'loc_ws_shelf_a', name: 'Shelf A', parentId: 'loc_ws', path: 'Workshop → Shelf A', createdAt: Date.now() - 86400000 * 29 },
  { id: 'loc_ws_drawer_a3', name: 'Drawer A3', parentId: 'loc_ws_shelf_a', path: 'Workshop → Shelf A → Drawer A3', description: 'Small component organizers', createdAt: Date.now() - 86400000 * 28 },
  { id: 'loc_ws_shelf_b', name: 'Shelf B', parentId: 'loc_ws', path: 'Workshop → Shelf B', createdAt: Date.now() - 86400000 * 25 },
  { id: 'loc_ws_bin_1', name: 'Bin 1', parentId: 'loc_ws_shelf_b', path: 'Workshop → Shelf B → Bin 1', description: 'Heavy tools & bench equipment', createdAt: Date.now() - 86400000 * 24 },
  { id: 'loc_bed', name: 'Bedroom', path: 'Bedroom', createdAt: Date.now() - 86400000 * 20 },
  { id: 'loc_bed_cabinet', name: 'Cabinet', parentId: 'loc_bed', path: 'Bedroom → Cabinet', createdAt: Date.now() - 86400000 * 19 },
  { id: 'loc_bed_box_2', name: 'Box 2', parentId: 'loc_bed_cabinet', path: 'Bedroom → Cabinet → Box 2', description: 'Collectible figures & retro games', createdAt: Date.now() - 86400000 * 18 },
  { id: 'loc_desk', name: 'Desk', path: 'Desk', createdAt: Date.now() - 86400000 * 15 },
  { id: 'loc_desk_top', name: 'Top Drawer', parentId: 'loc_desk', path: 'Desk → Top Drawer', description: 'Active prototyping supplies', createdAt: Date.now() - 86400000 * 14 },
];

// Cute sample SVG illustrations
export const SAMPLE_IMAGES = {
  arduino: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#F8FAFC" rx="28"/>
      <!-- PCB base -->
      <rect x="70" y="50" width="260" height="200" rx="16" fill="#0284C7" stroke="#0369A1" stroke-width="4"/>
      <!-- Header Pins top -->
      <rect x="100" y="60" width="140" height="14" rx="3" fill="#0F172A"/>
      <circle cx="110" cy="67" r="3" fill="#FCD34D"/><circle cx="125" cy="67" r="3" fill="#FCD34D"/>
      <circle cx="140" cy="67" r="3" fill="#FCD34D"/><circle cx="155" cy="67" r="3" fill="#FCD34D"/>
      <circle cx="170" cy="67" r="3" fill="#FCD34D"/><circle cx="185" cy="67" r="3" fill="#FCD34D"/>
      <circle cx="200" cy="67" r="3" fill="#FCD34D"/><circle cx="215" cy="67" r="3" fill="#FCD34D"/>
      <circle cx="230" cy="67" r="3" fill="#FCD34D"/>
      <!-- USB port -->
      <rect x="52" y="85" width="40" height="48" rx="6" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3"/>
      <rect x="58" y="95" width="22" height="28" rx="2" fill="#64748B"/>
      <!-- Power barrel -->
      <rect x="50" y="180" width="45" height="50" rx="6" fill="#1E293B"/>
      <circle cx="95" cy="205" r="8" fill="#F97316"/>
      <!-- Microcontroller Chip -->
      <rect x="170" y="110" width="70" height="70" rx="6" fill="#0F172A" stroke="#334155" stroke-width="3"/>
      <text x="180" y="148" font-family="monospace" font-size="12" font-weight="bold" fill="#38BDF8">ATMEGA</text>
      <text x="188" y="165" font-family="monospace" font-size="10" fill="#94A3B8">2560</text>
      <!-- Crystal & LEDs -->
      <ellipse cx="140" cy="130" rx="8" ry="16" fill="#94A3B8"/>
      <circle cx="270" cy="130" r="5" fill="#22C55E"/>
      <circle cx="270" cy="150" r="5" fill="#EF4444"/>
      <!-- Reset button -->
      <circle cx="100" cy="120" r="8" fill="#FF5C00" stroke="#FFFFFF" stroke-width="2"/>
      <!-- Pins bottom -->
      <rect x="140" y="225" width="170" height="14" rx="3" fill="#0F172A"/>
      <!-- Cute smile badge -->
      <circle cx="295" cy="85" r="14" fill="#FEF08A"/>
      <circle cx="290" cy="82" r="2" fill="#713F12"/><circle cx="300" cy="82" r="2" fill="#713F12"/>
      <path d="M289 89 Q295 95 301 89" stroke="#713F12" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `),
  lego: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#FFFBEB" rx="28"/>
      <!-- Minifigure Head -->
      <circle cx="200" cy="110" r="32" fill="#FACC15" stroke="#EAB308" stroke-width="3"/>
      <!-- Stud on head -->
      <rect x="188" y="70" width="24" height="12" rx="4" fill="#FACC15" stroke="#EAB308" stroke-width="2"/>
      <!-- Minifig face -->
      <circle cx="188" cy="108" r="4.5" fill="#1E293B"/>
      <circle cx="212" cy="108" r="4.5" fill="#1E293B"/>
      <circle cx="186" cy="106" r="1.5" fill="#FFFFFF"/>
      <circle cx="210" cy="106" r="1.5" fill="#FFFFFF"/>
      <path d="M190 122 Q200 132 210 122" stroke="#1E293B" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- Helmet / Hair -->
      <path d="M166 100 C166 60, 234 60, 234 100 C220 92, 180 92, 166 100 Z" fill="#EA580C"/>
      <!-- Torso -->
      <path d="M165 145 L180 145 L200 145 L220 145 L235 145 L245 220 L155 220 Z" fill="#FF5C00" stroke="#C2410C" stroke-width="3"/>
      <!-- Torso print badge -->
      <rect x="185" y="165" width="30" height="24" rx="4" fill="#FFFFFF"/>
      <circle cx="200" cy="177" r="7" fill="#DC2626"/>
      <!-- Arms -->
      <path d="M165 150 L140 185 L148 196 L175 165 Z" fill="#FF5C00"/>
      <path d="M235 150 L260 185 L252 196 L225 165 Z" fill="#FF5C00"/>
      <!-- Hands (yellow claws) -->
      <path d="M136 195 A8 8 0 1 0 148 206" fill="none" stroke="#FACC15" stroke-width="5" stroke-linecap="round"/>
      <path d="M264 195 A8 8 0 1 1 252 206" fill="none" stroke="#FACC15" stroke-width="5" stroke-linecap="round"/>
      <!-- Hips & Legs -->
      <rect x="160" y="220" width="80" height="15" rx="3" fill="#1E293B"/>
      <rect x="162" y="235" width="36" height="45" rx="4" fill="#334155"/>
      <rect x="202" y="235" width="36" height="45" rx="4" fill="#334155"/>
    </svg>
  `),
  motor: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#F1F5F9" rx="28"/>
      <!-- Output D-Shaft -->
      <rect x="60" y="138" width="55" height="24" rx="3" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
      <line x1="80" y1="138" x2="80" y2="162" stroke="#94A3B8" stroke-width="2"/>
      <!-- Brass Gearbox -->
      <rect x="110" y="105" width="90" height="90" rx="10" fill="#EAB308" stroke="#CA8A04" stroke-width="4"/>
      <rect x="120" y="115" width="70" height="70" rx="6" fill="#FACC15"/>
      <!-- Small screws on gearbox face -->
      <circle cx="125" cy="120" r="3" fill="#713F12"/><circle cx="185" cy="120" r="3" fill="#713F12"/>
      <circle cx="125" cy="180" r="3" fill="#713F12"/><circle cx="185" cy="180" r="3" fill="#713F12"/>
      <text x="135" y="155" font-family="monospace" font-size="14" font-weight="bold" fill="#713F12">N20</text>
      <!-- Cylindrical Motor Can -->
      <rect x="200" y="115" width="130" height="70" rx="8" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
      <rect x="230" y="122" width="70" height="56" rx="4" fill="#F8FAFC"/>
      <text x="242" y="156" font-family="sans-serif" font-size="14" font-weight="bold" fill="#475569">6V DC</text>
      <!-- Back Plastic End Cap & Terminals -->
      <rect x="330" y="125" width="18" height="50" rx="4" fill="#0F172A"/>
      <rect x="348" y="133" width="16" height="8" rx="2" fill="#F97316"/>
      <rect x="348" y="159" width="16" height="8" rx="2" fill="#3B82F6"/>
      <!-- Cute spark -->
      <path d="M75 110 L82 120 L92 120 L84 126 L88 136 L80 130 L72 136 L75 126 L67 120 L78 120 Z" fill="#FF5C00"/>
    </svg>
  `),
  soldering: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#EFF6FF" rx="28"/>
      <!-- Hakko blue station -->
      <rect x="80" y="90" width="170" height="150" rx="20" fill="#0284C7" stroke="#0369A1" stroke-width="4"/>
      <!-- Yellow accent front plate -->
      <rect x="95" y="105" width="140" height="120" rx="14" fill="#FACC15" stroke="#EAB308" stroke-width="3"/>
      <!-- 7-segment digital display -->
      <rect x="110" y="120" width="110" height="42" rx="8" fill="#0F172A"/>
      <text x="125" y="152" font-family="monospace" font-size="28" font-weight="bold" fill="#EF4444">350°C</text>
      <!-- Buttons -->
      <rect x="115" y="178" width="40" height="30" rx="8" fill="#FF5C00" stroke="#C2410C" stroke-width="2"/>
      <text x="125" y="198" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">UP</text>
      <rect x="165" y="178" width="40" height="30" rx="8" fill="#1E293B"/>
      <text x="175" y="198" font-family="sans-serif" font-size="12" font-weight="bold" fill="#FFFFFF">ENT</text>
      <!-- Stand with Iron -->
      <rect x="270" y="160" width="65" height="80" rx="12" fill="#334155"/>
      <ellipse cx="302" cy="180" rx="18" ry="12" fill="#64748B"/>
      <!-- Soldering iron handle -->
      <line x1="330" y1="70" x2="300" y2="180" stroke="#FF5C00" stroke-width="14" stroke-linecap="round"/>
      <line x1="300" y1="180" x2="290" y2="215" stroke="#CBD5E1" stroke-width="6" stroke-linecap="round"/>
      <!-- Tip -->
      <polygon points="290,215 285,230 293,228" fill="#E2E8F0"/>
      <!-- Cord -->
      <path d="M235 210 Q260 270 310 240" stroke="#0F172A" stroke-width="6" fill="none" stroke-linecap="round"/>
    </svg>
  `),
  bearing: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#F8FAFC" rx="28"/>
      <!-- Outer Ring -->
      <circle cx="200" cy="150" r="100" fill="#E2E8F0" stroke="#64748B" stroke-width="8"/>
      <!-- Rubber Seal (Blue/Orange) -->
      <circle cx="200" cy="150" r="86" fill="#FF5C00" stroke="#C2410C" stroke-width="3"/>
      <!-- Inner Ring -->
      <circle cx="200" cy="150" r="54" fill="#CBD5E1" stroke="#475569" stroke-width="7"/>
      <!-- Bore hole -->
      <circle cx="200" cy="150" r="32" fill="#F8FAFC" stroke="#64748B" stroke-width="5"/>
      <!-- Ball bearings showing through cutaway or text stamp -->
      <text x="145" y="146" font-family="sans-serif" font-size="13" font-weight="bold" fill="#FFFFFF">608-2RS</text>
      <text x="155" y="166" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FED7AA">ABEC-9</text>
      <!-- Sparkle highlights -->
      <circle cx="160" cy="90" r="8" fill="#FFFFFF" opacity="0.6"/>
      <circle cx="145" cy="105" r="4" fill="#FFFFFF" opacity="0.4"/>
    </svg>
  `),
  book: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#FDF4FF" rx="28"/>
      <!-- Book spine & shadow -->
      <rect x="110" y="45" width="180" height="215" rx="10" fill="#9333EA"/>
      <rect x="120" y="45" width="170" height="215" rx="8" fill="#0F172A" stroke="#FF5C00" stroke-width="4"/>
      <!-- Pages thickness -->
      <path d="M290 60 L305 70 L305 250 L290 240 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <!-- Book Title & Artwork -->
      <rect x="135" y="70" width="140" height="90" rx="8" fill="#FF5C00"/>
      <!-- Sine wave / electronics schematic on cover -->
      <path d="M145 115 Q160 85 175 115 T205 115 T235 115 T265 115" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round"/>
      <text x="140" y="190" font-family="sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">THE ART OF</text>
      <text x="140" y="210" font-family="sans-serif" font-size="14" font-weight="800" fill="#FACC15">ELECTRONICS</text>
      <text x="140" y="235" font-family="sans-serif" font-size="10" font-weight="bold" fill="#94A3B8">Horowitz &amp; Hill</text>
      <!-- Gold bookmark ribbon -->
      <polygon points="240,45 255,45 255,100 247,90 240,100" fill="#FACC15"/>
    </svg>
  `),
  screws: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#F1F5F9" rx="28"/>
      <!-- Plastic compartment box -->
      <rect x="80" y="60" width="240" height="180" rx="18" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
      <!-- Divider grids -->
      <line x1="160" y1="60" x2="160" y2="240" stroke="#94A3B8" stroke-width="3"/>
      <line x1="240" y1="60" x2="240" y2="240" stroke="#94A3B8" stroke-width="3"/>
      <line x1="80" y1="150" x2="320" y2="150" stroke="#94A3B8" stroke-width="3"/>
      <!-- Hex Socket Screws scattered in compartment 1 -->
      <polygon points="120,80 135,72 150,80 150,96 135,104 120,96" fill="#64748B"/>
      <polygon points="127,84 135,79 143,84 143,92 135,97 127,92" fill="#0F172A"/>
      <!-- Screw body -->
      <rect x="100" y="110" width="45" height="16" rx="3" transform="rotate(35 100 110)" fill="#64748B"/>
      <!-- Compartment 2: Hex nuts -->
      <circle cx="200" cy="105" r="20" fill="#94A3B8" stroke="#475569" stroke-width="3"/>
      <polygon points="190,100 200,92 210,100 210,110 200,118 190,110" fill="#F1F5F9"/>
      <!-- Compartment 3: Standoffs (brass) -->
      <rect x="260" y="85" width="35" height="18" rx="3" fill="#EAB308" stroke="#CA8A04" stroke-width="2"/>
      <rect x="255" y="112" width="45" height="18" rx="3" fill="#EAB308" stroke="#CA8A04" stroke-width="2"/>
      <!-- Label on box -->
      <rect x="130" y="175" width="140" height="40" rx="8" fill="#FF5C00"/>
      <text x="145" y="200" font-family="sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF">M3 SCREW KIT</text>
    </svg>
  `),
  esp32: makeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <rect width="400" height="300" fill="#F8FAFC" rx="28"/>
      <!-- PCB -->
      <rect x="110" y="45" width="180" height="210" rx="12" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
      <!-- Antenna top -->
      <path d="M140 50 L140 70 L260 70 L260 50" stroke="#FF5C00" stroke-width="5" fill="none" stroke-linecap="round"/>
      <!-- Metal RF Shield -->
      <rect x="135" y="80" width="130" height="95" rx="6" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3"/>
      <text x="155" y="125" font-family="monospace" font-size="16" font-weight="bold" fill="#0F172A">ESP-WROOM</text>
      <text x="180" y="148" font-family="monospace" font-size="14" font-weight="bold" fill="#0284C7">32D</text>
      <!-- Micro-USB port bottom -->
      <rect x="175" y="240" width="50" height="20" rx="4" fill="#94A3B8"/>
      <!-- Buttons -->
      <rect x="125" y="225" width="20" height="20" rx="4" fill="#EF4444"/>
      <text x="128" y="240" font-family="sans-serif" font-size="8" fill="#FFFFFF">EN</text>
      <rect x="255" y="225" width="20" height="20" rx="4" fill="#3B82F6"/>
      <text x="257" y="240" font-family="sans-serif" font-size="8" fill="#FFFFFF">BOOT</text>
      <!-- Header pins on sides -->
      <rect x="98" y="65" width="10" height="170" rx="3" fill="#FACC15"/>
      <rect x="292" y="65" width="10" height="170" rx="3" fill="#FACC15"/>
    </svg>
  `),
};

export const INITIAL_SAMPLE_ITEMS: VaultItem[] = [
  {
    id: 'item_arduino_mega',
    name: 'Arduino Mega 2560 R3',
    images: [SAMPLE_IMAGES.arduino],
    categoryId: 'cat_electronics',
    subcategory: 'Microcontroller',
    quantity: 4,
    minQuantity: 2,
    condition: 'Mint / New',
    brand: 'Arduino Official',
    modelNumber: 'A000067',
    tags: ['microcontroller', 'atmega2560', 'usb', '54-io'],
    locationId: 'loc_ws_drawer_a3',
    locationPath: 'Workshop → Shelf A → Drawer A3',
    purchaseDate: '2026-03-10',
    purchasePrice: 42.50,
    notes: 'Primary dev boards for robot controllers and large pinout hardware tests.',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now() - 86400000 * 2,
    lastUsedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'item_lego_starwars',
    name: 'LEGO Star Wars X-Wing Pilot',
    images: [SAMPLE_IMAGES.lego],
    categoryId: 'cat_lego',
    subcategory: 'Minifigures',
    quantity: 1,
    minQuantity: 1,
    condition: 'Mint / New',
    brand: 'LEGO',
    modelNumber: 'sw0543',
    tags: ['star-wars', 'minifig', 'pilot', 'rebel'],
    locationId: 'loc_bed_box_2',
    locationPath: 'Bedroom → Cabinet → Box 2',
    purchaseDate: '2025-11-18',
    purchasePrice: 18.00,
    notes: 'Collectible pilot with dual-molded helmet and detailed flight-suit torso.',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 18,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'item_n20_motor',
    name: 'N20 Micro Metal Gear Motor 6V 300RPM',
    images: [SAMPLE_IMAGES.motor],
    categoryId: 'cat_robotics',
    subcategory: 'Motors & Actuators',
    quantity: 2, // Low stock alert! (minQuantity is 4)
    minQuantity: 4,
    condition: 'Mint / New',
    brand: 'Pololu Style',
    modelNumber: 'N20-6V-300',
    tags: ['robotics', 'motor', 'brass-gear', '6v', 'd-shaft'],
    locationId: 'loc_ws_drawer_a3',
    locationPath: 'Workshop → Shelf A → Drawer A3',
    purchaseDate: '2026-01-15',
    purchasePrice: 7.50,
    notes: 'High torque compact gearmotor. Low stock! Need 4 more for the next chassis build.',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 1,
    lastUsedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'item_hakko_soldering',
    name: 'Hakko FX-888D Soldering Station',
    images: [SAMPLE_IMAGES.soldering],
    categoryId: 'cat_tools',
    subcategory: 'Soldering',
    quantity: 1,
    minQuantity: 1,
    condition: 'Like New',
    brand: 'Hakko',
    modelNumber: 'FX-888D-01BY',
    tags: ['soldering', 'iron', 'temperature-controlled', 'esd-safe'],
    locationId: 'loc_ws_bin_1',
    locationPath: 'Workshop → Shelf B → Bin 1',
    purchaseDate: '2025-08-20',
    purchasePrice: 115.00,
    notes: '70W digital temperature control station with T18-D16 chisel tip installed.',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 10,
    lastUsedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'item_608rs_bearings',
    name: '608-2RS Deep Groove Ball Bearings (10-pack)',
    images: [SAMPLE_IMAGES.bearing],
    categoryId: 'cat_mechanical',
    subcategory: 'Bearings',
    quantity: 8,
    minQuantity: 5,
    condition: 'Mint / New',
    brand: 'Bones Reds',
    modelNumber: '608-2RS-8x22x7',
    tags: ['bearing', 'skate', 'rotary', 'abec-7', 'rubber-seal'],
    locationId: 'loc_ws_drawer_a3',
    locationPath: 'Workshop → Shelf A → Drawer A3',
    purchaseDate: '2026-02-12',
    purchasePrice: 19.99,
    notes: '8mm bore, 22mm OD, 7mm width. Pre-lubricated with low friction synthetic speed cream.',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'item_art_of_electronics',
    name: 'The Art of Electronics (3rd Edition)',
    images: [SAMPLE_IMAGES.book],
    categoryId: 'cat_books',
    subcategory: 'Textbook / Reference',
    quantity: 1,
    minQuantity: 1,
    condition: 'Like New',
    brand: 'Cambridge University Press',
    modelNumber: 'ISBN 978-0521809269',
    tags: ['circuit-design', 'analog', 'reference', 'textbook'],
    locationId: 'loc_desk_top',
    locationPath: 'Desk → Top Drawer',
    purchaseDate: '2025-04-10',
    purchasePrice: 89.00,
    notes: 'Definitive circuit design manual by Paul Horowitz and Winfield Hill. 1,220 pages.',
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 28,
    updatedAt: Date.now() - 86400000 * 14,
  },
  {
    id: 'item_m3_screws',
    name: 'M3 Hex Socket Screws & Nuts Kit (320 Pcs)',
    images: [SAMPLE_IMAGES.screws],
    categoryId: 'cat_hardware',
    subcategory: 'Fasteners',
    quantity: 1, // 1 kit remaining, min 2 kits
    minQuantity: 2,
    condition: 'Good',
    brand: 'VIGRUE',
    modelNumber: 'M3-304-SS',
    tags: ['m3', 'screws', 'nuts', 'stainless-steel', 'hex-socket'],
    locationId: 'loc_ws_shelf_a',
    locationPath: 'Workshop → Shelf A',
    purchaseDate: '2026-01-20',
    purchasePrice: 16.50,
    notes: '304 stainless steel button head hex screws (6mm to 20mm lengths) plus matching locknuts.',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 16,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'item_esp32_wroom',
    name: 'ESP32-WROOM-32D Development Board',
    images: [SAMPLE_IMAGES.esp32],
    categoryId: 'cat_electronics',
    subcategory: 'Wireless Modules',
    quantity: 5,
    minQuantity: 2,
    condition: 'Mint / New',
    brand: 'Espressif',
    modelNumber: 'ESP32-DevKitC-V4',
    tags: ['wifi', 'bluetooth', 'dual-core', 'iot', 'espressif'],
    locationId: 'loc_desk_top',
    locationPath: 'Desk → Top Drawer',
    purchaseDate: '2026-02-05',
    purchasePrice: 6.80,
    notes: 'Dual-core Xtensa 32-bit LX6 @ 240MHz. Integrated 802.11b/g/n Wi-Fi and Bluetooth v4.2 BR/EDR/BLE.',
    isFavorite: false,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 6,
  }
];
