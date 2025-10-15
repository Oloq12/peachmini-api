/**
 * AI Router with Failover and A/B Testing
 * Handles provider selection, failover logic, and A/B testing
 */

const { generate, isProviderAvailable } = require('./providers');

/**
 * Get router configuration from environment variables
 */
function getRouterConfig() {
  return {
    primary: process.env.AI_PRIMARY || 'deepseek',
    secondary: process.env.AI_SECONDARY || undefined,
    modelPrimary: process.env.AI_MODEL_PRIMARY || 'deepseek-chat',
    modelSecondary: process.env.AI_MODEL_SECONDARY || undefined,
    temperature: parseFloat(process.env.AI_TEMP || '0.9'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '512'),
    abTestPercent: parseInt(process.env.AI_AB_TEST || '0'),
  };
}

/**
 * Check if request should go to A/B test bucket
 */
function shouldUseABTest(abTestPercent) {
  if (abTestPercent <= 0) return false;
  return Math.random() * 100 < abTestPercent;
}

/**
 * Generate offline stub response
 */
function generateOfflineStub() {
  return {
    text: "💬 Сейчас офлайн, но я с тобой. Расскажи, как прошёл твой день?",
    usage: { prompt: 0, completion: 0, total: 0 },
    latencyMs: 0,
    provider: 'stub',
    chosenProvider: 'stub',
    model: 'offline',
  };
}

/**
 * Main router function with failover and A/B testing
 */
async function routeGenerate(system, messages) {
  const config = getRouterConfig();
  const startTime = Date.now();

  // Check if A/B testing is enabled
  const useABTest = shouldUseABTest(config.abTestPercent);
  let abBucket;

  if (useABTest && config.secondary && config.modelSecondary) {
    abBucket = 'secondary';
    
    // Try secondary provider first for A/B test
    if (isProviderAvailable(config.secondary)) {
      try {
        const request = {
          provider: config.secondary,
          model: config.modelSecondary,
          system,
          messages,
          maxTokens: config.maxTokens,
          temperature: config.temperature,
        };

        const response = await generate(request);
        const totalLatency = Date.now() - startTime;

        console.log(`[AI] p=${response.provider} m=${config.modelSecondary} t=${totalLatency}ms tok=${response.usage.completion} ab=secondary`);

        return {
          ...response,
          chosenProvider: config.secondary,
          model: config.modelSecondary,
          abBucket: 'secondary',
        };
      } catch (error) {
        console.error(`[AI] Secondary provider failed:`, error);
        // Fall through to primary
      }
    }
  }

  // Try primary provider
  if (isProviderAvailable(config.primary)) {
    try {
      const request = {
        provider: config.primary,
        model: config.modelPrimary,
        system,
        messages,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      };

      const response = await generate(request);
      const totalLatency = Date.now() - startTime;

      console.log(`[AI] p=${response.provider} m=${config.modelPrimary} t=${totalLatency}ms tok=${response.usage.completion} ab=${abBucket || 'none'}`);

      return {
        ...response,
        chosenProvider: config.primary,
        model: config.modelPrimary,
        abBucket: abBucket || 'primary',
      };
    } catch (error) {
      console.error(`[AI] Primary provider failed:`, error);
    }
  }

  // Try secondary provider as failover (if not already tried in A/B test)
  if (config.secondary && config.modelSecondary && !useABTest && isProviderAvailable(config.secondary)) {
    try {
      const request = {
        provider: config.secondary,
        model: config.modelSecondary,
        system,
        messages,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      };

      const response = await generate(request);
      const totalLatency = Date.now() - startTime;

      console.log(`[AI] p=${response.provider} m=${config.modelSecondary} t=${totalLatency}ms tok=${response.usage.completion} ab=failover`);

      return {
        ...response,
        chosenProvider: config.secondary,
        model: config.modelSecondary,
        abBucket: 'failover',
      };
    } catch (error) {
      console.error(`[AI] Secondary provider failover failed:`, error);
    }
  }

  // All providers failed, return offline stub
  console.log(`[AI] All providers failed, using offline stub`);
  return generateOfflineStub();
}

/**
 * Get router status for health checks
 */
function getRouterStatus() {
  const config = getRouterConfig();
  const availableProviders = ['deepseek', 'openrouter', 'groq'].filter(isProviderAvailable);

  return {
    config: {
      primary: config.primary,
      secondary: config.secondary,
      modelPrimary: config.modelPrimary,
      modelSecondary: config.modelSecondary,
      abTestPercent: config.abTestPercent,
    },
    availableProviders,
    primaryAvailable: isProviderAvailable(config.primary),
    secondaryAvailable: config.secondary ? isProviderAvailable(config.secondary) : false,
  };
}

module.exports = {
  routeGenerate,
  getRouterStatus
};
