import { Fragment } from 'react';

// Sections
import Rankings from './sections/rankings';
import Footer from './sections/footer';
import Hero from './sections/hero';

const Page = () => {
	return (
		<Fragment>
			<Hero />

			<main className="container mx-auto px-4 py-8">
				<Rankings />
			</main>

			<Footer />
		</Fragment>
	);
};

export default Page;
