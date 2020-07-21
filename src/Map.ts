import { Bomb } from "./Bomb";

//種類
export const enum MapType { ROAD, WALL, BOMB, FIRE, BLOCK, WAIT_FIRE };

//マップクラス
export class Map extends g.FrameSprite {
	public colors: string[] = ["green", "#404040", "blue", "green", "orange", "#00A000"];
	public bomb: Bomb= null;
	public fires: g.FrameSprite[] = [];;

	constructor(scene: g.Scene, x: number, y: number, public num: MapType) {
		super({
			scene: scene,
			src: scene.assets["map"] as g.ImageAsset,
			x: x * 38,
			y: y * 38,
			width: 38,
			height: 38,
			frames: [0, 1, 4, 0, 2, 3],
			frameNumber: num
		});
	}

	public setNum = (num: MapType) => {
		this.num = num;
		this.frameNumber = num;
		this.modified();
	}
};