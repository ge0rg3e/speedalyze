import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ChartOptions, ScriptableContext } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface BenchmarkData {
	latency: {
		labels: string[];
		p50: number[];
		p95: number[];
	};
	throughput: {
		labels: string[];
		rps: number[];
	};
	errorRate: {
		labels: string[];
		rate: number[];
	};
}

interface BenchmarkChartsProps {
	data: BenchmarkData;
}

const lineChartOptions: ChartOptions<'line'> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'top',
			labels: {
				color: '#E5E7EB',
				font: {
					size: 12
				},
				padding: 20
			}
		},
		tooltip: {
			backgroundColor: 'rgba(17, 24, 39, 0.9)',
			titleColor: '#E5E7EB',
			bodyColor: '#E5E7EB',
			borderColor: 'rgba(75, 85, 99, 0.5)',
			borderWidth: 1,
			padding: 12,
			displayColors: true,
			callbacks: {
				label: function (context) {
					let label = context.dataset.label || '';
					if (label) {
						label += ': ';
					}
					if (context.parsed.y !== null) {
						label += context.parsed.y.toFixed(2) + ' ms';
					}
					return label;
				}
			}
		}
	},
	scales: {
		y: {
			grid: {
				color: 'rgba(75, 85, 99, 0.2)',
				display: false
			},
			ticks: {
				color: '#9CA3AF',
				font: {
					size: 11
				},
				padding: 8
			}
		},
		x: {
			grid: {
				color: 'rgba(75, 85, 99, 0.2)',
				display: false
			},
			ticks: {
				color: '#9CA3AF',
				font: {
					size: 11
				},
				padding: 8
			}
		}
	}
};

const barChartOptions: ChartOptions<'bar'> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'top',
			labels: {
				color: '#E5E7EB',
				font: {
					size: 12
				},
				padding: 20
			}
		},
		tooltip: {
			backgroundColor: 'rgba(17, 24, 39, 0.9)',
			titleColor: '#E5E7EB',
			bodyColor: '#E5E7EB',
			borderColor: 'rgba(75, 85, 99, 0.5)',
			borderWidth: 1,
			padding: 12,
			displayColors: true,
			callbacks: {
				label: function (context) {
					let label = context.dataset.label || '';
					if (label) {
						label += ': ';
					}
					if (context.parsed.y !== null) {
						label += context.parsed.y.toFixed(2);
						if (label.includes('Throughput')) {
							label += ' rps';
						} else if (label.includes('Error Rate')) {
							label += ' %';
						}
					}
					return label;
				}
			}
		}
	},
	scales: {
		y: {
			grid: {
				color: 'rgba(75, 85, 99, 0.2)',
				display: false
			},
			ticks: {
				color: '#9CA3AF',
				font: {
					size: 11
				},
				padding: 8
			}
		},
		x: {
			grid: {
				color: 'rgba(75, 85, 99, 0.2)',
				display: false
			},
			ticks: {
				color: '#9CA3AF',
				font: {
					size: 11
				},
				padding: 8
			}
		}
	}
};

export const BenchmarkCharts = ({ data }: BenchmarkChartsProps) => {
	const latencyData = {
		labels: data.latency.labels,
		datasets: [
			{
				label: 'P50 Latency',
				data: data.latency.p50,
				borderColor: 'rgb(167, 139, 250)',
				backgroundColor: 'rgba(167, 139, 250, 0.1)',
				tension: 0.3,
				borderWidth: 2,
				pointRadius: 4,
				pointHoverRadius: 6,
				pointBackgroundColor: 'rgb(167, 139, 250)',
				pointBorderColor: '#fff',
				pointBorderWidth: 2
			},
			{
				label: 'P95 Latency',
				data: data.latency.p95,
				borderColor: 'rgb(74, 222, 128)',
				backgroundColor: 'rgba(74, 222, 128, 0.1)',
				tension: 0.3,
				borderWidth: 2,
				pointRadius: 4,
				pointHoverRadius: 6,
				pointBackgroundColor: 'rgb(74, 222, 128)',
				pointBorderColor: '#fff',
				pointBorderWidth: 2
			}
		]
	};

	const throughputData = {
		labels: data.throughput.labels,
		datasets: [
			{
				label: 'Requests per Second',
				data: data.throughput.rps,
				backgroundColor: 'rgba(99, 102, 241, 0.7)',
				borderColor: 'rgb(99, 102, 241)',
				borderWidth: 1,
				borderRadius: 4,
				barThickness: 20
			}
		]
	};

	const errorRateData = {
		labels: data.errorRate.labels,
		datasets: [
			{
				label: 'Error Rate',
				data: data.errorRate.rate,
				backgroundColor: 'rgba(239, 68, 68, 0.7)',
				borderColor: 'rgb(239, 68, 68)',
				borderWidth: 1,
				borderRadius: 4,
				barThickness: 20
			}
		]
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
				<h3 className="text-sm font-medium text-gray-300 mb-4">Latency</h3>
				<div className="h-64">
					<Line data={latencyData} options={lineChartOptions} />
				</div>
			</div>
			<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
				<h3 className="text-sm font-medium text-gray-300 mb-4">Throughput</h3>
				<div className="h-64">
					<Bar data={throughputData} options={barChartOptions} />
				</div>
			</div>
			<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
				<h3 className="text-sm font-medium text-gray-300 mb-4">Error Rate</h3>
				<div className="h-64">
					<Bar data={errorRateData} options={barChartOptions} />
				</div>
			</div>
		</div>
	);
};
