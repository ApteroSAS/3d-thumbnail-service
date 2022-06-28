FROM ubuntu:18.04

RUN apt-get update
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

RUN apt-get -y install libglu1-mesa-dev freeglut3-dev mesa-common-dev xbase-clients xterm xvfb vnc4server x11-apps mesa-utils


RUN apt-get -y autoremove
RUN rm -rf /var/lib/apt/lists/*

#ENV BLENDER_BZ2_URL https://mirror.clarkson.edu/blender/release/Blender2.79/blender-2.79b-linux-glibc219-x86_64.tar.bz2
ENV BLENDER_BZ2_URL https://mirror.clarkson.edu/blender/release/Blender2.82/blender-2.82a-linux64.tar.xz

RUN mkdir /usr/local/blender
RUN	cd /usr/local/blender && curl -SL "$BLENDER_BZ2_URL" -o blender.tar
RUN	cd /usr/local/blender && tar -xvf blender.tar -C /usr/local/blender --strip-components=1 && rm blender.tar

	 
RUN /usr/local/blender/blender -b --version

VOLUME /media

COPY ./empty.blend /media/
COPY ./script.py /media/

#ENTRYPOINT ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 1024x768x24\" /usr/local/blender/blender -noaudio -d --background /media/blender_2.79_empty.blend --render-output /media/frame_### --render-frame 1"]
ENTRYPOINT ["/bin/sh", "-c", "/usr/bin/xvfb-run -a -s \"-screen 0 1024x768x24\" /usr/local/blender/blender -noaudio -d --background /media/empty.blend --python /media/script.py"]