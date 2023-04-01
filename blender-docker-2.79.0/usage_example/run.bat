rem docker run --rm -v C:\Workspace\ApteroVR\tmp\blend\media:/media/ zocker160/blender /media/a.blend -o /media/frame_### -f 1
rem docker run --rm -v %CD%\media\script.py:/media/script.py -v %CD%\media\in:/media/in -v %CD%\media\out:/media/out docker-blender
docker run --rm -v %CD%\media\script.py:/media/script.py -v %CD%\media\out:/media/out docker-blender:2.79-latest
rem docker run --rm -v ./media/:/media/ registry.aptero.co/docker-blender:latest
rem sudo docker run --rm -v /workspace/config/apterodevhub/3dpreview/tmp/media/in:/media/in -v /workspace/config/apterodevhub/3dpreview/tmp/media/out:/media/out registry.aptero.co/docker-blender:latest