# Prepara o site para o domínio final (rodar UMA vez quando o domínio estiver apontado para a Vercel):
#   python scripts/publicar.py draamaynarasousa.com.br
# - tira o noindex de todas as páginas (libera o Google)
# - deixa canonical, og:url, og:image e os dados estruturados com o endereço completo
# - gera o sitemap.xml e coloca a linha dele no robots.txt
# - deixa os links do llms.txt com o endereço completo
import os, re, sys, json, glob, datetime
from urllib.parse import urljoin

if len(sys.argv) < 2: sys.exit('uso: python scripts/publicar.py dominio.com.br')
DOM = sys.argv[1].strip().rstrip('/').replace('https://', '').replace('http://', '')
BASE = f'https://{DOM}/'
SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
os.chdir(SITE)

def page_url(f):
    rel = f.replace('\\', '/')
    return BASE if rel == 'index.html' else BASE + rel[:-len('index.html')]

URL_KEYS = {'url', '@id', 'item', 'image', 'logo', 'contentUrl', 'thumbnailUrl', 'hasMap', 'mainEntityOfPage'}
def absolutize(o, base):
    if isinstance(o, dict):
        return {k: (urljoin(base, v) if k in URL_KEYS and isinstance(v, str) and not v.startswith(('http', 'tel:', 'mailto:')) else absolutize(v, base)) for k, v in o.items()}
    if isinstance(o, list): return [absolutize(x, base) for x in o]
    return o

files = ['index.html'] + sorted(glob.glob('*/index.html')) + sorted(glob.glob('blog/*/index.html'))
for f in files:
    u = page_url(f); s = open(f, encoding='utf-8', newline='').read()
    s = re.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">', s)
    s = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + u + m.group(2), s)
    s = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + u + m.group(2), s)
    s = re.sub(r'(<meta (?:property|name)="(?:og:image|twitter:image)" content=")([^"]*)(")', lambda m: m.group(1) + urljoin(u, m.group(2)) + m.group(3), s)
    def ld(m):
        try: d = json.loads(m.group(1))
        except Exception: return m.group(0)
        d = absolutize(d, u)
        for n in (d.get('@graph', [d]) if isinstance(d, dict) else []):
            if isinstance(n, dict) and n.get('@type') in ('Physician', 'MedicalClinic', 'MedicalBusiness') and 'url' not in n:
                n['url'] = BASE
        return '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False) + '</script>'
    s = re.sub(r'<script type="application/ld\+json">(.*?)</script>', ld, s, flags=re.S)
    open(f, 'w', encoding='utf-8', newline='').write(s)

today = datetime.date.today().isoformat()
def prio(f):
    if f == 'index.html': return '1.0'
    if f.startswith('blog/') and f != 'blog/index.html': return '0.6'
    return '0.8'
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for f in files:
    xml.append(f'  <url><loc>{page_url(f)}</loc><lastmod>{today}</lastmod><priority>{prio(f)}</priority></url>')
xml.append('</urlset>')
open('sitemap.xml', 'w', encoding='utf-8', newline='\n').write('\n'.join(xml) + '\n')

r = open('robots.txt', encoding='utf-8').read()
r = re.sub(r'#?\s*Ao publicar: Sitemap: .*|^Sitemap: .*$', f'Sitemap: {BASE}sitemap.xml', r, flags=re.M)
if 'Sitemap:' not in r: r = r.rstrip() + f'\n\nSitemap: {BASE}sitemap.xml\n'
open('robots.txt', 'w', encoding='utf-8', newline='\n').write(r)

t = open('llms.txt', encoding='utf-8').read()
t = re.sub(r'\]\((/[^)]*)\)', lambda m: '](' + BASE.rstrip('/') + m.group(1) + ')', t)
open('llms.txt', 'w', encoding='utf-8', newline='\n').write(t)
print(f'ok: {len(files)} páginas liberadas para o Google em {BASE}, sitemap.xml com {len(files)} URLs, robots.txt e llms.txt atualizados')
