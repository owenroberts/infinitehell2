class Physics {
	constructor() {
		this.display = true;
		this.engine = Engine.create();
		this.engine.gravity.y = 2;

		this.defaultOptions = {
			restitution: 0.5,
			friction: 0.9,
		};
	}

	addBody(x, y, size) {
		const tile = new HellSprite(x, y, gme.anims.sprites.test_tile);
		tile.center = true;
		gme.scenes.game.addSprite(tile);
		tile.body = Bodies.rectangle(
			Math.round(x), 
			Math.round(y), 
			size,
			size,
			{
				...this.defaultOptions,
				collisionFilter: {
					category: 0b0010,
					mask: 0b0001,
				},
				isStatic: true
			}
		);
		
		Composite.add(this.engine.world, tile.body);
		return tile;
	}

	addTrigger(levelIndex, x, y, w, h, callback) {
		const body = Bodies.rectangle(
			Math.round(x), 
			Math.round(y), 
			w,
			h,
			{
				isStatic: true, 
				isSensor: true,
				collisionFilter: {
					category: 0b0100,
					mask: 0b0001,
				}
			}
		);
		body.isTrigger = true;
		body.levelIndex = levelIndex;
		body.callback = callback;
		Composite.add(this.engine.world, body);
		return body;
	}

	render() {
		if (this.display) {
			let lw = gme.ctx.lineWidth;
			let ls = gme.ctx.strokeStyle;

			gme.ctx.lineWidth = 1;
			gme.ctx.strokeStyle = '#00dd22';
			
			const bodies = Composite.allBodies(this.engine.world);
			for (let i = 0, len = bodies.length; i < len; i++) {
				const b = bodies[i];

				gme.ctx.beginPath();
				for (let k = 0, parts = b.parts.length; k < parts; k++) {
					const p = b.parts[k];

					gme.ctx.moveTo(p.vertices[0].x, p.vertices[0].y);
					for (let j = 1, verts = p.vertices.length; j < verts; j++) {
						gme.ctx.lineTo(p.vertices[j].x, p.vertices[j].y);
					}
					gme.ctx.lineTo(p.vertices[0].x, p.vertices[0].y);
				}
				gme.ctx.stroke();
			}
			
			gme.ctx.lineWidth = lw;
			gme.ctx.strokeStyle = ls;
		}	
	}
}