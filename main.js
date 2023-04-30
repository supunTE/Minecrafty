import * as THREE from "three"
import GUI from "lil-gui"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { generateHeightMap } from "./scripts/height_map"
import {
	StyledGrassAOTexture,
	StyledGrassColorTexture,
	StyledGrassNormalTexture,
	StyledGrassRoughnessTexture,
} from "./assets/Stylized_Grass/index.js"
import {
	DirtAOTexture,
	DirtColorTexture,
	DirtNormalTexture,
	DirtRoughnessTexture,
} from "./assets/Dirt/index.js"
import {
	SunnyNX,
	SunnyNY,
	SunnyNZ,
	SunnyPX,
	SunnyPY,
	SunnyPZ,
} from "./assets/ENV/Sunny-MC/index.js"

const gui = new GUI()

const canvas = document.querySelector("canvas")
const scene = new THREE.Scene()

// Env Map
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([
	SunnyPX,
	SunnyNX,
	SunnyPY,
	SunnyNY,
	SunnyPZ,
	SunnyNZ,
])
environmentMapTexture.magFilter = THREE.NearestFilter
scene.background = environmentMapTexture

const properties = {
	terrainWidth: 10,
	elevationGap: 2,
	baseHeight: 5,
	seed: Math.round((Math.random() - 0.5) * 200),
}
const cubeWidth = 1
const gap = 0

// Textures
const textureLoader = new THREE.TextureLoader()

const dirtTexture = textureLoader.load(DirtColorTexture)
const dirtNormalTexture = textureLoader.load(DirtNormalTexture)
// const dirtHeightTexture = textureLoader.load(DirtHeightTexture)
const dirtRoughnessTexture = textureLoader.load(DirtRoughnessTexture)
const dirtAOTexture = textureLoader.load(DirtAOTexture)

const grassTexture = textureLoader.load(StyledGrassColorTexture)
const grassNormalTexture = textureLoader.load(StyledGrassNormalTexture)
const grassRoughnessTexture = textureLoader.load(StyledGrassRoughnessTexture)
const grassAOTexture = textureLoader.load(StyledGrassAOTexture)
// const grassHeightTexture = textureLoader.load(StyledGrassHeightTexture)

// dirtTexture.encoding = THREE.sRGBEncoding;
dirtTexture.magFilter = THREE.NearestFilter

const segments = 1

const geometry = new THREE.BoxGeometry(
	cubeWidth,
	cubeWidth,
	cubeWidth,
	segments,
	segments,
	segments,
)

const grassMaterial = new THREE.MeshStandardMaterial({
	map: grassTexture,
	color: 0x3dbf32,
	normalMap: grassNormalTexture,
	normalScale: new THREE.Vector2(2, 2),
	roughnessMap: grassRoughnessTexture,
	aoMap: grassAOTexture,
	aoMapIntensity: 0.2,
})
grassMaterial.envMap = environmentMapTexture

const dirtMaterial = new THREE.MeshStandardMaterial({
	map: dirtTexture,
	color: 0xc5b340,
	normalMap: dirtNormalTexture,
	normalScale: new THREE.Vector2(2, 2),
	roughnessMap: dirtRoughnessTexture,
	aoMap: dirtAOTexture,
	aoMapIntensity: 0.2,
})
dirtMaterial.envMap = environmentMapTexture

const group = new THREE.Group()

function updateTerrain() {
	// Height-Map
	const heightMap = generateHeightMap(
		properties.terrainWidth,
		properties.elevationGap,
		properties.baseHeight,
		properties.seed,
	)
	group.clear()
	for (let i = 0; i < properties.terrainWidth; i++) {
		for (let j = 0; j < properties.terrainWidth; j++) {
			for (let k = 0; k < heightMap[i][j]; k++) {
				const material = k < heightMap[i][j] - 1 ? dirtMaterial : grassMaterial
				const cube = new THREE.Mesh(geometry, material)

				const x = (i - properties.terrainWidth / 2) * cubeWidth + i * gap
				const z = (j - properties.terrainWidth / 2) * cubeWidth + j * gap
				const y = (k - properties.terrainWidth / 2) * cubeWidth + k * gap
				cube.position.set(x, y, z)

				group.add(cube)
			}
		}
	}
	scene.add(group)
}

updateTerrain()

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 1)
light.position.x = 2
light.position.y = 5
light.position.z = 4
scene.add(light)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(1, 1, 1)
scene.add(directionalLight)

gui.add(directionalLight.position, "x", -5, 5, 0.01).name("Light X Position")

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
)
camera.position.z = properties.terrainWidth * 2

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.update()

function animate() {
	requestAnimationFrame(animate)
	controls.update()
	renderer.render(scene, camera)
	renderer.gammaFactor = 2.2
	renderer.gammaOutput = true
}

animate()

gui.add(properties, "terrainWidth", 1, 40, 1).onChange(() => {
	updateTerrain()
	renderer.render(scene, camera)
})

gui.add(properties, "elevationGap", 0, 40, 1).onChange(() => {
	updateTerrain()
	renderer.render(scene, camera)
})

gui.add(properties, "baseHeight", 0, 40, 1).onChange(() => {
	updateTerrain()
	renderer.render(scene, camera)
})

gui.add(properties, "seed", -100, 100, 1).onChange(() => {
	updateTerrain()
	renderer.render(scene, camera)
})

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	renderer.render(scene, camera)
})
