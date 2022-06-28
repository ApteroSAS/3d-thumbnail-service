IF [%1] == [] GOTO error


docker login
call build.bat

rem RUN DOCKER TO PUBLISH
docker tag docker-blender:latest registry.aptero.co/docker-blender:latest
docker push registry.aptero.co/docker-blender:latest

docker tag docker-blender:latest registry.aptero.co/docker-blender:%1
docker push registry.aptero.co/docker-blender:%1


GOTO :EOF
:error
ECHO incorrect_parameters