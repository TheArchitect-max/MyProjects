"""Verify the published transcripts, chapter destinations and per-project cross-links."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from xml.etree import ElementTree
import json

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://thearchitect-max.github.io/MyProjects/'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.anchors = []
        self.ids = []
        self.text = []
        self.canonical = None
        self.profile_interview = None
        self.in_body = False
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'body':
            self.in_body = True
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.anchors.append(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs['href']
        if attrs.get('id') == 'app':
            self.profile_interview = attrs.get('data-project-interview')

    def handle_endtag(self, tag):
        if tag == 'body':
            self.in_body = False

    def handle_data(self, data):
        if self.in_body and data.strip():
            self.text.append(data.strip())


def validate():
    sources = {p.parent.name: p for p in (ROOT / 'interviews').glob('*/transcript.json')}
    assert sources and set(sources) == {p.parent.name for p in (ROOT / 'interviews').glob('*/index.html')}
    projects = json.loads((ROOT / 'assets/buyer-catalogue.json').read_text())['projects']
    assert set(sources) <= {p['slug'] for p in projects}
    sitemap = [loc.text for loc in ElementTree.parse(ROOT / 'sitemap.xml').iterfind('.//{*}loc')]
    index = Page(ROOT / 'interviews/index.html')
    assert index.canonical == SITE + 'interviews/' and sitemap.count(index.canonical) == 1
    total_questions = 0
    total_chapters = 0
    for project in projects:
        slug = project['slug']
        display = Page(ROOT / 'displays/products' / slug / 'index.html')
        dossier = Page(ROOT / 'projects' / slug / 'index.html')
        marked = [a['href'] for a in display.anchors if 'data-creator-interview' in a]
        if slug not in sources:
            assert not marked and dossier.profile_interview is None, slug
            continue
        story = json.loads(sources[slug].read_text())
        path = '/MyProjects/interviews/' + slug + '/'
        assert marked == [path] and dossier.profile_interview == path, slug
        assert path in [a['href'] for a in index.anchors] and path + '#future-vision' in [a['href'] for a in index.anchors], slug
        article = Page(sources[slug].with_name('index.html'))
        assert article.canonical == SITE + 'interviews/' + slug + '/' and sitemap.count(article.canonical) == 1, slug
        assert len(article.ids) == len(set(article.ids)), slug
        links = {a['href'] for a in article.anchors}
        assert {'/MyProjects/interviews/', urlsplit(project['displayUrl']).path} <= links, slug
        assert all(href[1:] in article.ids for href in links if href.startswith('#')), slug
        assert {'who','what','when','where','why','future-vision'} <= set(article.ids), slug
        assert not any('#' in t or '*' in t for t in index.text + article.text), slug
        cursor = 0
        for line in story['introduction']:
            cursor = article.text.index(line, cursor) + 1
        for section in story['sections']:
            assert '#' + section['id'] in links, (slug, section['id'])
            assert section['questions'], slug
            total_chapters += 1
            for qa in section['questions']:
                cursor = article.text.index(qa['question'], cursor) + 1
                assert qa['answer'], (slug, qa['question'])
                for paragraph in qa['answer']:
                    cursor = article.text.index(paragraph, cursor) + 1
                total_questions += 1
        assert story['editorialNote'] in article.text[cursor:], slug
    return dict(interviews=len(sources), questions=total_questions, chapters=total_chapters, projectPairsChecked=len(projects))


if __name__ == '__main__':
    print(json.dumps(validate()))
