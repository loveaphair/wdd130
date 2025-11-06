// Group report results into Errors, Manual Review, and Passing sections.
export async function groupReportResults(reportEl = null) {
  // default to #report
  const report = reportEl || document.getElementById('report');
  if (!report) return;

  // Collect children, preserving non-lineitem nodes except section headings (h3)
  const children = Array.from(report.childNodes);

  // Remove any existing empty text nodes
  const elementChildren = children.filter(n => !(n.nodeType === 3 && n.textContent.trim() === ''));

  // Preserve callouts and other non-lineitem elements, but drop old h3 headings to avoid clutter
  const preserved = elementChildren.filter(node => !(node.nodeType === 1 && node.tagName && node.tagName.toLowerCase() === 'h3') && !(node.nodeType === 1 && node.classList && node.classList.contains('lineitem')));

  // Collect line items
  const lineItems = elementChildren.filter(node => node.nodeType === 1 && node.classList && node.classList.contains('lineitem'));

  // Classify items
  const errors = [];
  const review = [];
  const passing = [];

  for (const item of lineItems) {
    // Prefer explicit data-status when present
    const ds = (item.dataset && item.dataset.status) ? item.dataset.status.toLowerCase() : null;
    if (ds === 'error') {
      errors.push(item);
      continue;
    }
    if (ds === 'review') {
      review.push(item);
      continue;
    }
    if (ds === 'pass') {
      // If the visible text contains manual-review markers, treat it as review even when data-status says 'pass'
      const txt = (item.textContent || '');
      if (txt.includes('👀') || txt.includes('➡️')) {
        review.push(item);
      } else {
        passing.push(item);
      }
      continue;
    }

    // Fallback to heuristics on visible text if no data-status provided
    const text = item.textContent || '';
    // Priority: explicit failure marker ❌ anywhere
    if (text.includes('❌')) {
      errors.push(item);
      continue;
    }

    // Next: manual-review marker (👀) or blank mark area (some items set blank mark for review)
    const markEl = item.querySelector('.mark');
    const markText = markEl ? (markEl.textContent || '').trim() : '';
    if (text.includes('👀') || text.includes('➡️') || markText === '' ) {
      review.push(item);
      continue;
    }

    // Next: passing marker
    if (text.includes('✅')) {
      passing.push(item);
      continue;
    }

    // Fallback: manual review
    review.push(item);
  }

  // Clear report and re-render: preserved nodes first, then grouped sections
  report.textContent = '';

  // Append preserved nodes
  for (const p of preserved) {
    report.appendChild(p);
  }

  // If there are no errors and there are passing checks, show a submission-ready banner
  if (errors.length === 0 && passing.length > 0) {
    const banner = document.createElement('div');
    banner.className = 'submission-ready callout';
    const bh = document.createElement('h3');
    bh.textContent = '✅ This assignment is ready to submit!';
    banner.appendChild(bh);
    const bp = document.createElement('p');
    bp.textContent = 'Automated checks passed. Review any manual items below and submit when ready.';
    banner.appendChild(bp);
    report.appendChild(banner);
  }

  // Helper to build a section with optional description
  const buildSection = (title, items, className = '', description = '') => {
    const section = document.createElement('div');
    section.className = `group-section ${className}`.trim();
    const h = document.createElement('h3');
    h.textContent = title;
    section.appendChild(h);
    if (description && description.trim() !== '') {
      const desc = document.createElement('p');
      desc.className = 'group-desc';
      desc.textContent = description;
      section.appendChild(desc);
    }
    if (items.length === 0) {
      const p = document.createElement('div');
      p.className = 'lineitem';
      p.innerHTML = `<div class="label">(none)</div><div class="mark"> </div><div class="standard"></div>`;
      section.appendChild(p);
    } else {
      for (const it of items) {
        section.appendChild(it);
      }
    }
    return section;
  };

  // Append in order: Errors (only if any), Manual review, Passing
  if (errors.length > 0) {
    report.appendChild(buildSection('❌ Errors', errors, 'errors', 'These are items that failed automated checks for this week\'s assignment. Please review each error and follow the hint text to fix the problem.'));
  }
  if (review.length > 0) {
    report.appendChild(buildSection('👀 Needs manual review', review, 'review', 'These items could not be fully validated automatically and require a human review to ensure they meet the assignment requirements.'));
  }
  if (passing.length > 0) {
    report.appendChild(buildSection('✅ Passing checks', passing, 'passing', 'This section contains items that met the automated checks for the assignment.'));
  }

  return { errors: errors.length, review: review.length, passing: passing.length };
}
