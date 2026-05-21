const apiKey = "AIzaSyBOFOAKt2XZYgsYnvjBpKBVA_lSx6IfHDg";

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
test();
