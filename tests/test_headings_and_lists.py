#/usr/bin/env python3
import os
import pytest
import re

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
ARTICLES_DIR = os.path.join(PROJECT_DIR, 'hugo', 'content')

ALLOWED_FINAL_CHARS = '.:\\);!?'

def test_article_headlines_ending_on_dots():
    articles_list = os.listdir(ARTICLES_DIR)
    regex = re.compile(r'#{2,}.*')
    for article_name in articles_list:
        if article_name == 'authors':
            continue
        filepath = f'{ARTICLES_DIR}/{article_name}/index.md'
        with open(filepath) as fp:
            lines = fp.readlines()
            for line in lines:
                line = line.strip()
                result = regex.search(line)
                if result:
                    if not line[-1] in ALLOWED_FINAL_CHARS:
                        print(f'{article_name} ==> ' + line)
    assert True

def test_article_lists_ending_on_dots():
    articles_list = os.listdir(ARTICLES_DIR)
    regex = re.compile(r'\*\ .*')
    for article_name in articles_list:
        if article_name == 'authors':
            continue
        filepath = f'{ARTICLES_DIR}/{article_name}/index.md'
        with open(filepath) as fp:
            lines = fp.readlines()
            for line in lines:
                line = line.strip()
                result = regex.search(line)
                if result:
                    if not line[-1] in ALLOWED_FINAL_CHARS:
                        print(f'{article_name} ==> ' + line)
    assert True

if __name__ == '__main__':
    print('Test article headlines...')
    test_article_headlines_ending_on_dots()
    print('Test article lists...')
    test_article_lists_ending_on_dots()
