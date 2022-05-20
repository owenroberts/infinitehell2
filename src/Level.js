class Level {
	constructor(indexes, x, y, ringNumber, levelType) {
		this.indexes = indexes; // [x, y]
		this.x = x;
		this.y = y;
		
		// this.animationFrame = Cool.randomInt(gme.anims.sprites.platforms.endFrame);
		let endFrame = gme.anims.sprites.platforms.endFrame;
		this.animationFrame = Math.min(endFrame, Math.max(0, 
			Math.floor(endFrame / 2) + 1 + indexes[1]));

		this.tiles = [];
		this.tilesAdded = false;
		this.tilePositions = [];
		this.tileCount = 0;
		this.levelType = levelType;


		if (y > gme.lowestLevel) gme.lowestLevel = y;

		// player enters level
		this.width = Constants.TILE_SIZE * Constants.CELL_WIDTH * Constants.GRID_WIDTH;
		this.height = Constants.TILE_SIZE * Constants.CELL_HEIGHT * Constants.GRID_HEIGHT;
		this.trigger = physics.addTrigger(this.indexes, x + this.width / 2, y, this.width, this.height, () => {
			// console.log('triggered', this.indexes);
			// console.log(this.indexes, gme.currentLevel);
			if (this.indexes[0] === gme.currentLevel[0] && 
				this.indexes[1] === gme.currentLevel[1]) {
				return;
			}

			let delta = gme.currentLevel[1] - this.indexes[1];

			// camera.lerpToPlayer();

			gme.currentLevel[0] = this.indexes[0];
			gme.currentLevel[1] = this.indexes[1];

			for (let i = 0; i < gme.levels.length; i++) {
				let indexes = gme.levels[i].indexes;
				let dx = Math.abs(indexes[0] - this.indexes[0]);
				let dy = Math.abs(indexes[1] - this.indexes[1]);
				if (dx > 3 || dy > 3) {
					gme.levels[i].remove();
				}
			}

			this.addLevels(7); // building levels from 5 rings out to here

			if (doodoo) {
				doodoo.moveTonic(delta * 2);
				doodoo.moveBPM(delta * 2);
			}
			player.jumpSpeed -= delta / 2;
			// console.log('jump speed', player.jumpSpeed);

			if (this.indexes[1] > 0) {
				gme.anims.sprites.platforms.overrideProperty('wiggleRange', Math.abs(this.indexes[1])/4);
				gme.anims.sprites.platforms.overrideProperty('wiggleSpeed', Math.abs(this.indexes[1])/8);
				gme.anims.sprites.platforms.overrideProperty('wiggleSegments', true);
			} else {
				gme.anims.sprites.platforms.cancelOverride();
			}
		});

		// console.log(indexes, ringNumber);
		gme.levels.push(this);

		if (ringNumber >= 2) this.addPlatforms(levelType);
		if (ringNumber >= 1) this.addLevels(ringNumber);
	}

	updateTiles() {
		if (this.tileCount === this.tilePositions.length) return;
		let [x, y] = this.tilePositions[this.tileCount];
		this.tiles.push(physics.addBody(x, y, Constants.TILE_SIZE, this.animationFrame));
		this.tileCount++;
	}

	addPlatforms(parts) {
		if (this.tilesAdded) return;
		if (!player.landed && this.indexes[0] == 0 && this.indexes[1] < 0) return; 
		this.tilesAdded = true;
		// parts string w 9 01 -- probably cooler way to do this
		let { x, y } = this;

		if (!parts) {
			parts = '000000000'.split('');
			parts[Cool.randomInt(9)] = '1';
			parts[Cool.randomInt(9)] = '1';
			parts = parts.join('');
		}

		for (let i = 0; i < 9; i++) {

			if (+parts.charAt(i)) {

				let _x = (i % 3) * Constants.TILE_SIZE * Constants.CELL_WIDTH + Constants.HALF_TILE_SIZE;
				let _y = Math.floor(i / 3) * Constants.TILE_SIZE * Constants.CELL_HEIGHT - Constants.TILE_SIZE;

				this.tilePositions.push([x + _x, y + _y]);
				this.tilePositions.push([x + _x + Constants.TILE_SIZE, y + _y]);
				this.tilePositions.push([x + _x + Constants.TILE_SIZE * 2, y + _y]);

			}

		}
	}

	addLevel(indexes, ringNumber) {

		let level = gme.levels.filter(lvl => lvl.indexes[0] === indexes[0] && lvl.indexes[1] === indexes[1]);

		if (level.length) {
			// if the level exists add platforms
			if (ringNumber >= 1) level.forEach(lvl => { 
				if (lvl.tiles.length === 0) lvl.addPlatforms();
			});
			return;
		}

		let x = this.width * indexes[0];
		let y = this.height * indexes[1];
		// console.log(indexes, ringNumber)
		let newLevel = new Level(indexes, x, y, ringNumber);
	}

	addLevels(ringNumber) {
		// console.log('add levels', this.indexes, ringNumber);
		ringNumber -= 1;
		for (let i = 1; i <= 4; i++) {

			let indexes = [
				this.indexes[0] + (i <= 2 ? 1 : -1),
				this.indexes[1] + (i  % 2 === 0 ? 1 : -1)
			];
			// if (this.indexes[0] === 1 && this.indexes[1] === -1)  console.log('1, -1', this.indexes, indexes, ringNumber);
			this.addLevel(indexes, ringNumber);
		}
	}

	remove() {
		for (let i = 0; i < this.tiles.length; i++) {
			Composite.remove(physics.engine.world, this.tiles[i].body);
			gme.scenes.game.remove(this.tiles[i]);
		}
		Composite.remove(physics.engine.world, this.trigger);
		gme.levels.splice(gme.levels.indexOf(this), 1);
	}
}