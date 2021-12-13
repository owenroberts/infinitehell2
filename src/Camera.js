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
			threshold: 1, // how close to get to player position 
		};
		this.waitToSet = false;

	}

	lerpToPlayer() {
		if (this.state == 'view') {
			this.lerp.center = [...this.center];
			this.state = 'lerp';
		}
	}

	update() {
		if (this.state === 'lerp') {

			let px = -player.x - player.halfWidth;
			let py = -player.y - player.halfHeight;
			let direction = [px - this.lerp.center[0], py - this.lerp.center[1]];
			this.lerp.center[0] += Math.floor(direction[0] / this.lerp.speed);
			this.lerp.center[1] += Math.floor(direction[1] / this.lerp.speed);

			let focusDirection = [gme.halfWidth - this.lerp.focus[0], gme.halfHeight - this.lerp.focus[1]]
			this.lerp.focus[0] += Math.floor(focusDirection[0] / this.lerp.speed);
			this.lerp.focus[1] += Math.floor(focusDirection[1] / this.lerp.speed);


			gme.ctx.translate(this.lerp.focus[0], this.lerp.focus[1]);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(this.lerp.center[0], this.lerp.center[1]);

			if (Math.abs(direction[0]) < this.lerp.threshold || Math.abs(direction[1]) < this.lerp.threshold) {
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

			this.view[0] = gme.halfWidth - player.x - player.halfWidth;
			this.view[1] =  gme.halfHeight - player.y - player.halfHeight;

		} else if (this.state === 'view') {
			gme.ctx.translate(this.focus[0], this.focus[1]);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(this.center[0], this.center[1]);

			this.view[0] = -this.focus[0] - this.center[0];
			this.view[1] = -this.focus[1] - this.center[1];
		}
	}
}