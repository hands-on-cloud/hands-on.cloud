#!/usr/bin/env python3
'''
Original solution is available here: https://bart.degoe.de/use-google-cloud-text-to-speech-to-create-an-audio-version-of-your-blog-posts/
'''
import argparse
import functools
import logging
import os
import re
import sys
from glob import glob
from os import listdir
from pathlib import Path
from bs4 import BeautifulSoup
from google.cloud import texttospeech
from markdown import markdown
from pydub import AudioSegment

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(message)s')

parser = argparse.ArgumentParser(description='Create Audio From Article Text.')
parser.add_argument('article_path', metavar='article_path', type=str, help='Path to the article')
args = parser.parse_args()

def clean_text(text):
    # get rid of the Hugo preamble
    text = ''.join(text.split('---')[2:]).strip()
    # get rid of superfluous newlines, as that counts towards our API limits
    text = re.sub('\n+', ' ', text)
    # we're hacking our way around the markdown by converting to html first,
    # just because BeautifulSoup makes life so easy

    html = markdown(text)

    html = re.sub(r'<pre>(.*?)</pre>', ' ', html)
    html = re.sub(r'<code>(.*?)</code>', ' ', html)
    html = re.sub(r'<script(.*?)</script>', ' ', html)
    # this removes some artifacts from Hugo shortcodes
    html = re.sub(r'{{(.*?)}}', '', html)
    html = re.sub(r'\[\^.*?\]', ' ', html)
    soup = BeautifulSoup(html, "html.parser")
    text = ''.join(soup.findAll(text=True))
    text = re.sub(r'(\*\ )', ' ', text)
    text = re.sub(r'(#+)', ' ', text)
    # get rid of superfluous whitespace
    return re.sub(r'\s+', ' ', text)

def convert_to_audio(name, text, save_to):
    # initialize the API client
    client = texttospeech.TextToSpeechClient()
    # we can send up to 5000 characters per request, so split up the text
    step = 5000
    for j, i in enumerate(range(0, len(text), step)):
        synthesis_input = texttospeech.SynthesisInput(text=text[i:i+step])
        voice = texttospeech.VoiceSelectionParams(
            language_code='en-US',
            name='en-US-Wavenet-B'
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )
        logging.info(f'Synthesizing speech for {name}_{j}')
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        with open(f'{name}_{j}.mp3', 'wb') as out:
            # Write the response to the output file.
            out.write(response.audio_content)
            logging.info(f'Audio content written to file "{name}_{j}.mp3"')
        mp3_segments = sorted(glob(f'{name}_*.mp3'))
        segments = [AudioSegment.from_mp3(f) for f in mp3_segments]

        logging.info(f'Stitching together {len(segments)} mp3 files for {name}')
        audio = functools.reduce(lambda a, b: a + b, segments)

        logging.info(f'Exporting {name}.mp3')
        audio.export(f'{save_to}/{name}.mp3', format='mp3')

        logging.info('Removing intermediate files')
        for f in mp3_segments:
            os.remove(f)

def text_to_speech(filename):
    name = os.path.basename(filename.name).replace('.md', '')
    full_name = filename.name
    path = Path(full_name)
    save_to = path.parent
    data = filename.read()
    text = clean_text(data)
    #print(text)
    convert_to_audio(name, text, save_to)

if __name__ == '__main__':

    article_path = args.article_path
    if not os.path.isdir(article_path):
        print('The path specified does not exist')
        sys.exit()

    if len(glob(f'{article_path}/index.md')) > 0:
        f = open(f'{article_path}/index.md', 'r', encoding='utf-8')
        text_to_speech(f)
        f.close()
