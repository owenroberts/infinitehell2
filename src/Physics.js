class Physics {
	constructor() {
		this.display = false;
		this.engine = Engine.create();
		this.engine.gravity.y = 2;

		this.defaultOptions = {
			restitution: 0.5,
			friction: 0.9,
		};
	}

	addBody(x, y, size) {
		const body = Bodies.rectangle(
			Math.round(x), 
			Math.round(y), 
			size,
			size,
			{
				...this.defaultOptions, 
				isStatic: true
			}
		);
		const tile = new HellSprite(x, y, gme.anims.sprites.test_tile);
		tile.center = true;
		gme.scenes.game.addSprite(tile);
		Composite.add(this.engine.world, body);
		return body;
	}

	addTrigger(x, y, w, h, callback) {
		const body = Bodies.rectangle(
			Math.round(x), 
			Math.round(y), 
			w,
			h,
			{
				isStatic: true, 
				isSensor: true
			}
		);
		body.isTrigger = true;
		body.callback = callback;
		Composite.add(this.engine.world, body);
		return body;
	}

	render() {
		if (this.display) {
			let lw = gme.ctx.lineWidth;
			let ls = gme.ctx.strokeStyle;
			// console.log(lw, ls);

			// gme.ctx.clearRect(0, 0, gme.view.width, gme.view.height);

			gme.ctx.lineWidth = 1;
			gme.ctx.strokeStyle = '#00dd22';

			
			const bodies = Composite.allBodies(engine.world);
			for (let i = 0, len = bodies.length; i < len; i++) {
				const b = bodies[i];

				// gme.ctx.moveTo(b.vertices[0].x, b.vertices[0].y);
				// for (let j = 1, verts = b.vertices.length; j < verts; j++) {
				// 	gme.ctx.lineTo(b.vertices[j].x, b.vertices[j].y);
				// }
				// gme.ctx.lineTo(b.vertices[0].x, b.vertices[0].y);
				// if (i === 0) {
				// 	gme.ctx.beginPath();
				// 	gme.ctx.arc(b.position.x, b.position.y, 5, 0, 2 * Math.PI, false);
				// 	gme.ctx.stroke();
				// }

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

			
			// console.log(gme.ctx.strokeStyle);
			gme.ctx.lineWidth = lw;
			gme.ctx.strokeStyle = ls;
			// console.log(gme.ctx.strokeStyle);
		}	
	}
}