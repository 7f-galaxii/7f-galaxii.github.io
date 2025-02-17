let appHeader = `
    <h1>I Wanna Radio</h1>
    <a href="/radio/">[main]</a>
    <!-- <a href="/radio/requests">[requests]</a> -->
    <a id="discord-link" target="_blank" href="#">[discord]</a>
    <a href="/radio/about">[about]</a>
`;
document.getElementById("app-header").innerHTML = appHeader;
document.getElementById("discord-link").setAttribute("href", "https://dis"+"cord.gg/NG"+"cRajCNa5"); // really basic attempt at trying to stop primitive scanners/bots