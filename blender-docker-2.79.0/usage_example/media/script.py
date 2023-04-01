import bpy

# Create a new scene
scene = bpy.context.scene

# Create a mesh object for the flower
flower_mesh = bpy.data.meshes.new("FlowerMesh")

# Define the vertices and faces of the mesh object
vertices = [(0, 0, 0), (0, 1, 0), (1, 1, 0), (1, 0, 0), (0.5, 0.5, 1)]
faces = [(0, 1, 2, 3), (0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]
flower_mesh.from_pydata(vertices, [], faces)

# Create a new object for the flower
flower_obj = bpy.data.objects.new("Flower", flower_mesh)

# Link the mesh object to the flower object
flower_obj.data = flower_mesh

# Set the diffuse color of the flower
flower_obj.color = (1.0, 0.5, 0.5, 1.0)

# Add the flower object to the scene
scene.collection.objects.link(flower_obj)

filepath = "/media/out.glb"
bpy.ops.export_scene.gltf(filepath=filepath, export_format='GLB')