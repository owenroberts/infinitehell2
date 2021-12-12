class Level {
	constructor(index, x, y) {
		this.index = index;
		this.x = x;
		this.y = y;

		physics.addTrigger(this.index, x, y, gme.view.width, 100, () => {
			console.log('called back');
			camera.lerpToPlayer();
			this.createLevel();
		});
	}

	createLevel() {
		let { x, y } = this;
		let w = gme.view.width, h = gme.view.height;

		const levelStyle = Cool.random(['A', 'B', 'C']);

		if (true || levelStyle === 'A') {
			// bottom middle
			for (let _x = x; _x < x + w; _x += 64) {
				physics.addBody(_x, y, 64);
			}
			
		}
	}
}