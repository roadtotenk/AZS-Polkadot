const fs = require('fs').promises;
const path = require('path');

const bundlePath = path.join(__dirname, '../dist/bundle.js');

async function fix() {
  console.log(`Fixing ${bundlePath}`);
  const contents = await fs.readFile(bundlePath, 'utf8');
  const replaceMissingTypes = '\n\nwindow.addEventListener = function(){};\n\n';

  // Looking for a first breakline after the first line of the file
  // This is where we can safely inject our code
  const fixed = contents.replace('\n\n', replaceMissingTypes);
  await fs.writeFile(bundlePath, fixed);
}

fix();
