import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export function checkCapitalizedTags(html) {
    const regex = /<\s*\/?\s*[A-Z][^\s>]*\s*[^>]*>/g;

    let fragment = createLineItem({
        label: 'lowercase HTML tags',
        passed: regex.test(html) ? false : true,
        standardHtml: '<p>It is best practice to use lowercase for all HTML tags.</p>'
    });
    appendToReport(fragment);

}