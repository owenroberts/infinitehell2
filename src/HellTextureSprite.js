/*
	hell texture
*/

class HellTextureSprite extends HellSprite {
	constructor(params, debug) {
		super(params, debug);
		this.center = false;
		this.stateName = `frame-${params.stateIndex}`;
		this.animation.createNewState(`frame-${params.stateIndex}`, params.stateIndex, params.stateIndex);
	}

	display(view) {
		this.animation.state = this.stateName;
		super.display(view);
	}
}