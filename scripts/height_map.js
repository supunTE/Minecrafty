import { createNoise2D } from "simplex-noise"
import alea from "alea"

export function generateHeightMap(
	terrainWidth = 10,
	elevationGap = 2,
	baseHeight = 5,
	seed = 0,
) {
	const prng = alea(seed)
	// initialize the noise function
	const noise2D = createNoise2D(prng)
	const heightMap = []
	for (let z = 0; z < terrainWidth; z++) {
		const row = []
		for (let x = 0; x < terrainWidth; x++) {
			const height =
				Math.floor(noise2D(x / terrainWidth, z / terrainWidth) * elevationGap) +
				(baseHeight - 1)
			row.push(height)
		}
		heightMap.push(row)
	}
	return heightMap
}
