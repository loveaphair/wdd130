export async function parseHTML(url) {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
}