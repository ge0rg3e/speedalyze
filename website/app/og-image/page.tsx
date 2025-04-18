import { getAllFrameworks } from '~/lib/data';
import { BarChart3Icon } from 'lucide-react';
import { Badge } from '~/components/badge';

const Page = () => {
	const topFrameworks = getAllFrameworks()
		.sort((a, b) => a.avgResponseTime - b.avgResponseTime)
		.slice(0, 3);

	return (
		<div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-950 via-purple-900 to-gray-950">
			<div className="max-w-[500px] mx-auto">
				<div className="flex items-center gap-3 mb-4">
					<div className="bg-purple-600 p-2 rounded-xl">
						<BarChart3Icon className="h-6 w-6" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Speedalyze</h1>
				</div>
				<p className="text-xl md:text-2xl text-gray-300 mb-6">Compare web framework performance across languages</p>

				<div className="w-full flex justify-center">
					<div className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl">
						<div className="flex items-center justify-between mb-4">
							<div className="text-lg font-semibold text-purple-300">Top Performers</div>
							<Badge className="bg-purple-600/30 text-purple-300 rounded-full">Latest Data</Badge>
						</div>
						<div className="space-y-4">
							{topFrameworks.map((framework, index) => (
								<div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all">
									<div className="flex items-center gap-3.5">
										<img src={framework.logo} alt={framework.framework} className="w-[24px] h-auto select-none" style={{ filter: framework.logoFilter ?? 'none' }} />
										<div>
											<div className="font-medium">{framework.framework}</div>
											<div className="text-xs text-gray-400">{framework.language}</div>
										</div>
									</div>
									<div className="text-right">
										<div className="font-mono text-emerald-400">{framework.avgResponseTime.toFixed(1)}ms</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;
