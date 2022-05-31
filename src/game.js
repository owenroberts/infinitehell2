// loading animation pre lines render
const title = document.getElementById('title');
function loadingAnimation() {
	let t = '~' + title.textContent + '~';
	title.textContent = t;
}

const isMobile = Cool.mobilecheck();
if (isMobile) document.body.classList.add('mobile');

/* this is the game part */
const gme = new Game({
	dps: 24,
	lineWidth: 1,
	// zoom: isMobile ? 1 : 1.5,
	zoom: 1.5,
	width: window.innerWidth,
	height: window.innerHeight,
	multiColor: true,
	checkRetina: true,
	// debug: true,
	stats: true,
	// ignoreAlerts: true,
	testPerformance: true,
	smallCanvas: false,
	// lowPerformance: true,
	useSVGFilterOnLow: true,
	// svgFilter: true,
	suspend: true,
	events: isMobile ? ['touch'] : ['keyboard', 'mouse'],
	scenes: ['game', 'splash', 'loading', 'bg', 'fg'],
	bounds: {
		left: -1024,
		top: 1024,
		right: 1024,
		bottom: 1024,
	}
});

// iframe fix -- fucking itch bullshit
let loadingInterval;
if (window.parent !== window) {
	console.log('iframe detected');

	title.style.display = 'none';
	const startButton = document.createElement('button');
	startButton.textContent = 'start infinite hell 2';
	document.getElementById('splash').appendChild(startButton);
	startButton.onclick = function() {
		startButton.remove();
		title.style.display = 'block';
		loadingInterval = setInterval(loadingAnimation, 1000 / 12);
		gme.load({ sprites: 'data/sprites.json' }, false);
	}
} else {
	loadingInterval = setInterval(loadingAnimation, 1000 / 12);
	gme.load({ sprites: 'data/sprites.json' }, false);
}

const { Engine, Bodies, Body, Composite, Runner, Events } = Matter;
let player, buffer, origin, view = 'scene'; // view state -- player, view, lerp
let offset = [0, 0], playerOffset = [0, 0];
let firstLevel;
gme.levels = [];
let scenery = new Scenery();
let physics = new Physics();
let doodoo;

gme.start = function() {
	document.getElementById('splash').remove();

	let splash = new HellSprite({ 
		x: 64, 
		y: gme.view.halfHeight - 128, 
		animation: gme.anims.sprites.splash
	});
	splash.center = false;
	gme.scenes.splash.addToDisplay(splash);

	// instructions are part of scene
	let instructions = new HellSprite({ 
		x: 256, 
		y: -128, 
		animation: gme.anims.sprites.instructions 
	});
	gme.scenes.game.addSprite(instructions);

	gme.levels = [];
	gme.currentLevel = [0, 0];
	gme.lowestLevel = 0;

	player = new Player(Constants.PLAYER_START_X, Constants.PLAYER_START_Y, gme.anims.sprites.player);
	gme.scenes.game.addToDisplay(player);
	
	scenery.setupBG();
	scenery.setupFG();
	gme.scenes.current = 'splash';

	buffer = Math.round(Math.min(128, gme.width / 4));
	origin = [gme.view.halfWidth - Constants.PLAYER_START_X, gme.view.halfHeight];
	offset = [gme.view.halfWidth - Constants.PLAYER_START_X, gme.view.halfHeight];
};

// update by matter ...
function startGame(withSound) {
	if (withSound) {
		bgMusic();
		sfxSetup();
	}
	gme.scenes.current = 'game';
	// Runner.run(physics.engine); // start physics
	const runner = Runner.create({
		delta: 1000 / 60,
		isFixed: true,
	});
	Runner.run(runner, physics.engine);
	// physics.display = true;
	firstLevel = new Level([0, 0], 0, 0, Constants.LEVEL_RINGS, '000000111');
	firstLevel.triggered = true;
}

gme.draw = function(timeElapsed) {
	for (let i = 0; i < gme.levels.length; i++) {
		gme.levels[i].updateTiles();
	}

	gme.ctx.clearRect(0, 0, gme.view.width, gme.view.height);

	// get player sides buffer
	if (view === 'scene') {
		// console.log(player.x, player.position[0], gme.view.width, gme.view.width - buffer)
		const insideBuffer =
			player.position[0] > buffer && 
			player.position[0] < gme.view.width - buffer &&
			player.position[1] > buffer && 
			player.position[1] < gme.view.height - buffer;

		if (!insideBuffer && player.landedFirst) {
			view = 'lerp';
		}
	}

	// player is inside edges, player should move before scene
	if (view === 'scene') {
		playerOffset[0] = player.mapPosition[0] - Constants.PLAYER_START_X + (offset[0] - origin[0]);
		playerOffset[1] = player.mapPosition[1] + (offset[1] - origin[1]);
		
	} else if (view === 'lerp') {

		const d = [
			offset[0] - (gme.view.halfWidth - player.mapPosition[0]),
			offset[1] - (gme.view.halfHeight - player.mapPosition[1])
		];

		playerOffset[0] = d[0];	
		offset[0] -= (d[0] * Constants.LERP_SPEED) * (timeElapsed / 100);

		playerOffset[1] = d[1];
		offset[1] -= (d[1] * Constants.LERP_SPEED) * (timeElapsed / 100);

		if (Math.abs(d[0] + d[1]) < Constants.LERP_THRESHOLD) {
			view = 'scene';
		}
	}

	// "parrallaxx bg"
	gme.scenes.bg.update([offset[0] * Constants.PARALAX_SPEED, offset[1] * Constants.PARALAX_SPEED]);
	gme.scenes.bg.display([0, 0, gme.width, gme.height]);
	
	gme.scenes.current.update(offset);
	gme.scenes.current.display();
	player.update(playerOffset);
	physics.render(offset);

	gme.scenes.fg.update([-offset[0] * Constants.PARALAX_SPEED, -offset[1] * Constants.PARALAX_SPEED]);
	gme.scenes.fg.display([0, 0, gme.width, gme.height]);

	if ((player.mapPosition[1] > gme.lowestLevel + gme.view.height) ||
		(player.mapPosition[1] > 13 * gme.view.height)) {
		gme.reset();		
	}
};

gme.reset = function() {
	for (let i = gme.levels.length - 1; i >= 0; i--) {
		gme.levels[i].remove();
	}

	gme.levels = [];
	gme.currentLevel = [0, 0];
	gme.lowestLevel = 0;
	firstLevel = new Level([0,0], 0, 0, 3, '000000111');
	// firstLevel.addPlatforms('000000111');

	player.reset();
	offset = [gme.view.halfWidth - Constants.PLAYER_START_X, gme.view.halfHeight];
	playerOffset = [0, 0]
	scenery.reset();
	scenery.setupBG();
	scenery.setupFG();

	if (doodoo) {
		doodoo.setTonic('F#4');
		doodoo.setBPM(120);
	}
	gme.anims.sprites.platforms.cancelOverride();
};

function bgMusic() {
	const { Doodoo } = doodooLib; // import lib
	const parts =  [
		[
			['F#5', '2n'],
			[null, '4n'],
			[null, '8n'],
			['C#5', '8n'],
			['D5', '8n'],
			['E5', '8n'],
			['F#5', '8n'],
			['D5', '8n'],
			['E5', '8n'],
			['F#5', '8n'],
			['A5', '8n'],
			['E5', '8n'],
			['F#5', '8n'],
			['G5', '8n'],
			['B5', '8n'],
			[null, '8n'],
			['B5', '4n'],
			['F#5', '4n'],
			['D5', '4n'],
			['B4', '4n'],
			['D4', '2n'],
			[null, '4n'],
			['F#5', '4n'],
			['D5', '4n'],
			['G4', '8n'],
			['A4', '8n'],
			['B4', '4n'],
			['D5', '8n'],
			['D5', '8n'],
			['F#4', '8n'],
			['D4', '8n'],
			['D4', '8n'],
			['D5', '8n'],
			['F#4', '8n'],
			['D4', '2n'],

		]
	];
	doodoo = new Doodoo({
		tonic: 'F#4',
		scale: [-4, -2, 0, 1, 3, 5, 7],
		parts: parts,
		startDuration: '8n',
		samples: './samples/choir/', // -- add samples for sampler
		volume: 0,
	});
	doodoo.setBPM(120);
}

function sfxSetup() {
	const sfx = [];
	const audioFiles = [
		'walk_6.mp3',
		'walk_5.mp3',
		'walk_4.mp3',
		'walk_3.mp3',
		'walk_2.mp3',
		'walk_1.mp3',
		'jump_1.mp3',
	];

	function preloadAudio(url) {
		var audio = new Audio();
		audio.addEventListener('canplaythrough', loadedAudio, false);
		audio.src = url;
		audio.load();
		sfx.push(audio);
	}

	let loaded = 0;
	function loadedAudio() {
		loaded++;
	}

	for (let i = 0; i < audioFiles.length; i++) {
		preloadAudio(`./sfx/${audioFiles[i]}`);
	}

	const loader = setInterval(() => {
		if (loaded === audioFiles.length) {
			clearInterval(loader);
			player.addSFX(sfx);
		}
	}, 1000 / 30);
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
			if (gme.scenes.currentName === 'splash') return startGame(true);
			player.inputKey('jump', true);

			break;
		case 'z':
			if (gme.scenes.currentName === 'splash') return startGame(false);
			// player.inputKey('jump', true);
			break;
		case 'd':
		case 'right':
			player.inputKey('right', true);
			break;
		// case 's':
		// case 'down':
		// 	player.inputKey('down', true);
		// 	break;
		case 't':
			physics.display = !physics.display;
			console.log('show physies', physics.display);
		break;

		case 'm':
				if (!player.sfx) return sfxSetup();
				if (player.hasSFX) player.hasSFX = false;
				else player.hasSFX = true;
		break;

		case 'b':
				if (!doodoo) return bgMusic();
				if (doodoo.isPlaying) doodoo.stop();
				else doodoo.play();
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
