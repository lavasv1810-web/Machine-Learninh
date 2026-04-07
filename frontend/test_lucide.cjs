const lucide = require('lucide-react');
const icons = ['ShieldAlert', 'Activity', 'Terminal', 'Network', 'Server', 'Database', 'Globe', 'Clock', 'Crosshair', 'Fingerprint'];

const missing = [];
for (const icon of icons) {
  if (!lucide[icon]) {
    missing.push(icon);
  }
}

console.log("Missing icons:", missing);
