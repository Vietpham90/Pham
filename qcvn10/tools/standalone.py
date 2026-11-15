import sys, re, pathlib
src = pathlib.Path(sys.argv[1]).read_text()   # built artifact page (no skeleton)
mode = sys.argv[2]                             # "pwa" | "ios"
out = pathlib.Path(sys.argv[3])
head_end = src.index("</style>") + len("</style>")
head, body = src[:head_end], src[head_end:]
meta = ['<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '<meta name="apple-mobile-web-app-capable" content="yes">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
        '<meta name="apple-mobile-web-app-title" content="QCVN 10">',
        '<meta name="format-detection" content="telephone=no">']
if mode == "pwa":
    meta += ['<link rel="manifest" href="manifest.webmanifest">',
             '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
             '<link rel="icon" type="image/png" href="icon-192.png">']
extra_css = """<style>
html { padding-top: env(safe-area-inset-top, 0px); -webkit-tap-highlight-color: transparent; }
[hidden] { display: none !important; }
body { margin: 0; overscroll-behavior-y: none; }
img { max-width: 100%; }
</style>"""
sw = ""
if mode == "pwa":
    sw = """<script>
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
</script>"""
doc = "<!doctype html>\n<html lang=\"vi\">\n<head>\n" + "\n".join(meta) + "\n" + head + "\n" + extra_css + "\n</head>\n<body>\n" + body + "\n" + sw + "\n</body>\n</html>\n"
out.write_text(doc)
print(out, len(doc))
