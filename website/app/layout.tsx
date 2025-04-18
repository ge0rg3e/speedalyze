import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	metadataBase: new URL('https://speedalyze.ge0rg3e.rest'),
	title: 'Speedalyze',
	description: 'Compare web framework performance across languages',
	icons: {
		icon: '/logo.svg'
	},
	openGraph: {
		title: 'Speedalyze',
		description: 'Compare web framework performance across languages',
		type: 'website',
		url: 'https://speedalyze.ge0rg3e.rest',
		siteName: 'Speedalyze',
		images: [
			{
				url: '/api/get-og-image',
				width: 1200,
				height: 630,
				alt: 'Speedalyze - Web Framework Performance Comparison'
			}
		]
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Speedalyze',
		description: 'Compare web framework performance across languages',
		images: ['/api/get-og-image']
	}
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
	return (
		<html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
			<body className={`antialiased ${inter.className}`}>{children}</body>
		</html>
	);
};

export default RootLayout;
