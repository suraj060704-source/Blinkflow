export default async function handler(req, res) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  
  // Debug: check if key exists
  if (req.method === 'GET') {
    return res.status(200).json({ 
      keyExists: !!GEMINI_API_KEY,
      keyStart: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 8) : 'NOT FOUND'
    })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured in Vercel' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
