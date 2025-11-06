import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export async function validateHTML(url, h) {
    // convert url to a uri for linking
    const uri = encodeURIComponent(url);

    // convert the h document object to string
    if (h instanceof Document) {
        h = new XMLSerializer().serializeToString(h);
    }
    let htmlErrorCount = 0;
    try {
        let url = `https://validator.w3.org/nu/?out=json`;
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/html'
            },
            body: h
        });
        if (response.status !== 200 || !response.ok) {
            throw new Error(`Validation failed with status code ${response.status}`);
        }
        let vResult = await response.json();

        htmlErrorCount = vResult.messages.reduce((count, message) => {
            return message.type === 'error' ? count + 1 : count;
        }, 0);

        // New Section Heading
        const h3 = document.createElement('h3');
        h3.textContent = 'w3.org Validation Report';
        appendToReport(h3);

        // Build line-item
        const fragment = createLineItem({
            label: 'HTML Validation',
            passed: htmlErrorCount === 0,
            standardHtml: `${htmlErrorCount === 0 ? '<p>No HTML validation errors were found. Use the link below to check for warnings or other useful information.</p>' : `Errors Found: ${htmlErrorCount}`} <p>🔗 <a href="https://validator.w3.org/check?verbose=1&uri=${uri}" target="_blank">HTML Validation Report on w3.org</a></p>`
            // The following reports all errors, warnings, and info messages, which may be too verbose and we do want students using the link to see the full report
            // standardHtml: `${htmlErrorCount === 0 ? '<p>No HTML validation errors were found. Use the link below to check for warnings or other useful information.</p>' : `Errors Found: ${htmlErrorCount} <p>${vResult.messages.map(msg => `<p>${msg.message}</p>`).join('')}</p>`} <p>🔗 <a href="https://validator.w3.org/check?verbose=1&uri=${uri}" target="_blank">HTML Validation Report on w3.org</a></p>`
        });

        appendToReport(fragment);

    } catch (error) {
        console.error('validateHTML error:', error);

        // Report the error but don't throw - allow the audit to continue
        const h3 = document.createElement('h3');
        h3.textContent = 'w3.org Validation Report';
        appendToReport(h3);

        const errorFragment = createLineItem({
            label: 'HTML Validation',
            passed: 'review',
            standardHtml: `⚠️ Unable to validate HTML: ${error.message || error}<br><p>🔗 <a href="https://validator.w3.org/check?verbose=1&uri=${uri}" target="_blank">Try manual validation on w3.org</a></p>`
        });
        appendToReport(errorFragment);
    }

}