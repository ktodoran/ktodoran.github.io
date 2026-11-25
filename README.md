# ktodoran.github.io

Source for my personal site: <https://ktodoran.github.io>

It's a single static page. No framework, no build step, no JavaScript.

## Structure

```
index.html     Page content
styles.css     All styles, including light and dark themes
favicon.svg    Site icon
og.png         Social preview image (1200x630)
Kyle_Todoran_Resume.pdf
fonts/         Self-hosted variable fonts and their licenses
```

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

GitHub Pages serves the `main` branch root. Pushing to `main` publishes the site.

## Fonts

[Bricolage Grotesque](https://github.com/ateliertriay/bricolage) and
[Source Serif 4](https://github.com/adobe-fonts/source-serif) are self-hosted
under the SIL Open Font License 1.1. License texts are in `fonts/`.
