// api/proxy.js
// Vercel Serverless Function to securely connect to n8n

module.exports = async (req, res) => {
  const n8nURL = "https://xenonled.app.n8n.cloud/webhook/netregent";

  try {
    const response = await fetch(n8nURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: 'Failed to reach n8n' });
  }
};
