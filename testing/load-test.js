import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURATION ---
const APP_URL = 'https://lms.qubitedge.in'; 
const SUPABASE_URL = 'https://fzcihfoavithftyhdeef.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LHE7d5eitEplXPYFQwsmYQ_z7YaERig';
const TABLE_NAME = 'events'; 

export const options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp up to 100
    { duration: '2m', target: 300 }, // Ramp up to 300
    { duration: '3m', target: 300 }, // Hold 300
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must be under 2s
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

export default function () {
  // 1. Test Frontend Home Page
  const frontendRes = http.get(APP_URL);
  check(frontendRes, {
    'frontend status is 200': (r) => r.status === 200,
    'frontend response time < 2s': (r) => r.duration < 2000,
  });

  sleep(1);

  // 2. Test Supabase REST API (PostgREST)
  const params = {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  const apiRes = http.get(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&limit=1`, params);
  check(apiRes, {
    'supabase status is 200': (r) => r.status === 200,
    'supabase response time < 2s': (r) => r.duration < 2000,
  });

  sleep(1);
}
