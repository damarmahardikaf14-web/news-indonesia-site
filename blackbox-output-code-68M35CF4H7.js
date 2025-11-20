function saveArticle(title, url) {
    let saved = JSON.parse(localStorage.getItem('savedArticles') || '[]');
    if (!saved.find(a => a.url === url)) {
        saved.push({ title, url });
        localStorage.setItem('savedArticles', JSON.stringify(saved));
        alert('Berita disimpan!');
    }
}