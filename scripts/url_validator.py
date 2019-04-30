import threading
import time
import urllib2
import sys
from bs4 import BeautifulSoup


def get_sitemap(url):
    response = urllib2.urlopen(url)
    return response.read()


def process_sitemap(s):
    soup = BeautifulSoup(s)
    result = []

    for loc in soup.findAll('loc'):
        result.append(loc.text)

    return result


def is_sub_sitemap(s):
    if s.endswith('.xml') and 'sitemap' in s:
        return True
    else:
        return False


def parse_sitemap(s):
    sitemap = process_sitemap(s)
    result = []

    while sitemap:
        candidate = sitemap.pop()

        if is_sub_sitemap(candidate):
            sub_sitemap = get_sitemap(candidate)
            for i in process_sitemap(sub_sitemap):
                sitemap.append(i)
        else:
            result.append(candidate)

    return result


def fetch_url(url):
    urlHandler = urllib2.urlopen(url)
    urlHandler.read()
    print("'%s\' fetched in %ss" % (url, (time.time() - start)))


start = time.time()
site_url = sys.argv[1]
sitemap = get_sitemap('{}/sitemap.xml'.format(site_url))
urls = parse_sitemap(sitemap)

threads = [threading.Thread(target=fetch_url, args=(url,)) for url in urls]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()

print("Validation compeete in: %s sec." % (time.time() - start))
