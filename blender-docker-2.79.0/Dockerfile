FROM ubuntu:20.04

RUN apt-get update
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata

RUN apt-get install -y \
	unzip \
	tar \
	curl \
	bzip2 \
	libfreetype6 \
	libgl1-mesa-dev \
	libglu1-mesa \
	libxi6 \
	libxrender1 
    
RUN apt-get install -y -qqy x11-apps
RUN apt-get install -y xterm

RUN apt-get install -y mesa-common-dev
RUN apt-get install -y libosmesa6-dev
RUN apt-get install -y libglu1-mesa-dev

RUN apt-get install -y xvfb
RUN apt-get install -y xz-utils

RUN apt-get -y install libglu1-mesa-dev freeglut3-dev mesa-common-dev xbase-clients xterm xvfb x11-apps mesa-utils


RUN apt-get -y autoremove
RUN rm -rf /var/lib/apt/lists/*

ENV BLENDER_BZ2_URL https://mirror.clarkson.edu/blender/release/Blender2.79/blender-2.79b-linux-glibc219-x86_64.tar.bz2

# Setup demo environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY_WIDTH=1024 \
    DISPLAY_HEIGHT=768

RUN mkdir /usr/local/blender
RUN	cd /usr/local/blender && curl -SL "$BLENDER_BZ2_URL" -o blender.tar
RUN	cd /usr/local/blender && tar -xvf blender.tar -C /usr/local/blender --strip-components=1 && rm blender.tar

	 
RUN /usr/local/blender/blender -b --version

VOLUME /media

COPY main.blend /media/
COPY ./script.py /media/

#https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html
#ENTRYPOINT ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 1024x768x24\" /usr/local/blender/blender -noaudio -d --background /media/blender_2.79_empty.blend --python /media/script.py"]
ENTRYPOINT ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 $DISPLAY_WIDTHx$DISPLAY_HEIGHTx24\" /usr/local/blender/blender -noaudio -d --background /media/main.blend --python /media/script.py"]