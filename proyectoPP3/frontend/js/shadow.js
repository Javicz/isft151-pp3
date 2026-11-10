const VIEW_STYLES = [
    "css/w3.css",
    "css/w3-theme-teal.css"
];

export function attachViewShadow(host) {
    var root = host.attachShadow({ mode: "open" });

    for (var i = 0; i < VIEW_STYLES.length; i++) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = VIEW_STYLES[i];
        root.appendChild(link);
    }

    return root;
}
