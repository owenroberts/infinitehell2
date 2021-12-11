// loading animation pre lines render
const title = document.getElementById('title');
function loadingAnimation() {
	let t = '~' + title.textContent + '~';
	title.textContent = t;
}
let loadingInterval = setInterval(loadingAnimation, 1000 / 12);

const isMobile = Cool.mobilecheck();
if (isMobile) document.body.classList.add('mobile');

/* this is the game part */
const gme = new Game({
	dps: 24,
	lineWidth: 1,
	// zoom: isMobile ? 1 : 1.5,
	zoom: 1,
	width: window.innerWidth,
	height: window.innerHeight,
	multiColor: true,
	checkRetina: true,
	// debug: true,
	// stats: true,
	suspend: true,
	events: isMobile ? ['touch'] : ['keyboard', 'mouse'],
	scenes: ['game', 'splash', 'loading'],
	bounds: {
		left: -1024,
		top: 1024,
		right: 1024,
		bottom: 1024,
	}
});

gme.load({ 
	// scenery: 'data/scenery.json',
	// textures: 'data/textures.json',
	sprites: 'data/sprites.json',
	// ui: 'data/ui.json',
}, false);

let player;

/* physics */
const  { Engine, Bodies, Body, Composite, Runner, Events } = Matter;
const showPhysics = true;
const engine = Engine.create();
engine.gravity.y = 2;
const objects = [];

const defaultOptions = {
	restitution: 0.5,
	friction: 0.9,
};

function addBody(x, y, size) {
	// console.log(x, y, size);
	const body = Bodies.rectangle(
		Math.round(x), 
		Math.round(y), 
		size,
		size,
		{...defaultOptions, isStatic: true }
	);

	const tile = new Sprite(x, y, gme.anims.sprites.test_tile);
	tile.center = true;
	gme.scenes.game.addSprite(tile);
	Composite.add(engine.world, body);
	return body;
}

function addTrigger(x, y, w, h, callback) {
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
	Composite.add(engine.world, body);
	return body;
}

gme.start = function() {
	document.getElementById('splash').remove();

	player = new Player(0, 0, gme.anims.sprites.player)
	gme.scenes.game.addSprite(player);
	
	const w = gme.view.halfWidth, h = gme.view.halfHeight;

	addBody(0, h + 100, 100);
	addBody(150, h + 100, 100);
	addBody(300, h + 100, 100);

	addBody(150, h + 1000, 100);
	addBody(300, h + 1000, 100);
	addBody(450, h + 1000, 100);
	addBody(600, h + 1000, 100);
	addBody(750, h + 1000, 100);


	addBody(150, h + 1000, 100);
	addBody(300, h + 1000, 100);
	addBody(450, h + 1000, 100);
	addBody(600, h + 1000, 100);
	addBody(750, h + 1000, 100);

	addTrigger(-gme.halfWidth / 2, h + 300, gme.width * 2.5, 200, function() {
		lerpCenter = [...cameraCenter];
		startLerp = true;
	});

	gme.scenes.current = 'game';
	Runner.run(engine); // start physics

};
// update by matter ...

gme.draw = function() {
	gme.ctx.save();
	camera();
	
	// if (showPhysics) renderPhysics();
	gme.scenes.current.display(true);
	renderDebug();
	gme.ctx.restore();
};

// trying this out ...
// try changing this ...

let centerPlayer = false;
let cameraCenter = [100, 0];
let lerpCenter = [0, 0];
let startLerp = false;
let lerpSpeed = 8; // higher is slower
let lerpThreshold = 0.1;

function camera() {

	if (startLerp) {
		let px = gme.halfWidth - player.x - player.halfWidth;
		let py = gme.halfHeight - player.y - player.halfHeight;

		let direction = [px - lerpCenter[0], py - lerpCenter[1]];

		lerpCenter[0] += direction[0] / lerpSpeed;
		lerpCenter[1] += direction[1] / lerpSpeed;

		gme.ctx.translate(lerpCenter[0], lerpCenter[1]);

		if (Math.abs(direction[0]) < lerpThreshold || Math.abs(direction[1]) < lerpThreshold) {
			startLerp = false;
			centerPlayer = true;
		}
		

	} else if (centerPlayer) {
		// gme.ctx.translate(gme.halfWidth, gme.halfHeight);
		gme.ctx.translate(gme.halfWidth - player.x - player.halfWidth, gme.halfHeight - player.y - player.halfHeight);
	} else {
		gme.ctx.translate(cameraCenter[0], cameraCenter[1]);
	}
}

function renderDebug() {
	gme.ctx.beginPath();
	gme.ctx.strokeStyle = '#ffffff';
	gme.ctx.arc(0, 0, 5, 0, 2 * Math.PI);
	gme.ctx.stroke();
}

function renderPhysics() {
	let lw = gme.ctx.lineWidth;
	let ls = gme.ctx.strokeStyle;
	// console.log(lw, ls);

	gme.ctx.clearRect(0, 0, gme.view.width, gme.view.height);

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

/* events */
gme.keyDown = function(key) {
	switch (key) {
		case 'a':
		case 'left':
			player.inputKey('left', true);
			break;
		case 'w':
		case 'up':
		case 'x':
		case 'space':
			player.inputKey('jump', true);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', true);
			break;
		// case 's':
		// case 'down':
		// 	player.inputKey('down', true);
		// 	break;
		case 'g':
			// if (!userStarted) userStart();
		break;
		case 'h':
			// if (!userStarted) loadSound();
		break;

	}
};

gme.keyUp = function(key) {
	switch (key) {
		case 'a':
		case 'left':
			player.inputKey('left', false);
			break;
		case 'w':
		case 'up':
		case 'x':
		case 'space':
			player.inputKey('jump', false);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', false);
			break;
		case 's':
		case 'down':
			player.inputKey('down', false);
			break;
	}
};
