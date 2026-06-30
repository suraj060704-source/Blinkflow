export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { prompt, imageBase64, imageMime } = req.body

    const content = []
    if (imageBase64) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: imageMime, data: imageBase64 }
      })
    }
    content.push({ type: 'text', text: prompt })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content }]
      })
    })

    const data = await response.json()

    if (data.error) {
      return res.status(500).json({ error: data.error.message })
    }

    // Return in same format listing.html expects
    res.status(200).json({
      candidates: [{
        content: {
          parts: [{ text: data.content?.[0]?.text || '' }]
        }
      }]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
