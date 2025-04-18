const Footer = () => {
	return (
		<footer className="bg-gray-900 border-t border-gray-800 mt-12">
			<div className="container mx-auto flex justify-between items-center py-4">
				<p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Speedalyze.</p>

				<p className="text-muted-foreground text-sm">
					Created with <span className="text-red-500">❤️</span> by{' '}
					<a href="https://x.com/ge0rg3e_dev" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors font-bold">
						Ge0rg3e
					</a>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
