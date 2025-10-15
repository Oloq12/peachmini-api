/**
 * Multi-Provider AI Layer
 * Supports DeepSeek, OpenRouter, and Groq with unified interface
 */

// AI Provider Types and Interfaces

/**
 * DeepSeek Provider
 */
async function generateDeepSeek(request) {
  const startTime = Date.now();
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages
      ],
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const latencyMs = Date.now() - startTime;

  return {
    text: data.choices[0]?.message?.content || '',
    usage: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
    latencyMs,
    provider: 'deepseek',
  };
}

/**
 * OpenRouter Provider
 */
async function generateOpenRouter(request) {
  const startTime = Date.now();
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://peachmini.app',
      'X-Title': 'Peachmini AI Chat',
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages
      ],
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const latencyMs = Date.now() - startTime;

  return {
    text: data.choices[0]?.message?.content || '',
    usage: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
    latencyMs,
    provider: 'openrouter',
  };
}

/**
 * Groq Provider
 */
async function generateGroq(request) {
  const startTime = Date.now();
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: [
        { role: 'system', content: request.system },
        ...request.messages
      ],
      max_tokens: request.maxTokens,
      temperature: request.temperature,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const latencyMs = Date.now() - startTime;

  return {
    text: data.choices[0]?.message?.content || '',
    usage: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
    latencyMs,
    provider: 'groq',
  };
}

/**
 * Main generate function with provider routing
 */
async function generate(request) {
  const { provider } = request;

  switch (provider) {
    case 'deepseek':
      return generateDeepSeek(request);
    case 'openrouter':
      return generateOpenRouter(request);
    case 'groq':
      return generateGroq(request);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Check if provider is available (has API key)
 */
function isProviderAvailable(provider) {
  switch (provider) {
    case 'deepseek':
      return !!process.env.DEEPSEEK_KEY;
    case 'openrouter':
      return !!process.env.OPENROUTER_KEY;
    case 'groq':
      return !!process.env.GROQ_KEY;
    default:
      return false;
  }
}

/**
 * Get available providers
 */
function getAvailableProviders() {
  const providers = ['deepseek', 'openrouter', 'groq'];
  return providers.filter(isProviderAvailable);
}

module.exports = {
  generate,
  isProviderAvailable,
  getAvailableProviders
};
