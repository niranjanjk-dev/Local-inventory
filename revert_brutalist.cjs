const fs = require('fs');
const path = require('path');

const dir = 'd:/Local Inventory/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    content = content.replace(/rounded-none/g, 'rounded-2xl');
    content = content.replace(/border-2 border-black/g, 'border border-zinc-200');
    content = content.replace(/ hover:translate-x-\[-2px\] hover:translate-y-\[-2px\] hover:shadow-\[4px_4px_0_0_rgba\(0,0,0,1\)\]/g, '');
    content = content.replace(/ translate-x-\[-2px\] translate-y-\[-2px\] shadow-\[4px_4px_0_0_rgba\(0,0,0,1\)\]/g, '');
    content = content.replace(/ shadow-\[8px_8px_0_0_rgba\(0,0,0,1\)\]/g, ' shadow-2xl');
    content = content.replace(/ shadow-\[2px_2px_0_0_rgba\(24,24,27,1\)\]/g, ' shadow-sm');
    content = content.replace(/ active:shadow-none active:translate-x-\[2px\] active:translate-y-\[2px\]/g, '');
    
    fs.writeFileSync(fullPath, content);
}
console.log('Revert done');
