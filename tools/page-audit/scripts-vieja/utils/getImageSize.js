export async function getImageSize(imageUrl) {
    const response = await fetch(imageUrl);
    const size = parseInt(response.headers.get('content-length')) / 1024;
    return size;
}

export async function getAllImageSizes(phtml, url) {
    const imgElements = phtml.querySelectorAll('img');
    const imageSizes = [];

    for (const img of imgElements) {
        const size = await getImageSize(`${url}${img.src}`);
        imageSizes.push({ src: img.src, size });
    }

    return imageSizes;
}