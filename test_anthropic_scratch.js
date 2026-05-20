async function run() {
  console.log('Testing direct IP fetch to bypass DNS...');
  try {
    const start = Date.now();
    const res = await fetch('http://1.1.1.1', { method: 'HEAD' });
    console.log(`[SUCCESS] http://1.1.1.1 - Status: ${res.status} (${Date.now() - start}ms)`);
  } catch (error) {
    console.log('[FAILED] http://1.1.1.1');
    console.error(error);
  }
}

run();
