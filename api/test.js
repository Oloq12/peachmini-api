// Simple test endpoint for Vercel
export default async function handler(req, res) {
  console.log('[API] /api/test called');
  
  try {
    res.json({
      ok: true,
      message: 'Test endpoint working',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('[API] Test error:', error);
    res.status(500).json({
      ok: false,
      error: 'Test failed'
    });
  }
}