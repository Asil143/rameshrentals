"""3D walkthrough of the Ramesh Rentals hub on plots 4 + 5 (Blender 4.2+).

The layout matches the floor plan on /concepts: a 13.90 × 24.87 m plot
(345.66 m², perimeter 77.54 m) whose only road frontage is Road 1. Customers use the front (office, forecourt, handover
bay); bikes and cars park either side of a central drive lane; wash, service
and store rooms are at the back.

Textures (fleet photos and logo as PNG) are read from HUB_TEX_DIR, frames are
written to HUB_OUT/frames. Set HUB_PREVIEW=1 to render a few stills instead.

Realistic mode: set HUB_PBR_DIR to a folder of ambientCG 1K/2K-JPG material
folders (Asphalt033, Concrete034, Plaster001, Tiles141, CorrugatedSteel005,
PaintedMetal004, PavingStones138, Ground110) plus sky.hdr (Poly Haven
kloofendal_38d_partly_cloudy_puresky). All CC0. This switches to Cycles with
photographed surfaces and real sky lighting. HUB_SAMPLES sets Cycles samples.

  HUB_TEX_DIR=... HUB_OUT=... blender --background --python tools/render_hub_walkthrough.py
"""

import math
import os
from pathlib import Path

import bpy

W = 13.90  # plot width along Road 1 (m)
D = 24.87  # plot depth away from the road (m)
TEX = Path(os.environ["HUB_TEX_DIR"])
OUT = Path(os.environ["HUB_OUT"])
PREVIEW = os.environ.get("HUB_PREVIEW") == "1"
STILLS = os.environ.get("HUB_STILLS") == "1"  # one 1920×1080 still per area (AI video kit)
PBR = Path(os.environ["HUB_PBR_DIR"]) if os.environ.get("HUB_PBR_DIR") else None
SAMPLES = int(os.environ.get("HUB_SAMPLES", "48"))
FPS = 24
SECONDS = 22
FRAMES = FPS * SECONDS


# Zone edges in metres (x from the left wall, y from the Road 1 boundary).
# Keep in sync with the floor plan in src/app/concepts/page.tsx.
FRONT_BAND = 6.0  # office / forecourt depth
REAR_BAND = D - 5.6  # where the wash / service / store rooms start
X_LANE_L = 4.6  # office and bike strip width
X_LANE_R = 8.4  # 3.8 m drive lane
X_LANE_MID = (X_LANE_L + X_LANE_R) / 2
X_ROOM_1 = 5.56  # wash | service partition
X_ROOM_2 = 9.73  # service | store partition
GATE_MID = (X_LANE_L + W) / 2
CAR_X = (X_LANE_R + W) / 2
BAY = 2.55  # car bay width
CAR_BAYS = 5
BIKE_STANDS = 10
BIKE_PITCH = (REAR_BAND - FRONT_BAND - 1.2) / BIKE_STANDS  # ≈ 1.2 m per bike

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ----------------------------------------------------------------- materials


def material(name, color, rough=0.5, metal=0.0, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    p = mat.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    if emission:
        p.inputs["Emission Color"].default_value = (*emission, 1)
        p.inputs["Emission Strength"].default_value = strength
    return mat


def textured(name, dark, light, scale, rough, bump=0.15, wave=False):
    """Procedural surface: noise (or corrugation waves) between two colours, with bump."""
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    p = nt.nodes["Principled BSDF"]
    p.inputs["Roughness"].default_value = rough
    coord = nt.nodes.new("ShaderNodeTexCoord")
    if wave:
        tex = nt.nodes.new("ShaderNodeTexWave")
        tex.inputs["Scale"].default_value = scale
        tex.bands_direction = "X"
        factor = tex.outputs["Fac"]
    else:
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = scale
        tex.inputs["Detail"].default_value = 8
        factor = tex.outputs["Fac"]
    nt.links.new(coord.outputs["Object"], tex.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*dark, 1)
    ramp.color_ramp.elements[1].color = (*light, 1)
    nt.links.new(factor, ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = bump
    nt.links.new(factor, b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], p.inputs["Normal"])
    return mat


def image_material(name, filename, emission=0.25):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    p = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(TEX / filename))
    nt.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    nt.links.new(tex.outputs["Color"], p.inputs["Emission Color"])
    p.inputs["Emission Strength"].default_value = emission
    nt.links.new(tex.outputs["Alpha"], p.inputs["Alpha"])
    p.inputs["Roughness"].default_value = 0.35
    return mat


BRAND_DARK = (0.012, 0.06, 0.035)
BRAND_GREEN = (0.02, 0.2, 0.11)
AMBER = (0.92, 0.5, 0.06)

M = {
    "concrete": textured("Concrete", (0.38, 0.37, 0.35), (0.55, 0.54, 0.51), 6, 0.85),
    "asphalt": textured("Asphalt", (0.035, 0.035, 0.04), (0.09, 0.09, 0.095), 40, 0.92, bump=0.3),
    "kerb": textured("Kerb", (0.45, 0.45, 0.44), (0.62, 0.62, 0.6), 12, 0.8),
    "plaster": textured("Plaster", (0.78, 0.74, 0.66), (0.88, 0.85, 0.78), 9, 0.9, bump=0.05),
    "plaster_pink": textured("PlasterPink", (0.74, 0.55, 0.5), (0.82, 0.64, 0.58), 9, 0.9, bump=0.05),
    "plaster_blue": textured("PlasterBlue", (0.48, 0.6, 0.66), (0.58, 0.7, 0.76), 9, 0.9, bump=0.05),
    "roof": textured("RoofSheet", (0.18, 0.24, 0.22), (0.3, 0.37, 0.34), 60, 0.4, bump=0.4, wave=True),
    "steel": material("Steel", BRAND_DARK, rough=0.35, metal=0.6),
    "brand": material("BrandGreen", BRAND_GREEN, rough=0.4),
    "amber": material("Amber", AMBER, rough=0.35, emission=AMBER, strength=1.5),
    "paint_amber": material("PaintAmber", AMBER, rough=0.5),
    "paint_white": material("PaintWhite", (0.85, 0.85, 0.82), rough=0.5),
    "glass": material("Glass", (0.12, 0.2, 0.22), rough=0.05, metal=0.3),
    "window": material("Window", (0.05, 0.08, 0.1), rough=0.1, metal=0.4),
    "white": material("CardWhite", (0.95, 0.95, 0.93), rough=0.6),
    "tyre": material("Tyre", (0.02, 0.02, 0.02), rough=0.8),
    "chrome": material("Chrome", (0.8, 0.8, 0.8), rough=0.15, metal=1.0),
    "seat": material("Seat", (0.03, 0.03, 0.03), rough=0.6),
    "lamp": material("Lamp", (1, 0.97, 0.9), emission=(1, 0.95, 0.85), strength=6),
    "tile": textured("Tile", (0.55, 0.68, 0.72), (0.66, 0.78, 0.82), 20, 0.25),
    "wood": textured("Wood", (0.32, 0.19, 0.09), (0.45, 0.28, 0.14), 14, 0.6),
    "leaf": textured("Leaf", (0.04, 0.16, 0.05), (0.09, 0.3, 0.09), 5, 0.8, bump=0.6),
    "bark": material("Bark", (0.12, 0.08, 0.05), rough=0.9),
    "red": material("RedPaint", (0.5, 0.02, 0.02), rough=0.25, metal=0.3),
    "engine": material("Engine", (0.08, 0.08, 0.09), rough=0.4, metal=0.7),
    "earth": textured("Earth", (0.2, 0.17, 0.12), (0.32, 0.28, 0.2), 3, 0.95, bump=0.3),
}



def pbr(name, asset, tile, tint=None, normal=1.0):
    """Photographed material, box-projected at real scale (`tile` metres per repeat)."""
    folder = PBR / asset
    files = {f.name.split("_")[-1].split(".")[0]: f for f in folder.iterdir() if f.suffix == ".jpg"}
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    p = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1 / tile, 1 / tile, 1 / tile)
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])

    def image(kind, colour_space):
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = bpy.data.images.load(str(files[kind]))
        node.image.colorspace_settings.name = colour_space
        node.projection = "BOX"
        node.projection_blend = 0.25
        nt.links.new(mapping.outputs["Vector"], node.inputs["Vector"])
        return node

    colour = image("Color", "sRGB").outputs["Color"]
    if tint:
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs[0].default_value = 1.0
        nt.links.new(colour, mix.inputs[6])
        mix.inputs[7].default_value = (*tint, 1)
        colour = mix.outputs[2]
    nt.links.new(colour, p.inputs["Base Color"])
    nt.links.new(image("Roughness", "Non-Color").outputs["Color"], p.inputs["Roughness"])
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nmap.inputs["Strength"].default_value = normal
    nt.links.new(image("NormalGL", "Non-Color").outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], p.inputs["Normal"])
    return mat


def set_input(mat, name, value):
    p = mat.node_tree.nodes["Principled BSDF"]
    if name in p.inputs:
        p.inputs[name].default_value = value


if PBR:
    M.update(
        concrete=pbr("Concrete", "Concrete034", 3.0),
        asphalt=pbr("Asphalt", "Asphalt033", 4.0),
        kerb=pbr("Footpath", "PavingStones138", 1.6),
        plaster=pbr("Plaster", "Plaster001", 3.0, tint=(0.95, 0.92, 0.85), normal=0.6),
        plaster_pink=pbr("PlasterPink", "Plaster001", 3.0, tint=(0.9, 0.66, 0.6), normal=0.6),
        plaster_blue=pbr("PlasterBlue", "Plaster001", 3.0, tint=(0.62, 0.76, 0.82), normal=0.6),
        roof=pbr("RoofSheet", "CorrugatedSteel005", 1.5, tint=(0.35, 0.45, 0.42)),
        tile=pbr("Tile", "Tiles141", 1.2, tint=(0.85, 0.95, 1.0)),
        earth=pbr("Earth", "Ground110", 4.0),
    )
    # Real glass in the office front and door; car-like windows.
    for key in ("glass", "window"):
        set_input(M[key], "Transmission Weight", 1.0)
        set_input(M[key], "Roughness", 0.02)
        set_input(M[key], "IOR", 1.45)

# ------------------------------------------------------------------ geometry


def box(name, x0, x1, y0, y1, z0, z1, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    obj = bpy.context.object
    obj.name = name
    obj.scale = ((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    obj.data.materials.append(mat)
    return obj


def cylinder(name, x, y, z, radius, depth, mat, rot=(0, 0, 0), verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=(x, y, z), rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return obj


def plane(name, x, y, z, w, h, mat, rot):
    bpy.ops.mesh.primitive_plane_add(location=(x, y, z), rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (w / 2, h / 2, 1)
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    return obj


def text(body, x, y, z, size, mat, rot=(math.radians(90), 0, 0), extrude=0.02, align="CENTER"):
    curve = bpy.data.curves.new(body, "FONT")
    curve.body = body
    curve.size = size
    curve.extrude = extrude
    curve.align_x = align
    curve.align_y = "CENTER"
    obj = bpy.data.objects.new(body, curve)
    obj.location = (x, y, z)
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    scene.collection.objects.link(obj)
    return obj


FACING_ROAD = (math.radians(90), 0, 0)  # readable from Road 1 (looking +y)
FACING_LANE = (math.radians(90), 0, math.radians(90))  # on the office wall, readable from the lane (looking -x)

# Road 1, kerb/footpath, and the roads at each end of the block.
box("Ground", -120, W + 120, -120, D + 120, -0.15, -0.1, M["earth"])
box("Road1", -40, W + 40, -11, -1.6, -0.1, 0, M["asphalt"])
box("Footpath", -40, W + 40, -1.6, 0, 0, 0.12, M["kerb"])
for i in range(-8, 12):
    box(f"LaneMark{i}", i * 4, i * 4 + 2, -6.4, -6.25, 0, 0.005, M["paint_white"])

# Plot floor.
box("Slab", 0, W, 0, D, 0, 0.12, M["concrete"])
FLOOR = 0.12

# Boundary walls (sides shared with neighbours, rear).
box("WallLeft", -0.23, 0, 0, D, 0, 2.6, M["plaster"])
box("WallRight", W, W + 0.23, 0, D, 0, 2.6, M["plaster"])
box("WallRear", -0.23, W + 0.23, D, D + 0.23, 0, 2.6, M["plaster"])

# Steel frame and roof.
ROOF_Z = 4.6
bays = 6
for i in range(bays + 1):
    y = min(D - 0.1, 0.1 + i * (D - 0.2) / bays)
    for x in (0.12, W - 0.12):
        box(f"Column{i}{x:.0f}", x - 0.1, x + 0.1, y - 0.1, y + 0.1, 0, ROOF_Z - 0.2, M["steel"])
    box(f"Truss{i}", 0, W, y - 0.08, y + 0.08, ROOF_Z - 0.45, ROOF_Z - 0.15, M["steel"])
roof = box("Roof", -0.4, W + 0.4, -0.9, D + 0.35, ROOF_Z, ROOF_Z + 0.06, M["roof"])

# Under-roof LED battens along the drive lane and over each parking strip.
for x in (X_LANE_L / 2, X_LANE_MID, CAR_X):
    for k in range(5):
        y0 = 1.5 + k * 4.7
        box(f"Batten{x:.0f}{k}", x - 0.05, x + 0.05, y0, y0 + 2.4, ROOF_Z - 0.55, ROOF_Z - 0.5, M["lamp"])

# Front fascia with the sign and logo.
box("Fascia", -0.3, W + 0.3, -1.0, -0.9, 3.9, 5.1, M["brand"])
box("FasciaTrim", -0.3, W + 0.3, -1.06, -1.0, 3.9, 3.98, M["paint_amber"])
text("RAMESH RENTALS", W / 2 + 0.5, -1.08, 4.5, 0.62, M["amber"], extrude=0.04)
plane("Logo", 0.9, -1.07, 4.5, 0.8, 0.8, image_material("LogoMat", "brand-icon.png", 0.6), FACING_ROAD)

# Gate pillars either side of the opening onto Road 1.
for x in (X_LANE_L, W - 0.15):
    box(f"GatePillar{x:.0f}", x - 0.2, x + 0.2, -0.2, 0.2, 0, 2.8, M["brand"], bevel=0.02)
    box(f"PillarCap{x:.0f}", x - 0.25, x + 0.25, -0.25, 0.25, 2.8, 2.9, M["paint_amber"])

# ---------------------------------------------------------------- the office
OFFICE_H = 3.0
box("OfficeFrontL", 0, 0.3, 0, 0.2, 0, OFFICE_H, M["plaster"])
box("OfficeFrontR", 3.95, X_LANE_L, 0, 0.2, 0, OFFICE_H, M["plaster"])
box("OfficeSill", 0.3, 3.95, 0, 0.2, 0, 0.9, M["plaster"])
box("OfficeHead", 0.3, 3.95, 0, 0.2, 2.6, OFFICE_H, M["plaster"])
box("OfficeGlass", 0.3, 3.95, 0.08, 0.12, 0.9, 2.6, M["glass"])
box("OfficeBack", 0, X_LANE_L, FRONT_BAND - 0.2, FRONT_BAND, 0, OFFICE_H, M["plaster"])
box("OfficeSideA", X_LANE_L - 0.2, X_LANE_L, 0, 0.6, 0, OFFICE_H, M["plaster"])
box("OfficeSideB", X_LANE_L - 0.2, X_LANE_L, 1.6, FRONT_BAND, 0, OFFICE_H, M["plaster"])
box("OfficeDoorHead", X_LANE_L - 0.2, X_LANE_L, 0.6, 1.6, 2.2, OFFICE_H, M["plaster"])
box("OfficeDoor", X_LANE_L - 0.12, X_LANE_L - 0.08, 0.6, 1.6, 0, 2.2, M["glass"])
box("OfficeCeiling", 0, X_LANE_L, 0, FRONT_BAND, OFFICE_H, OFFICE_H + 0.15, M["plaster"])
box("OfficeCanopy", 0, X_LANE_L + 0.4, -0.6, 0.2, 2.75, 2.85, M["brand"])
box("Desk", 0.8, 3.2, 2.4, 3.1, 0, 0.78, M["wood"])
text("OFFICE · KEYS", 2.1, -0.62, 2.95, 0.22, M["amber"], extrude=0.01)

# "Our fleet" board on the office wall, facing the forecourt and lane: real fleet photos.
BOARD_X = X_LANE_L + 0.02
box("FleetBoard", X_LANE_L, X_LANE_L + 0.04, 2.0, 5.2, 0.95, 2.75, M["brand"])
text("OUR FLEET", BOARD_X + 0.03, 3.6, 2.52, 0.24, M["amber"], rot=FACING_LANE, extrude=0.01)
photos = [
    "honda-activa-6g-side.png",
    "tvs-jupiter-side.png",
    "royal-enfield-classic-350-side.png",
    "hero-splendor-plus-side.png",
    "maruti-suzuki-swift-angle.png",
    "maruti-suzuki-ertiga.png",
    "hyundai-i10-angle.png",
    "bajaj-platina-110.png",
]
for i, photo in enumerate(photos):
    col, row = i % 4, i // 4
    y = 2.45 + col * 0.77
    z = 1.85 - row * 0.62
    plane(f"Card{i}", BOARD_X + 0.03, y, z, 0.7, 0.5, M["white"], FACING_LANE)
    plane(f"Photo{i}", BOARD_X + 0.04, y, z, 0.66, 0.42, image_material(f"Photo{i}", photo), FACING_LANE)

# -------------------------------------------------------- forecourt + lane
# Handover bay: dashed amber rectangle and floor lettering.
hx0, hx1 = X_LANE_L + 1.0, W - 1.0
hy0, hy1 = 0.9, FRONT_BAND - 1.0
for t in range(10):
    a = hx0 + t * (hx1 - hx0) / 10
    for y in (hy0, hy1):
        box(f"BayDashX{t}{y:.0f}", a, a + 0.32, y - 0.05, y + 0.05, FLOOR, FLOOR + 0.004, M["paint_amber"])
for t in range(6):
    a = hy0 + t * (hy1 - hy0) / 6
    for x in (hx0, hx1):
        box(f"BayDashY{t}{x:.0f}", x - 0.05, x + 0.05, a, a + 0.28, FLOOR, FLOOR + 0.004, M["paint_amber"])
text("HANDOVER BAY", (hx0 + hx1) / 2, (hy0 + hy1) / 2, FLOOR + 0.005, 0.32, M["paint_amber"], rot=(0, 0, 0), extrude=0)

# Drive lane centre line and arrow.
for k in range(9):
    y = FRONT_BAND + 0.3 + k * 1.15
    box(f"LaneDash{k}", X_LANE_MID - 0.05, X_LANE_MID + 0.05, y, y + 0.6, FLOOR, FLOOR + 0.004, M["paint_amber"])
text("▲", X_LANE_MID, FRONT_BAND + 0.9, FLOOR + 0.005, 0.6, M["paint_amber"], rot=(0, 0, 0), extrude=0)

# ---------------------------------------------------------------- vehicles


def bike(x, y, colour):
    parts = []
    for dx in (-0.65, 0.65):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.045, major_segments=40, minor_segments=12, location=(x + dx, y, FLOOR + 0.34), rotation=(math.radians(90), 0, 0))
        t = bpy.context.object
        t.data.materials.append(M["tyre"])
        bpy.ops.object.shade_smooth()
        parts.append(t)
        parts.append(cylinder("Hub", x + dx, y, FLOOR + 0.34, 0.09, 0.08, M["chrome"], rot=(math.radians(90), 0, 0)))
    parts.append(box("Frame", x - 0.55, x + 0.45, y - 0.05, y + 0.05, FLOOR + 0.55, FLOOR + 0.66, colour, bevel=0.03))
    parts.append(box("Engine", x - 0.2, x + 0.3, y - 0.13, y + 0.13, FLOOR + 0.28, FLOOR + 0.56, M["engine"], bevel=0.05))
    parts.append(cylinder("Exhaust", x - 0.3, y + 0.17, FLOOR + 0.3, 0.045, 0.75, M["chrome"], rot=(0, math.radians(84), 0)))
    parts.append(box("RearGuard", x - 0.95, x - 0.5, y - 0.07, y + 0.07, FLOOR + 0.62, FLOOR + 0.66, colour, bevel=0.02))
    parts.append(box("SidePanel", x - 0.45, x - 0.15, y - 0.11, y + 0.11, FLOOR + 0.5, FLOOR + 0.72, colour, bevel=0.04))
    parts.append(box("Tank", x - 0.05, x + 0.4, y - 0.15, y + 0.15, FLOOR + 0.7, FLOOR + 0.92, colour, bevel=0.07))
    parts.append(box("Seat", x - 0.6, x - 0.02, y - 0.13, y + 0.13, FLOOR + 0.72, FLOOR + 0.84, M["seat"], bevel=0.04))
    parts.append(box("Fork", x + 0.5, x + 0.58, y - 0.03, y + 0.03, FLOOR + 0.35, FLOOR + 1.0, M["chrome"]))
    parts.append(cylinder("Bars", x + 0.52, y, FLOOR + 1.02, 0.02, 0.7, M["chrome"], rot=(math.radians(90), 0, 0)))
    parts.append(cylinder("Headlamp", x + 0.62, y, FLOOR + 0.9, 0.06, 0.07, M["lamp"], rot=(0, math.radians(90), 0)))
    return parts


def prism(name, profile, y0, y1, mat, bevel=0.06):
    """Extrude a side profile [(x, z), ...] between y0 and y1."""
    import bmesh

    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    near = [bm.verts.new((px_, y0, pz)) for px_, pz in profile]
    far = [bm.verts.new((px_, y1, pz)) for px_, pz in profile]
    bm.faces.new(list(reversed(near)))
    bm.faces.new(far)
    n = len(profile)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((near[i], near[j], far[j], far[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.data.materials.append(mat)
    if bevel:
        mod = obj.modifiers.new("Bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
        mod.limit_method = "ANGLE"
    return obj


# Hatchback side profile, nose toward +x.
CAR_BODY = [(-1.88, 0.24), (1.88, 0.24), (1.94, 0.52), (1.78, 0.8), (0.95, 0.9), (-1.62, 0.95), (-1.9, 0.82)]
CAR_GLASS = [(-1.62, 0.92), (0.9, 0.88), (0.22, 1.36), (-1.28, 1.39)]


def car(x, y, colour):
    """Car parked nose-in across the strip (length along x, nose toward the side wall)."""
    body = prism("CarBody", [(x + px_, FLOOR + pz) for px_, pz in CAR_BODY], y - 0.83, y + 0.83, colour, bevel=0.12)
    glass = prism("CarGlass", [(x + px_, FLOOR + pz) for px_, pz in CAR_GLASS], y - 0.72, y + 0.72, M["window"], bevel=0.08)
    box("CarRoof", x - 1.25, x + 0.2, y - 0.74, y + 0.74, FLOOR + 1.36, FLOOR + 1.42, colour, bevel=0.03)
    for dx in (-1.25, 1.25):
        for dy in (-0.76, 0.76):
            cylinder("Wheel", x + dx, y + dy, FLOOR + 0.31, 0.31, 0.21, M["tyre"], rot=(math.radians(90), 0, 0))
            cylinder("Rim", x + dx, y + dy * 1.08, FLOOR + 0.31, 0.18, 0.03, M["chrome"], rot=(math.radians(90), 0, 0))
    for dy in (-0.55, 0.55):
        box("Headlight", x + 1.84, x + 1.92, y + dy - 0.17, y + dy + 0.17, FLOOR + 0.6, FLOOR + 0.72, M["lamp"])
        box("Taillight", x - 1.94, x - 1.86, y + dy - 0.14, y + dy + 0.14, FLOOR + 0.66, FLOOR + 0.78, M["red"])
    return body, glass


bike_colours = [
    material("BikeRed", (0.45, 0.02, 0.02), rough=0.25, metal=0.4),
    material("BikeBlue", (0.02, 0.12, 0.45), rough=0.25, metal=0.4),
    material("BikeBlack", (0.02, 0.02, 0.025), rough=0.25, metal=0.4),
    material("BikeTeal", (0.0, 0.3, 0.35), rough=0.25, metal=0.4),
    material("BikeGrey", (0.3, 0.3, 0.32), rough=0.25, metal=0.6),
    material("BikeMaroon", (0.25, 0.02, 0.04), rough=0.25, metal=0.4),
]
for i in range(BIKE_STANDS + 1):
    y = FRONT_BAND + 0.6 + i * BIKE_PITCH
    box(f"BikeStand{i}", 0.3, X_LANE_L - 0.5, y - 0.03, y + 0.03, FLOOR, FLOOR + 0.004, M["paint_amber"])
    if i < BIKE_STANDS and i != 6:  # one empty stand
        bike(X_LANE_L / 2 - 0.1, y + 0.65, bike_colours[i % len(bike_colours)])

car_y = [FRONT_BAND + 0.3 + BAY / 2 + k * BAY for k in range(CAR_BAYS)]
for k in range(CAR_BAYS + 1):
    y = FRONT_BAND + 0.3 + k * BAY
    box(f"CarBayLine{k}", X_LANE_R + 0.2, W - 0.3, y - 0.04, y + 0.04, FLOOR, FLOOR + 0.004, M["paint_white"])
CAR_COAT = 0.6
car_paints = [
    material("CarSilver", (0.55, 0.56, 0.58), rough=0.2, metal=0.8),
    material("CarRed", (0.45, 0.01, 0.02), rough=0.15, metal=0.5),
    material("CarWhite", (0.8, 0.8, 0.78), rough=0.2, metal=0.3),
]
for paint in car_paints:
    set_input(paint, "Coat Weight", CAR_COAT)
for k, paint in zip((0, 1, 3, 4), car_paints + [car_paints[0]]):  # middle bay left free
    car(CAR_X + 0.15, car_y[k], paint)

# -------------------------------------------------------- rear rooms
ROOM_H = 3.0
for x in (X_ROOM_1, X_ROOM_2):
    box(f"Partition{x:.0f}", x - 0.1, x + 0.1, REAR_BAND, D, 0, ROOM_H, M["plaster"])
box("RoomHeader", 0, W, REAR_BAND - 0.15, REAR_BAND, 2.5, ROOM_H, M["brand"])
for label, x0, x1 in (("WASH BAY", 0, X_ROOM_1), ("SERVICE BAY", X_ROOM_1, X_ROOM_2), ("STORE", X_ROOM_2, W)):
    text(label, (x0 + x1) / 2, REAR_BAND - 0.17, 2.75, 0.26, M["amber"], extrude=0.01)
# Wash bay: tiled floor, drain, hose reel.
box("WashTiles", 0, X_ROOM_1 - 0.1, REAR_BAND, D, FLOOR, FLOOR + 0.01, M["tile"])
box("Drain", 0.3, X_ROOM_1 - 0.4, REAR_BAND + 2.6, REAR_BAND + 2.75, FLOOR + 0.01, FLOOR + 0.015, M["steel"])
bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.06, location=(2.4, D - 0.1, 1.4), rotation=(math.radians(90), 0, 0))
bpy.context.object.data.materials.append(material("Hose", (0.6, 0.18, 0.02), rough=0.5))
# Service bay: workbench, tool board, compressor.
box("Workbench", X_ROOM_1 + 0.5, X_ROOM_2 - 0.6, D - 0.8, D - 0.1, 0, 0.9, M["wood"])
box("ToolBoard", X_ROOM_1 + 0.5, X_ROOM_2 - 0.6, D - 0.08, D - 0.02, 1.2, 2.4, M["paint_white"])
for t in range(8):
    box(f"Tool{t}", X_ROOM_1 + 0.75 + t * 0.38, X_ROOM_1 + 0.85 + t * 0.38, D - 0.11, D - 0.08, 1.45 + (t % 3) * 0.15, 2.1, M["engine"])
cylinder("Compressor", X_ROOM_2 - 0.9, REAR_BAND + 1.6, 0.45, 0.3, 0.8, M["red"], rot=(0, math.radians(90), 0))
# Store: shelves with helmets.
helmet_colours = [bike_colours[0], bike_colours[1], bike_colours[2], M["paint_white"], M["paint_amber"]]
for level in range(3):
    z = 0.5 + level * 0.75
    box(f"Shelf{level}", X_ROOM_2 + 0.3, W - 0.3, D - 0.7, D - 0.1, z - 0.03, z, M["wood"])
    for h in range(6):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.15, location=(X_ROOM_2 + 0.6 + h * 0.58, D - 0.4, z + 0.13))
        helmet = bpy.context.object
        helmet.data.materials.append(helmet_colours[(h + level) % 5])
        bpy.ops.object.shade_smooth()

# ------------------------------------------------------------ neighbourhood
# Plot 3 to the left, plots 8 / 7 to the right — simple houses and shops.
box("NeighbourLeft", -9, -0.3, 0.6, 17, 0, 6.6, M["plaster_pink"])
box("NeighbourLeftParapet", -9.1, -0.2, 0.5, 17.1, 6.6, 7.0, M["plaster"])
box("NeighbourRightShop", W + 0.3, W + 11, 0.6, 7, 0, 4.2, M["plaster_blue"])
box("NeighbourRightShutter", W + 1.5, W + 6, 0.55, 0.6, 0, 3.0, M["steel"])
box("NeighbourRightBack", W + 0.3, W + 11, 7.4, 20, 0, 7.4, M["plaster"])
for k in range(3):
    box(f"LeftWindow{k}", -7.6 + k * 2.6, -6.2 + k * 2.6, 0.55, 0.6, 3.8, 5.2, M["window"])
    box(f"LeftWindowLow{k}", -7.6 + k * 2.6, -6.2 + k * 2.6, 0.55, 0.6, 1.0, 2.3, M["window"])
for x, s in ((-3.5, 1.0), (W + 3.2, 1.2), (-14, 1.3), (W + 16, 1.1)):
    cylinder("Trunk", x, -0.8, 1.4 * s, 0.13 * s, 2.8 * s, M["bark"], verts=10)
    # Leafy canopy: a few overlapping clumps, each roughened by a displacement texture.
    clumps = ((0, 0, 0, 1.5), (0.7, 0.3, -0.3, 1.0), (-0.6, -0.2, -0.2, 1.1), (0.1, 0.5, 0.6, 0.9))
    for k, (dx, dy, dz, r) in enumerate(clumps):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=r * s, location=(x + dx * s, -0.8 + dy * s, (3.4 + dz) * s))
        canopy = bpy.context.object
        canopy.data.materials.append(M["leaf"])
        noise = bpy.data.textures.new(f"Leaves{x:.0f}{k}", "CLOUDS")
        noise.noise_scale = 0.35
        displace = canopy.modifiers.new("Leaves", "DISPLACE")
        displace.texture = noise
        displace.strength = 0.45 * s
        bpy.ops.object.shade_smooth()

# ------------------------------------------------------------- lighting
world = bpy.data.worlds.new("Sky")
scene.world = world
world.use_nodes = True
nt = world.node_tree
if PBR:
    # Real sky photo (HDRI) lights the scene; it already contains the sun.
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(str(PBR / "sky.hdr"))
    env_map = nt.nodes.new("ShaderNodeMapping")
    env_map.inputs["Rotation"].default_value = (0, 0, math.radians(120))
    nt.links.new(nt.nodes.new("ShaderNodeTexCoord").outputs["Generated"], env_map.inputs["Vector"])
    nt.links.new(env_map.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], nt.nodes["Background"].inputs["Color"])
    nt.nodes["Background"].inputs["Strength"].default_value = 1.0
sky = nt.nodes.new("ShaderNodeTexSky")
for sky_type in ("NISHITA", "MULTIPLE_SCATTERING", "SINGLE_SCATTERING"):
    try:
        sky.sky_type = sky_type
        break
    except TypeError:
        continue
sky.sun_elevation = math.radians(42)
sky.sun_rotation = math.radians(215)
if not PBR:
    nt.links.new(sky.outputs["Color"], nt.nodes["Background"].inputs["Color"])
    nt.nodes["Background"].inputs["Strength"].default_value = 0.35
    sun_data = bpy.data.lights.new("Sun", "SUN")
    sun_data.energy = 4.0
    sun_data.angle = math.radians(1.5)
    sun = bpy.data.objects.new("Sun", sun_data)
    sun.rotation_euler = (math.radians(48), 0, math.radians(215 - 90))
    scene.collection.objects.link(sun)

# Office ceiling light (visible through the glass front).
office_light = bpy.data.lights.new("OfficeLight", "AREA")
office_light.energy = 120
office_light.size = 2.5
office_obj = bpy.data.objects.new("OfficeLight", office_light)
office_obj.location = (X_LANE_L / 2, FRONT_BAND / 2, OFFICE_H - 0.05)
scene.collection.objects.link(office_obj)

for k, y in enumerate((3, 8.5, 14, 19, 22.5)):
    area_data = bpy.data.lights.new(f"Under{k}", "AREA")
    area_data.energy = 220
    area_data.size = W - 1
    area_data.size_y = 4
    area_data.shape = "RECTANGLE"
    area_data.color = (1, 0.96, 0.9)
    area = bpy.data.objects.new(f"Under{k}", area_data)
    area.location = (W / 2, y, ROOF_Z - 0.6)
    scene.collection.objects.link(area)

# Roof fades away for the closing overhead shot.
roof_mat = roof.data.materials[0]
rnt = roof_mat.node_tree
out = rnt.nodes["Material Output"]
principled = rnt.nodes["Principled BSDF"]
transparent = rnt.nodes.new("ShaderNodeBsdfTransparent")
mix = rnt.nodes.new("ShaderNodeMixShader")
rnt.links.new(principled.outputs["BSDF"], mix.inputs[1])
rnt.links.new(transparent.outputs["BSDF"], mix.inputs[2])
rnt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
if hasattr(roof_mat, "surface_render_method"):
    roof_mat.surface_render_method = "BLENDED"
else:
    roof_mat.blend_method = "BLEND"
if hasattr(roof_mat, "use_transparent_shadow"):
    roof_mat.use_transparent_shadow = True
fade = mix.inputs["Fac"]
# Gone before the camera (rising from frame 396) reaches roof height.
for frame, value in ((1, 0.0), (398, 0.0), (424, 1.0), (FRAMES, 1.0)):
    fade.default_value = value
    fade.keyframe_insert("default_value", frame=frame)

# --------------------------------------------------------------- camera
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 22
cam_data.clip_end = 300
cam = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
target = bpy.data.objects.new("Target", None)
scene.collection.objects.link(target)
track = cam.constraints.new("TRACK_TO")
track.target = target
track.track_axis = "TRACK_NEGATIVE_Z"
track.up_axis = "UP_Y"

EYE = 1.65
SHOTS = [
    # frame, camera position, looking at
    (1, (W / 2 + 1.5, -15, 2.2), (W / 2, 0, 3.2)),  # Road 1: the hub and its sign
    (78, (GATE_MID, -5.5, EYE), (GATE_MID, 4, 1.8)),  # walking up to the gate
    (140, (GATE_MID, -0.6, 2.3), (GATE_MID, 3.6, 0.1)),  # handover bay, just inside the gate
    (204, (GATE_MID + 0.4, 2.8, EYE), (X_LANE_L, 3.7, 1.6)),  # forecourt: the fleet board on the office
    (276, (X_LANE_MID, 8.2, EYE), (1.6, 11.5, 0.7)),  # bike parking
    (336, (X_LANE_MID - 0.4, 7.2, 2.1), (W - 2.8, 14.5, 0.6)),  # car parking
    (396, (X_LANE_MID, REAR_BAND - 3.4, 2.0), (X_ROOM_1 + 1.8, D, 1.1)),  # wash / service / store
    (FRAMES, (W / 2 + 4.5, -10, 28), (W / 2, 11.5, 0)),  # overview of the whole plot
]
# One still per area for the AI video kit: name, camera position, looking at.
KIT_SHOTS = [
    ("01-road-front", (W / 2 + 1.5, -15, 2.2), (W / 2, 0, 3.2)),
    ("02-gate-handover-bay", (GATE_MID, -3.0, 1.7), (GATE_MID, 4, 0.6)),
    ("03-office-and-keys", (X_LANE_L + 2.2, -4.2, 1.6), (1.8, 0.6, 1.5)),
    ("04-fleet-board", (GATE_MID + 0.4, 2.8, EYE), (X_LANE_L, 3.7, 1.6)),
    ("05-bike-parking", (X_LANE_MID, 8.2, EYE), (1.6, 11.5, 0.7)),
    ("06-car-parking", (X_LANE_MID - 0.4, 7.2, 2.1), (W - 2.8, 14.5, 0.6)),
    ("07-wash-bay", (X_LANE_MID + 0.3, REAR_BAND - 4.5, 2.2), (X_ROOM_1 / 2, D - 1.0, 0.8)),
    ("08-service-bay", ((X_ROOM_1 + X_ROOM_2) / 2, REAR_BAND - 2.6, 1.7), ((X_ROOM_1 + X_ROOM_2) / 2, D, 1.0)),
    ("09-store", ((X_ROOM_2 + W) / 2 - 0.3, REAR_BAND - 0.2, 1.6), ((X_ROOM_2 + W) / 2 + 0.2, D - 0.4, 1.0)),  # from its doorway
    ("10-overview", (W / 2 + 4.5, -10, 28), (W / 2, 11.5, 0)),
]

for frame, position, look in [] if STILLS else SHOTS:
    cam.location = position
    target.location = look
    cam.keyframe_insert("location", frame=frame)
    target.keyframe_insert("location", frame=frame)
for obj in [] if STILLS else (cam, target):
    for fcurve in obj.animation_data.action.fcurves if hasattr(obj.animation_data.action, "fcurves") else []:
        for kp in fcurve.keyframe_points:
            kp.interpolation = "BEZIER"
            kp.easing = "AUTO"

# --------------------------------------------------------------- render
if PBR:
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    # Background Metal kernel optimisation crashes Blender 5.2 when it saves its cache.
    if hasattr(prefs, "kernel_optimization_level"):
        prefs.kernel_optimization_level = "OFF"
    prefs.get_devices()
    for device in prefs.devices:
        device.use = True
    scene.cycles.device = "GPU"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 6
else:
    for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    eevee = scene.eevee
    for attr, value in (("use_raytracing", True), ("use_shadows", True), ("taa_render_samples", 24 if not PREVIEW else 16), ("use_gtao", True)):
        if hasattr(eevee, attr):
            setattr(eevee, attr, value)
for view in ("AgX", "Filmic"):
    try:
        scene.view_settings.view_transform = view
        break
    except TypeError:
        continue
scene.view_settings.exposure = float(os.environ.get("HUB_EXPOSURE", "-0.9" if not PBR else "0"))
for look in ("AgX - Punchy", "Punchy", "None"):
    try:
        scene.view_settings.look = look
        break
    except TypeError:
        continue
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.fps = FPS
scene.frame_start = 1
scene.frame_end = FRAMES
scene.render.image_settings.file_format = "PNG"

frames_dir = OUT / ("stills" if STILLS else "preview" if PREVIEW else "frames")
frames_dir.mkdir(parents=True, exist_ok=True)
if STILLS:
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    only = os.environ.get("HUB_ONLY", "").split(",") if os.environ.get("HUB_ONLY") else None
    for name, position, look in KIT_SHOTS:
        if only and not any(name.startswith(prefix) for prefix in only):
            continue
        scene.frame_set(FRAMES if name.endswith("overview") else 1)  # roof hidden only for the overview
        cam.location = position
        target.location = look
        scene.render.filepath = str(frames_dir / f"{name}.png")
        bpy.ops.render.render(write_still=True)
elif PREVIEW:
    for frame in [shot[0] for shot in SHOTS]:
        scene.frame_set(frame)
        scene.render.filepath = str(frames_dir / f"shot_{frame:04d}.png")
        bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = f"{frames_dir}/"  # trailing slash: frames go inside the folder
    bpy.ops.render.render(animation=True)
