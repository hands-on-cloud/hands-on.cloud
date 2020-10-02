#!/usr/bin/env bash

HUGO_CONTENT=$(pwd)/hugo/content
cd $HUGO_CONTENT
for article in *; do
    if [ "$article" = "authors" ]; then
    continue
    fi
    echo "[Processing]: $article"
    cd "$HUGO_CONTENT/$article"
    for file in *.png; do
    webp_file="${file%.png}.webp"
    if [ ! -f "$webp_file" ]; then
        echo "Generating $webp_file..."
        convert "$file" -quality 50 -define webp:lossless=true "${webp_file}";
    fi
    done
done