function shareArticle(title, url) {
    if (navigator.share) {
        navigator.share({ title, url });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
    }
}