export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const STABILITY_API_KEY = process.env.STABILITY_API_KEY
  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'Image generation is not configured' })
  }

  try {
    const { prompt, aspectRatio } = req.body
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' })
    }

    const form = new FormData()
    form.append('prompt', prompt)
    form.append('output_format', 'jpeg')
    form.append('aspect_ratio', aspectRatio || '1:1')

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: form
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText || 'Image generation failed' })
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    res.status(200).json({ image: `data:image/jpeg;base64,${base64}` })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
