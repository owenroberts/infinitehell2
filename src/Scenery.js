/* add scenery to scene */


class Scenery {
	constructor() { }

	setupBG() {
		let column = 64;
		for (let x = -32; x < gme.view.width; x += column) {

			if (Cool.chance(0.66)) {
				let cloud = new HellTextureSprite({
					x: x + Cool.randomInt(-column, column), 
					y: Cool.randomInt(-column, 0), 
					animation: gme.anims.sprites.clouds,
					stateIndex: Cool.randomInt(0, gme.anims.sprites.clouds.endFrame)
				});
				gme.scenes.bg.addToDisplay(cloud);
			}
			
			let fire = new HellTextureSprite({
				x: x + Cool.randomInt(-column, column), 
				y: gme.view.height - 64 - Cool.randomInt(64), 
				animation: gme.anims.sprites.fire,
				stateIndex: Cool.randomInt(0, gme.anims.sprites.fire.endFrame)
			});
			gme.scenes.bg.addToDisplay(fire);

			if (Cool.chance(0.33)) {
				let land = new HellTextureSprite({
					x: x + Cool.randomInt(-column, column), 
					y: gme.view.halfHeight + Cool.randomInt(128), 
					animation: gme.anims.sprites.land,
					stateIndex: Cool.randomInt(0, gme.anims.sprites.land.endFrame)
				});
				gme.scenes.bg.addToDisplay(land);
			}
		}
	}

	setupFG() {
		let tile = 512;
		let index = Cool.randomInt(gme.anims.sprites.foregrounds.endFrame);
		for (let x = -tile/2; x < gme.view.width + tile/2; x += tile) {
			for (let y = -tile/2; y < gme.view.width + tile/2; y += tile) {
				let fg = new HellTextureSprite({
					x: x + Cool.randomInt(-tile/8, tile/8), 
					y: y + Cool.randomInt(-tile/8, tile/8),
					animation: gme.anims.sprites.foregrounds,
					stateIndex: index,
				});
				gme.scenes.fg.addToDisplay(fg);
			}
		}
	}

	reset() {
		gme.scenes.bg.displaySprites.clear();
		gme.scenes.fg.displaySprites.clear();
	}
}