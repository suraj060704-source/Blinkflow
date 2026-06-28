export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    )
    const data = await response.json()
    
    // Log for debugging
    console.log('Gemini response status:', response.status)
    console.log('Gemini response:', JSON.stringify(data).slice(0, 200))
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: error.message })
  }
}
