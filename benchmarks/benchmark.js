import http from 'k6/http';
import { check, group } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');
export let requests = new Counter('requests');

// Test configuration
export let options = {
  scenarios: {
    default: {
      executor: 'ramping-vus',
      stages: [
        { duration: '20s', target: 10 }, // Ramp to 10 VUs (low load start)
        { duration: '70s', target: 10 }, // Stay at 10 VUs (low load)
        { duration: '20s', target: 50 }, // Ramp to 50 VUs (hard load)
        { duration: '70s', target: 50 }, // Stay at 50 VUs (hard load)
        { duration: '20s', target: 10 }, // Ramp to 10 VUs (low load)
        { duration: '70s', target: 10 }, // Stay at 10 VUs (low load)
        { duration: '20s', target: 50 }, // Ramp to 50 VUs (hard load)
        { duration: '70s', target: 50 }, // Stay at 50 VUs (hard load)
        { duration: '20s', target: 10 }, // Ramp to 10 VUs (low load)
        { duration: '70s', target: 10 }, // Stay at 10 VUs (low load)
        { duration: '20s', target: 50 }, // Ramp to 50 VUs (hard load)
        { duration: '70s', target: 50 }, // Stay at 50 VUs (hard load)
        { duration: '20s', target: 0 },  // Ramp down to 0 VUs (wind down)
      ],
      gracefulRampDown: '30s',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    // Latency per endpoint
    'http_req_duration{type:list}': ['p(95)<200'],
    'http_req_duration{type:detail}': ['p(95)<200'],
    'http_req_duration{type:create}': ['p(95)<300'],
    'http_req_duration{type:update}': ['p(95)<300'],
    'http_req_duration{type:delete}': ['p(95)<200'],
    // Global error rate
    'errors': ['rate<0.01'],
  },
};

const BASE_URL = 'http://localhost:8080';

export default function () {
  // Generate a unique timestamp for cache busting
  const ts = Date.now();

  // Create a new item and use its ID for subsequent operations
  group('create', () => {
    const params = {
      tags: { type: 'create', name: 'POST /items' },
      headers: { 'Content-Type': 'application/json' },
    };
    const payload = JSON.stringify({ name: 'item', value: 100 });
    const url = `${BASE_URL}/items?ts=${ts}`;
    const res = http.post(url, payload, params);
    requests.add(1, { route: 'create' });


    const success = check(res, {
      'status is 201': (r) => r.status === 201,
    });
    errorRate.add(!success, { type: 'create' });

    if (res.status !== 201) {
      console.log(`Failed create: Status: ${res.status}, Body: ${res.body}`);
      return; // Skip subsequent operations if create fails
    }

    const item = JSON.parse(res.body);
    const itemId = item.id;

    // Perform detail, update, and delete operations on the created item
    group('detail', () => {
      const detailParams = {
        tags: { type: 'detail', name: 'GET /items/:id' },
        headers: { 'Content-Type': 'application/json' },
      };
      const detailUrl = `${BASE_URL}/items/${itemId}?ts=${ts}`;
      const detailRes = http.get(detailUrl, detailParams);
      requests.add(1, { route: 'detail' });

      const detailSuccess = check(detailRes, {
        'status is 200': (r) => r.status === 200,
      });
      errorRate.add(!detailSuccess, { type: 'detail' });

      if (detailRes.status !== 200) {
        console.log(`Failed detail: Status: ${detailRes.status}, Body: ${detailRes.body}`);
      }
    });

    group('update', () => {
      const updateParams = {
        tags: { type: 'update', name: 'PUT /items/:id' },
        headers: { 'Content-Type': 'application/json' },
      };
      const updatePayload = JSON.stringify({ name: 'item-upd', value: 200 });
      const updateUrl = `${BASE_URL}/items/${itemId}?ts=${ts}`;
      const updateRes = http.put(updateUrl, updatePayload, updateParams);
      requests.add(1, { route: 'update' });

      const updateSuccess = check(updateRes, {
        'status is 200': (r) => r.status === 200,
      });
      errorRate.add(!updateSuccess, { type: 'update' });

      if (updateRes.status !== 200) {
        console.log(`Failed update: Status: ${updateRes.status}, Body: ${updateRes.body}`);
      }
    });

    group('delete', () => {
      const deleteParams = {
        tags: { type: 'delete', name: 'DELETE /items/:id' },
        headers: { 'Content-Type': 'application/json' },
      };
      const deleteUrl = `${BASE_URL}/items/${itemId}?ts=${ts}`;
      const deleteRes = http.del(deleteUrl, null, deleteParams);
      requests.add(1, { route: 'delete' });

      const deleteSuccess = check(deleteRes, {
        'status is 204': (r) => r.status === 204,
      });
      errorRate.add(!deleteSuccess, { type: 'delete' });

      if (deleteRes.status !== 204) {
        console.log(`Failed delete: Status: ${deleteRes.status}, Body: ${deleteRes.body}`);
      }
    });
  });

  // List operation
  group('list', () => {
    const listParams = {
      tags: { type: 'list', name: 'GET /items' },
      headers: { 'Content-Type': 'application/json' },
    };
    const listUrl = `${BASE_URL}/items?ts=${ts}`;
    const listRes = http.get(listUrl, listParams);
    requests.add(1, { route: 'list' });

    const listSuccess = check(listRes, {
      'status is 200': (r) => r.status === 200,
    });
    errorRate.add(!listSuccess, { type: 'list' });

    if (listRes.status !== 200) {
      console.log(`Failed list: Status: ${listRes.status}, Body: ${listRes.body}`);
    }
  });
}

export function handleSummary(data) {
  // Debug: Log all metric keys
  console.log('Available metrics:', Object.keys(data.metrics));

  const benchmarkResults = {
    latency: { labels: [], p50: [], p95: [] },
    throughput: { labels: [], rps: [] },
    errorRate: { labels: [], rate: [] },
    environment: {
      vus: 50, // Max VUs (actual varies due to ramping)
      duration: '10m', // Reflects total test duration
      endpoints: ['list', 'detail', 'create', 'update', 'delete'],
    },
  };

  const endpointNames = ['list', 'detail', 'create', 'update', 'delete'];
  endpointNames.forEach(ep => {
    // Latency metrics
    const latKey = `http_req_duration{type:${ep}}`;
    const latM = data.metrics[latKey] || { values: { med: 0, 'p(95)': 0 } };
    benchmarkResults.latency.labels.push(ep);
    benchmarkResults.latency.p50.push(latM.values.med || latM.values['p(90)'] || latM.values.avg || 0);
    benchmarkResults.latency.p95.push(latM.values['p(95)'] || 0);

    // Throughput metrics
    let reqKey = `requests{route:${ep}}`;
    let reqM = data.metrics[reqKey] || { values: { count: 0 } };
    // Try alternative key format
    if (!reqM.values.count) {
      reqKey = `requests{route=${ep}}`;
      reqM = data.metrics[reqKey] || { values: { count: 0 } };
    }
    benchmarkResults.throughput.labels.push(ep);
    const testDurationSeconds = (data.state.testRunDurationMs || 600000) / 1000; // Fallback to 600s
    let rps = reqM.values.count ? (reqM.values.count / testDurationSeconds) : 0;

    // Fallback: Use http_reqs if requests counter fails
    if (!rps && data.metrics['http_reqs']) {
      const totalRequests = data.metrics['http_reqs'].values.count || 0;
      rps = totalRequests / testDurationSeconds / endpointNames.length; // Divide by number of endpoints
    }
    benchmarkResults.throughput.rps.push(rps);

    // Error rate metrics
    const errKey = `errors{type:${ep}}`;
    const errM = data.metrics[errKey] || { values: { rate: 0 } };
    benchmarkResults.errorRate.labels.push(ep);
    benchmarkResults.errorRate.rate.push(errM.values.rate || 0);
  });

  return {
    'benchmark_results.json': JSON.stringify(benchmarkResults, null, 2),
  };
}