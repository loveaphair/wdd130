// Current - Set audit URL path
const auditURL = `/wdd130/index.html`;
const course = 'wdd130';
const week = 'w01';

// #region Set HTML Elements *****************************
const usernameInput = document.querySelector('#username');
const form = document.querySelector('#auditForm');
const report = document.querySelector('#report');
const message = document.querySelector('#message');
// #endregion Set HTML Elements ***************************************

// #region Imports ******************************************

import { resetReport } from './utils/resetReport.js';
import { checkURL } from './tests/checkURL.js';
import { parseHTML } from './utils/parseHTML.js';
import { plainHTML } from './utils/plainHTML.js';
import { displayGitHubLinks } from './views/displayGitHubLinks.js';
import { checkTemplateUsed } from './tests/checkTemplateUsed.js';
import { checkFolderImages } from './tests/checkFolderImages.js';
import { checkFileNamingConventions } from './tests/checkFileNamingConventions.js';
import { validateHTML } from './utils/validateHTML.js';
import { checkHTMLDoc } from './tests/checkHTMLDoc.js';
import { checkCapitalizedTags } from './tests/checkCapitalizedTags.js';
import { checkHTMLAttributeSpacing } from './tests/checkHTMLAttributeSpacing.js';
import { checkHeadContent } from './tests/checkHeadContent.js';
import { wdd130w01htmlbody } from './course/wdd130-w01-htmlbody.js';
import { groupReportResults } from './utils/groupReportResults.js';

// #endregion Imports ***************************************

// #region Event Listeners - Run Audit *****************************
form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const auditPageURL = await getAuditURL();
  if (!auditPageURL) return; // return null behavior handled here
  await buildReport(auditPageURL);
});

window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('user') && params.get('user').trim() !== '') {
    usernameInput.value = params.get('user').trim();
    const auditPageUrl = await getAuditURL();
    if (auditPageUrl) buildReport(auditPageUrl);
  }
});
// #endregion Event Listeners - Run Audit *****************************

async function getAuditURL() {
  const validURL = '';
  const username = usernameInput.value.trim();
  // Check if empty
  if (username === "") {
    message.innerHTML = "<p>⚠️ Please enter a GitHub username.</p>";
    message.style.display = "block";
    usernameInput.focus();
    return null;
  }

  // Check if full URL
  if (/^https?:\/\//i.test(username) || username.includes('github.io')) {
    try {
      const u = new URL(username.startsWith('http') ? username : `https://${username}`);
      // ensure it's a GitHub Pages host
      if (!u.hostname.endsWith('.github.io')) return null;

      // require the wdd130 repo path
      let pathname = u.pathname || '/';
      if (!pathname.startsWith('/wdd130')) return null;

      // normalize to include /wdd130/index.html (NECESSARY??)
      if (pathname === '/wdd130' || pathname === '/wdd130/') {
        pathname = '/wdd130/index.html';
      }

      if (await checkURL(`${u.protocol}//${u.hostname}${pathname}`, course)) {
        return `${u.protocol}//${u.hostname}${pathname}`;
      } else {
        usernameInput.focus();
        return null;
      }
    } catch {
      message.innerHTML = "<p>⚠️ Invalid URL.</p>";
      message.style.display = "block";
      usernameInput.focus();
      return null;
    }
  }

  // Assume username
  if (await checkURL(`https://${username}.github.io${auditURL}`, course)) {
    return `https://${username}.github.io${auditURL}`;
  } else {
    usernameInput.focus();
    return null;
  }
}

async function buildReport(url) {
  resetReport(); // Clear previous report and hide message 
  let parsedHTML = await parseHTML(url);
  let textHTML = await plainHTML(url);

  displayGitHubLinks(url, course);
  await checkTemplateUsed(url);
  await validateHTML(url, textHTML);
  await checkFolderImages(usernameInput.value, 'wdd130');
  checkFileNamingConventions(parsedHTML);
  await checkHTMLDoc(parsedHTML, textHTML);
  checkCapitalizedTags(textHTML);
  checkHTMLAttributeSpacing(textHTML);
  checkHeadContent(textHTML, course, week);
  await wdd130w01htmlbody(parsedHTML, url);
  // After all tests finish, group and re-render report items for better UX
  try {
    await groupReportResults(report);
  } catch (err) {
    console.error('Error grouping report results', err);
  }
}