"""Render the Ramesh Rentals hub concept with Blender 4.x.

Run from the repository root:
  blender --background --python tools/render_rental_hub.py
"""

from pathlib import Path
import math
import subprocess

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "concepts"
OUTPUT.mkdir(parents=True, exist_ok=True)


def material(name, color, metallic=0.0, roughness=0.45, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = (*color, 1)
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    if emission:
        principled.inputs["Emission Color"].default_value = (*emission, 1)
        principled.inputs["Emission Strength"].default_value = strength
    return mat


def cube(name, location, scale, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Soft edges", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
    obj.data.materials.append(mat)
    return obj


def cylinder(name, location, radius, depth, mat, rotation=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=radius, depth=depth, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return obj


def add_car(name, x, y, color, angle=0.0):
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)

    body = cube(f"{name} body", (x, y, 1.05), (1.35, 2.45, 0.48), color, 0.28)
    cabin = cube(f"{name} cabin", (x, y + 0.18, 1.72), (1.05, 1.22, 0.48), glass, 0.32)
    bonnet = cube(f"{name} bonnet", (x, y - 1.72, 1.28), (1.25, 0.62, 0.22), color, 0.2)
    for obj in (body, cabin, bonnet):
        for old_collection in list(obj.users_collection):
            old_collection.objects.unlink(obj)
        collection.objects.link(obj)
    for wx in (-1.27, 1.27):
        for wy in (-1.52, 1.48):
            wheel = cylinder(f"{name} wheel", (x + wx, y + wy, 0.7), 0.43, 0.28, rubber, (math.pi / 2, 0, 0))
            wheel.rotation_euler[1] = math.pi / 2
            for old_collection in list(wheel.users_collection):
                old_collection.objects.unlink(wheel)
            collection.objects.link(wheel)
    for lx in (-0.72, 0.72):
        lamp = cube(f"{name} headlamp", (x + lx, y - 2.46, 1.28), (0.27, 0.05, 0.14), headlamp, 0.05)
        for old_collection in list(lamp.users_collection):
            old_collection.objects.unlink(lamp)
        collection.objects.link(lamp)
    empty = bpy.data.objects.new(f"{name} root", None)
    collection.objects.link(empty)
    empty.location = (x, y, 0)
    for obj in collection.objects:
        if obj is not empty:
            obj.parent = empty
            obj.matrix_parent_inverse = empty.matrix_world.inverted()
    empty.rotation_euler[2] = angle
    return empty


def add_bike(name, x, y, color):
    for wheel_y in (-0.75, 0.78):
        cylinder(f"{name} wheel", (x, y + wheel_y, 0.58), 0.43, 0.13, rubber, (0, math.pi / 2, 0))
        cylinder(f"{name} rim", (x, y + wheel_y, 0.58), 0.29, 0.15, metal, (0, math.pi / 2, 0))
    cube(f"{name} tank", (x, y - 0.05, 1.18), (0.28, 0.52, 0.24), color, 0.18)
    cube(f"{name} seat", (x, y + 0.55, 1.18), (0.3, 0.55, 0.12), rubber, 0.1)
    cube(f"{name} frame", (x, y + 0.05, 0.86), (0.12, 0.72, 0.1), metal, 0.04)
    cube(f"{name} handle", (x, y - 0.72, 1.38), (0.55, 0.06, 0.06), metal, 0.03)
    cylinder(f"{name} lamp", (x, y - 0.79, 1.24), 0.18, 0.14, headlamp, (math.pi / 2, 0, 0))


def add_area_light(name, location, energy, size, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.shape = "RECTANGLE"
    data.size = size
    data.color = color
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    return obj


def point_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.render.resolution_x = 1600
scene.render.resolution_y = 900

charcoal = material("Charcoal cladding", (0.035, 0.052, 0.065), metallic=0.65, roughness=0.3)
steel = material("Structural steel", (0.12, 0.15, 0.17), metallic=0.8, roughness=0.22)
metal = material("Brushed metal", (0.22, 0.25, 0.27), metallic=0.85, roughness=0.2)
yellow = material("Brand gold", (1.0, 0.54, 0.015), metallic=0.15, roughness=0.28)
sign_glow = material("Sign glow", (1.0, 0.42, 0.005), roughness=0.24, emission=(1.0, 0.22, 0.005), strength=4.5)
concrete = material("Polished concrete", (0.33, 0.36, 0.36), roughness=0.48)
road = material("Asphalt", (0.025, 0.032, 0.038), roughness=0.82)
glass = material("Smoked glass", (0.025, 0.16, 0.21), metallic=0.1, roughness=0.13)
rubber = material("Tyres", (0.008, 0.01, 0.012), roughness=0.8)
white = material("White paint", (0.88, 0.9, 0.88), metallic=0.05, roughness=0.3)
red = material("Deep red", (0.35, 0.012, 0.015), metallic=0.45, roughness=0.23)
green = material("Landscape green", (0.05, 0.22, 0.08), roughness=0.9)
headlamp = material("Headlamp", (0.9, 0.95, 1.0), roughness=0.08, emission=(0.7, 0.86, 1.0), strength=2.0)

# Site, road, and illuminated guide lines.
cube("Forecourt", (0, 2, -0.18), (19, 27, 0.2), concrete)
cube("Road", (0, -23, -0.24), (32, 7, 0.2), road)
for x in range(-27, 28, 6):
    cube("Road marking", (x, -23, -0.02), (1.8, 0.08, 0.025), white)
for x in (-10.5, -7, -3.5, 0, 3.5, 7, 10.5):
    cube("Bay marker", (x, 5.8, 0.035), (0.035, 8, 0.025), yellow)

# Main shell: open showroom frontage, service depth, and saw-tooth roof trim.
cube("Rear wall", (0, 14.5, 4.4), (14.5, 0.25, 4.5), charcoal)
cube("Left wall", (-14.5, 5.0, 4.4), (0.25, 9.8, 4.5), charcoal)
cube("Right office wall", (11.7, 5.0, 4.4), (2.8, 9.8, 4.5), charcoal)
for x in (-14.5, -10, -5, 0, 5, 10, 14.5):
    cube("Front column", (x, -4.7, 4.5), (0.16, 0.16, 4.6), steel)
for y in (-4.7, 1.8, 8.2, 14.5):
    cube("Left beam", (-14.5, y, 8.75), (0.18, 0.18, 0.18), steel)
    cube("Right beam", (14.5, y, 8.75), (0.18, 0.18, 0.18), steel)
cube("Flat roof", (0, 5, 8.85), (15.1, 10.3, 0.28), charcoal, 0.08)
for x in range(-14, 15, 2):
    cube("Roof rib", (x, 5, 9.18), (0.05, 10.1, 0.06), metal)

# Glass office and reception.
cube("Office glass", (9.1, -4.63, 3.1), (2.25, 0.08, 2.8), glass, 0.04)
cube("Office divider", (6.75, 2.0, 3.1), (0.08, 6.6, 3.0), glass)
cube("Reception desk", (9.2, 0.0, 1.05), (1.9, 0.7, 1.0), charcoal, 0.14)
cube("Desk accent", (9.2, -0.73, 1.05), (1.9, 0.05, 0.26), sign_glow, 0.03)

# Front fascia and dimensional sign.
cube("Front fascia", (0, -4.95, 8.0), (14.85, 0.35, 1.05), charcoal, 0.1)
cube("Sign panel", (0, -5.34, 8.02), (8.1, 0.13, 0.78), sign_glow, 0.16)
bpy.ops.object.text_add(location=(0, -5.50, 7.84), rotation=(math.pi / 2, 0, 0))
sign = bpy.context.object
sign.name = "Ramesh Rentals letters"
sign.data.body = "RAMESH RENTALS"
sign.data.align_x = "CENTER"
sign.data.align_y = "CENTER"
sign.data.size = 1.08
sign.data.extrude = 0.045
sign.data.bevel_depth = 0.012
sign.data.materials.append(charcoal)

# Vehicles staged like a premium automotive showroom.
add_car("White hatchback", -7.1, 2.0, white, -0.03)
add_car("Red MPV", 0.7, 3.5, red, 0.04)
for i, (x, color) in enumerate(((-11.8, yellow), (-9.7, red), (-7.6, white), (-5.5, yellow))):
    add_bike(f"Motorcycle {i + 1}", x, 9.0, color)

# Inspection portal and service detailing at the back.
for x in (-4.2, 4.2):
    cube("Inspection post", (x, 10.2, 3.2), (0.1, 0.1, 3.2), yellow)
cube("Inspection header", (0, 10.2, 6.35), (4.3, 0.1, 0.1), yellow)
for x in (-3.6, 0, 3.6):
    strip = cube("Ceiling light", (x, 4.5, 8.45), (1.25, 3.5, 0.05), headlamp, 0.02)

# Landscape and protective bollards.
for x in (-17.0, 17.0):
    cylinder("Tree trunk", (x, -2.0, 1.25), 0.28, 2.5, metal, (0, 0, 0))
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=2.2, location=(x, -2.0, 3.55))
    bpy.context.object.data.materials.append(green)
for x in (6.2, 12.0):
    cylinder("Safety bollard", (x, -6.2, 0.65), 0.12, 1.3, yellow, (0, 0, 0))

# Lighting.
sun_data = bpy.data.lights.new("Sun", "SUN")
sun_data.energy = 2.5
sun_data.angle = math.radians(18)
sun = bpy.data.objects.new("Sun", sun_data)
bpy.context.collection.objects.link(sun)
sun.rotation_euler = (math.radians(24), math.radians(-18), math.radians(-28))
for x in (-8, 0, 8):
    light = add_area_light("Interior softbox", (x, 3, 8.25), 850, 5.0, (1.0, 0.78, 0.52))
    light.rotation_euler = (0, 0, 0)

# Camera and a premium warm sky.
bpy.ops.object.camera_add(location=(25, -39, 10.5))
camera = bpy.context.object
camera.data.lens = 48
camera.data.sensor_width = 36
scene.camera = camera
point_at(camera, (0, 3.0, 3.8))
world = bpy.data.worlds.new("Rental hub sky")
scene.world = world
world.color = (0.035, 0.055, 0.08)
world.use_nodes = True
background = world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.22, 0.42, 0.68, 1)
background.inputs["Strength"].default_value = 0.62

# Day still.
scene.render.filepath = str(OUTPUT / "rental-hub-day.png")
bpy.ops.render.render(write_still=True)

# Cinematic dusk still.
background.inputs["Color"].default_value = (0.008, 0.015, 0.04, 1)
background.inputs["Strength"].default_value = 0.08
sun_data.energy = 0.18
for obj in bpy.data.objects:
    if obj.name.startswith("Interior softbox"):
        obj.data.energy = 1450
scene.render.filepath = str(OUTPUT / "rental-hub-night.png")
bpy.ops.render.render(write_still=True)

# Seven-second silent hero loop assembled from the day and dusk renders. The
# opposing slow zooms and crossfade keep the file small enough for mobile web.
subprocess.run(
    [
        "ffmpeg", "-y",
        "-loop", "1", "-framerate", "24", "-t", "4", "-i", str(OUTPUT / "rental-hub-day.png"),
        "-loop", "1", "-framerate", "24", "-t", "4", "-i", str(OUTPUT / "rental-hub-night.png"),
        "-filter_complex",
        "[0:v]scale=1408:792,zoompan=z='min(zoom+0.0007,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24[day];"
        "[1:v]scale=1408:792,zoompan=z='if(eq(on,1),1.08,max(zoom-0.0007,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24[night];"
        "[day][night]xfade=transition=fade:duration=1:offset=3,format=yuv420p[out]",
        "-map", "[out]", "-an", "-t", "7", "-r", "24", "-movflags", "+faststart",
        "-c:v", "libx264", "-crf", "22", str(OUTPUT / "rental-hub-hero.mp4"),
    ],
    check=True,
)

print(f"Rendered concept media to {OUTPUT}")
