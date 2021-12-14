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
	scenes: ['game', 'splash', 'loading', 'scenery'],
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

const { Engine, Bodies, Body, Composite, Runner, Events } = Matter;
let player;
let firstLevel;
gme.levels = [];
let scenery = new Scenery();
let camera = new Camera();
let physics = new Physics();
let doodoo;

gme.start = function() {
	document.getElementById('splash').remove();

	player = new Player(Constants.PLAYER_START_X, Constants.PLAYER_START_Y, gme.anims.sprites.player);
	gme.scenes.game.addSprite(player);

	let instructions = new HellSprite(600, -130, gme.anims.sprites.instructions);
	gme.scenes.game.addToDisplay(instructions);

	let splash = new HellSprite(350, -200, gme.anims.sprites.splash);
	gme.scenes.splash.addToDisplay(splash);

	camera.focus = [Constants.CAMERA_START_X, gme.view.halfHeight];

	gme.levels = [];
	gme.currentLevel = [0, 0];
	gme.lowestLevel = 0;
	firstLevel = new Level([0,0], 0, 0, 4, '000000111');
	
	scenery.setup();
	gme.scenes.current = 'splash';
};

// update by matter ...

function startGame(withSound) {
	if (withSound) {
		bgMusic();
		sfxSetup();
	}
	gme.scenes.current = 'game';
	Runner.run(physics.engine); // start physics
}

gme.draw = function() {


	for (let i = 0; i < gme.levels.length; i++) {
		gme.levels[i].updateTiles();
	}

	gme.ctx.save();
	gme.ctx.clearRect(0, 0, gme.view.width, gme.view.height);

	// "parrallaxx bg"
	gme.ctx.save();
	gme.ctx.translate(player.x / 50, player.y / 50);
	gme.scenes.scenery.display();
	gme.ctx.restore();
	
	camera.update();
	physics.render();
	gme.scenes.current.display(camera.view);
	gme.ctx.restore();

	if (player.y > gme.lowestLevel + gme.view.height) {
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

	camera.center = [0, 0];
	camera.focus = [Constants.CAMERA_START_X, gme.view.halfHeight];
	camera.state = 'view';

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
		samples: '../samples/choir/' // -- add samples for sampler
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
		case 't':
			physics.display = !physics.display;
			console.log('show physies', physics.display);
		break;

		case 'm':
				console.log('toggle m');
				if (!player.sfx) sfxSetup();
				if (player.hasSFX) player.hasSFX = false;
				else player.hasSFX = true;
		break;

		case 'b':
				console.log('toggle b');
				if (!doodoo) return bgMusic();
				console.log(doodoo.isPlaying);
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
