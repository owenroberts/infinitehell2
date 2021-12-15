class HellSprite extends Sprite {
	constructor(x, y, animation, callback) {
		super(x,y, animation, callback);
	}

	display(view) {
		// if (this.debug) console.log(this.isOnScreen(view))
		if (this.isOnScreen(view)) {
			if (this.debug) this.drawDebug();
			if (this.animation) {
				this.animation.update();
				this.animation.draw(this.x, this.y, GAME.suspend);
			}
		}
		if (this.displayFunc) this.displayFunc();
	}

	isOnScreen(view) {
		if (this.debug) {
			// console.log(this.x, this.width, this.x + this.width, view[0], this.x + this.width > view[0]);
			// console.log(this.x, this.position.x);
			// console.log(view); // -100, -0, 1134, 976
			// console.log(this.x, this.y, this.x + this.width, this.height); // 40 44.5 120 115
		}
		
		return (
			this.x + this.width > view[0] &&
			this.y + this.height > view[1] &&
			this.x < view[0] + view[2] &&
			this.y < view[1] + view[3]
		);
	}
}