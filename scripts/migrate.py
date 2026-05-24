#!/usr/bin/env python3
"""Migrate Hexo blog posts to Hugo format."""

import os
import re
import sys
from pathlib import Path

HEXO_POSTS = Path(__file__).parent.parent.parent / "hexo" / "source" / "_posts"
HEXO_DRAFTS = Path(__file__).parent.parent.parent / "hexo" / "source" / "_drafts"
HUGO_CONTENT = Path(__file__).parent.parent / "content" / "blog"

SKIP_FILES = {"2021-10-30-.md"}

CATEGORY_NORMALIZE = {
    "container": "containers",
    "ceph Ansible": "ceph",
    "ceph Openstack": "ceph",
    "ceph Pacemaker": "ceph",
    "pacemaker DRBD": "pacemaker",
    "Ceph": "ceph",
    "Openstack": "openstack",
}


def extract_slug(filename):
    """Extract the slug from a Hexo filename like 2011-02-21-le-cloud-computing.markdown."""
    name = Path(filename).stem
    match = re.match(r"\d{4}-\d{2}-\d{2}-(.*)", name)
    if match:
        return match.group(1)
    return name


def parse_post(text):
    """Split a post into frontmatter lines and body."""
    lines = text.split("\n")
    if lines[0].strip() != "---":
        return None, text

    end = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break

    if end == -1:
        return None, text

    fm_lines = lines[1:end]
    body = "\n".join(lines[end + 1 :])
    return fm_lines, body


def parse_frontmatter(fm_lines):
    """Parse frontmatter lines into a dict (simple YAML parser for our known formats)."""
    result = {}
    current_key = None
    current_list = None

    for line in fm_lines:
        if not line.strip():
            continue

        list_match = re.match(r"^\s+-\s+(.*)", line)
        if list_match and current_key:
            if current_list is None:
                current_list = []
            current_list.append(list_match.group(1).strip())
            result[current_key] = current_list
            continue

        if current_list is not None:
            current_list = None

        kv_match = re.match(r"^(\w+):\s*(.*)", line)
        if kv_match:
            key = kv_match.group(1)
            value = kv_match.group(2).strip()
            current_key = key
            current_list = None

            if not value:
                result[key] = ""
            else:
                value = value.strip("'\"")
                result[key] = value
        else:
            current_key = None
            current_list = None

    return result


def normalize_frontmatter(fm, slug):
    """Convert Hexo frontmatter to Hugo format."""
    hugo_fm = {}

    hugo_fm["title"] = fm.get("title", slug)
    date_str = fm.get("date", "")
    if date_str and re.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$", date_str):
        date_str += ":00"
    hugo_fm["date"] = date_str
    hugo_fm["slug"] = slug
    hugo_fm["draft"] = False

    cat = fm.get("categories", "")
    if isinstance(cat, list):
        cats = cat
    elif cat:
        cats = [cat]
    else:
        cats = []
    cats = [CATEGORY_NORMALIZE.get(c, c.lower() if c else c) for c in cats if c]
    cats = list(dict.fromkeys(cats))
    hugo_fm["categories"] = cats

    tag = fm.get("tag", fm.get("tags", ""))
    if isinstance(tag, list):
        tags = [t.strip() for t in tag if t.strip()]
    elif tag:
        tags = [tag.strip()]
    else:
        tags = []
    tags = [t.lower() for t in tags if t]
    tags = list(dict.fromkeys(tags))
    hugo_fm["tags"] = tags

    return hugo_fm


def format_frontmatter(fm):
    """Format frontmatter dict as YAML."""
    lines = ["---"]

    title = fm["title"]
    if ":" in title or "'" in title or '"' in title or "#" in title:
        title_escaped = title.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'title: "{title_escaped}"')
    else:
        lines.append(f"title: {title}")

    lines.append(f"date: {fm['date']}")
    lines.append(f"slug: {fm['slug']}")
    lines.append(f"draft: {str(fm['draft']).lower()}")

    if fm["categories"]:
        cats = ", ".join(f'"{c}"' for c in fm["categories"])
        lines.append(f"categories: [{cats}]")
    else:
        lines.append("categories: []")

    if fm["tags"]:
        tags = ", ".join(f'"{t}"' for t in fm["tags"])
        lines.append(f"tags: [{tags}]")
    else:
        lines.append("tags: []")

    lines.append("---")
    return "\n".join(lines)


def convert_codeblocks(text):
    """Convert {% codeblock %} to fenced code blocks."""
    def replace_open(m):
        lang = m.group(1) or ""
        return f"```{lang.strip()}"

    text = re.sub(
        r"\{%\s*codeblock\s*(?:[^%]*?\s+)?(?:lang:(\w+))?\s*(?:[^%]*)%\}",
        replace_open,
        text,
    )
    text = re.sub(r"\{%\s*endcodeblock\s*%\}", "```", text)
    return text


def convert_img_tags(text):
    """Convert {% img %} tags to markdown images."""
    def replace_img(m):
        url = m.group(2)
        caption = m.group(3).strip() if m.group(3) else ""
        # Remove dimensions like "700 700" from caption
        caption = re.sub(r"^\d+\s+\d+\s*", "", caption).strip()
        url = rewrite_image_url(url)
        return f"![{caption}]({url})"

    text = re.sub(
        r"\{%\s*img\s+(center|left|right|)\s*(https?://\S+?)(?:\s+(\d+\s+\d+.*?|\S.*?))?\s*%\}",
        replace_img,
        text,
    )
    # Catch remaining img tags without alignment
    text = re.sub(
        r"\{%\s*img\s+(https?://\S+?)(?:\s+(.+?))?\s*%\}",
        lambda m: f"![{(m.group(2) or '').strip()}]({rewrite_image_url(m.group(1))})",
        text,
    )
    return text


def rewrite_image_url(url):
    """Rewrite sebastien-han.fr image URLs to local paths."""
    url = re.sub(
        r"https?://(?:www\.)?sebastien-han\.fr/(?:blog/)?images/",
        "/images/",
        url,
    )
    return url


def convert_more_tags(text):
    """Normalize <!-- more --> variants to <!--more-->."""
    text = re.sub(r"<!--\s*more\s*-->", "<!--more-->", text)
    return text


def convert_youtube(text):
    """Convert {% youtube ID %} to Hugo shortcode."""
    text = re.sub(
        r"\{%\s*youtube\s+(\S+)\s*%\}",
        r'{{< youtube \1 >}}',
        text,
    )
    return text


def convert_pdf(text):
    """Convert {% pdf URL %} to Hugo shortcode."""
    text = re.sub(
        r"\{%\s*pdf\s+(\S+)\s*%\}",
        r'{{< pdf "\1" >}}',
        text,
    )
    return text


def convert_blockquotes(text):
    """Convert {% blockquote %}...{% endblockquote %} to markdown blockquotes."""
    lines = text.split("\n")
    result = []
    in_blockquote = False

    for line in lines:
        if re.match(r"\s*\{%\s*blockquote\s*%\}", line):
            in_blockquote = True
            continue
        if re.match(r"\s*\{%\s*endblockquote\s*%\}", line):
            in_blockquote = False
            continue
        if in_blockquote:
            result.append(f"> {line}" if line.strip() else ">")
        else:
            result.append(line)

    return "\n".join(result)


def convert_gist(text):
    """Convert {% gist ID %} to Hugo shortcode."""
    text = re.sub(
        r"\{%\s*gist\s+(\S+)\s*%\}",
        r'{{< gist leseb \1 >}}',
        text,
    )
    return text


def convert_video(text):
    """Convert {% video 'HTML' %} to raw HTML."""
    text = re.sub(
        r"\{%\s*video\s+'(.+?)'\s*%\}",
        r"\1",
        text,
    )
    return text


def fix_html_before_blockquote(text):
    """Ensure a blank line between HTML blocks and markdown blockquotes."""
    text = re.sub(r"(<br\s*/?>)\n(>[^>])", r"\1\n\n\2", text)
    text = re.sub(r"(</\w+>)\n(>[^>])", r"\1\n\n\2", text)
    return text


def rewrite_markdown_image_urls(text):
    """Rewrite absolute image URLs in standard markdown syntax."""
    text = re.sub(
        r"(!\[[^\]]*\]\()https?://(?:www\.)?sebastien-han\.fr/(?:blog/)?images/([^)]+)\)",
        r"\1/images/\2)",
        text,
    )
    return text


def rewrite_malformed_urls(text):
    """Fix malformed double URLs like http://sebastien-han.frhttp://sebastien-han.fr/blog/images/..."""
    text = re.sub(
        r"https?://(?:www\.)?sebastien-han\.fr\s*https?://(?:www\.)?sebastien-han\.fr/",
        "https://sebastien-han.fr/",
        text,
    )
    return text


def migrate_post(src_path, dest_dir, is_draft=False):
    """Migrate a single post from Hexo to Hugo format."""
    filename = src_path.name
    if filename in SKIP_FILES:
        return None, f"SKIPPED: {filename} (in skip list)"

    text = src_path.read_text(encoding="utf-8", errors="replace")

    # Fix malformed URLs before any other processing
    text = rewrite_malformed_urls(text)

    fm_lines, body = parse_post(text)
    if fm_lines is None:
        return None, f"ERROR: {filename} has no frontmatter"

    fm = parse_frontmatter(fm_lines)
    slug = extract_slug(filename)
    hugo_fm = normalize_frontmatter(fm, slug)

    if is_draft:
        hugo_fm["draft"] = True

    # Convert body
    body = convert_blockquotes(body)
    body = convert_codeblocks(body)
    body = convert_img_tags(body)
    body = convert_more_tags(body)
    body = convert_youtube(body)
    body = convert_pdf(body)
    body = convert_gist(body)
    body = convert_video(body)
    body = rewrite_markdown_image_urls(body)
    body = fix_html_before_blockquote(body)

    frontmatter = format_frontmatter(hugo_fm)
    output = frontmatter + "\n" + body

    # Output filename: always .md
    out_name = re.sub(r"\.(markdown|md)$", ".md", filename)
    out_path = dest_dir / out_name
    out_path.write_text(output, encoding="utf-8")

    return out_path, f"OK: {filename} -> {out_name}"


def main():
    dest = HUGO_CONTENT
    dest.mkdir(parents=True, exist_ok=True)

    # Write blog section index
    index = dest / "_index.md"
    index.write_text("---\ntitle: Blog\n---\n", encoding="utf-8")

    # Write site index
    site_index = dest.parent / "_index.md"
    if not site_index.exists():
        site_index.write_text("---\ntitle: Sébastien Han\n---\n", encoding="utf-8")

    stats = {"ok": 0, "skip": 0, "error": 0}
    errors = []

    # Migrate posts
    post_files = sorted(HEXO_POSTS.glob("*"))
    print(f"Found {len(post_files)} post files")

    for src in post_files:
        if src.suffix not in (".md", ".markdown"):
            continue
        result, msg = migrate_post(src, dest)
        if msg.startswith("OK"):
            stats["ok"] += 1
        elif msg.startswith("SKIP"):
            stats["skip"] += 1
        else:
            stats["error"] += 1
            errors.append(msg)
        print(msg)

    # Migrate drafts
    if HEXO_DRAFTS.exists():
        draft_files = sorted(HEXO_DRAFTS.glob("*"))
        print(f"\nFound {len(draft_files)} draft files")
        for src in draft_files:
            if src.suffix not in (".md", ".markdown"):
                continue
            result, msg = migrate_post(src, dest, is_draft=True)
            if msg.startswith("OK"):
                stats["ok"] += 1
            elif msg.startswith("SKIP"):
                stats["skip"] += 1
            else:
                stats["error"] += 1
                errors.append(msg)
            print(msg)

    print(f"\n=== Migration Summary ===")
    print(f"OK:      {stats['ok']}")
    print(f"Skipped: {stats['skip']}")
    print(f"Errors:  {stats['error']}")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  {e}")

    return 0 if stats["error"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
