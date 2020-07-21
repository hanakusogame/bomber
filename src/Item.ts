//アイテムクラス
export class Item extends g.FrameSprite {
	constructor(scene: g.Scene, public px:number, public py:number, public num:number) {
		super({
			scene: scene,
			src: scene.assets["item"] as g.ImageAsset,
			width: 60,
			height: 60,
			frames: [0, 1],
			x: px * 38 - 11,
			y: py * 38 - 11,
			frameNumber:num,
			touchable:true
		});
	}
};