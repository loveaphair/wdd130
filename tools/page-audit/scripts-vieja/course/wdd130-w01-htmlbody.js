import { createLineItem, appendToReport } from '../utils/reportTestLineItem.js';
import { displayImageList } from '../views/displayImageList.js';

export async function wdd130w01htmlbody(phtml, url) {
    try {
        // New Section Heading
        const h3 = document.createElement('h3');
        h3.innerHTML = '&lt;body&gt; Elements';
        appendToReport(h3);

        // #region Check for header element *****************************
        let headerPassed = false;
        let messageDetail = '';

        const headers = Array.from(phtml.querySelectorAll('header'));
        const body = phtml.querySelector('body');
        const main = phtml.querySelector('main');

        if (headers.length === 0) {
            messageDetail = 'No <code>&lt;header&gt;</code> element found.';
        } else if (headers.length > 1) {
            messageDetail = `Found ${headers.length} <code>&lt;header&gt;</code> elements (expected a single header).`;
        } else {
            const headerEl = headers[0];
            if (!body || !body.contains(headerEl)) {
                messageDetail = 'The <code>&lt;header&gt;</code> element is not inside the <body>.';
            } else if (!main) {
                messageDetail = 'No <code>&lt;main&gt;</code> element found to verify header placement before it.';
            } else {
                // header should appear before main in document order
                const headerBeforeMain = !!(headerEl.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING);
                if (headerBeforeMain) {
                    headerPassed = true;
                } else {
                    messageDetail = 'The <code>&lt;header&gt;</code> element does not appear before the <code>&lt;main&gt;</code> element.';
                }
            }
        }

        const headerItem = createLineItem({
            label: '&lt;header&gt;',
            passed: headerPassed,
            standardHtml: 'Document must contain a single <code>&lt;header&gt;</code> element that is inside the <code>&lt;body&gt;</code> and appears before the <code>&lt;main&gt;</code> element.' + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(headerItem);
        // #endregion Check for header element **************************

        // #region Check for nav element *****************************
        let navPassed = false;
        messageDetail = '';

        const navs = Array.from(phtml.querySelectorAll('nav'));
        const headerEl = phtml.querySelector('header');

        if (navs.length === 0) {
            messageDetail = 'No <code>&lt;nav&gt;</code> element found.';
        } else if (navs.length > 1) {
            messageDetail = `Found ${navs.length} <code>&lt;nav&gt;</code> elements (expected a single nav).`;
        } else {
            const navEl = navs[0];
            if (!headerEl) {
                messageDetail = 'No <code>&lt;header&gt;</code> element found to verify <code>&lt;nav&gt;</code> placement.';
            } else if (!headerEl.contains(navEl)) {
                messageDetail = 'The <code>&lt;nav&gt;</code> element is not inside the <code>&lt;header&gt;</code>.';
            } else {
                navPassed = true;
            }
        }

        const navItem = createLineItem({
            label: '&lt;nav&gt;',
            passed: navPassed,
            standardHtml: 'Document must contain a single <code>&lt;nav&gt;</code> element that is inside the <code>&lt;header&gt;</code> element.' + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(navItem);
        // #endregion

        // #region Check for anchor tags in nav element *****************************
        let anchorsPassed = false;
        messageDetail = '';
        if (!navs || navs.length !== 1) {
            messageDetail = '❌ Cannot check anchor tags because <code>&lt;nav&gt;</code> element is missing or invalid.';
        } else {
            const navEl = navs[0];
            const anchorEls = Array.from(navEl.querySelectorAll('a'));

            // Expect exactly two anchors and specific href values + specific text for each (order required)
            if (anchorEls.length !== 2) {
                messageDetail = `Found ${anchorEls.length} <code>&lt;a&gt;</code> elements inside the <code>&lt;nav&gt;</code> (expected exactly 2).`;
            } else {
                const hrefs = anchorEls.map(a => (a.getAttribute('href') || '').trim());
                const texts = anchorEls.map(a => a.textContent.trim());
                const expectedHrefs = ['#', 'wwr/'];

                const hrefsMatch = hrefs[0] === expectedHrefs[0] && hrefs[1] === expectedHrefs[1];
                const textsMatch = texts[0] === 'Home' && (texts[1] === 'Rafting Website' || texts[1] === 'Rafting Site');

                if (hrefsMatch && textsMatch) {
                    anchorsPassed = true;
                } else {
                    const parts = [];
                    if (!hrefsMatch) {
                        parts.push(`Found hrefs: ${hrefs.map(h => `<code>${h}</code>`).join(', ')}. Expected: <code>#</code>, <code>wwr/</code>.`);
                    }
                    if (!textsMatch) {
                        parts.push(`Found link texts: ${texts.map(t => `<code>${t}</code>`).join(', ')}. Expected: <code>Home</code>, <code>Rafting Website</code> or <code>Rafting Site</code>.`);
                    }
                    messageDetail = parts.join(' ');
                }
            }
        }

        const anchorsItem = createLineItem({
            label: 'nav &lt;a&gt; links',
            passed: anchorsPassed,
            standardHtml: 'The <code>&lt;nav&gt;</code> element should contain exactly two <code>&lt;a&gt;</code> elements with hrefs <code>#</code> and <code>wwr/</code> and link text "Home" and "Rafting Website" (or "Rafting Site") respectively.' + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(anchorsItem);
        // #endregion

        // #region Check for main element *****************************
        let mainPassed = false;
        messageDetail = '';
        const mains = Array.from(phtml.querySelectorAll('main'));
        const footerEl = phtml.querySelector('footer');

        if (mains.length === 0) {
            messageDetail = 'No <code>&lt;main&gt;</code> element found.';
        } else if (mains.length > 1) {
            messageDetail = `Found ${mains.length} <code>&lt;main&gt;</code> elements (expected a single main).`;
        } else {
            const mainEl = mains[0];

            // must be inside body
            if (!body || !body.contains(mainEl)) {
                messageDetail = 'The <code>&lt;main&gt;</code> element is not inside the <code>&lt;body&gt;</code>.';
            } else {
                // ensure header exists and main is after the header closing (not inside header)
                if (!headerEl) {
                    messageDetail = 'No <code>&lt;header&gt;</code> element found to verify placement relative to <code>&lt;main&gt;</code>.';
                } else if (headerEl.contains(mainEl)) {
                    messageDetail = 'The <code>&lt;main&gt;</code> element must not be inside the <code>&lt;header&gt;</code>; it should follow the closing <code>&lt;/header&gt;</code>.';
                } else {
                    const headerBeforeMain = !!(headerEl.compareDocumentPosition(mainEl) & Node.DOCUMENT_POSITION_FOLLOWING);
                    if (!headerBeforeMain) {
                        messageDetail = 'The <code>&lt;main&gt;</code> element does not appear after the <code>&lt;header&gt;</code>.';
                    } else if (footerEl) {
                        // ensure main appears before footer start
                        if (footerEl.contains(mainEl)) {
                            messageDetail = 'The <code>&lt;main&gt;</code> element must not be inside the <code>&lt;footer&gt;</code>.';
                        } else {
                            const mainBeforeFooter = !!(mainEl.compareDocumentPosition(footerEl) & Node.DOCUMENT_POSITION_FOLLOWING);
                            if (!mainBeforeFooter) {
                                messageDetail = 'The <code>&lt;main&gt;</code> element does not appear before the <code>&lt;footer&gt;</code>.';
                            } else {
                                mainPassed = true;
                            }
                        }
                    } else {
                        // no footer to compare against — accept as long as header check passed
                        mainPassed = true;
                    }
                }
            }
        }

        const mainItem = createLineItem({
            label: '&lt;main&gt;',
            passed: mainPassed,
            standardHtml: 'Document must contain a single <code>&lt;main&gt;</code> element that is inside the <code>&lt;body&gt;</code> and is between the <code>&lt;header&gt;</code> element and the <code>&lt;footer&gt;</code> element.' + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(mainItem);
        // #endregion Check for main element **************************

        // #region Check for h1 inside main *****************************
        let h1Passed = false;
        let h1Text = '';
        messageDetail = '';
        if (!mainPassed) {
            messageDetail = '❌ Cannot check <code>&lt;h1&gt;</code> because <code>&lt;main&gt;</code> element is missing or invalid.';
        } else {
            const h1s = Array.from(phtml.querySelectorAll('h1'));
            if (h1s.length === 0) {
                messageDetail = 'No <code>&lt;h1&gt;</code> element found inside the <code>&lt;main&gt;</code>.';
            } else if (h1s.length > 1) {
                messageDetail = `Found ${h1s.length} <code>&lt;h1&gt;</code> elements inside the <code>&lt;main&gt;</code> (expected a single h1).`;
            } else {
                h1Text = h1s[0].textContent.trim();
                const hasWDD = /\bWDD\b/i.test(h1Text);
                const has130 = /\b130\b/.test(h1Text);
                if (hasWDD && has130) {
                    h1Passed = true;
                } else {
                    messageDetail = `The <code>&lt;h1&gt;</code> content does not include the required text content. Found: "${h1Text}". Expected to include "WDD 130".`;
                }
            }
        }
        const h1Item = createLineItem({
            label: '&lt;h1&gt;',
            passed: h1Passed,
            standardHtml: `<strong>Content</strong>: <em>${h1Text}</em><br>Document must contain a single <code>&lt;h1&gt;</code> element inside the <code>&lt;main&gt;</code> element whose content includes the required text content "WDD 130".` + (messageDetail ? `<br>${messageDetail}` : '')
        });
        appendToReport(h1Item);
        // #endregion Check for h1 inside main **************************

        // #region Check for the required img inside the main *****************************
        let imgPassed = false;
        messageDetail = '';
        if (!mainPassed) {
            messageDetail = '❌ Cannot check <code>&lt;img&gt;</code> because <code>&lt;main&gt;</code> element is missing or invalid.';
        }
        else {
            const imgElements = Array.from(main.querySelectorAll('img'));
            // Check for profile image in images folder with valid extension
            const profileRegex = /images\/profile\.(jpg|jpeg|png|webp|gif|svg)/i;
            const profileImg = imgElements.find(img => {
                const src = img.getAttribute('src') || '';
                return profileRegex.test(src);
            });
            if (profileImg) {
                imgPassed = true;
                messageDetail = '✅ Profile image found named "profile" in the "images" folder.<br>';
            } else {
                messageDetail = '❌ Missing valid profile image named "<strong>profile</strong>" in the "<strong>images</strong>" folder.<br>';
            }
        }
        // Display image list for review
        const imgListResult = await displayImageList(phtml, url);
        let imgTableHtml = '';
        if (typeof imgListResult === 'string') {
            imgTableHtml = imgListResult;
        } else if (imgListResult && typeof imgListResult.outerHTML === 'string') {
            imgTableHtml = imgListResult.outerHTML;
        } else if (imgListResult && typeof imgListResult.innerHTML === 'string') {
            imgTableHtml = imgListResult.innerHTML;
        }

        const imgItem = createLineItem({
            label: 'profile &lt;img&gt;',
            passed: imgPassed,
            standardHtml: `The <code>&lt;main&gt;</code> element must contain at least one image with a valid extension and named <strong>profile</strong> in the <strong>images</strong> folder. All image files must be ✔correctly referenced, ✔be optimized(<= 125 kB), ✔have alt attribute.<br><br>${messageDetail}${imgTableHtml ? ` <br>${imgTableHtml}` : ''}`
        });
        appendToReport(imgItem);
        // #endregion

        // #region p in main *****************************
        let mainPPassed = false;
        let mainpText = '';
        messageDetail = '';
        if (!mainPassed) {
            messageDetail = '❌ Cannot check <code>&lt;p&gt;</code> because <code>&lt;main&gt;</code> element is missing or invalid.';
        } else {
            const pEls = Array.from(main.querySelectorAll('p'));
            if (pEls.length === 0) {
                messageDetail = 'No <code>&lt;p&gt;</code> element found inside the <code>&lt;main&gt;</code>.';
            } else {
                const p = pEls[0];
                mainpText = (p.textContent || '').trim();
                if (mainpText.length >= 50) {
                    mainPPassed = true;
                } else {
                    messageDetail = `<strong>Review</strong>: 👀➡️ The <code>&lt;p&gt;</code> content may be too short (found ${mainpText.length} characters).`;
                }
            }
        }
        const mainPItem = createLineItem({
            label: 'main &lt;p&gt;',
            passed: mainPPassed,
            standardHtml: `The <code>&lt;main&gt;</code> element must contain a <code>&lt;p&gt;</code> element with any reasonable content about the student. <br>(found ${mainpText.length} characters)` + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(mainPItem);
        // #endregion Check for p in the main with any content (longer than 50 characters) **************************

        // #region Check for footer element *****************************
        let footerPassed = false;
        messageDetail = '';
        const footers = Array.from(phtml.querySelectorAll('footer'));
        if (footers.length === 0) {
            messageDetail = 'No <code>&lt;footer&gt;</code> element found.';
        } else if (footers.length > 1) {
            messageDetail = `Found ${footers.length} <code>&lt;footer&gt;</code> elements (expected a single footer).`;
        } else {
            const footerEl = footers[0];
            if (!body || !body.contains(footerEl)) {
                messageDetail = 'The <code>&lt;footer&gt;</code> element is not inside the <code>&lt;body&gt;</code>.';
            } else if (!main) {
                messageDetail = 'No <code>&lt;main&gt;</code> element found to verify footer placement after it.';
            } else {
                // footer should appear after main in document order
                const mainBeforeFooter = !!(main.compareDocumentPosition(footerEl) & Node.DOCUMENT_POSITION_FOLLOWING);
                if (mainBeforeFooter) {
                    footerPassed = true;
                } else {
                    messageDetail = 'The <code>&lt;footer&gt;</code> element does not appear after the <code>&lt;main&gt;</code> element.';
                }
            }
        }
        const footerItem = createLineItem({
            label: '&lt;footer&gt;',
            passed: footerPassed,
            standardHtml: 'Document must contain a single <code>&lt;footer&gt;</code> element that is inside the <code>&lt;body&gt;</code> and appears after the <code>&lt;main&gt;</code> element.' + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(footerItem);
        // #endregion

        // #region Check paragraph inside footer *****************************
        let footerPPassed = false;
        let footerpText = '';
        messageDetail = '';
        if (!footerPassed) {
            messageDetail = '❌ Cannot check <code>&lt;p&gt;</code> because <code>&lt;footer&gt;</code> element is missing or invalid.';
        } else {
            const footerEl = phtml.querySelector('footer');
            const pEls = Array.from(footerEl.querySelectorAll('p'));
            if (pEls.length === 0) {
                messageDetail = 'No <code>&lt;p&gt;</code> element found inside the <code>&lt;footer&gt;</code>.';
            } else if (pEls.length > 1) {
                messageDetail = `Found ${pEls.length} <code>&lt;p&gt;</code> elements inside the <code>&lt;footer&gt;</code> (expected a single paragraph).`;
            } else {
                const p = pEls[0];
                const contentHtml = (p.innerHTML || '').trim();
                footerpText = (p.textContent || '').trim();

                // Accept common forms that render a copyright symbol:
                // literal ©, HTML entity &copy;, numeric &#169;, hex &#xA9;, or (c)
                const copyrightRegex = /©|&copy;|&#169;|&#xA9;|\(c\)/i;

                const hasCopyright = copyrightRegex.test(contentHtml) || copyrightRegex.test(footerpText);

                if (hasCopyright) {
                    footerPPassed = true;
                } else if (/@/.test(contentHtml) || /@/.test(footerpText)) {
                    // student used "@" instead of a copyright mark
                    messageDetail = `❌ The footer paragraph contains an "@" character instead of a copyright symbol (©). `;
                } else {
                    messageDetail = `❌ The footer paragraph does not contain a copyright symbol. `;
                }
            }
        }
        const footerPItem = createLineItem({
            label: 'footer &lt;p&gt;',
            passed: footerPPassed,
            standardHtml: `<strong>Content</strong>: <em>${footerpText}</em> <br>The <code>&lt;footer&gt;</code> element must contain a single <code>&lt;p&gt;</code> element that includes a copyright (&copy;) symbol.` + (messageDetail ? ` <br>${messageDetail}` : '')
        });
        appendToReport(footerPItem);
        // #endregion

    } catch (error) {
        message.innerHTML = `Audit Error: Body Content section — ${error}`;
        message.style.display = "block";
    }
}