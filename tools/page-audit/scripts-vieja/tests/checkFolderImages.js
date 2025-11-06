// Check for images subfolder

import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export async function checkFolderImages(username, course, subdir ='') {
    // if (!username || typeof username !== 'string') return false; 
    const apiUrl = `https://api.github.com/repos/${encodeURIComponent(username)}/${course}/contents/${subdir}/images`;
    // Direct GitHub URL for human-friendly viewing
    const encodedSubdir = (subdir || '').split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const pathPart = encodedSubdir ? `${encodedSubdir}/images` : 'images';
    const directUrl = `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(course)}/tree/main/${pathPart}`;
    try {
        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        // New Section Heading
        const h3 = document.createElement('h3');
        h3.textContent = 'Naming Conventions';
        appendToReport(h3);

        // Build line-item
        const fragment = createLineItem({
            label: 'images Folder',
            passed: res.ok,
            standardHtml: `A subfolder named <strong>images</strong> is required.`
            // standardHtml: `A subfolder named <strong>images</strong> is required. <br>View on GitHub: <a href="${directUrl}" target="_blank" rel="noopener">${directUrl}</a>`
        });

        appendToReport(fragment);
    } catch (err) {
        message.innerHTML = `Audit Error: Folder Naming Conventions section — ${err}`;
        message.style.display = "block";
    }
}