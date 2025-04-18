export const frameworkData = {
	golang: [
		{
			name: 'Gin',
			url: 'https://gin-gonic.com',
			logo: 'https://raw.githubusercontent.com/gin-gonic/logo/master/color.png',
			description: 'Gin is a high-performance HTTP web framework written in Golang.',
			codeBase: 'https://github.com/ge0rg3e/speedalyze/tree/main/benchmarks/golang/gin',
			lastUpdated: '2025-04-18',
			benchmarks: {
				latency: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					p50: [1.0034, 1.002, 1.0036, 1.0034, 1.0011],
					p95: [1.0618, 1.04, 1.0626, 1.061, 1.0139]
				},
				throughput: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					rps: [1413.3336048853091, 1413.3336048853091, 1413.3336048853091, 1413.3336048853091, 1413.3336048853091]
				},
				errorRate: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					rate: [0, 0, 0, 0, 0]
				},
				environment: {
					vus: 50,
					duration: '10m',
					endpoints: ['list', 'detail', 'create', 'update', 'delete']
				}
			}
		},

		{
			name: 'Echo',
			url: 'https://echo.labstack.com',
			logo: 'https://avatars.githubusercontent.com/u/2624634?v=4',
			description: 'Echo is a high-performance, extensible, and minimalist web framework for Go.',
			codeBase: 'https://github.com/ge0rg3e/speedalyze/tree/main/benchmarks/golang/echo',
			lastUpdated: '2025-04-18',
			benchmarks: {
				latency: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					p50: [0.5429, 0.5411, 0.5435, 0.5433, 0.5395],
					p95: [0.5706, 0.5676, 0.5715, 0.5717, 0.5642]
				},
				throughput: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					rps: [1764.764909835097, 1764.764909835097, 1764.764909835097, 1764.764909835097, 1764.764909835097]
				},
				errorRate: {
					labels: ['list', 'detail', 'create', 'update', 'delete'],
					rate: [0, 0, 0, 0, 0]
				},
				environment: {
					vus: 50,
					duration: '10m',
					endpoints: ['list', 'detail', 'create', 'update', 'delete']
				}
			}
		}
	]
};

// Helper function to get all frameworks across all languages
export const getAllFrameworks = () => {
	const allFrameworks: any[] = [];

	Object.entries(frameworkData).forEach(([language, frameworks]) => {
		(frameworks as any[]).forEach((framework) => {
			// Calculate metrics from benchmark data
			const avgResponseTime = framework.benchmarks.latency.p50.reduce((acc: number, val: number) => acc + val, 0) / framework.benchmarks.latency.p50.length;
			const maxP95 = Math.max(...framework.benchmarks.latency.p95);
			const avgRPS = framework.benchmarks.throughput.rps.reduce((acc: number, val: number) => acc + val, 0) / framework.benchmarks.throughput.rps.length;

			allFrameworks.push({
				language: language === 'node' ? 'Node.js' : language.charAt(0).toUpperCase() + language.slice(1),
				framework: framework.name,
				benchmarks: framework.benchmarks,
				avgResponseTime,
				maxP95,
				avgRPS,
				logo: framework.logo,
				logoFilter: framework.logoFilter,
				url: framework.url,
				codeBase: framework.codeBase,
				description: framework.description,
				lastUpdated: framework.lastUpdated
			});
		});
	});

	return allFrameworks;
};
