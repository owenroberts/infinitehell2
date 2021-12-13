class Camera {
	constructor() {
		this.view = [0, 0, gme.width, gme.height];
		this.zoom = 1;
		this.center = [0, 0];
		this.focus = [0, 0];
		this.state = 'view'; // lerp, player, view
		this.lerp = {
			center: [0, 0],
			focus: [0, 0],
			speed: 8, // higher is slower,
			threshold: 0.05, // how close to get to player position 
		};
		this.waitToSet = false;

	}

	lerpToPlayer() {
		if (this.state == 'view') {
			this.lerp.center = [...this.center];
			this.lerp.focus = [...this.focus];
			this.state = 'lerp';
		}
	}

	update() {
		if (this.state === 'lerp') {

			let px = -player.x - player.halfWidth;
			let py = -player.y - player.halfHeight;
			let lerp = [
				(px - this.lerp.center[0]) / this.lerp.speed, 
				(py - this.lerp.center[1]) / this.lerp.speed
			];
			this.lerp.center[0] += lerp[0];
			this.lerp.center[1] += lerp[1];

			let focusLerp = [
				(gme.halfWidth - this.lerp.focus[0]) / this.lerp.speed, 
				(gme.halfHeight - this.lerp.focus[1]) / this.lerp.speed
			];
			this.lerp.focus[0] += focusLerp[0];
			this.lerp.focus[1] += focusLerp[1];

			gme.ctx.translate(Math.floor(this.lerp.focus[0]), Math.floor(this.lerp.focus[1]));
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(Math.floor(this.lerp.center[0]), Math.floor(this.lerp.center[1]));

			if (Math.abs(lerp[0]) < this.lerp.threshold || Math.abs(lerp[1]) < this.lerp.threshold) {
				// console.log('lerp done');
				this.state = 'view';
				this.focus = [gme.halfWidth, gme.halfHeight];
				this.center = [-player.x - player.halfWidth, -player.y - player.halfHeight];
			}
			
			this.view[0] = -this.lerp.focus[0] - this.lerp.center[0];
			this.view[1] = -this.lerp.focus[1] - this.lerp.center[1];

		} else if (this.state === 'player') {

			gme.ctx.translate(gme.halfWidth, gme.halfHeight);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(-player.x - player.halfWidth, -player.y - player.halfHeight);

			this.view[0] = -gme.halfWidth + player.x + player.halfWidth;
			this.view[1] = -gme.halfHeight + player.y + player.halfHeight;

			// console.log(this.view);

		} else if (this.state === 'view') {
			gme.ctx.translate(this.focus[0], this.focus[1]);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(this.center[0], this.center[1]);

			this.view[0] = -this.focus[0] - this.center[0];
			this.view[1] = -this.focus[1] - this.center[1];

			// console.log(this.focus, this.center, this.view);
		}
	}
}