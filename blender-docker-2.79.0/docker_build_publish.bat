rem IF [%1] == [] GOTO error


docker login
call build.bat

rem RUN DOCKER TO PUBLISH
rem docker tag docker-blender:latest registry.aptero.co/docker-blender:latest
rem docker push registry.aptero.co/docker-blender:latest

docker tag docker-blender:latest registry.aptero.co/docker-blender:2.79-latest
docker tag docker-blender:latest docker-blender:2.79-latest
docker push registry.aptero.co/docker-blender:2.79-latest

docker tag docker-blender:latest registry.aptero.co/docker-blender:2.79-1.0.0
docker push registry.aptero.co/docker-blender:2.79-1.0.0


GOTO :EOF
:error
ECHO incorrect_parameters