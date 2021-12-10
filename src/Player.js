class Player extends Sprite {
	constructor(x, y, animation, debug) {
		super(x, y);
		this.mapPosition = [Math.round(x), Math.round(y)];
		this.center = true; /* need better name */
		// this.setCollider(25, 6, 78, 90);

		this.debug = debug || false;
		this.speed = [1, 1];
		this.jumpSpeed = -20;
		this.jumpJustPressed = false;
		this.isJumping = false;
		this.jumpCount = 0;
		this.jumpMax = 2;

		this.addAnimation(animation);
		this.animation.state = 'idle';

		this.input = { right: false, up: false, left: false, down: false, jump: false };
		this.inBounds = [true, true];

		this.hasSFX = false;

		this.setupPhyiscs();
		
	}

	setupPhyiscs() {

		let parts = []

		this.blocked = { down : null, up : null, right : null, left : null };
		this.sensors = {};

		let { x, y } = this;
		let [w, h] = [90, 78];
		let s = 10; // sensor size

		this.sensors.down = Bodies.rectangle(x, y + h / 2, this.width / 2, s, {isSensor : true});
		// this.sensors.right = Bodies.rectangle(x + w / 2, y, s, h / 2, {isSensor : true});
		// this.sensors.left = Bodies.rectangle(x - w / 2, y, s, h / 2, {isSensor : true});
		// this.sensors.up = Bodies.rectangle(x, y - h / 2, w / 2, s, {isSensor : true});


		parts.push(this.sensors.down);
		// parts.push(this.sensors.left);
		// parts.push(this.sensors.right);
		// parts.push(this.sensors.up);

		parts.push(Bodies.rectangle(x, y, w, h));
		const params = {
			inertia : Infinity,
			restitution: 0.1,
			friction: 0.5,
			parts: parts
		};
		this.body = Body.create(params);
		Composite.add(engine.world, this.body);

		Events.on(engine, 'afterUpdate', this.physicsUpdate.bind(this));
		Events.on(engine, 'beforeUpdate', event => {
			this.blocked.down = false;
			// this.blocked.right = false;
			// this.blocked.left = false;
			// this.blocked.up = false;
		});

		Matter.Events.on(engine, 'collisionActive', event => {
			let pairs = event.pairs;
			for(let i = 0, p = pairs.length; i < p; i++){
				let pair = pairs[i];
				if (pair.bodyA === this.sensors.down || pair.bodyB === this.sensors.down) 
					this.blocked.down = true;
				// if (pair.bodyA === this.sensors.right || pair.bodyB === this.sensors.right) 
				// 	this.blocked.right = true;
				// if (pair.bodyA === this.sensors.left || pair.bodyB === this.sensors.left) 
				// 	this.blocked.left = true;
				// if (pair.bodyA === this.sensors.up || pair.bodyB === this.sensors.up) 
				// 	this.blocked.up = true;
			}
		});

	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	physicsUpdate() {

		let state = this.animation.stateName.includes('idle') ?
			this.animation.state :
			'idle';

		if (this.input.jump) {
			if (!this.jumpJustPressed) {
				if (this.blocked.down || this.jumpCount < this.jumpMax) {
					Body.setVelocity(this.body, {x : this.body.velocity.x, y : -10});
					this.isJumping = true;
					this.jumpCount++;
					
				}
			}
			this.jumpJustPressed = true;
		} else {
			this.jumpJustPressed = false;
		}

		if (this.blocked.down && this.isJumping && !this.jumpJustPressed) {
			this.isJumping = false;
			this.jumpCount = 0;
		}

		if (this.isJumping || !this.blocked.down) {
			state = 'jump';
		}

		if (this.input.right) {
			if (!this.isJumping) state = 'right';
			Body.setVelocity(player.body, {x : 3, y : player.body.velocity.y})			
		}

		if (this.input.left) {
			if (!this.isJumping) state = 'left';
			Body.setVelocity(player.body, {x : -3, y : player.body.velocity.y});
		}

		this.position[0] = this.body.position.x;
		this.position[1] = this.body.position.y;

		this.animation.state = state;

		if (this.hasSFX) this.playSFX(speed);
	}
}