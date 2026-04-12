const fs = require('fs');

const cssPath = 'src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace page-container-wide
css = css.replace(/\.page-container-wide\s*\{[^}]+\}/, '.page-container-wide {\n    width: 100%;\n    margin-left: auto;\n    margin-right: auto;\n    padding-left: 1rem;\n    padding-right: 1rem;\n  }');
css = css.replace(/@media \(min-width: 1024px\)\s*\{\s*\.page-container-wide\s*\{\s*padding-left: 2rem;\s*padding-right: 2rem;\s*\}\s*\}/, '@media (min-width: 1024px) {\n    .page-container-wide {\n      padding-left: 6%;\n      padding-right: 6%;\n    }\n  }');

// Same for narrow if it exists, but usually narrow wants to be narrow.
// We'll leave narrow alone or also make it 6% if user says 'tất cả căn đều 2 bên'.
css = css.replace(/\.page-container-narrow\s*\{[^}]+\}/, '.page-container-narrow {\n    width: 100%;\n    margin-left: auto;\n    margin-right: auto;\n    padding-left: 1rem;\n    padding-right: 1rem;\n  }');
css = css.replace(/@media \(min-width: 1024px\)\s*\{\s*\.page-container-narrow\s*\{\s*padding-left: 2rem;\s*padding-right: 2rem;\s*\}\s*\}/, '@media (min-width: 1024px) {\n    .page-container-narrow {\n      padding-left: 6%;\n      padding-right: 6%;\n    }\n  }');

fs.writeFileSync(cssPath, css);
console.log('Updated globals.css');
