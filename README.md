# The Wardrobe

Themes for [The Crew](https://github.com/nseidm1/The-Crew) and [The Swarm](https://github.com/nseidm1/The-Swarm).

**Try them on:** https://the-wardrobe.starny-consulting.workers.dev

Take a theme off the rail and the whole page puts it on, with the very file the app would load. The fitting room shows The Crew's own pages wearing it, captured from the app running locally.

## The rail

| Theme | Mode | What it looks like |
| --- | --- | --- |
| Original | dark | The look The Crew ships with. Smoked glass over a night ground. |
| Office | light | The team's office by day. Sage walls, frosted paper, mint buttons, a warm desk lamp. |
| Lab | light | A research-lab page. Warm white paper, near-black ink, sharp corners. |
| Arcade | light | An old 2D game on a quiet page. Cream paper, square corners, pixel headings, a strip of warm blocks. |
| Blueprint | dark | Drafting blue, a measured grid, white ink, headings in the product's own mono. |
| Riso | light | A zine in two inks. Cream stock, federal blue, fluorescent pink, grain, slightly off register. |
| Dusk | dark | For The Swarm. An indigo evening going peach, with a murmuration across the sky. |

Each theme also picks how the five are made (plain felt, felt with something from their job, or wool pompoms), drawn by `characters.js`.

## Wear one

A theme is one stylesheet. Load it after the app's own stylesheets:

```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/site.css">
<link rel="stylesheet" href="css/app.css">
<link rel="stylesheet" href="https://the-wardrobe.starny-consulting.workers.dev/themes/dusk/theme.css">
```

Or let people choose, with the engine (`wardrobe.js`, no dependencies):

```html
<script src="wardrobe.js" data-base="https://the-wardrobe.starny-consulting.workers.dev/"></script>
<script>Wardrobe.wear(Wardrobe.saved());</script>
```

| Call | Does |
| --- | --- |
| `Wardrobe.list()` | the themes on the rail, from `themes/index.json` |
| `Wardrobe.wear(id)` | adds that theme's stylesheet, resolves once it has loaded |
| `Wardrobe.off()` | back to the app's own look |
| `Wardrobe.current()` / `Wardrobe.saved()` | what is worn now, what was worn last |
| `wardrobe` event on `window` | `{ detail: { id, theme } }` after every change |

The new stylesheet goes in before the old one comes out, so a page never shows half a theme.

## The contract

A theme only sets values The Crew already reads in `css/base.css`:

`--ink` ground, `--panel` panels, `--fog` text, `--mist` and `--dim` quieter text, `--line` and `--line-2` edges, `--sheen`, `--shade`, `--smoke`, `--jade` passed, `--garnet` failed, `--gilt` running, `--em2`, `--sky`, `--vio` signature line, `--jade-ink`, `--display`, `--body`, `--mono`, `--code`, `--r` corner radius.

Plus three of its own: `--room` (what sits behind the page), `--btn` and `--btn-ink` (the main button).

**Colour still means proof.** Every theme keeps green for passed, red for failed and amber for running. Shades change, meanings do not.

A few parts of the app are dark by hand rather than by token (white glass tints, the side rail, the mode toggle). Light themes cover those with a small adapter in `adapters/light.css`. If the app's own CSS moved its literal colours onto tokens, for example `rgba(255, 255, 255, 0.04)` to `color-mix(in srgb, var(--fog) 4%, transparent)` and `rgba(52, 211, 153, 0.5)` to `color-mix(in srgb, var(--jade) 50%, transparent)`, every theme would reach every corner and the adapters could go.

## Make your own

```
themes/<id>/theme.json   name, mode, a one-line description, characters, fonts, tokens
themes/<id>/extra.css    optional flourishes (patterns, heading treatment)
```

1. Copy a folder in `themes/` and change `theme.json`.
2. Add its id to `ORDER` in `tools/build.py`, then run `python tools/build.py`. It writes `themes/<id>/theme.css` (one self-contained file) and `themes/index.json`.
3. To photograph it, run The Crew locally (`npm start` in its repo), then `node tools/shoot.mjs <id>` (needs Playwright). It saves `start.jpg` and `app.jpg` next to the theme.

## Files

```
index.html          the rail and the fitting room (built on The Crew's own tokens)
wardrobe.js         the engine
characters.js       the five of The Crew in three felt styles
adapters/           shared rules for every theme, light themes and dark themes
themes/             one folder per theme, plus index.json
tools/build.py      builds every theme.css
tools/shoot.mjs     photographs The Crew wearing each theme
```

## Credits

The Crew, The Swarm, the five characters and their colours are by [nseidm1](https://github.com/nseidm1). The themes, the felt drawings and this repo are by [Starny](https://github.com/0xStarny). Apache 2.0, like The Crew.
