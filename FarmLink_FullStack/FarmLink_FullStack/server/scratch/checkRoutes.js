async function checkRoutes() {
  try {
    const fRes = await fetch('http://localhost:5000/api/farmers');
    const fData = await fRes.json();
    console.log("Farmers count:", fData.length);

    const leRes = await fetch('http://localhost:5000/api/payment/last-error');
    const leData = await leRes.json();
    console.log("Last payment error:", leData.lastPaymentError);
  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}
checkRoutes();
