export async function checkURL(url, course) {

    let errorMessage = `<p>The page audit URL was not found or is not accessible. Check the following:
        <ul class=\"check\">
          <li>You entered a valid GitHub username</li>
          <li>You have a GitHub repository named <strong>${course}</strong></li>
          <li>You named the assignment file correctly and it is saved in the correct location in your repository</li>
          <li>GitHub Pages has been enabled for your <strong>${course}</strong> repository</li>
          <li>The audit is expecting to access a URL that begins in this format: <div class="callout reference"><code>https://<em>username</em>.github.io/${course}</code></div></li>
        </ul>`
    try {
        const res = await fetch(url);
        if (!res.ok) {
            message.innerHTML = errorMessage;
            message.style.display = "block";
        } else {
            message.innerHTML = "";
            message.style.display = "none";
        }
        return res.ok;
    } catch {
        message.innerHTML = errorMessage;
        message.style.display = "block";
        return false;
    }
}