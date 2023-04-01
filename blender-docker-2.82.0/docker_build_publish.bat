rem IF [%1] == [] GOTO error


docker login
call build.bat

rem RUN DOCKER TO PUBLISH
docker tag docker-blender:latest registry.aptero.co/docker-blender:2.82-latest
docker tag docker-blender:latest docker-blender:2.82-latest
docker push registry.aptero.co/docker-blender:2.82-latest

docker tag docker-blender:latest registry.aptero.co/docker-blender:2.82-1.0.0
docker push registry.aptero.co/docker-blender:2.82-1.0.0


GOTO :EOF
:error
ECHO incorrect_parameters