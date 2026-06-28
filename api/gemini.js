export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { prompt, imageBase64, imageMime } = req.body

    const messages = [{ role: 'user', content: [] }]

    if (imageBase64) {
      messages[0].content.push({
        type: 'image_url',
        image_url: { url: `data:${imageMime};base64,${imageBase64}` }
      })
    }

    messages[0].content.push({ type: 'text', text: prompt })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
        temperature: 0.7
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
          parts: [{ text: data.choices[0].message.content }]
        }
      }]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
