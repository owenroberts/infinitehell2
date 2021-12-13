class Level {
	constructor(index, x, y, levelType, isFirstLevel) {
		this.index = index; // [x, y]
		this.x = x;
		this.y = y;
		this.tiles = [];
		this.levelType = levelType;

		// player enters level
		this.trigger = physics.addTrigger(this.index, x, y, gme.view.width, 100, () => {
			// console.log('triggered', this.index);
			camera.lerpToPlayer();
			if (this.index[0] === gme.currentLevel[0] && this.index[1] === gme.currentLevel[1]) return;
			gme.currentLevel[0] = this.index[0];
			gme.currentLevel[1] = this.index[1];


			for (let i = 0; i < gme.levels.lenth; i++) {
				let index = gme.levels[i].index;
				let dx = Math.abs(index[0] - this.index[0]);
				let dy = Math.abs(index[1] - this.index[1]);
				if (dx > 2 || dy > 2) {
					console.log('remove', index);
					gme.levels[i].remove();
				}
			}


			// this.createLevel(levelType);
			this.addLevels();
		});

		this.createLevel(levelType);
		if (isFirstLevel) this.addLevels();
		gme.levels.push(this);

	}

	remove() {
		for (let i = 0; i < this.tiles.length; i++) {
			Composite.remove(physics.engine.world, this.tiles[i].body);
			gme.scenes.game.remove(this.tiles[i]);
		}
		Composite.remove(physics.engine.world, this.trigger);
		gme.levels.splice(gme.levels.indexOf(this), 1);
		console.log(gme.levels);
	}

	createLevel(levelType) {
		let { x, y } = this;
		let w = gme.view.halfWidth, h = gme.view.halfHeight;

		if (levelType === 'A') {
			// bottom middle
			for (let _x = x - w / 4; _x < x + w / 4; _x += 64) {
				this.tiles.push(physics.addBody(_x, y + 128, 64));
			}
			
			// top right
			for (let _x = x - w; _x < x - w + w / 2; _x += 64) {
				this.tiles.push(physics.addBody(_x, y, 64));
			}

			// top left
			for (let _x = x + w / 2; _x < x + w / 2 + w / 2; _x += 64) {
				this.tiles.push(physics.addBody(_x, y, 64));
			}
		}

		if (levelType === 'B') {
			// top middle
			for (let _x = x - w / 4; _x < x + w / 4; _x += 64) {
				this.tiles.push(physics.addBody(_x, y, 64));
			}
			
			// bottom right
			for (let _x = x - w; _x < x - w + w / 2; _x += 64) {
				this.tiles.push(physics.addBody(_x, y + 128, 64));
			}

			// bottom left
			for (let _x = x + w / 2; _x < x + w / 2 + w / 2; _x += 64) {
				this.tiles.push(physics.addBody(_x, y + 128, 64));
			}
		}
	}

	addLevels() {
		for (let i = 1; i <= 4; i++) {

			let index = [
				this.index[0] + (i <= 2 ? 1 : -1),
				this.index[1] + (i  % 2 === 0 ? 1 : -1)
			];

			if (gme.levels.filter(level => 
				level.index[0] === index[0] && level.index[1] === index[1]).length) {
				continue;
			}
				
			// diamond
			// let x = (i % 2 === 0) ? this.x : this.x + (i === 1 ? gme.view.width * 1.25 : -gme.view.width * 1.25);
			// let y = (i % 2 !== 0) ? this.y : this.y + (i === 2 ? gme.view.height * 0.25 : -gme.view.height * 0.25);

			let x = this.x + gme.view.width * (i <= 2 ? 1 : -1) * 1;
			let y = this.y - gme.view.height/4 + gme.view.height * (i % 2 === 0) * 0.5;
			// console.log('level', index);
			let levelType = this.levelType === 'A' ? 'B' : 'A';
			let level = new Level(index, x, y, levelType);
		}
	}
}