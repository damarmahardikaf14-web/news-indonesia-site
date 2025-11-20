async function fetchFromRSS() {
    // Gunakan proxy pribadi atau disable CORS di browser (chrome://flags/#disable-web-security)
    const rssUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.detik.com/';
    const response = await fetch(rssUrl);
    const data = await response.json();
    return data.items.map(item => ({
        title: item.title,
        description: item.description,
        url: item.link,
        urlToImage: item.enclosure?.link || 'assets/placeholder.jpg',
        source: { name: 'Detik' },
        publishedAt: item.pubDate
    }));
}