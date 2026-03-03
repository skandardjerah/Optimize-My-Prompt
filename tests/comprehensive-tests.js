const BASE_URL = 'http://localhost:3000';

console.log('🧪 COMPREHENSIVE TEST SUITE\n');
console.log('================================\n');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failed++;
  }
}

async function runTests() {
  
  await test('Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Failed');
  });

  await test('SQL Intent', async () => {
    const res = await fetch(`${BASE_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Show me all users' })
    });
    const data = await res.json();
    if (data.intent !== 'sql_query') throw new Error('Wrong intent');
  });

  await test('Code Review Intent', async () => {
    const res = await fetch(`${BASE_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Review my code' })
    });
    const data = await res.json();
    if (data.intent !== 'code_review') throw new Error('Wrong intent');
  });

  await test('Prompt Enhancement Intent', async () => {
    const res = await fetch(`${BASE_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Help me write better' })
    });
    const data = await res.json();
    if (data.intent !== 'prompt_enhancement') throw new Error('Wrong intent');
  });

  await test('Conversation Memory', async () => {
    const res = await fetch(`${BASE_URL}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test' })
    });
    const data = await res.json();
    if (!data.conversationId) throw new Error('No ID');
  });

  await test('Analytics', async () => {
    const res = await fetch(`${BASE_URL}/api/analytics/summary`);
    const data = await res.json();
    if (data.totalRequests === undefined) throw new Error('Failed');
  });

  await test('Feedback', async () => {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5 })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed');
  });

  await test('Template Builder', async () => {
    const res = await fetch(`${BASE_URL}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'test_' + Date.now(),
        template: 'Test {{.Var}}'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed');
  });

  await test('Prompt Library', async () => {
    const res = await fetch(`${BASE_URL}/api/prompts`);
    const data = await res.json();
    if (!data.prompts) throw new Error('Failed');
  });

  await test('Web UI', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error('Failed');
  });

  console.log('\n================================');
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`📊 SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('================================\n');
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
  } else {
    console.log('⚠️  Some tests failed\n');
  }
}

runTests();