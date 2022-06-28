import bpy
from bpy import context

####################
#import object
####################
bpy.ops.import_scene.gltf(filepath='/media/in/3dfile.glb')


####################
# Select objects that will be rendered
####################
for obj in bpy.context.scene.objects:
    obj.select_set(True)
bpy.ops.view3d.camera_to_view_selected()
        
        
##################################
#Adapt light strengh
#################################   
#https://docs.blender.org/api/current/bpy.types.Light.html  
print(bpy.data.objects['Lamp'].data)
lx = bpy.data.objects['Lamp'].matrix_world.translation.x
ly = bpy.data.objects['Lamp'].matrix_world.translation.y
lz = bpy.data.objects['Lamp'].matrix_world.translation.z
lightStrenght = lx*lx+ly*ly+lz*lz
print(lightStrenght)
bpy.data.objects['Lamp'].data.energy=lightStrenght*10
print(bpy.data.objects['Lamp'].matrix_world.translation)
#bpy.data.objects['Lamp'].data.distance=10000000000
#bpy.data.objects['Lamp'].data.cutoff_distance=10000000000

 
####################
#render
####################

bpy.context.scene.frame_current = 1
bpy.context.scene.render.filepath = (
                        "/media/out/"
                        + "thumbnail.png"
                        )
bpy.ops.render.render( #{'dict': "override"},
                      #'INVOKE_DEFAULT',  
                      False,            # undo support
                      animation=False, 
                      write_still=True
                     )