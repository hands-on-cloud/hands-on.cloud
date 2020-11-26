import os
import pytest

BASE_DIR = os.path.dirname(os.path.realpath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
ARTICLES_DIR = os.path.join(PROJECT_DIR, 'hugo', 'content')

def test_article_name_not_have_special_charecters():
    articles_list = os.listdir(ARTICLES_DIR)
    special_chars = set('!@#$%^&*()[]?{};:".')
    for article_name in articles_list:
        assert (not any((c in special_chars) for c in article_name)), f"'{article_name}' contains special character"

