import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export function checkFileNamingConventions(html) {
    // html is in the form of a #document object
    // We need to convert it to string for regex processing
    const htmlString = new XMLSerializer().serializeToString(html);
    try {
        const regex = /(src|href|data)="([^"]+)"/g; // look for src, href, or data attributes
        let badFileList = '';
        let match;

        // Helper: normalize and extract just the filename (no query/hash)
        const getFilename = (path) => {
            if (!path) return '';
            const noHash = path.split('#')[0];
            const noQuery = noHash.split('?')[0];
            const lastSlash = noQuery.lastIndexOf('/');
            return lastSlash >= 0 ? noQuery.substring(lastSlash + 1) : noQuery;
        };

        // Common non-semantic patterns (camera/screenshot/default exports)
        const genericNamePatterns = [
            /^img[_-]?\d+$/i,
            /^image[_-]?\d+$/i,
            /^photo[_-]?\d+$/i,
            /^pic[_-]?\d+$/i,
            /^dsc[_-]?\d+$/i,
            /^pxl[_-]?\d+$/i,
            /^screenshot(\s*\d{4}-?\d{2}-?\d{2}.*)?$/i,
            /^untitled.*$/i,
            /^new-?document.*$/i,
            /^scan[_-]?\d+$/i
        ];

        // Skip duplicate reports for the exact same file within the same page
        const seen = new Set();

        while ((match = regex.exec(htmlString)) !== null) {
            const rawPath = match[2];
            // Skip external and non-file schemes
            if (/^(https?:)?\/\//i.test(rawPath)) continue;
            if (/^(data:|mailto:|tel:|javascript:)/i.test(rawPath)) continue;

            const file = getFilename(rawPath);
            if (!file || file.endsWith('/')) continue; // directory or empty
            if (seen.has(file)) continue; // avoid duplicate reports per filename
            seen.add(file);

            const base = file.includes('.') ? file.substring(0, file.lastIndexOf('.')) : file;
            const ext = file.includes('.') ? file.substring(file.lastIndexOf('.') + 1) : '';

            // Uppercase characters
            if (file !== file.toLocaleLowerCase()) {
                badFileList += `🅰️ ${file} &ndash; Uppercase letters found (use lowercase)<br>`;
            }

            // Spaces or encoded spaces
            if (file.includes(' ') || /%20/i.test(file)) {
                badFileList += `🚀 ${file} &ndash; Spaces found (use hyphens)<br>`;
            }

            // Invalid/special characters (allow a-z 0-9 . - _ only)
            if (/[^a-z0-9.\-_]/i.test(file)) {
                badFileList += `❓ ${file} &ndash; Contains special characters (allowed: a-z, 0-9, hyphen, period)<br>`;
            }

            // Multiple sequential separators
            if (/--|__|\.\./.test(file)) {
                badFileList += `➖ ${file} &ndash; Repeated separators found ("--", "__", or "..")<br>`;
            }

            // Very long names (hard to read and maintain)
            if (file.length > 30) {
                badFileList += `🀄 ${file} &ndash; File name is very long (length > 30)<br>`;
            }

            // Names that are too short to be descriptive
            if (base.length > 0 && base.length < 3) {
                badFileList += `� ${file} &ndash; Name too short to be descriptive<br>`;
            }

            // Numeric-only (not descriptive)
            if (/^\d+$/.test(base)) {
                badFileList += `🔢 ${file} &ndash; Numeric-only name (not descriptive)<br>`;
            }

            // Generic camera/screenshot/default export patterns
            if (genericNamePatterns.some((re) => re.test(base))) {
                badFileList += `🖼️ ${file} &ndash; Generic camera/screenshot name (use descriptive words)<br>`;
            }

        }

        // Build line-item
        const fragment = createLineItem({
            label: 'Files',
            passed: badFileList === '',
            standardHtml: `${badFileList === '' ? '<p>All file names follow the course\'s naming conventions.</p>' : `<p>The following are instances of the course's naming convention issues:</p><div class="naming-issues">${badFileList}</div>`}`
        });

        appendToReport(fragment);

    }
    catch (error) {
        message.innerHTML = `Audit Error: File Naming Conventions section — ${error}`;
    }
}