import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export async function checkHTMLDoc(doc, html) {
    // convert the h document object to string

    try {
        // New Section Heading
        const h3 = document.createElement('h3');
        h3.textContent = 'HTML Document';
        appendToReport(h3);

        // #region doctype check *****************************)
        let doctypeTest = !!(html && doc.doctype && typeof doc.doctype.name === 'string' && doc.doctype.name.toLowerCase() === 'html');

        let fragment = createLineItem({
            label: 'doctype',
            passed: doctypeTest,
            standardHtml: '<p>An HTML5 doctype is required and is the first line of the document.</p>'
        });
        appendToReport(fragment);
        // #endregion doctype check **************************

        // #region <html> tag and lang attribute check *************
        let validHtml = false;
        if (html.includes('<html lang="') && html.includes('</html>') && html.indexOf('<html') < html.indexOf('<head') && html.indexOf('</html>') > html.indexOf('</body>')) {
            validHtml = true;
        }

        const fragment2 = createLineItem({
            label: '&lt;html&gt;',
            passed: validHtml,
            standardHtml: 'An all enclosing <code>&lt;html&gt;</code> element is required and a <code>lang</code> attribute must be applied to the opening <code>&lt;html&gt;</code> tag.'
        });
        appendToReport(fragment2);
        // #endregion <html> tag and lang attribute check **********

        // #region <head> tag check *************
        let validHead = false;
        if (html.includes('<head') && html.includes('</head>') && html.indexOf('<head') > html.indexOf('<html') && html.indexOf('</head>') < html.indexOf('<body')) {
            validHead = true;
        }

        const fragment3 = createLineItem({
            label: '&lt;head&gt;',
            passed: validHead,
            standardHtml: 'An enclosing <code>&lt;head&gt;</code> element (with opening and closing tags) must exist inside the <code>&lt;html&gt;</code> element and must come before the <code>&lt;body&gt;</code> element.'
        });
        appendToReport(fragment3);
        // #endregion <head> tag check **********

        // #region <body> tag check *************

        let validBody = false;
        if (html.includes('<body') && html.includes('</body>') && html.indexOf('<body') > html.indexOf('</head>') && html.indexOf('</body>') < html.indexOf('</html>')) {
            validBody = true;
        }

        const fragment4 = createLineItem({
            label: '&lt;body&gt;',
            passed: validBody,
            standardHtml: 'An enclosing <code>&lt;body&gt;</code> element (with opening and closing tags) must exist inside the <code>&lt;html&gt;</code> element, appear after the <code>&lt;/head&gt;</code>, and before the <code>&lt;/html&gt;</code> closing tag.'
        });
        appendToReport(fragment4);
        // #endregion <body> tag check **********

    } catch (error) {
        message.innerHTML = `Audit Error: HTML document and structure section — ${error}`;
    }
}