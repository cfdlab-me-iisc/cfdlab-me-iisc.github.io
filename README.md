# Research group website template

A website for a research group, built for GitHub Pages. It has six pages
(Home, Research, Publications, People, Software and Contact) and a home page
with a looping simulation video in the background.

All content lives in plain text files in `_data/`. Adding a paper, a person
or a project means editing a list, not writing HTML. GitHub builds and
publishes the site for you every time you push a change.

Everything in the template is placeholder content: the people, papers, DOIs
and software are fictional. The videos and images in `assets/research/` and
`assets/video/` are real simulations (reaction–diffusion, wave equation,
double-gyre flow) generated for the template. Keep them or replace them.


## Publish it on GitHub Pages

1. Create a new repository on GitHub and upload the contents of this folder
   (the files themselves, not the folder) to its main branch. Or push it with
   git:
   ```
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. Open `_config.yml` and set `url` and `baseurl`:

   | Where the site will live            | `url`                        | `baseurl`  |
   |-------------------------------------|------------------------------|------------|
   | `https://<user>.github.io/<repo>/`  | `https://<user>.github.io`   | `/<repo>`  |
   | `https://<user>.github.io/`         | `https://<user>.github.io`   | `""`       |
   | A custom domain, e.g. `lab.example.edu` | `https://lab.example.edu` | `""`       |

   If the site appears without styling, `baseurl` is almost always the cause.
3. In the repository, go to **Settings → Pages**. Under *Build and
   deployment*, choose **Deploy from a branch**, then branch **main** and
   folder **/ (root)**. Save.
4. After a minute or two the site is live at the address shown on that page.
   Each later push republishes it automatically. Build errors appear under the
   repository's **Actions** tab.


## Where to edit what

| To change…                               | Edit                         |
|------------------------------------------|------------------------------|
| Group name, tagline, colours, contact details, hero video | `_config.yml` |
| The "About the lab" text on the home page | `index.md`                  |
| News items on the home page               | `_data/news.yml`            |
| Research projects, videos and figures     | `_data/research.yml`        |
| Publications                              | `_data/publications.yml`    |
| People and alumni                         | `_data/people.yml`          |
| Software                                  | `_data/software.yml`        |
| Menu items                                | `_data/navigation.yml`      |
| Page introductions                        | the `intro:` line at the top of each page file |
| "Join the lab" and Contact page text      | front matter of `people.html` and `contact.html` |
| Fonts, colours, spacing                   | the top of `assets/css/main.css` |

Each file in `_data/` starts with a comment explaining every field. YAML is
sensitive to indentation, so copy an existing entry and change its values.
Text containing a colon followed by a space should be wrapped in quotes.

### Adding a person
Copy an entry in `_data/people.yml`. Photos go in `assets/img/people/`.
Portrait crops (4:5, about 600 × 750 px, under 200 KB) work best. Without a
`photo:` line, the person's initials are shown instead.

### Adding a publication
Copy an entry in `_data/publications.yml`. Put lab members in
`**double asterisks**` to show them in bold. `doi` and `arxiv` take just the
identifier; the site builds the links. Give each paper a unique `id`. Research
projects and software entries refer to papers by that `id`, and
`/publications/#id` links straight to the paper.

### Adding a research project
Copy an entry in `_data/research.yml`. The main figure can be a video, an
image, or a YouTube or Vimeo embed. Always write an `alt:` description:
it's what screen-reader users hear instead of seeing the figure. Set
`featured: true` to show the project on the home page (the first three
featured projects are used).

### Removing the Software page
Delete `software.html` and the Software entry in `_data/navigation.yml`.


## Preparing simulation videos

Browsers play H.264 MP4 everywhere. Short, muted clips (5–15 seconds) load
quickly and loop well. These commands use [ffmpeg](https://ffmpeg.org).

**A research clip** (scaled to 1280 px wide, no audio, web-optimised):
```
ffmpeg -i input.mov -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 26 \
  -preset slow -pix_fmt yuv420p -movflags +faststart assets/research/my-clip.mp4
```
Raise `-crf` (e.g. 30) for a smaller file; lower it for higher quality.

**A poster image** (shown before the video loads, and on the home page):
```
ffmpeg -i assets/research/my-clip.mp4 -frames:v 1 -q:v 3 assets/research/my-clip.jpg
```

**From a folder of numbered frames** (`frame_0001.png`, `frame_0002.png`…):
```
ffmpeg -framerate 24 -i frame_%04d.png -c:v libx264 -crf 26 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -vf "scale=1280:-2" clip.mp4
```

**The home page background** works best when it is:
- 10–20 seconds long and under about 5 MB;
- dark or low in contrast, so the white headline stays readable;
- a seamless loop: a statistically steady state, or a periodic one, loops
  better than a simulation that starts empty and fills up.

Then point `hero.video` and `hero.poster` in `_config.yml` at your files and
update `hero.caption` and the `colorbar` block (or delete them). The poster
should be the video's first frame so the start is seamless.

**Size limits.** GitHub rejects files over 100 MB and recommends keeping a
repository under 1 GB. For long or high-resolution videos, upload them to
YouTube, Vimeo or Zenodo and use a `youtube` or `vimeo` entry instead of a
local file.


## Colours and fonts

The colour palette is defined at the top of `assets/css/main.css`, with
separate values for light and dark mode. The link colour can also be set
from `_config.yml` (`accent` and `accent_dark`). The `--cm-0` … `--cm-4`
colours are the colormap of the demo simulations; they are reused for the
footer, the initials tiles and the hero colour bar. If you change your
simulations' colormap, update these too.

Fonts are STIX Two Text (headings and text) and Instrument Sans (labels and
interface), loaded from Google Fonts in `_includes/head.html`.


## Preview on your own computer (optional)

You don't need this to publish, but it lets you check changes before
pushing. Install Ruby (see https://jekyllrb.com/docs/installation/), then
in this folder run:
```
bundle install
bundle exec jekyll serve
```
and open `http://localhost:4000/<baseurl>/`, for example
`http://localhost:4000/research-group-site/`. Changes to `_config.yml` need
a restart; everything else reloads on refresh.


## Optional extras

- **Contact form.** GitHub Pages can't process forms. Create a free form at
  [Formspree](https://formspree.io) and paste its endpoint into
  `contact.form_endpoint` in `_config.yml`; the form then appears on the
  Contact page.
- **Map.** Set `contact.map.lat` and `lon` to your building's coordinates
  (right-click a spot in OpenStreetMap or Google Maps to copy them). Delete
  the `map` block to hide the map.
- **Custom domain.** Add it under Settings → Pages → Custom domain, then set
  `url` to it and `baseurl` to `""`.
- **Social preview image.** Replace `assets/img/og-image.jpg` (1200 × 630).


## Accessibility and motion

The background video doesn't play for visitors whose system asks for reduced
motion; they see the poster image and can start it with the play button.
Research videos play only while on screen and pause otherwise. The site
works with a keyboard alone, has visible focus outlines, and its content
is all readable with JavaScript turned off; only the publication filters, the
full-size media viewer, video playback and the menu toggle need it.


## File overview

```
_config.yml          site settings
_data/               all content lists (people, publications, research…)
_includes/           reusable pieces (header, footer, publication, person…)
_layouts/            page frames (default, home, page)
assets/css/main.css  all styles
assets/js/main.js    menu, theme, video, viewer, filters, copy buttons
assets/research/     research videos and images
assets/video/        home page background video
assets/img/          favicon, social preview image, people photos
index.md, research.html, publications.html, people.html,
software.html, contact.html, 404.html   the pages
```
