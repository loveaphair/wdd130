import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';

export function checkHeadContent(html, course, week) {
    try {
        // New Section Heading
        const h3 = document.createElement('h3');
        h3.innerHTML = '&lt;head&gt; Elements';
        appendToReport(h3);

        // #region Check Meta Charset *****************************
        // Check for meta charset with flexible matching
        const metaCharsetRegex = /<meta\s+charset=["'](utf-8|UTF-8|utf8)["']\s*\/?>/i;
        const metaCharsetPassed = metaCharsetRegex.test(html);

        // Check if self-closing syntax is used (/) 
        const hasSelfClosing = /<meta\s+charset=["'](utf-8|UTF-8|utf8)["']\s*\/>/i.test(html);

        const metaCharsetItem = createLineItem({
            label: 'Meta Charset',
            passed: metaCharsetPassed,
            standardHtml: `The meta charset attribute must be properly declared.<br> <code>&lt;meta charset="UTF-8"&gt;</code>${hasSelfClosing ? '<br><div class="warningnote">⚠️ <strong>Note:</strong> It is unnecessary to self-close void elements like <code>&lt;meta&gt;</code> with <code>/&gt;</code> in HTML5. Void elements like meta tags do not have closing tags. The trailing slash is not required, has no effect, and interacts badly with unquoted attribute values: <code>&lt;meta charset="UTF-8"&gt;</code></div>' : ''}`
        });
        appendToReport(metaCharsetItem);
        // #endregion Check Meta Charset **************************

        // #region Check Meta Viewport *****************************
        // Check for meta viewport with flexible matching
        const metaViewportRegex = /<meta\s+name=["']viewport["']\s+content=["']width=device-width,?\s*initial-scale=1(\.0)?["']\s*\/?>/i;
        const metaViewportPassed = metaViewportRegex.test(html);

        // Check if self-closing syntax is used (/)
        const hasViewportSelfClosing = /<meta\s+name=["']viewport["']\s+content=["'][^"']*["']\s*\/>/i.test(html);

        const metaViewportItem = createLineItem({
            label: 'Meta Viewport',
            passed: metaViewportPassed,
            standardHtml: `The meta viewport attribute must be properly declared.<br> <code>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</code>${hasViewportSelfClosing ? '<br><div class="warningnote">⚠️ <strong>Note:</strong> It is unnecessary to self-close void elements like <code>&lt;meta&gt;</code> with <code>/&gt;</code> in HTML5. Void elements do not have closing tags and the trailing slash is not required, has no effect, and interacts badly with unquoted attribute values.</div>' : ''}`
        });
        appendToReport(metaViewportItem);
        // #endregion Check Meta Viewport **************************

        // #region Check Title *****************************
        let titlePassed = false;
        let pageTitle = '';
        let titleFound = false;
        let titleInHead = false;
        let titleContent = false;
        let minimumLength = 8;

        if (typeof html === 'string') {
            const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
            if (titleMatch) {
                titleFound = true;
                pageTitle = titleMatch[1].trim();
                const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
                if (headMatch && headMatch[0].toLowerCase().includes(titleMatch[0].toLowerCase())) {
                    titleInHead = true;
                }
            }
        } else if (html && typeof html.querySelector === 'function') {
            const t = html.querySelector('title');
            if (t) {
                titleFound = true;
                pageTitle = t.textContent.trim();
                const head = html.querySelector('head');
                titleInHead = !!head && head.contains(t);
            }
        }

        // #region Set required title content based on course and week

        let requiredContent = [];
        let requiredContentNote = '';

        switch (course.toLowerCase()) {
            case 'wdd130':
                switch (week) {
                    case 'w01':
                    case 'w02':
                        requiredContent = ['WDD 130'];
                        requiredContentNote = 'a valid student name';
                        break;
                    case 'w03':
                    case 'w04':
                        requiredContent = ['About Us'];
                        requiredContentNote = 'the rafting company name';
                        break;
                    case 'w05':
                        requiredContent = ['Contact Us'];
                        requiredContentNote = 'the rafting company name';
                        break;
                }
                break;
            case 'wdd131':
                switch (week) {
                    case 'w01':
                        requiredContent = ['WDD', '131', 'Dynamic Web Fundamentals'];
                        minimumLength = 30;
                        requiredContentNote = 'a valid student name';
                        break;
                    case 'w02':
                    case 'w04':
                        requiredContent = ['Temple'];
                        minimumLength = 10;
                        requiredContentNote = 'and the term "Album" or equivalent';
                        break;
                    case 'w03':
                        requiredContent = [''];
                        minimumLength = 5;
                        requiredContentNote = 'A place name';
                        break;
                    case 'w05':
                        requiredContent = [''];
                        minimumLength = 10;
                        requiredContentNote = 'The term "Product Review" or something equivalent';
                        break;
                }
                break;
            case 'wdd231':
                switch (week) {
                    case 'w01':
                        requiredContent = [];
                        break;
                    case 'w02':
                        requiredContent = ['Directory'];
                        minimumLength = 20;
                        break;
                }
                break;
            default:
                requiredContent = ['⚠️'];
                requiredContentNote = 'Please review the content manually';
        }
        // #endregion

        titleContent = pageTitle && pageTitle.length >= minimumLength && requiredContent.every(item => pageTitle.toLowerCase().includes(item.toLowerCase())) ? true : false;


        if (titleFound && titleInHead && titleContent) {
            titlePassed = true;
        } else {
            titlePassed = false;
        }

        // Build optional required content segment only when there is something to show
        const requiredSegment = (Array.isArray(requiredContent) && requiredContent.length === 0 && (!requiredContentNote || String(requiredContentNote).trim() === ''))
            ? ''
            : `<br>Required title content: <strong>${requiredContent} ${requiredContentNote ? ` and ${requiredContentNote}` : ''}</strong>.`;

        const titleItem = createLineItem({
            label: '&lt;title&gt;',
            passed: titlePassed,
            standardHtml: `👀➡️ <strong>Requires Content Review</strong>: <em>${pageTitle || '[no &lt;title&gt; found]'}</em>
            ${requiredSegment}
            <br>${titleFound ? (titleInHead ? '✅ <code>&lt;title&gt;</code> exists within the <code>&lt;head&gt;</code> element.' : '❌ <code>&lt;title&gt;</code> exists but is not inside the <code>&lt;head&gt;</code> element. ***') : '❌ <code>&lt;title&gt;</code> is missing. ***'}.
            <br>${titleContent ? '✅ Title content meets requirements.' : `❌ Title content does not meet requirements. `}`
        });
        appendToReport(titleItem);
        // #endregion Check Title **************************

    } catch (error) {
        message.innerHTML = `Audit Error: Head Content section — ${error}`;
        message.style.display = "block";
    }
}