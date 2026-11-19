"""Publish creator interviews as static, individually addressable catalogue pages."""
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
import json
import re


FIVE_WS = ('who', 'what', 'why', 'where', 'when')
SHORT_LABELS = {key: key.capitalize() for key in (*FIVE_WS, 'how')}
SHORT_LABELS['future-vision'] = 'Future vision'


def story_path(slug):
    return f'interviews/{slug}/'


def display_with_interview(markup, url):
    """Keep one direct link next to the asset dossier, also for templated displays."""
    markup = re.sub(r'<a\b[^>]* data-creator-interview\b[^>]*>.*?</a>', '', markup)
    if not url:
        return markup
    link = f'<a class="button secondary" data-creator-interview href="{escape(url)}">Read the interview</a>'
    anchor = r'(<section class="product-hero">.*?<div class="hero-actions">.*?)</div>'
    markup, count = re.subn(anchor, lambda match: match[1] + link + '</div>', markup, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected one set of project actions for {url}, found {count}')
    return markup


def page(title, summary, route, base, content, article=False):
    prefix = urlsplit(base).path
    current = '' if article else ' aria-current="page"'
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>{escape(title)} — THEARCHITECT_MAX</title>
  <meta name="description" content="{escape(summary)}">
  <meta property="og:type" content="{'article' if article else 'website'}">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(summary)}">
  <link rel="canonical" href="{base}{route}">
  <link rel="stylesheet" href="{prefix}assets/im4.css?v=im36">
  <link rel="stylesheet" href="{prefix}assets/interviews.css?v=1">
</head>
<body class="journal">
  <a class="skip" href="#main">Skip to content</a>
  <header class="journal-header">
    <div class="journal-shell journal-bar">
      <a class="brand" href="{prefix}" aria-label="THEARCHITECT_MAX portfolio">
        <span class="monogram" aria-hidden="true">TA</span>
        <span class="brand-copy"><strong>THEARCHITECT_MAX</strong><span>Private Technology · Public Catalogue</span></span>
      </a>
      <nav class="journal-links" aria-label="Portfolio navigation">
        <a href="{prefix}">Overview</a>
        <a href="{prefix}displays/">Project displays</a>
        <a href="{prefix}interviews/"{current}>Interviews</a>
      </nav>
    </div>
  </header>
  <main id="main" tabindex="-1" class="journal-shell">
{content}
  </main>
  <footer class="journal-footer"><div class="journal-shell journal-bar">
    <span>© 2026 THEARCHITECT_MAX</span>
    <nav class="journal-links" aria-label="Footer"><a href="{prefix}interviews/">All interviews</a><a href="{prefix}">Portfolio overview</a></nav>
  </div></footer>
  <script src="{prefix}assets/audio-player.js?v=music3" defer></script>
</body>
</html>
'''


def render_index(stories, base):
    prefix = urlsplit(base).path
    summary = 'Harm Booij explains why he started each project, who it is for and what he wants it to become.'
    feature = ''
    rows = []
    for project, story in stories:
        url = prefix + story_path(project['slug'])
        if 'excerpt' in story and not feature:
            excerpt = story['excerpt']
            section = next(s for s in story['sections'] if s['id'] == excerpt['section'])
            if not any(excerpt['text'] in qa['answer'] for qa in section['questions']):
                raise ValueError(f"Excerpt does not match an answer in {story['ref']}")
            feature = f'''<figure class="journal-excerpt">
          <blockquote>“{escape(excerpt['text'])}”</blockquote>
          <figcaption>Harm Booij on <a href="{url}#{section['id']}">{escape(project['title'])}</a></figcaption>
        </figure>'''
        rows.append(f'''      <li class="story-row">
        <div class="story-identity"><span class="journal-label">{escape(project['ref'])}</span><p>{escape(project['title'])}</p></div>
        <div class="story-description"><h2><a href="{url}">{escape(story['title'])}</a></h2><p>{escape(story['summary'])}</p></div>
        <div class="story-actions"><a class="journal-button" href="{url}" aria-label="Read the interview about {escape(project['title'])}">Read interview</a>
          <a class="text-link" href="{url}#future-vision" aria-label="Future vision for {escape(project['title'])}">Future vision</a></div>
      </li>''')
    listing = '\n'.join(rows)
    content = f'''    <header class="journal-masthead">
      <div><p class="journal-label">Conversations with the creator</p><h1>Interviews</h1><p class="journal-deck">{summary}</p></div>
      {feature}
    </header>
    <ul class="story-list" aria-label="Project interviews">
{listing}
    </ul>'''
    return page('Interviews with Harm Booij', summary, 'interviews/', base, content)


def paragraphs(lines):
    return '\n'.join(f'            <p>{escape(line)}</p>' for line in lines)


def render_section(section):
    key = section['id']
    heading = escape(section['heading'])
    label = f'<p class="journal-label">{SHORT_LABELS[key]}</p>' if key in SHORT_LABELS else ''
    questions = []
    for qa in section['questions']:
        questions.append(f'''        <div class="exchange">
          <h3>{escape(qa['question'])}</h3>
          <div class="answer">
{paragraphs(qa['answer'])}
          </div>
        </div>''')
    return f'''      <section class="interview-chapter" id="{key}" aria-labelledby="{key}-heading">
        {label}<h2 id="{key}-heading">{heading}</h2>
{chr(10).join(questions)}
      </section>'''


def render_article(project, story, base):
    prefix = urlsplit(base).path
    sections = story['sections']
    section_ids = [s['id'] for s in sections]
    if (len(set(section_ids)) != len(sections) or not set((*FIVE_WS, 'future-vision')) <= set(section_ids)
            or not all(re.fullmatch(r'[a-z][a-z0-9-]*', key) for key in section_ids)):
        raise ValueError(f"Invalid interview chapters for {project['ref']}")
    topics = '\n'.join(f'<li><a href="#{s["id"]}">{escape(SHORT_LABELS.get(s["id"], s["heading"]))}</a></li>' for s in sections)
    published = date.fromisoformat(story['published'])
    title = escape(story['title'])
    display_url = urlsplit(project['displayUrl']).path
    project_name = escape(project['title'])
    details = '\n'.join(f'<div><dt>{escape(k)}</dt><dd>{escape(v)}</dd></div>' for k, v in story['details'].items())
    credits = '<br>'.join(escape(line) for line in story['credit'])
    chapters = '\n'.join(render_section(s) for s in sections)
    content = f'''    <article>
      <header class="article-masthead">
        <nav class="journal-breadcrumb" aria-label="Breadcrumb"><a href="{prefix}interviews/">Interviews</a><span aria-hidden="true">/</span><a href="{display_url}">{project_name}</a></nav>
        <h1>{title}</h1>
        <p class="article-byline">An interview with <strong>Harm Booij</strong> <span aria-hidden="true">·</span> <time datetime="{published.isoformat()}">{published.day} {published.strftime('%B %Y')}</time></p>
        <div class="article-start"><a class="journal-button" href="#{sections[0]['id']}">Start the interview</a><a class="text-link" href="#future-vision">Jump to the future vision</a></div>
      </header>
      <div class="interview-layout">
        <aside class="interview-side"><nav aria-label="Interview chapters">
          <details class="chapter-menu" open><summary>In this interview</summary><ul>{topics}</ul></details>
          <a class="project-return" href="{display_url}">View project display</a>
        </nav></aside>
        <div class="interview-copy">
          <div class="interview-intro">{paragraphs(story['introduction'])}</div>
{chapters}
          <footer class="interview-end">
            <p class="journal-label">About this interview</p>
            <p class="credit">{credits}</p>
            <dl class="interview-facts">{details}</dl>
            <p class="editorial-note">{escape(story['editorialNote'])}</p>
            <div class="article-start"><a class="journal-button" href="{display_url}">View project display</a><a class="text-link" href="{prefix}interviews/">All interviews</a></div>
          </footer>
        </div>
      </div>
    </article>'''
    return page(story['title'] + ' · ' + project['title'], story['summary'],
                story_path(project['slug']), base, content, article=True)


def build_interviews(root: Path, projects, base):
    folder = root / 'interviews'
    sources = {p.parent.name: p for p in folder.glob('*/transcript.json')}
    stories = []
    for project in projects:
        slug = project['slug']
        source = sources.pop(slug, None)
        url = urlsplit(base).path + story_path(slug) if source else ''
        display = root / 'displays/products' / slug / 'index.html'
        old = display.read_text(encoding='utf-8')
        new = display_with_interview(old, url)
        if new != old:
            display.write_text(new, encoding='utf-8')
        if source:
            story = json.loads(source.read_text(encoding='utf-8'))
            if story['ref'] != project['ref'] or story['details']['Project'] != project['title']:
                raise ValueError(f'Interview and catalogue identity mismatch for {slug}')
            source.with_name('index.html').write_text(render_article(project, story, base), encoding='utf-8')
            stories.append((project, story))
    if sources:
        raise ValueError(f'Interviews without matching catalogue projects: {sorted(sources)}')
    (folder / 'index.html').write_text(render_index(stories, base), encoding='utf-8')
    return {project['slug']: story_path(project['slug']) for project, _ in stories}
