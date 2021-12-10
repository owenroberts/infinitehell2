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
	Composite.add(engine.world, body);
	return body;
}

gme.start = function() {
	document.getElementById('splash').remove();

	player = new Player(gme.view.halfWidth, gme.view.halfHeight, gme.anims.sprites.player)
	gme.scenes.game.addSprite(player);
	
	const w = gme.view.halfWidth, h = gme.view.halfHeight;

	addBody(0, h + 100, 100);
	addBody(150, h + 100, 100);
	addBody(300, h + 100, 100);
	addBody(450, h + 100, 100);
	addBody(600, h + 100, 100);
	addBody(750, h + 100, 100);

	gme.scenes.current = 'game';
	Runner.run(engine); // start physics
};

gme.update = function(timeElapsed) {
	// gme.scenes.current.update(timeElapsed / gme.dps);
	for (let i = 0; i < objects.length; i++) {
		// objects[i].update();
	}
};

gme.draw = function() {
	if (showPhysics) renderPhysics();
	gme.scenes.current.display();
};

function renderPhysics() {
	let lw = gme.ctx.lineWidth;
	let ls = gme.ctx.strokeStyle;
	// console.log(lw, ls);

	gme.ctx.clearRect(0, 0, gme.view.width, gme.view.height);

	gme.ctx.lineWidth = 1;
	gme.ctx.strokeStyle = '#00dd22';

	gme.ctx.beginPath();
	const bodies = Composite.allBodies(engine.world);
	for (let i = 0, len = bodies.length; i < len; i++) {
		const b = bodies[i];

		// gme.ctx.moveTo(b.vertices[0].x, b.vertices[0].y);
		// for (let j = 1, verts = b.vertices.length; j < verts; j++) {
		// 	gme.ctx.lineTo(b.vertices[j].x, b.vertices[j].y);
		// }
		// gme.ctx.lineTo(b.vertices[0].x, b.vertices[0].y);
		
		for (let k = 0, parts = b.parts.length; k < parts; k++) {
			const p = b.parts[k];

			gme.ctx.moveTo(p.vertices[0].x, p.vertices[0].y);
			for (let j = 1, verts = p.vertices.length; j < verts; j++) {
				gme.ctx.lineTo(p.vertices[j].x, p.vertices[j].y);
			}
			gme.ctx.lineTo(p.vertices[0].x, p.vertices[0].y);
		}

	}

	gme.ctx.stroke();
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
			player.inputKey('up', true);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', true);
			break;
		case 's':
		case 'down':
			player.inputKey('down', true);
			break;

		case 'x':
			player.inputKey('jump', true);
			break;

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
			player.inputKey('up', false);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', false);
			break;
		case 's':
		case 'down':
			player.inputKey('down', false);
			break;

		case 'x':
			player.inputKey('jump', false);
			break;
	}
};
