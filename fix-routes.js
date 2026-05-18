// Simple route tree regeneration trigger
console.log("Cleaning build cache...");
const fs = require('fs');
const path = require('path');

// Touch the router file to trigger regeneration
const routerPath = path.join(__dirname, 'src', 'router.tsx');
const content = fs.readFileSync(routerPath, 'utf8');
fs.writeFileSync(routerPath, content);

console.log("Routes will regenerate on next build.");
