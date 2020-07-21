import { Fire } from "./MainGame";

//爆弾クラス
export class Bomb extends g.E {
	public px: number = 0;
	public py: number = 0;
	public power: number = 0;
	public cnt: number = 0;
	public arr: Fire[] = [];

	constructor(pram: g.EParameterObject) {
		super(pram);

		const spr = new g.FrameSprite({
			scene: pram.scene,
			src: pram.scene.assets["bomb"] as g.ImageAsset,
			width: 50,
			height: 50,
			frames: [0, 1],
			interval: 500,
			x: -6,
			y: -12
		});
		spr.start();
		this.append(spr);
	}
}