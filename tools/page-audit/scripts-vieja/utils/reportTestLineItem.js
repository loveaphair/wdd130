// Helpers to build and append common report line-items
// Create a fragment for a audit "line item".

export function createLineItem({ label, passed = false, standardHtml = '' } = {}) {
    const frag = document.createDocumentFragment();

    // container for the three columns
    const lineItem = document.createElement('div');
    lineItem.className = 'lineitem';
    // set a data-status attribute for deterministic grouping: 'error' | 'review' | 'pass'
    let status = 'review';
    if (passed === true) status = 'pass';
    else if (passed === false) status = 'error';
    else if (typeof passed === 'string') {
        const p = passed.toLowerCase();
        if (p === 'review' || p === 'blank') status = 'review';
        else if (p === 'pass' || p === 'true') status = 'pass';
        else if (p === 'error' || p === 'false') status = 'error';
    }
    lineItem.dataset.status = status;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.innerHTML = label || '';

    const markDiv = document.createElement('div');
    markDiv.className = 'mark';
    markDiv.innerHTML = passed ? '✅' : '❌';
    if (passed === 'review') {
        markDiv.innerHTML = ' ';
    }
    if (passed === 'blank') {
        markDiv.innerHTML = ' ';
    }
    const standardDiv = document.createElement('div');
    standardDiv.className = 'standard';
    standardDiv.innerHTML = standardHtml || '';

    lineItem.appendChild(labelDiv);
    lineItem.appendChild(markDiv);
    lineItem.appendChild(standardDiv);

    frag.appendChild(lineItem);

    return frag;
}

// If no container is provided, it will look up #report in the document.
export function appendToReport(fragmentOrElement, container = null) {
    const target = container || document.getElementById('report');
    if (!target) return;
    target.appendChild(fragmentOrElement);
}