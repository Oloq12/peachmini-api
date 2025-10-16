export default async function handler(req, res) {
  res.status(200).json({ ok: true, env: {
    AI_PRIMARY: process.env.AI_PRIMARY || null,
    HAS_DEEPSEEK: Boolean(process.env.DEEPSEEK_KEY),
    HAS_OPENROUTER: Boolean(process.env.OPENROUTER_KEY),
    HAS_GROQ: Boolean(process.env.GROQ_KEY)
  }});
}
