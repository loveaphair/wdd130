export function resetReport({ messageEl, reportEl } = {}) {
  // fall back to DOM lookup when elements aren't provided
  const message = messageEl || document.querySelector('#message');
  const report = reportEl || document.querySelector('#report');

  if (message) message.style.display = 'none';
  if (report) report.textContent = '';
}