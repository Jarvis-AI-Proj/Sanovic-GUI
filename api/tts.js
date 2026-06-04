export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'HF_TOKEN is not configured on Vercel.' });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/mms-tts-tur",
            {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: text }),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'TTS API Error' }));
            return res.status(response.status).json(error);
        }

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(buffer));

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
