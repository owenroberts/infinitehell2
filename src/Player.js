class Player extends HellSprite {
	constructor(x, y, animation, debug) {
		super(x, y);
		this.mapPosition = [Math.round(x), Math.round(y)];
		this.center = true; /* need better name */
		// this.setCollider(25, 6, 78, 90);

		this.debug = debug || false;
		this.speed = [1, 1];
		this.jumpSpeed = Constants.PLAYER_JUMP_SPEED;
		this.jumpJustPressed = false;
		this.isJumping = true; // starts out falling
		this.jumpCount = 0;
		this.jumpMax = 2;
		
		this.addAnimation(animation);
		this.animation.state = 'idle_right';
		this.direction = 1; // 1 is right -1 is left

		this.input = { right: false, up: false, left: false, down: false, jump: false };

		this.hasSFX = false;

		this.landed = false;
		this.setupPhysics();

		this.halfWidth = this.width / 2;
		this.halfHeight = this.height / 2;

	}

	setupPhysics() {

		let parts = []

		this.blocked = { down : null, up : null, right : null, left : null };
		this.sensors = {};

		let [x, y] = this.position;
		let [w, h] = [56, 56];
		let s = 10; // sensor size

		this.sensors.down = Bodies.rectangle(x, y + h / 2, w / 2, s, {isSensor : true});
		parts.push(this.sensors.down);

		parts.push(Bodies.rectangle(x, y, w, h));
		const params = {
			inertia : Infinity,
			restitution: 0.25,
			friction: 0.05,
			parts: parts,
			collisionFilter: {
				category: 0b0001,
			}
			// isStatic: true,

		};
		this.body = Body.create(params);
		this.body.isPlayer = true;
		Composite.add(physics.engine.world, this.body);

		Events.on(physics.engine, 'afterUpdate', this.physicsUpdate.bind(this));
		Events.on(physics.engine, 'beforeUpdate', event => {
			this.blocked.down = false;
		});

		Events.on(physics.engine, 'collisionActive', event => {
			let pairs = event.pairs;

			for(let i = 0, p = pairs.length; i < p; i++) {
				let pair = pairs[i];
				if ((pair.bodyA === this.sensors.down || 
					pair.bodyB === this.sensors.down) 
					&& !pair.bodyA.isTrigger && !pair.bodyB.isTrigger) {
					// console.log(pair.bodyA.isTrigger, pair.bodyB.isTrigger)
					this.blocked.down = true;
					if (!player.landed) player.landed = true;
				}
			}
		});

		Events.on(physics.engine, 'collisionStart', event => {
			if (!player.landed) return;
			let pairs = event.pairs;

			for(let i = 0, p = pairs.length; i < p; i++) {
				let pair = pairs[i];
				if (pair.bodyA.isTrigger && pair.bodyB.parent.isPlayer) {
					pair.bodyA.callback();
				}
				
				if (pair.bodyB.isTrigger && pair.bodyA.parent.isPlayer) {
					pair.bodyB.callback();
				}

				// if (pair.bodyA.calledBack) Composite.remove(physics.engine.world, pair.bodyA);
				// if (pair.bodyB.calledBack) Composite.remove(physics.engine.world, pair.bodyB);

			}
		});
	}

	inputKey(key, state) {
		if (!this.landed) return;
		this.input[key] = state;
	}

	reset() {
		player.landed = false;
		this.jumpSpeed = Constants.PLAYER_JUMP_SPEED;
		this.input.right = false;
		this.input.left = false;
		this.input.jump = false;
		Body.setPosition(this.body, { x : Constants.PLAYER_START_X, y : Constants.PLAYER_START_Y });
		Body.setVelocity(this.body, { x : 0, y : 0 });
	}

	physicsUpdate() {
		
		if (this.blocked.down && this.isJumping) {
			this.isJumping = false;
			this.jumpCount = 0;
			this.animation.cancelOverride();
			if (this.hasSFX) this.sfx.jump[0].play();
		}

		if (this.input.jump) {
			if (!this.jumpJustPressed) {
				if (this.blocked.down || this.jumpCount < this.jumpMax) {
					Body.setVelocity(this.body, {x : this.body.velocity.x, y : -12});
					this.isJumping = true;
					this.jumpCount++;
					this.animation.overrideProperty('wiggleSpeed', 5);
					this.animation.overrideProperty('wiggleSpeed', 2);
					this.animation.overrideProperty('wiggleSegments', true);
					if (this.hasSFX) {
						this.sfx.jump[0].pause();
						this.sfx.jump[0].currentTime = 0;
						this.sfx.jump[0].play();
					}
				}
			}
			this.jumpJustPressed = true;
		} else {
			this.jumpJustPressed = false;
		}

		let state = this.direction == 1 ? 'idle_right' : 'idle_left';



		if (this.isJumping || !this.blocked.down) {
			state = this.direction == 1 ? 'jump_right' : 'jump_left';
			// camera.lerpToPlayer();
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

		if (this.hasSFX) this.playSFX(this.body.velocity, this.blocked.down);
	}

	addSFX(sfx) {
		this.sfx = {};
		this.hasSFX = true;

		sfx.forEach(clip => {
			const f = clip.currentSrc.split('/').pop();
			const type = f.split('_')[0];
			if (!this.sfx[type]) this.sfx[type] = [];
			this.sfx[type].push(clip);
		});

		this.walkCount = 0;
		this.walkInterval = 30; // 24 / 2 + 1
	}

	playSFX(velocity, isOnGround) {
		if (Math.abs(velocity.x) > 0 && this.walkCount === 0 && isOnGround) {
			let index = Cool.randomInt(this.sfx.walk.length - 1);
			this.sfx.walk[index].play();
			this.walkCount++;
		} else if (velocity.x === 0 || this.walkCount === this.walkInterval || !isOnGround) {
			this.walkCount = 0;
		} else {
			this.walkCount++;
		}
	}

}