import { PLATFORM_FRESHER_PROGRAMS } from '../../src/careers-core/data/fresherPrograms.ts';
import { PLATFORM_COMPANIES } from '../../src/careers-core/data/companies.ts';

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    return { status: res.status, ok: res.ok, finalUrl: res.url };
  } catch (err) {
    return { status: 'ERR', ok: false, error: err.name === 'AbortError' ? 'TIMEOUT' : err.message };
  }
}

async function run() {
  console.log('Auditing all provenance URLs in Fresher Programs...');
  const programUrls = [];
  for (const prog of PLATFORM_FRESHER_PROGRAMS) {
    for (const src of prog.provenance?.sources || []) {
      if (src.url) {
        programUrls.push({ entityId: prog.id, companyId: prog.companyId, title: src.title, url: src.url });
      }
    }
  }

  console.log(`Found ${programUrls.length} fresher program URLs to check.`);
  const failed = [];
  const passed = [];

  // Batch in concurrency of 5
  for (let i = 0; i < programUrls.length; i += 5) {
    const batch = programUrls.slice(i, i + 5);
    await Promise.all(
      batch.map(async (item) => {
        const res = await checkUrl(item.url);
        if (!res.ok || res.status === 404) {
          failed.push({ ...item, ...res });
          console.log(`[FAIL ${res.status}] ${item.companyId} (${item.entityId}): ${item.url}`);
        } else {
          passed.push({ ...item, ...res });
          console.log(`[OK ${res.status}] ${item.companyId}: ${item.url}`);
        }
      })
    );
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`Total URLs: ${programUrls.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed / 404: ${failed.length}`);
  console.log(JSON.stringify(failed, null, 2));
}

run();
