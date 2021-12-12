/* add scenery to scene */


class Scenery {
	constructor() {

	}

	setup() {
		let column = 256;
		for (let x = 0; x < gme.view.width; x += column) {
			let cloud = new HellTextureSprite({
				x: x + Cool.randomInt(-column, column), 
				y: Cool.randomInt(0, 100), 
				animation: gme.anims.sprites.clouds,
				stateIndex: Cool.randomInt(0, gme.anims.sprites.clouds.endFrame)
			});
			gme.scenes.scenery.addToDisplay(cloud);

			let fire = new HellTextureSprite({
				x: x + Cool.randomInt(-column, column), 
				y: gme.view.height - 64 - Cool.randomInt(128), 
				animation: gme.anims.sprites.fire,
				stateIndex: Cool.randomInt(0, gme.anims.sprites.fire.endFrame)
			});
			gme.scenes.scenery.addToDisplay(fire);

			let land = new HellTextureSprite({
				x: x + Cool.randomInt(-column, column), 
				y: gme.view.halfHeight - Cool.randomInt(-256, 256), 
				animation: gme.anims.sprites.land,
				stateIndex: Cool.randomInt(0, gme.anims.sprites.land.endFrame)
			});
			gme.scenes.scenery.addToDisplay(land);
		}
	}
}