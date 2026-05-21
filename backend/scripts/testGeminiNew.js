import fs from 'fs';
const apiKey = "AIzaSyBOFOAKt2XZYgsYnvjBpKBVA_lSx6IfHDg";
const prompt = "Hello";

async function test(model) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await res.json();
    let result = `\n--- ${model} ---\n`;
    if(data.error) {
        result += `Error: ${data.error.code} ${data.error.message.substring(0, 100)}`;
    } else {
        result += `Success: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50)}`;
    }
    fs.appendFileSync('out.txt', result);
  } catch (err) {
    fs.appendFileSync('out.txt', `\n--- ${model} ---\nFetch error: ${err.message}\n`);
  }
}

async function run() {
    fs.writeFileSync('out.txt', ''); // clear
    await test("gemini-flash-latest");
    await test("gemini-2.0-flash-lite");
    await test("gemma-3-1b-it");
}
run();
