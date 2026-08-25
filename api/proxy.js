// api/proxy.js
export default async function handler(req, res) {
  // ضع هنا رابط n8n Webhook الخاص بك (الذي يبدأ بـ https://...app.n8n.cloud/webhook/...)
  const n8nURL = "https://XENONLED2.APP.N8N.CLOUD/WEBHOOK/YOUR_WEBHOOK_ID"; 

  try {
    const response = await fetch(n8nURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    });

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reach n8n' });
  }
}
