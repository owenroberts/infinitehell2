class Physics {
	constructor() {
		this.display = false;
		this.engine = Engine.create();
		this.engine.gravity.y = Constants.GRAVITY;

		this.defaultOptions = {
			restitution: 0.1,
			friction: 0.05,
		};
	}

	addBody(x, y, size, animationFrame) {
		const tile = new HellTextureSprite({
			x: x + Cool.randomInt(-Constants.TILE_SIZE / 4, Constants.TILE_SIZE / 4), 
			y: y + Cool.randomInt(Constants.TILE_SIZE / 4), 
			animation: gme.anims.sprites.platforms,
			stateIndex: animationFrame
		});
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
					category: Constants.PLATFORM_CATEGORY,
					// mask: 0b0001,
				},
				isStatic: true
			}
		);
		tile.body.isPlatform = true;
		
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
					category: Constants.TRIGGER_CATEGORY,
					// mask: 0b0001,
				}
			}
		);
		body.isTrigger = true;
		body.levelIndex = levelIndex;
		body.callback = callback;
		Composite.add(this.engine.world, body);
		return body;
	}

	render(offset) {
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

					// gme.ctx.moveTo(p.vertices[0].x + offset[0], p.vertices[0].y + offset[1]);
					
					for (let j = 1, verts = p.vertices.length; j < verts; j++) {
						// gme.ctx.lineTo(p.vertices[j - 1].x + offset[0], p.vertices[j - 1].y + offset[1]);
						gme.ctx.moveTo(p.vertices[j - 1].x + offset[0], p.vertices[j - 1].y + offset[1]);
						gme.ctx.lineTo(p.vertices[j].x + offset[0], p.vertices[j].y + offset[1]);

						if (j < verts - 1) {
							gme.ctx.moveTo(p.vertices[j - 1].x + offset[0], p.vertices[j - 1].y + offset[1]);
							gme.ctx.lineTo(p.vertices[j + 1].x + offset[0], p.vertices[j + 1].y + offset[1]);
						}
					}
					
					gme.ctx.lineTo(p.vertices[0].x + offset[0], p.vertices[0].y + offset[1]);
				}
				gme.ctx.stroke();
			}
			
			gme.ctx.lineWidth = lw;
			gme.ctx.strokeStyle = ls;
		}	
	}
}