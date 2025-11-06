export async function plainHTML(url) {
    const response = await fetch(url);
    const html = await response.text();
    return html;
}