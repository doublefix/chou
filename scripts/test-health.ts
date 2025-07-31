// scripts/test-health.ts
import { fetcher } from '../lib/api';

async function main() {
  try {
    const data = await fetcher('/api/v1/healthz');
    console.log('✅ 健康检查通过：', data);
  } catch (error) {
    console.error('❌ 健康检查失败：', error);
  }
}

main();


// NEXT_PUBLIC_API_BASE_URL=http://10.187.6.190 npx tsx scripts/test-health.ts