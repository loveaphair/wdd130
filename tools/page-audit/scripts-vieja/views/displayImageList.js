import { getImageSize } from '../utils/getImageSize.js';

export async function displayImageList(phtml, baseUrl, cssText = '') {
    const imgElements = phtml.querySelectorAll('img');
    const pictureElements = phtml.querySelectorAll('picture');

    // Collect all unique image URLs (from src and srcset)
    const imageUrlsSet = new Set();
    const imageData = []; // Store image data with source info

    // First pass: collect all images from src and srcset
    for (const img of imgElements) {
        const rawSrc = img.getAttribute('src') || img.src;
        const rawSrcset = img.getAttribute('srcset') || '';
        const altText = img.alt || 'No alt text';

        // Add src image
        if (rawSrc && rawSrc.trim()) {
            imageData.push({
                url: rawSrc.trim(),
                alt: altText,
                source: 'src'
            });
        }

        // Parse and add srcset images
        if (rawSrcset && rawSrcset.trim()) {
            // srcset format: "url1 descriptor1, url2 descriptor2, ..."
            const srcsetParts = rawSrcset.split(',').map(s => s.trim());
            for (const part of srcsetParts) {
                // Extract just the URL (before any width/density descriptor)
                const urlMatch = part.match(/^(\S+)/);
                if (urlMatch) {
                    const srcsetUrl = urlMatch[1];
                    imageData.push({
                        url: srcsetUrl,
                        alt: altText,
                        source: 'srcset',
                        descriptor: part.replace(srcsetUrl, '').trim() || ''
                    });
                }
            }
        }
    }

    // Third pass: collect images referenced via CSS url()
    if (cssText !== '' && cssText && typeof cssText === 'string') {
        const urlRegex = /url\s*\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi;
        const imageExtRegex = /\.(png|jpe?g|gif|webp|avif|svgz?|ico|bmp|apng|tiff?)(\?|#|$)/i;
        let match;
        while ((match = urlRegex.exec(cssText)) !== null) {
            const rawUrl = match[2].trim();
            // Include data URIs for images as well
            const isDataImage = /^data:image\//i.test(rawUrl);
            if (isDataImage || imageExtRegex.test(rawUrl)) {
                imageData.push({
                    url: rawUrl,
                    alt: 'N/A (CSS asset)',
                    source: 'css'
                });
            }
        }
    }

    // Second pass: collect images from picture > source elements
    for (const picture of pictureElements) {
        const sources = picture.querySelectorAll('source');
        const imgInPicture = picture.querySelector('img');
        const altText = imgInPicture ? (imgInPicture.alt || 'No alt text') : 'No alt text';

        for (const source of sources) {
            const rawSrcset = source.getAttribute('srcset') || '';
            const media = source.getAttribute('media') || '';

            if (rawSrcset && rawSrcset.trim()) {
                const srcsetParts = rawSrcset.split(',').map(s => s.trim());
                for (const part of srcsetParts) {
                    const urlMatch = part.match(/^(\S+)/);
                    if (urlMatch) {
                        const srcsetUrl = urlMatch[1];
                        const descriptor = part.replace(srcsetUrl, '').trim() || '';
                        imageData.push({
                            url: srcsetUrl,
                            alt: altText,
                            source: 'picture',
                            descriptor: descriptor,
                            media: media
                        });
                    }
                }
            }
        }
    }

    // Build Image List Container
    const imgTable = document.createElement('div');
    imgTable.className = 'grid-list';

    // Headers (3)  
    const imgTableHeader1 = document.createElement('div');
    imgTableHeader1.className = 'title';
    imgTableHeader1.innerHTML = 'File Reference';
    imgTable.appendChild(imgTableHeader1);

    const imgTableHeader2 = document.createElement('div');
    imgTableHeader2.className = 'title';
    imgTableHeader2.innerHTML = 'Size';
    imgTable.appendChild(imgTableHeader2);

    const imgTableHeader3 = document.createElement('div');
    imgTableHeader3.className = 'title';
    imgTableHeader3.innerHTML = 'Alt Text';
    imgTable.appendChild(imgTableHeader3);

    // Helper to verify an image exists (similar approach to JS link existence)
    const checkImageExists = async (url) => {
        try {
            const resp = await fetch(url, { method: 'GET', cache: 'no-store' });
            if (resp.ok) return true;
            if (resp.status === 404) return false;
            // For other non-ok statuses, treat as not found
            return false;
        } catch (err) {
            // Likely a CORS error — fall back to opaque request
            try {
                const resp2 = await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
                // Opaque means we can't read status but resource likely exists
                return !!resp2 && (resp2.ok || resp2.type === 'opaque');
            } catch {
                return false;
            }
        }
    };

    // Populate Image List using for...of so await works
    for (const imgData of imageData) {
        const rawSrc = imgData.url;
        const isAbsoluteUrl = /^https?:\/\//i.test(rawSrc) || /^\/\//.test(rawSrc) || /^[a-z][a-z0-9+.-]*:/i.test(rawSrc);

        // Column 1: File Reference
        const imgsrc = document.createElement('div');
        imgsrc.className = 'grid-item';
        // Resolve to absolute for existence check
        let resolvedSrc;
        try {
            resolvedSrc = new URL(rawSrc, baseUrl).href;
        } catch {
            resolvedSrc = rawSrc;
        }
        const exists = await checkImageExists(resolvedSrc);

        // Add source indicator (src, srcset, picture, or css)
        let sourceLabel = '';
        if (imgData.source === 'srcset') {
            sourceLabel = ` <em>[srcset${imgData.descriptor ? ': ' + imgData.descriptor : ''}]</em>`;
        } else if (imgData.source === 'picture') {
            const mediaInfo = imgData.media ? ` ${imgData.media}` : '';
            const descriptorInfo = imgData.descriptor ? ` ${imgData.descriptor}` : '';
            sourceLabel = ` <em>[picture:${mediaInfo}${descriptorInfo}]</em>`;
        } else if (imgData.source === 'css') {
            sourceLabel = ' <em>[css]</em>';
        }
        imgsrc.innerHTML = `${exists ? '✅' : '❌'} ${rawSrc}${sourceLabel}`;
        imgTable.appendChild(imgsrc);

        // Column 2: File Size
        const imgsize = document.createElement('div');
        imgsize.className = 'grid-item';
        // Do not attempt to get size for absolute URLs (external or with any scheme)

        if (isAbsoluteUrl) {
            imgsize.innerHTML = '⛔';
        } else {
            let resolvedSrc; // skip absolute URLs
            try {
                resolvedSrc = new URL(rawSrc, baseUrl).href;
            } catch {
                resolvedSrc = rawSrc;
            }
            const size = await getImageSize(resolvedSrc);
            imgsize.innerHTML = `${(size <= 125) ? '✅' : '❌'} ${isNaN(size) ? '⛔' : size.toFixed(0) + ' kB'}`;
        }
        imgTable.appendChild(imgsize);

        // Column 3: File alt Attribute
        const imgalt = document.createElement('div');
        imgalt.className = 'grid-item';
        // alt attribute checks (not applicable to CSS assets)
        let altCheck = '';
        if (imgData.source === 'css') {
            altCheck = '— N/A (CSS asset)';
        } else {
            const altText = imgData.alt;
            if (!altText || altText === 'No alt text') {
                altCheck = `❌ No alt text found`;
            } else if (altText.trim() === '') {
                altCheck = `❌ Empty (decorative image?)`;
            } else if (altText.length < 7 || !altText.includes(' ')) {
                altCheck = `👀➡️ Review if this is too short! – "${altText}"`;
            } else if (altText.toLowerCase().includes('image') || altText.toLowerCase().includes('photo')) {
                altCheck = `👀➡️ Review if it is descriptive! – "${altText}"`;
            } else {
                altCheck = `✅ "${altText}"`;
            }
        }
        imgalt.innerHTML = altCheck;
        imgTable.appendChild(imgalt);
    }

    return imgTable;
}