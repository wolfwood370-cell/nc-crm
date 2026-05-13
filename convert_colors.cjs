const fs = require('fs');

const colors = {
  "on-primary-container": "#00422b",
  "surface-tint": "#4edea3",
  "inverse-on-surface": "#2b322d",
  "secondary-container": "#0566d9",
  "tertiary-fixed": "#ffdad7",
  "surface-container": "#1a211d",
  "secondary": "#adc6ff",
  "outline-variant": "#3c4a42",
  "on-surface": "#dde4dd",
  "tertiary-container": "#fc7c78",
  "on-tertiary-fixed": "#410005",
  "surface-variant": "#2f3632",
  "secondary-fixed-dim": "#adc6ff",
  "tertiary-fixed-dim": "#ffb3af",
  "surface-container-low": "#161d19",
  "surface-container-highest": "#2f3632",
  "primary-fixed": "#6ffbbe",
  "on-secondary-fixed": "#001a42",
  "error": "#ffb4ab",
  "surface-container-lowest": "#09100c",
  "surface-bright": "#343b36",
  "secondary-fixed": "#d8e2ff",
  "on-secondary": "#002e6a",
  "error-container": "#93000a",
  "surface-dim": "#0e1511",
  "on-secondary-fixed-variant": "#004395",
  "outline": "#86948a",
  "surface-container-high": "#242c27",
  "on-tertiary-container": "#711419",
  "on-primary-fixed-variant": "#005236",
  "on-primary-fixed": "#002113",
  "on-tertiary": "#650911",
  "on-background": "#dde4dd",
  "background": "#0e1511",
  "tertiary": "#ffb3af",
  "inverse-surface": "#dde4dd",
  "on-surface-variant": "#bbcabf",
  "on-tertiary-fixed-variant": "#842225",
  "on-secondary-container": "#e6ecff",
  "on-primary": "#003824",
  "inverse-primary": "#006c49",
  "surface": "#0e1511",
  "primary-container": "#10b981",
  "on-error": "#690005",
  "primary-fixed-dim": "#4edea3",
  "primary": "#4edea3",
  "on-error-container": "#ffdad6"
};

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

let cssContent = "  .dark {\n";
let twContent = "{\n";

for (const [key, value] of Object.entries(colors)) {
  const hsl = hexToHsl(value);
  cssContent += `    --${key}: ${hsl};\n`;
  twContent += `        "${key}": "hsl(var(--${key}))",\n`;
}

cssContent += "  }";
twContent += "}";

fs.writeFileSync('C:\\Users\\wolfw\\Documents\\life-business-os\\colors.txt', cssContent + "\n\n" + twContent);
