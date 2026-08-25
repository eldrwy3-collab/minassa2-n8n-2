// api/proxy.js
export default async function handler(req, res) {
  // ضع هنا رابط n8n Webhook الخاص بك (بدون "https://" في البداية، فقط الرابط الكامل)
  const n8nURL = "https://your-n8n-instance.app.n8n.cloud/webhook/YOUR_WEBHOOK_ID"; 

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
