#!/usr/bin/python3
import bpy
import sys
import time
import argparse
import os
import shutil

'''
Description: An enhanced version of blenderSimplify.py that stores models and its textures in a folder 
with the name as the decimation ratio. blendersimplify.py is a Python Tool that decimates an OBJ 3D model into lower resolutions (in nb of faces)
It uses the Blender Python API.
Requirements: You need only to install Blender first on the OS in question
          Example in Ubuntu Server 16.04: 'sudo apt-get install blender'
          Example in Fedora 26:           'sudo dnf install blender'
          Make sure you can call Blender from cmd/terminal etc...
Usage: blender -b -P blenderSimplifyV2.py -- --ratio 0.5 --inm 'Original_Mesh.obj' --outm 'Output_Mesh.obj'
After --inm:  you specify the original mesh to import for decimation
      --outm: you specify the final output mesh name to export
      --ratio: this ratio should be between 0.1 and 1.0(no decimation occurs). If you choose
      Per example --ratio 0.5 meaning you half the number of faces so if your model is 300K faces
      it will be exported as 150K faces
PS: this tool does not try to preserve the integrity of the mesh so be carefull in choosing
the ratio (try not choose a very low ratio)
Enjoy!
'''
 
ratio = 0.1
decimateRatio = float(ratio)
print(decimateRatio)

input_model = str("C:\Users\pierr\Downloads\R+1 3D - 20191008.obj")
print(input_model)

output_model = str("C:\Users\pierr\Downloads\decimated.obj")
print(output_model)

print('\n Clearing blender scene (default garbage...)')
# deselect all
bpy.ops.object.select_all(action='DESELECT')

# selection
bpy.data.objects['Camera'].select = True

# remove it
bpy.ops.object.delete() 

# Clear Blender scene
# select objects by type
for o in bpy.data.objects:
    if o.type == 'MESH':
        o.select = True
    else:
        o.select = False

# call the operator once
bpy.ops.object.delete()

print('\nImporting the input 3D model, please wait.......')
bpy.ops.import_scene.obj(filepath=input_model)
print('\nObj file imported successfully ...')

#Creating a folder named as the Number of faces: named '150000'
print('\n Creating a folder to store the decimated model ...........')
nameOfFolder = float(ratio) * 100
if not os.path.exists(str(nameOfFolder) + "%"):
    os.makedirs(str(nameOfFolder) + "%")

#sys.exit()

print('\n Beginning the process of Decimation using Blender Python API ...')
modifierName='DecimateMod'

print('\n Creating and object list and adding meshes to it ...')
objectList=bpy.data.objects
meshes = []
for obj in objectList:
  if(obj.type == "MESH"):
    meshes.append(obj)

print("{} meshes".format(len(meshes)))

for i, obj in enumerate(meshes):
  bpy.context.scene.objects.active = obj
  print("{}/{} meshes, name: {}".format(i, len(meshes), obj.name))
  print("{} has {} verts, {} edges, {} polys".format(obj.name, len(obj.data.vertices), len(obj.data.edges), len(obj.data.polygons)))
  modifier = obj.modifiers.new(modifierName,'DECIMATE')
  modifier.ratio = decimateRatio
  modifier.use_collapse_triangulate = True
  bpy.ops.object.modifier_apply(apply_as='DATA', modifier=modifierName)
  print("{} has {} verts, {} edges, {} polys after decimation".format(obj.name, len(obj.data.vertices), len(obj.data.edges), len(obj.data.polygons)))

bpy.ops.export_scene.obj(filepath=str(nameOfFolder) + "%/" + output_model)
print('\nProcess of Decimation Finished ...')
print('\nOutput Mesh is stored in corresponding folder ...')

print('\n Copying textures (PNG and JPEG) into the folder of decimated model....')
#Now checking for textures in the folder of the input mesh.... (plz change if needed)
allfilelist= os.listdir('.')

for Afile in allfilelist[:]: 
    if not(Afile.endswith(".png") or Afile.endswith(".PNG") or Afile.endswith(".jpg") or Afile.endswith(".JPG")):
        allfilelist.remove(Afile)
print('\n Found the LIST of images in PNG and JPEG (textures): ')
print(allfilelist)

for file in allfilelist:
    shutil.copy(file, str(nameOfFolder) + "%")
