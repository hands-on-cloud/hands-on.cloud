.PHONY: clean

PYTHON_VER=python3.7
_PKG_NAME=$(PYTHON_VER)_ffmpeg_common
DOT:= .
NOTHING:=
PKG_NAME=$(subst $(DOT),$(NOTHING),$(_PKG_NAME))
PKG_DIR=$(PKG_NAME)/python/lib/$(PYTHON_VER)/site-packages

all: package

package:
	docker run --rm -v `pwd`:/src -w /src python /bin/bash -c "mkdir -p $(PKG_NAME) && \
	mkdir -p $(PKG_DIR) && \
	apt-get update && \
	apt-get -y install zip && \
	pip install -r requirements.txt -t $(PKG_DIR) && \
	mkdir -p $(PKG_NAME)/bin && \
	wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
	tar -xJf ffmpeg-release-amd64-static.tar.xz && \
	cp ffmpeg-4.3.1-amd64-static/ffmpeg $(PKG_NAME)/bin/ && \
	chmod +x $(PKG_NAME)/bin/* && \
	rm -Rf ffmpeg-* && \
	cd $(PKG_NAME) && \
	zip -9 --symlinks -r ../$(PKG_NAME).zip . && \
	cd .."

deploy:
	aws lambda publish-layer-version --layer-name $(PKG_NAME) --zip-file fileb://$(PKG_NAME).zip

clean:
	rm -Rf $(PKG_NAME)
	rm -Rf $(PKG_NAME).zip
