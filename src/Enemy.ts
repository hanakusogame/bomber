import { Map, MapType } from './Map';
declare function require(x: string): any;

//敵クラス
export class Enemy extends g.E {
	public px: number = 0;
	public py: number = 0;
	public isMove: boolean = false;//１マス移動中
	public sprite: g.FrameSprite;
	public timeline: any;
	public move = (maps: Map[][]) => { };
	public hit = () => { };
	public roots: MapType[] = [];
	public life: number = 1;
	public isCollision = true;//当たり判定の有無
	public score = 0;

	constructor(scene: g.Scene, num: number) {
		super({
			scene: scene,
			width: 38,
			height: 38
		});

		const tl = require("@akashic-extension/akashic-timeline");
		this.timeline = new tl.Timeline(scene);

		const scores = [300, 500, 400, 1000, 1500, 1200];
		this.score = scores[num];

		let spr: g.FrameSprite;
		const frames = [4 * (num % 3), 4 * (num % 3) + 1];
		if (num < 3) {
			spr = new g.FrameSprite({
				scene: scene,
				src: scene.assets["enemy"] as g.ImageAsset,
				width: 50,
				height: 75,
				frames: frames,
				interval: 300,
				x: -6,
				y: -37
			});
			this.life = 1;
		} else {
			spr = new g.FrameSprite({
				scene: scene,
				src: scene.assets["enemy2"] as g.ImageAsset,
				width: 100,
				height: 100,
				frames: frames,
				interval: 300,
				x: -31,
				y: -62
			});
			this.life = 2;
		}

		if (num % 3 === 0) {
			this.roots = [MapType.ROAD, MapType.WAIT_FIRE];
		} else if (num % 3 === 1) {
			this.roots = [MapType.ROAD];
		} else if (num % 3 === 2) {
			this.roots = [MapType.ROAD, MapType.BLOCK];
		}

		const dx = [1, 0, -1, 0];//４方向
		const dy = [0, 1, 0, -1];

		//移動
		this.move = (maps: Map[][]) => {
			if (!this.isMove) {

				//移動可能な場所のリスト作成
				const arr: { x: number, y: number }[] = [];
				for (let i = 0; i < 4; i++) {
					const x = this.px + dx[i];
					const y = this.py + dy[i];
					if ([MapType.WAIT_FIRE, MapType.BOMB].indexOf(maps[this.py][this.px].num) !== -1) {
						const ar = [MapType.WAIT_FIRE];
						if (ar.indexOf(maps[y][x].num) !== -1) arr.push({ x: x, y: y });
					} else {
						if (this.roots.indexOf(maps[y][x].num) !== -1) arr.push({ x: x, y: y });
					}
				}

				//移動
				if (arr.length !== 0) {
					const p = arr[g.game.random.get(0, arr.length - 1)];
					this.isMove = true;
					const x = this.x;
					const y = this.y;

					this.timeline.create(this).every((a: number, b: number) => {
						if (this.life <= 0) return;
						this.x = x + (p.x * this.width - x) * b;
						this.y = y + (p.y * this.height - y) * b;
						this.modified();
					}, 500).call(() => {
						this.px = p.x;
						this.py = p.y;
						this.isMove = false;
					});
				}

			}
		}

		//爆風に当たった時
		this.hit = () => {
			this.sprite.frames = [4 * (num % 3) + 2];
			this.sprite.frameNumber = 0;
			this.sprite.modified();
			this.life--;
			this.isCollision = false;
			
			if (this.life > 0) {
				scene.setTimeout(() => {
					this.sprite.frames = frames;
					this.sprite.frameNumber = 0;
					this.sprite.modified();
					this.isCollision = true;
				}, 1300);
			} else {
				scene.setTimeout(() => {
					this.destroy();
				}, 1000);
			}
		}

		spr.start();
		this.append(spr);
		this.sprite = spr;
	}
};