class Player extends HellSprite {
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
		this.animation.state = 'idle_right';
		this.direction = 1; // 1 is right -1 is left

		this.input = { right: false, up: false, left: false, down: false, jump: false };

		this.hasSFX = false;

		this.setupPhysics();

		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;

		console.log('player sprite', this)

	}

	setupPhysics() {

		let parts = []

		this.blocked = { down : null, up : null, right : null, left : null };
		this.sensors = {};

		let [x, y] = this.position;
		let [w, h] = [64, 64];
		let s = 10; // sensor size

		this.sensors.down = Bodies.rectangle(x, y + h / 2, w / 2, s, {isSensor : true});
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
			parts: parts,
			// isStatic: true
		};
		this.body = Body.create(params);
		this.body.isPlayer = true;
		Composite.add(engine.world, this.body);
		console.log(this.body);

		Events.on(engine, 'afterUpdate', this.physicsUpdate.bind(this));
		Events.on(engine, 'beforeUpdate', event => {
			this.blocked.down = false;
			// this.blocked.right = false;
			// this.blocked.left = false;
			// this.blocked.up = false;
		});
		let firstCollision = true;
		Events.on(engine, 'collisionActive', event => {
			let pairs = event.pairs;
			if (firstCollision) {
				// console.log(pairs);
				firstCollision = false;
			}
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
				// console.log(pair.bodyA.isTrigger, pair.bodyB.isTrigger);
				// console.log(pair.bodyA.parent.isPlayer, pair.bodyB.parent.isPlayer);

				if (pair.bodyA.isTrigger && pair.bodyB.parent.isPlayer) {
					if (!pair.bodyA.calledBack) {
						pair.bodyA.callback();
						pair.bodyA.calledBack = true;
					}
				}
				
				if (pair.bodyB.isTrigger && pair.bodyA.parent.isPlayer) {
					if (!pair.bodyB.calledBack) {
						pair.bodyB.callback();
						pair.bodyB.calledBack = true;
					}
				}

				if (pair.bodyA.calledBack) Composite.remove(engine.world, pair.bodyA);
				if (pair.bodyB.calledBack) Composite.remove(engine.world, pair.bodyB);

			}
		});
	}

	inputKey(key, state) {
		this.input[key] = state;
	}

	translatePosition() {
		return [-this.x - this.halfWidth, -this.y - this.halfHeight];
	}

	physicsUpdate() {

		
		if (this.blocked.down && this.isJumping) {
			this.isJumping = false;
			this.jumpCount = 0;
		}

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

		let state = this.direction == 1 ? 'idle_right' : 'idle_left';

		if (this.isJumping || !this.blocked.down) {
			state = this.direction == 1 ? 'jump_right' : 'jump_left';
		}

		if (this.input.right) {
			Body.setVelocity(player.body, {x : 3, y : player.body.velocity.y});
			this.direction = 1;
			if (!this.isJumping) state = 'right';
		}

		if (this.input.left) {
			Body.setVelocity(player.body, {x : -3, y : player.body.velocity.y});
			this.direction = -1;
			if (!this.isJumping) state = 'left';
		}

		this.position[0] = Math.round(this.body.position.x);
		this.position[1] = Math.round(this.body.position.y);

		this.animation.state = state;

		if (this.hasSFX) this.playSFX(speed);
	}

}