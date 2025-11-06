// Check if the student's wdd130 repo was generated from byui-cse/wdd130-ww-student-template, currently not graded
export async function checkTemplateUsed(url) {
    //remove protocol form url
    let uri = url.replace(/^https?:\/\//, '');
    const template = document.createElement("div");
    template.className = "callout url";
    try {
        const match = uri.match(/^([^.]+)\.github\.io/);
        const username = match ? match[1] : null;
        const repoApiUrl = `https://api.github.com/repos/${username}/wdd130`;
        const res = await fetch(repoApiUrl);
        if (res.ok) {
            const repoData = await res.json();
            // Check if template_repository exists and matches the template repo
            const isTemplate = repoData.template_repository &&
                repoData.template_repository.full_name === 'byui-cse/wdd130-ww-student-template';
            template.innerHTML = isTemplate ? '<span>wdd130 Template Used:</span><span>✅ <strong>Yes</strong></span' : '<span>wdd130 Template Used:</span><span>❌ <strong>No</strong> (See instructions at <a href="https://byui-cse.github.io/wdd130-ww-course/week01/setup-github.html#create-repo" target="_blank">Step 2: Create Your Course Repository</a>)</span>';
        } else {
            template.innerHTML = `Error checking wdd130 template usage`;
        }
        report.appendChild(template);
    } catch (error) {
        message.innerHTML = `Error in template check: ${error.message}`;
        message.style.display = "block";
    }
}