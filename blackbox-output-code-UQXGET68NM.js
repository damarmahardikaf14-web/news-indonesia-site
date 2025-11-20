const apiKey = 'YOUR_API_KEY_HERE'; // Ganti dengan API key NewsAPI Anda
let currentCategory = '';
let currentPage = 1;
let totalPages = 1;

function toggleTheme() {
    const body = document.body;
    const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

async function fetchFromAPI(category = '', query = '', page = 1, date = '', source = '', author = '') {
    let url = `https://newsapi.org/v2/top-headlines?country=id&pageSize=12&page=${page}&apiKey=${apiKey}`;
    if (category) url += `&category=${category}`;
    if (query) url += `&q=${query}`;
    if (date) url += `&from=${date}&to=${date}`;
    if (source) url += `&sources=${source}`;
    if (author) url += `&q=${query} author:${author}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('API gagal');
    const data = await response.json();
    totalPages = Math.ceil(data.totalResults / 12);
    return data.articles;
}

async function fetchFromRSS() {
    const rssUrl = 'https://cors-anywhere.herokuapp.com/https://rss.detik.com/';
    const response = await fetch(rssUrl);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const items = xml.querySelectorAll('item');
    return Array.from(items).slice(0, 12).map(item => ({
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        url: item.querySelector('link').textContent,
        urlToImage: 'assets/placeholder.jpg',
        source: { name: 'Detik' },
        publishedAt: new Date().toISOString()
    }));
}

async function fetchNews(category = '', query = '', page = 1, date = '', source = '', author = '') {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('news-container').innerHTML = '';
    try {
        let articles = await fetchFromAPI(category, query, page, date, source, author);
        if (!articles || articles.length === 0) articles = await fetchFromRSS();
        displayNews(articles);
        updatePagination(page);
    } catch (error) {
        console.error(error);
        const articles = await fetchFromRSS();
        displayNews(articles);
    }
    document.getElementById('loading').style.display = 'none';
}

function displayNews(articles) {
    const container = document.getElementById('news-container');
    const sourceFilter = document.getElementById('source-filter').value.toLowerCase();
    const authorFilter = document.getElementById('author-filter').value.toLowerCase();
    const filteredArticles = articles.filter(article => {
        const matchesSource = !sourceFilter || article.source.name.toLowerCase().includes(sourceFilter);
        const matchesAuthor = !authorFilter || (article.author && article.author.toLowerCase().includes(authorFilter));
        return matchesSource && matchesAuthor;
    });
    filteredArticles.forEach(article => {
        let videoHtml = '';
        const text = (article.description || '') + (article.title || '');
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
        const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/(\d+)/;
        const igRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/reel\/([^\/]+)/;
        const youtubeMatch = text.match(youtubeRegex);
        const vimeoMatch = text.match(vimeoRegex);
        const tiktokMatch = text.match(tiktokRegex);
        const igMatch = text.match(igRegex);
        if (youtubeMatch) videoHtml = `<div class="video-embed"><iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        else if (vimeoMatch) videoHtml = `<div class="video-embed"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        else if (tiktokMatch) videoHtml = `<div class="video-embed"><iframe src="https://www.tiktok.com/embed/${tiktokMatch[1]}" frameborder="0" allowfullscreen></iframe></div>`;
        else if (igMatch) videoHtml = `<div class="video-embed"><iframe src="https://www.instagram.com/reel/${igMatch[1]}/embed" frameborder="0" allowfullscreen></iframe></div>`;
        const item = document.createElement('div');
        item.className = 'news-item';
        item.innerHTML = `
            <img src="${article.urlToImage || 'assets/placeholder.jpg'}" alt="Berita">
            <h5>${article.title}</h5>
            <p>${article.description || 'Deskripsi tidak tersedia.'}</p>
            ${videoHtml}
            <small>Sumber: ${article.source.name} | Tanggal: ${new Date(article.publishedAt).toLocaleDateString('id-ID')}</small><br>
            <a href="${article.url}" target="_blank">Baca Selengkapnya</a>
        `;
        container.appendChild(item);
    });
    if (Notification.permission === 'granted' && filteredArticles.length > 0) {
        new Notification('Berita Baru!', { body: `Ada ${filteredArticles.length} berita terbaru.` });
    }
}

function updatePagination(page) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (page > 1) pagination.innerHTML += `<button onclick="changePage(${page - 1})">Sebelumnya</button>`;
    pagination.innerHTML += `<span>Halaman ${page} dari ${totalPages}</span>`;
    if (page < totalPages) pagination.innerHTML += `<button onclick="changePage(${page + 1})">Selanjutnya</button>`;
}

function changePage(page) { currentPage = page; fetchNews(currentCategory, document.getElementById('search').value, page, document.getElementById('date-filter').value, document.getElementById('source-filter').value, document.getElementById('author-filter').value); }
function loadCategory(category) { currentCategory = category; currentPage = 1; fetchNews(category); }
function searchNews() { document.getElementById('date-filter').value = ''; document.getElementById('source-filter').value = ''; document.getElementById('author-filter').value = ''; const query = document.getElementById('search').value; currentPage = 1; fetchNews(currentCategory, query); }
function applyAdvancedFilters() { const source = document.getElementById('source-filter').value; const author = document.getElementById('author-filter').value; const date = document.getElementById('date-filter').value; const query = document.getElementById('search').value; currentPage = 1; fetchNews(currentCategory, query, 1, date, source, author); }
function addComment() { const input = document.getElementById('comment-input'); const list = document.getElementById('comments-list'); if (input.value.trim()) { const comment = document.createElement('div'); comment.className = 'comment'; comment.textContent = input.value; list.appendChild(comment); localStorage.setItem('comments', list.innerHTML); input.value = ''; } }

window.onload = () => { fetchNews(); const savedComments = localStorage.getItem('comments'); if (savedComments) document.getElementById('comments-list').innerHTML = savedComments; };