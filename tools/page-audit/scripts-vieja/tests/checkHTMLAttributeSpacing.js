import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export function checkHTMLAttributeSpacing(html) {
    // Check HTML for spaces around equal signs in attributes (not in attribute values)
    // We need to parse attributes properly to avoid false positives from = signs in values

    let hasSpacingIssue = false;
    const tagRegex = /<([a-zA-Z][^\s>]*)([^>]*)>/g;
    let match;

    while ((match = tagRegex.exec(html)) !== null) {
        const tagName = match[1];
        const attributesString = match[2];

        // Skip if no attributes
        if (!attributesString || !attributesString.trim()) continue;

        // Parse attributes more carefully
        // Match: attribute="value" or attribute='value' or attribute=value
        const attrRegex = /([a-zA-Z\-:]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
        let attrMatch;

        while ((attrMatch = attrRegex.exec(attributesString)) !== null) {
            const attrName = attrMatch[1];
            const spacingAroundEquals = attrMatch[2];

            // Check if there are spaces around the = sign
            // spacingAroundEquals should be exactly '=' with no spaces
            if (spacingAroundEquals !== '=') {
                hasSpacingIssue = true;
                break;
            }
        }

        if (hasSpacingIssue) break;
    }

    let fragment = createLineItem({
        label: 'HTML attribute spacing',
        passed: !hasSpacingIssue,
        standardHtml: '<p>It is best practice to have no spaces around the equal sign in attributes, e.g., <code>&lt;html lang="en-US"&gt;</code></p>'
    });
    appendToReport(fragment);
}