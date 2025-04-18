'use client';

import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, GithubIcon, GlobeIcon, SearchIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/card';
import { Fragment, useEffect, useState } from 'react';
import { getAllFrameworks } from '../lib/data';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { BenchmarkCharts } from '../components/benchmark-charts';

const Rankings = () => {
	const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'avgResponseTime', direction: 'asc' });
	const [selectedLanguage, setSelectedLanguage] = useState<string | 'all'>('all');
	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
	const [allFrameworks, setAllFrameworks] = useState<any[]>([]);
	const languages = ['all', ...new Set(allFrameworks.map((framework) => framework.language))];
	const [searchQuery, setSearchQuery] = useState('');

	// Initialize frameworks, auto-expand, and scroll to framework from query parameter
	useEffect(() => {
		const frameworks = getAllFrameworks();
		setAllFrameworks(frameworks);

		// Parse URL query parameter
		const params = new URLSearchParams(window.location.search);
		const frameworkQuery = params.get('framework');

		if (frameworkQuery) {
			// Find the framework (case-insensitive)
			const targetFramework = frameworks.find((f) => f.framework.toLowerCase() === frameworkQuery.toLowerCase());
			if (targetFramework) {
				const rowId = `${targetFramework.framework}-${targetFramework.language}`;
				setExpandedRows((prev) => ({
					...prev,
					[rowId]: true
				}));
				// Scroll to the framework after a slight delay to ensure DOM is rendered
				setTimeout(() => {
					const element = document.getElementById(rowId);
					if (element) {
						element.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}
				}, 0);
			}
		}
	}, []);

	const sortedFrameworks = [...allFrameworks].sort((a, b) => {
		if (a[sortConfig.key] < b[sortConfig.key]) {
			return sortConfig.direction === 'asc' ? -1 : 1;
		}
		if (a[sortConfig.key] > b[sortConfig.key]) {
			return sortConfig.direction === 'asc' ? 1 : -1;
		}
		return 0;
	});

	const filteredFrameworks = sortedFrameworks.filter((framework) => {
		const matchesSearch =
			!searchQuery ||
			framework.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
			framework.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
			framework.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesLanguage = selectedLanguage === 'all' || framework.language === selectedLanguage;
		return matchesSearch && matchesLanguage;
	});

	const requestSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'desc';
		if (sortConfig.key === key && sortConfig.direction === 'desc') {
			direction = 'asc';
		}
		setSortConfig({ key, direction });
	};

	const getSortIndicator = (key: string) => {
		if (sortConfig.key !== key) return null;
		return sortConfig.direction === 'asc' ? '↑' : '↓';
	};

	const toggleRowExpansion = (id: string) => {
		setExpandedRows((prev) => ({
			...prev,
			[id]: !prev[id]
		}));
	};

	return (
		<Fragment>
			{/* Quick Language & Operation Selector */}
			<div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 mb-8 shadow-lg">
				<div className="flex flex-col gap-4">
					<div className="flex flex-wrap gap-2 justify-center">
						{languages.map((lang) => (
							<Button
								key={lang}
								variant="outline"
								className={`rounded-xl text-sm px-3 py-1 sm:px-4 sm:py-2 ${selectedLanguage === lang ? '!bg-purple-600/30 border-purple-500 !text-purple-300' : ''}`}
								onClick={() => setSelectedLanguage(lang)}
							>
								{lang === 'all' ? 'All Languages' : lang}
							</Button>
						))}
					</div>
					<div className="relative w-full max-w-md mx-auto">
						<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="Search frameworks..."
							className="pl-9 bg-gray-800 border-gray-700 rounded-xl text-sm h-10 w-full focus:border-purple-500 focus:ring-purple-500/20"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Global Rankings View */}
			<Card className="bg-gray-900 border-gray-800 rounded-2xl overflow-hidden shadow-lg mb-8">
				<CardHeader className="border-b border-gray-800 bg-gray-900/80">
					<CardTitle className="text-xl sm:text-2xl flex items-center">
						<GlobeIcon className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-purple-400" />
						Framework Rankings
					</CardTitle>
					<CardDescription className="text-gray-400 text-sm sm:text-base">
						{selectedLanguage === 'all' ? 'Compare all frameworks across all languages' : `Showing frameworks for ${selectedLanguage}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Desktop Table */}
					<div className="hidden sm:block overflow-x-auto">
						<Table>
							<TableHeader className="!bg-gray-900/80 sticky top-0 z-10">
								<TableRow className="hover:bg-gray-800/30">
									<TableHead className="w-[50px] text-sm">#</TableHead>
									<TableHead className="text-sm">Framework</TableHead>
									<TableHead className="text-sm">Language</TableHead>
									<TableHead className="cursor-pointer hover:text-purple-300 text-sm" onClick={() => requestSort('avgResponseTime')}>
										<span title="Average Response Time">Avg RT</span> {getSortIndicator('avgResponseTime')}
									</TableHead>
									<TableHead className="cursor-pointer hover:text-purple-300 text-sm" onClick={() => requestSort('maxP95')}>
										<span title="Maximum P95 Latency">Max P95</span> {getSortIndicator('maxP95')}
									</TableHead>
									<TableHead className="cursor-pointer hover:text-purple-300 text-sm" onClick={() => requestSort('avgRPS')}>
										<span title="Average Requests Per Second">Avg RPS</span> {getSortIndicator('avgRPS')}
									</TableHead>
									<TableHead className="w-[60px] text-sm">Details</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredFrameworks.map((framework, index) => {
									const rowId = `${framework.framework}-${framework.language}`;
									const isExpanded = expandedRows[rowId] || false;

									return (
										<Fragment key={rowId}>
											<TableRow
												id={rowId} // Added ID for scrolling
												className="border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer"
												onClick={() => toggleRowExpansion(rowId)}
											>
												<TableCell className="font-medium text-sm">{index + 1}</TableCell>
												<TableCell>
													<div className="flex items-center gap-x-2">
														<img src={framework.logo} alt={framework.framework} className="w-5 h-auto select-none" style={{ filter: framework.logoFilter ?? 'none' }} />
														<a href={framework.url} target="_blank" className="hover:text-purple-300 flex items-center text-sm">
															{framework.framework}
															<ExternalLinkIcon className="h-3 w-3 ml-1 opacity-50" />
														</a>
													</div>
												</TableCell>
												<TableCell className="text-sm">{framework.language}</TableCell>
												<TableCell className="font-mono text-emerald-400 text-sm">{framework.avgResponseTime.toFixed(1)} ms</TableCell>
												<TableCell className="font-mono text-emerald-400 text-sm">{framework.maxP95.toFixed(1)} ms</TableCell>
												<TableCell className="font-mono text-emerald-400 text-sm">{framework.avgRPS.toFixed(0)} rps</TableCell>
												<TableCell>
													<Button variant="ghost" size="sm" className="rounded-full p-0 h-8 w-8">
														{isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
													</Button>
												</TableCell>
											</TableRow>

											{isExpanded && (
												<TableRow className="!bg-gray-800/20 border-b border-gray-800">
													<TableCell colSpan={7} className="p-0">
														<div className="p-4">
															<div className="flex flex-col gap-4">
																<div>
																	<div className="flex items-center justify-between mb-2">
																		<h3 className="text-base sm:text-lg font-medium">{framework.framework}</h3>
																		<a href={framework.codeBase} target="_blank" className="flex items-center gap-2 text-gray-400 hover:text-purple-300">
																			<GithubIcon className="h-4 w-4" />
																			<span className="text-sm">View Code</span>
																		</a>
																	</div>
																	<p className="text-gray-400 text-sm mb-2">{framework.description}</p>
																	<p className="mb-2 text-purple-300 text-sm">Updated at {framework.lastUpdated}</p>

																	{/* Statistics Section */}
																	<div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
																		<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
																			<h4 className="text-sm font-medium text-gray-300 mb-2">Environment</h4>
																			<div className="space-y-2">
																				<div>
																					<div className="text-gray-400 text-xs">Virtual Users</div>
																					<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.vus} VUs</div>
																				</div>
																				<div>
																					<div className="text-gray-400 text-xs">Duration</div>
																					<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.duration}</div>
																				</div>
																				<div>
																					<div className="text-gray-400 text-xs">Endpoints</div>
																					<div className="font-mono text-purple-400 text-sm">{framework.benchmarks.environment.endpoints.length}</div>
																				</div>
																			</div>
																		</div>
																		<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
																			<h4 className="text-sm font-medium text-gray-300 mb-2">Latency</h4>
																			<div className="space-y-2">
																				<div>
																					<div className="text-gray-400 text-xs">Average P50</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{(
																							framework.benchmarks.latency.p50.reduce((a: number, b: number) => a + b, 0) /
																							framework.benchmarks.latency.p50.length
																						).toFixed(2)}{' '}
																						ms
																					</div>
																				</div>
																				<div>
																					<div className="text-gray-400 text-xs">Worst P95</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{Math.max(...framework.benchmarks.latency.p95).toFixed(2)} ms
																					</div>
																				</div>
																			</div>
																		</div>
																		<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
																			<h4 className="text-sm font-medium text-gray-300 mb-2">Throughput</h4>
																			<div className="space-y-2">
																				<div>
																					<div className="text-gray-400 text-xs">Average RPS</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{(
																							framework.benchmarks.throughput.rps.reduce((a: number, b: number) => a + b, 0) /
																							framework.benchmarks.throughput.rps.length
																						).toFixed(0)}{' '}
																						rps
																					</div>
																				</div>
																				<div>
																					<div className="text-gray-400 text-xs">Total Requests</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{(framework.benchmarks.throughput.rps[0] * 600).toFixed(0)} / 10m
																					</div>
																				</div>
																			</div>
																		</div>
																		<div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
																			<h4 className="text-sm font-medium text-gray-300 mb-2">Error Rate</h4>
																			<div className="space-y-2">
																				<div>
																					<div className="text-gray-400 text-xs">Average</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{(
																							framework.benchmarks.errorRate.rate.reduce((a: number, b: number) => a + b, 0) /
																							framework.benchmarks.errorRate.rate.length
																						).toFixed(2)}
																						%
																					</div>
																				</div>
																				<div>
																					<div className="text-gray-400 text-xs">Max</div>
																					<div className="font-mono text-emerald-400 text-sm">
																						{Math.max(...framework.benchmarks.errorRate.rate).toFixed(2)}%
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>

																	<div className="mt-6">
																		<h4 className="text-sm font-medium text-gray-300 mb-4">Performance Metrics</h4>
																		<BenchmarkCharts data={framework.benchmarks} />
																	</div>
																</div>
															</div>
														</div>
													</TableCell>
												</TableRow>
											)}
										</Fragment>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card Layout */}
					<div className="block sm:hidden space-y-4">
						{filteredFrameworks.map((framework, index) => {
							const rowId = `${framework.framework}-${framework.language}`;
							const isExpanded = expandedRows[rowId] || false;

							return (
								<Card id={rowId} key={rowId} className="bg-gray-800 border-gray-700">
									<CardContent className="p-4">
										<div className="flex justify-between items-center mb-2">
											<div className="flex items-center gap-2">
												<span className="font-medium text-sm">#{index + 1}</span>
												<img src={framework.logo} alt={framework.framework} className="w-5 h-auto select-none" style={{ filter: framework.logoFilter ?? 'none' }} />
												<a href={framework.url} target="_blank" className="hover:text-purple-300 text-sm">
													{framework.framework}
												</a>
											</div>
											<Button variant="ghost" size="sm" className="rounded-full p-0 h-8 w-8" onClick={() => toggleRowExpansion(rowId)}>
												{isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
											</Button>
										</div>
										<div className="text-sm text-gray-400 mb-2">Language: {framework.language}</div>
										<div className="grid grid-cols-2 gap-4 mb-4">
											<div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
												<h4 className="text-sm font-medium text-gray-300 mb-2">Environment</h4>
												<div className="space-y-2">
													<div>
														<div className="text-gray-400 text-xs">Virtual Users</div>
														<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.vus} VUs</div>
													</div>
													<div>
														<div className="text-gray-400 text-xs">Duration</div>
														<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.duration}</div>
													</div>
													<div>
														<div className="text-gray-400 text-xs">Endpoints</div>
														<div className="font-mono text-purple-400 text-sm">{framework.benchmarks.environment.endpoints.length}</div>
													</div>
												</div>
											</div>
											<div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
												<h4 className="text-sm font-medium text-gray-300 mb-2">Latency</h4>
												<div className="space-y-2">
													<div>
														<div className="text-gray-400 text-xs">Average P50</div>
														<div className="font-mono text-emerald-400 text-sm">
															{(framework.benchmarks.latency.p50.reduce((a: number, b: number) => a + b, 0) / framework.benchmarks.latency.p50.length).toFixed(2)} ms
														</div>
													</div>
													<div>
														<div className="text-gray-400 text-xs">Worst P95</div>
														<div className="font-mono text-emerald-400 text-sm">{Math.max(...framework.benchmarks.latency.p95).toFixed(2)} ms</div>
													</div>
												</div>
											</div>
										</div>

										{isExpanded && (
											<div className="mt-4">
												<div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 mb-4">
													<h4 className="text-sm font-medium text-gray-300 mb-2">Environment</h4>
													<div className="grid grid-cols-3 gap-2">
														<div>
															<div className="text-gray-400 text-xs">VUs</div>
															<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.vus}</div>
														</div>
														<div>
															<div className="text-gray-400 text-xs">Duration</div>
															<div className="font-mono text-emerald-400 text-sm">{framework.benchmarks.environment.duration}</div>
														</div>
														<div>
															<div className="text-gray-400 text-xs">Endpoints</div>
															<div className="font-mono text-purple-400 text-sm">{framework.benchmarks.environment.endpoints.length}</div>
														</div>
													</div>
												</div>

												<div>
													<p className="text-gray-400 text-sm mb-2">{framework.description}</p>
													<p className="mb-4 text-purple-300 text-sm">Updated at {framework.lastUpdated}</p>

													<h4 className="text-sm font-medium text-gray-300 mb-4">Performance Metrics</h4>
													<BenchmarkCharts data={framework.benchmarks} />
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</Fragment>
	);
};

export default Rankings;
