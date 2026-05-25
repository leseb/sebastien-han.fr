# sebastien-han.fr

Personal website and blog of Sébastien Han — Senior Principal Software Engineer at Red Hat.

## Stack

- **Static site generator**: [Hugo](https://gohugo.io/) v0.161.1 (extended)
- **Hosting**: GitHub Pages with GitHub Actions CI/CD
- **DNS**: OVH
- **Domain**: [sebastien-han.fr](https://sebastien-han.fr)

## Design

- Dark theme with oklch color system
- Heading font: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)
- Monospace: JetBrains Mono
- Blog design inspired by [OGX blog](https://ogx-ai.github.io/blog) — 70vh hero headers, staggered animations, traffic-light code blocks, scroll progress bar
- Landing page with animated gradient glow, spring physics scroll animations

## Content

- 370+ blog posts (2011–2021) migrated from Hexo
- Topics: Ceph, OpenStack, Kubernetes, Rook, Containers, AI/ML
- PDF presentations bundled locally in `static/down/`

## Development

```bash
cd hugo
hugo server
```

## Deployment

Push to `main` triggers the GitHub Actions workflow (`.github/workflows/hugo.yml`) which builds and deploys to GitHub Pages automatically.

## Structure

```
hugo/
├── assets/css/          # Main stylesheet + syntax highlighting
├── content/blog/        # All blog posts (markdown)
├── data/                # Landing page data (skills, experience)
├── layouts/             # Hugo templates
│   ├── blog/            # Blog list + single post
│   ├── _default/        # Taxonomy, terms, base
│   ├── partials/        # Head, header, footer
│   └── shortcodes/      # PDF viewer, YouTube
├── static/
│   ├── images/          # Blog post images
│   ├── img/             # Landing page icons + avatar
│   ├── down/            # PDF presentations
│   └── js/              # Main JS, spring physics
└── hugo.toml            # Site configuration
```
