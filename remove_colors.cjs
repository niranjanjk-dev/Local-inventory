const fs = require('fs');
const path = require('path');

const dir = 'd:/Local Inventory/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Make category distribution bar bigger
    if (file === 'SettingsScreen.tsx') {
        content = content.replace(/className="h-4 w-full bg-zinc-100 border border-zinc-200 flex overflow-hidden"/g, 'className="h-10 w-full bg-zinc-100 border border-zinc-200 flex overflow-hidden rounded-xl"');
        content = content.replace(/className={`w-3 h-3 border border-zinc-200 \${cat.color}`} \/>/g, 'className={`w-4 h-4 rounded-md border border-zinc-200 ${cat.color}`} />');
        // emerald
        content = content.replace(/text-emerald-600/g, 'text-black');
    }

    // Replace color utility classes
    const replacements = [
        ['bg-rose-600', 'bg-black'],
        ['hover:bg-rose-700', 'hover:bg-zinc-800'],
        ['bg-rose-500', 'bg-black'],
        ['bg-rose-100', 'bg-zinc-100'],
        ['bg-rose-50', 'bg-zinc-50'],
        ['text-rose-800', 'text-black'],
        ['text-rose-700', 'text-black'],
        ['text-rose-600', 'text-black'],
        ['text-rose-500', 'text-black'],
        ['border-rose-300', 'border-zinc-300'],
        ['border-rose-200', 'border-zinc-200'],
        ['hover:text-rose-600', 'hover:text-black'],
        ['hover:text-rose-500', 'hover:text-black'],
        ['hover:bg-rose-100', 'hover:bg-zinc-200'],
        ['hover:bg-rose-50', 'hover:bg-zinc-100'],
    ];

    for (const [find, replace] of replacements) {
        content = content.split(find).join(replace);
    }

    // Fix some specific things
    // If we turned text-rose-600 to text-black inside a dark button, it might be an issue.
    // Let's review the low stock badge: "text-rose-600 bg-rose-50 border border-rose-200" becomes "text-black bg-zinc-50 border border-zinc-200" which is fine!
    
    fs.writeFileSync(fullPath, content);
}

console.log('Colors replaced successfully!');
