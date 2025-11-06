// This function displays the page and GitHub repo links for convenience
export function displayGitHubLinks(url, course) {

    const links = document.createElement("div");
    links.className = "callout url";

    // extract username from a full URL safely
    let username = 'username';
    try {
        const u = new URL(url);
        const host = u.hostname.toLowerCase();
        const match = host.match(/^([^.]+)\.github\.io$/);
        if (match) username = match[1];
    } catch (err) {
        // fallback: try to find a username in the string if URL parsing fails
        const match = url.match(/\/\/([^./]+)\.github\.io/i);
        if (match) username = match[1];
    }

    const repoUrl = `https://github.com/${username}/${course}`;

    links.innerHTML = `
  <span> Page Link:</span>
  <span>🔗 <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></span>
  <span>GitHub Repo Link:</span>
  <span>🔗 <a href="${repoUrl}" target="_blank" rel="noopener noreferrer">${repoUrl}</a></span>`;
    report.appendChild(links);
}