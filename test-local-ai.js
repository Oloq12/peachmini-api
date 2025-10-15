// Test AI router locally
const { routeGenerate, getRouterStatus } = require('./api/ai/router');

async function testAI() {
  console.log('🧪 Testing AI Router locally...');
  
  try {
    // Test router status
    const status = getRouterStatus();
    console.log('📊 Router Status:', JSON.stringify(status, null, 2));
    
    // Test AI generation
    const systemPrompt = "You are a helpful AI assistant.";
    const messages = [{ role: "user", content: "Hello!" }];
    
    const response = await routeGenerate(systemPrompt, messages);
    console.log('🤖 AI Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAI();
