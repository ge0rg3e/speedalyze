import * as screenshotone from 'screenshotone-api-sdk';

const cache: {
	image: Buffer | null;
	timestamp: number;
} = {
	image: null,
	timestamp: 0
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const GET = async () => {
	try {
		const now = Date.now();

		if (cache.image && now - cache.timestamp < CACHE_DURATION) {
			return new Response(cache.image, {
				headers: {
					'Content-Type': 'image/jpeg',
					'X-Cache': 'HIT'
				}
			});
		}

		const baseUrl = `${process.env.NEXT_PUBLIC_VERCEL_URL}/og-image` || 'http://localhost:3000/og-image';

		const client = new screenshotone.Client(process.env.SCREENSHOTONE_ACCESS_KEY as string, process.env.SCREENSHOTONE_SECRET_KEY as string);

		const options = screenshotone.TakeOptions.url(baseUrl).delay(3).imageQuality(80).viewportWidth(1200).viewportHeight(630).format('jpg');

		const imageBlob = await client.take(options);
		const buffer = Buffer.from(await imageBlob.arrayBuffer());

		cache.image = buffer;
		cache.timestamp = now;

		return new Response(buffer, {
			headers: {
				'Content-Type': 'image/jpeg',
				'X-Cache': 'MISS'
			}
		});
	} catch (error) {
		return new Response('Failed to generate OG image.', { status: 500 });
	}
};
