"""Produce three self-contained HTML typography options from the built homepage."""
import base64
import json
import mimetypes
import re
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

ROOT = Path("_site")
OUT = Path("typography-variants")
OUT.mkdir(exist_ok=True)
SPECS = json.loads(Path("_preview/typography/specs.json").read_text())
FONT_REF = "2eb0b48d5f760f62e286216f0859a8c540dbc1bd"
source = (ROOT / "index.html").read_text()
base_css = (ROOT / "assets/academic/styles.css").read_text()
theme_js = (ROOT / "assets/academic/theme.js").read_text()

def data_url(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    return "data:" + mime + ";base64," + base64.b64encode((ROOT / path.lstrip("/")).read_bytes()).decode()

for spec in SPECS:
    address = "https://raw.githubusercontent.com/google/fonts/" + FONT_REF + "/"
    with urlopen(address + quote(spec["font"]), timeout=60) as response:
        font = base64.b64encode(response.read()).decode()
    license_path = spec["font"].rsplit("/", 1)[0] + "/OFL.txt"
    with urlopen(address + license_path, timeout=60) as response:
        license_text = response.read().decode()
    override = """
@font-face {
  font-family: PreviewType;
  src: url(data:font/ttf;base64,FONT_DATA) format("truetype");
  font-style: normal;
  font-weight: 200 900;
  font-display: block;
}
:root { --sans: PreviewType, "Segoe UI", "Microsoft YaHei", sans-serif; --serif: var(--sans); }
body { font-size: BODY_SIZEpx; font-optical-sizing: auto; }
.profile h1 { font-family: var(--sans); font-size: NAME_SIZEpx; font-weight: NAME_WEIGHT; letter-spacing: TRACKING; line-height: 1.22; }
.wordmark { font-family: var(--sans); font-size: 18px; font-weight: 500; letter-spacing: -.02em; }
.eyebrow { text-transform: none; font-size: 10px; letter-spacing: .035em; font-weight: 500; }
.bio p { font-size: BODY_SIZEpx; line-height: 1.85; }
.section-heading h2 { font-family: var(--sans); font-size: HEADING_SIZEpx; font-weight: HEADING_WEIGHT; letter-spacing: -.02em; }
.education-copy h3 { font-family: var(--sans); font-size: SCHOOL_SIZEpx; font-weight: 500; letter-spacing: -.015em; }
.publication h3 { font-size: PAPER_SIZEpx; font-weight: 500; letter-spacing: -.012em; }
.paper-index { font-family: var(--sans); font-size: 22px; font-weight: 400; }
.subpage-heading h1 { font-family: var(--sans); font-size: NAME_SIZEpx; font-weight: NAME_WEIGHT; letter-spacing: TRACKING; }
@media (max-width:700px) {
  .profile h1 { font-size: MOBILE_SIZEpx; }
  .wordmark { font-size: 17px; }
  .bio p { font-size: 15px; }
  .section-heading h2 { font-size: 22px; }
  .education-copy h3 { font-size: 19px; }
  .publication h3 { font-size: 17px; }
}
@media (max-width:450px) {
  .profile h1 { font-size: MOBILE_SIZEpx; }
  .eyebrow { font-size: 8px; letter-spacing: .02em; }
  .section-heading h2 { font-size: 21px; }
  .education-copy h3 { font-size: 18px; }
}
"""
    replacements = {"FONT_DATA": font, "NAME_SIZE": spec["name"], "NAME_WEIGHT": spec["nameWeight"],
                    "BODY_SIZE": spec["body"], "HEADING_SIZE": spec["heading"], "HEADING_WEIGHT": spec["headingWeight"],
                    "SCHOOL_SIZE": spec["school"], "PAPER_SIZE": spec["paper"], "TRACKING": spec["tracking"], "MOBILE_SIZE": spec["mobile"]}
    for key, value in replacements.items():
        override = override.replace(key, str(value))
    html = re.sub(r'<link rel="stylesheet"[^>]+>', lambda m: "<style>\n" + base_css + override + "\n</style>", source)
    html = re.sub(r'<script src="[^"]+" defer></script>', lambda m: "<script>\n" + theme_js + "\n</script>", html)
    html = re.sub(r'(?:src|href)="(/(?:assets/academic|images)/[^"]+)"',
                  lambda m: m.group(0).split("=")[0] + '="' + data_url(m.group(1)) + '"', html)
    html = html.replace('href="/#', 'href="#').replace('href="/"', 'href="#top"').replace('href="/publications/"', 'href="#publications"')
    html = html.replace("<title>Lixian Chen | Homepage</title>", "<title>Lixian Chen | " + spec["label"] + "</title>")
    html = html.replace("</head>", "<!-- Embedded font license:\n" + license_text.replace("--", "- -") + "\n-->\n</head>")
    assert html.count('<article class="publication">') == 3
    assert "ICIC" not in source  # Check content before embedded font bytes are added.
    assert not re.search(r'(?:src|href)="/(?:assets|images)/', html)
    assert 'rel="stylesheet"' not in html
    assert 'src="https://' not in html
    assert "{{" not in html and "{%" not in html
    target = OUT / (spec["id"] + ".html")
    target.write_text(html, encoding="utf-8")
    print("Generated", target, "bytes:", target.stat().st_size)
