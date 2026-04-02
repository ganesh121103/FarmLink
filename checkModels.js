const fs = require('fs');
const content = fs.readFileSync('available_models.txt', 'utf16le');
try {
  const json = JSON.parse(content);
  if (json.models) {
    const names = json.models.map(m => m.name);
    console.log("Models:", names.filter(n => n.includes("gemini")));
  } else {
    console.log(content.substring(0, 200));
  }
} catch(e) {
  console.log(content.substring(0, 200));
}
