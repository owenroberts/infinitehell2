class Camera {
	constructor() {
		this.centerPlayer = false;
		this.view = [0, 0, gme.width, gme.height];
		this.zoom = 1.5;
		this.center = [100, 0];
		this.lerp = {
			center: [0, 0],
			speed: 8, // higher is slower,
			threshold: 0.1, // how close to get to player position 
		};

	}

	lerpToPlayer() {
		this.lerp.center = [...this.center];
		this.lerp.start = true;
	}

	update() {
		if (this.lerp.start) {
			let px = gme.halfWidth - player.x - player.halfWidth;
			let py = gme.halfHeight - player.y - player.halfHeight;
			let direction = [px - this.lerp.center[0], py - this.lerp.center[1]];

			console.log(px, py);

			console.log(this.lerp.center);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(this.lerp.center[0], this.lerp.center[1]);

			if (Math.abs(direction[0]) < this.lerp.threshold || Math.abs(direction[1]) < this.lerp.threshold) {
				this.lerp.start = false;
				this.centerPlayer = true;
			}
			
			this.view[0] = -this.lerp.center[0];
			this.view[1] = -this.lerp.center[1];

		} else if (this.centerPlayer) {

			gme.ctx.translate(gme.halfWidth, gme.halfHeightx);
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(-player.x - player.halfWidth, -player.y - player.halfHeight);

			this.view[0] = gme.halfWidth - player.x - player.halfWidth;
			this.view[1] =  gme.halfHeight - player.y - player.halfHeight;
		} else {
			gme.ctx.scale(this.zoom, this.zoom);
			gme.ctx.translate(this.center[0], this.center[1]);
			this.view[0] = -this.center[0];
			this.view[1] = -this.center[1];
		}
	}
}