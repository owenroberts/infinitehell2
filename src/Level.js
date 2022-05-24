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
		this.triggered = false;

		if (y > gme.lowestLevel) gme.lowestLevel = y;

		// player enters level
		this.width = Constants.TILE_SIZE * Constants.CELL_WIDTH * Constants.GRID_WIDTH;
		this.height = Constants.TILE_SIZE * Constants.CELL_HEIGHT * Constants.GRID_HEIGHT;
		this.trigger = physics.addTrigger(this.indexes, x + this.width / 2, y, this.width, this.height, () => {
			
			this.triggered = true;

			// if in the current level ignore
			if (this.indexes[0] === gme.currentLevel[0] && 
				this.indexes[1] === gme.currentLevel[1]) {
				return;
			}

			// change in up or down
			let delta = gme.currentLevel[1] - this.indexes[1];

			gme.currentLevel[0] = this.indexes[0];
			gme.currentLevel[1] = this.indexes[1];

			// removing levels too far away ...
			for (let i = 0; i < gme.levels.length; i++) {
				let indexes = gme.levels[i].indexes;
				let dx = Math.abs(indexes[0] - this.indexes[0]);
				let dy = Math.abs(indexes[1] - this.indexes[1]);
				// if (dx > removeLevelsThreshold || dy > removeLevelsThreshold) {
				if (dx + dy > Constants.REMOVE_RINGS) {
					gme.levels[i].remove();
				}
			}

			this.addLevels(Constants.LEVEL_RINGS); // building levels from 5 rings out to here

			if (doodoo) {
				doodoo.moveTonic(delta * 2);
				doodoo.moveBPM(delta * 2);
			}

			player.jumpSpeed -= delta * Constants.SPEED_CHANGE;

			if (this.indexes[1] > 0) {
				gme.anims.sprites.platforms.overrideProperty('wiggleRange', Math.abs(this.indexes[1])/4);
				gme.anims.sprites.platforms.overrideProperty('wiggleSpeed', Math.abs(this.indexes[1])/8);
				gme.anims.sprites.platforms.overrideProperty('wiggleSegments', true);
			} else {
				gme.anims.sprites.platforms.cancelOverride();
			}
		});

		gme.levels.push(this);

		if (ringNumber >= 2) this.addPlatforms(levelType);
		if (ringNumber >= 1) this.addLevels(ringNumber);

		this.platformLife = 30; // Cool.randomInt(120, 360);
		this.lifeCounter = 0;
		this.removeCount = 0;
	}

	updateTiles() {
		// if (this.tileCount === this.tilePositions.length) return;
		if (this.tileCount < this.tilePositions.length) {
			let [x, y] = this.tilePositions[this.tileCount];
			this.tiles.push(physics.addBody(x, y, Constants.TILE_SIZE, this.animationFrame));
			this.tileCount++;
			return;
		}

		return;
		if (!this.triggered) return;

		if (this.lifeCounter < this.platformLife) {
			this.lifeCounter++;
			return;
		}

		console.log(this.removeCount, this.tiles)
		if (this.tiles.length > 0) {
			Composite.remove(physics.engine.world, this.tiles[0].body);
			gme.scenes.game.remove(this.tiles[0]);
			this.tiles.splice(0, 1);
			return;
		}

		this.tilesAdded = false;
		this.platformLife = Cool.randomInt(120, 360);
		this.lifeCounter = 0;
		this.tileCount = 0;
		this.tilePositions = [];
		this.addPlatforms();
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

		// prevents creating levels already created ...
		if (level.length > 0) {
			// if the level exists add platforms
			if (ringNumber >= 1) level.forEach(lvl => { 
				if (lvl.tiles.length === 0) lvl.addPlatforms();
			});
			if (ringNumber >= 2) {
				level[0].addLevels(ringNumber);
			}
			return;
		}

		let x = this.width * indexes[0];
		let y = this.height * indexes[1];
		let newLevel = new Level(indexes, x, y, ringNumber);
	}

	addLevels(ringNumber) {
		ringNumber -= 1;
		for (let i = 1; i <= 4; i++) {

			let indexes = [
				this.indexes[0] + (i <= 2 ? 1 : -1),
				this.indexes[1] + (i % 2 === 0 ? 1 : -1)
			];
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