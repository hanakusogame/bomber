import { MainScene } from './MainScene';
import { Player } from './Player';
import { Fire } from "./MainGame";
import { MapType, Map } from './Map';

//爆弾クラス
export class Bomb extends g.E {
	static dropCnt = 0;

	public px: number = 0;
	public py: number = 0;
	public power: number = 0;//火力
	public cnt: number = 0;
	public arr: Fire[] = [];//爆風
	public type: number = 0;//種類
	public init: (px: number, py: number, player: Player) => void;//種類の変更
	public setArea: (maps: Map[][]) => void;
	public blast: (maps: Map[][]) => { x: number, y: number, num: number }[];

	constructor(pram: g.EParameterObject, mapBase: g.E) {
		super(pram);

		const scene = pram.scene as MainScene;

		const spr = new g.FrameSprite({
			scene: pram.scene,
			src: pram.scene.assets["bomb"] as g.ImageAsset,
			width: 60,
			height: 60,
			frames: [0, 1],
			interval: 500,
			x: -11,
			y: -22
		});
		spr.start();
		this.append(spr);

		//爆風作成
		let fires: g.FrameSprite[] = [];
		for (let i = 0; i < 21; i++) {
			const spr = new g.FrameSprite({
				scene: scene,
				src: scene.assets["fire"] as g.ImageAsset,
				width: 38,
				height: 38,
				frames: [0, 1, 2, 3]
			});
			spr.hide();
			fires.push(spr);
			mapBase.append(spr);
		}

		//初期化
		this.init = (px, py, player) => {
			this.px = px;
			this.py = py;
			this.type = player.bombType;

			if (this.type !== 3) {
				this.power = player.power;
			} else {
				this.power = scene.random.get(1, 5);
			}

			if (this.type !== 1) {
				this.cnt = player.time / 30;
			} else {
				this.cnt = 1000;//適当
			}

			spr.frames = [this.type * 2, this.type * 2 + 1];
			spr.frameNumber = 0;
			spr.modified();

			this.touchable = (this.type === 1);
		}

		this.pointDown.add(() => {
			this.cnt = 0;
		});

		const dx = [1, 0, -1, 0];//４方向
		const dy = [0, 1, 0, -1];

		//爆破の範囲設定
		this.setArea = (maps: Map[][]) => {
			const arr: Fire[] = [];
			for (let i = 0; i < 4; i++) {
				let x = this.px;
				let y = this.py;
				for (let j = 0; j < this.power; j++) {
					x += dx[i];
					y += dy[i];

					const map = maps[y][x];
					if (map.num === MapType.BOMB || map.num === MapType.BLOCK || map.num === MapType.WALL) {
						break;
					}
					map.setNum(MapType.WAIT_FIRE);
					arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: 0 });
				}
			}
			this.arr = arr;
		}

		//爆破
		this.blast = (maps: Map[][]) => {
			this.hide()

			scene.playSound("se_bomb");

			this.arr.forEach(p => {
				const map = maps[p.y][p.x];
				if (map.num === MapType.BOMB) return;
				map.setNum(MapType.ROAD);
			});

			const arr: Fire[] = [];
			arr.push({ x: this.px, y: this.py, time: 0, angle: 0, num: 0 });

			for (let i = 0; i < 4; i++) {
				let x = this.px;
				let y = this.py;
				for (let j = 0; j < this.power; j++) {
					x += dx[i];
					y += dy[i];

					const map = maps[y][x];
					if (map.num === MapType.WALL) break;

					let num = 1;
					if (j + 1 === this.power) num = 2
					if (map.num === MapType.BLOCK) num = 3;

					arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: num });

					if (map.num === MapType.BOMB || map.num === MapType.BLOCK) {
						break;
					} else {
						map.setNum(MapType.WAIT_FIRE);
					}
				}
			}

			const itemArr: { x: number, y: number, num: number }[] = [];
			let fireCnt = 0;
			//爆風表示
			arr.forEach(p => {
				const map = maps[p.y][p.x];

				if (map.num === MapType.BLOCK) {
					if (scene.random.get(0, 8) === 0 || Bomb.dropCnt % 11 === 4) {
						itemArr.push({ x: p.x, y: p.y, num: 0 });
					} else if (Bomb.dropCnt % 6 === 1) {
						itemArr.push({ x: p.x, y: p.y, num: 1 });
					}
					Bomb.dropCnt++;
				}

				scene.setTimeout(() => {
					if (map.num === MapType.BOMB) {
						map.bomb.cnt = 0;
						map.bomb = null;
					}

					map.setNum(MapType.FIRE);

					const fire = fires[fireCnt % fires.length];
					fire.moveTo(map.x, map.y);
					fire.frameNumber = p.num;
					fire.angle = p.angle;
					fire.modified();
					fire.show();
					fireCnt++;

				}, p.time * ((10 - this.power) * 10));

			});

			//爆風を消す
			scene.setTimeout(() => {
				arr.forEach(p => {
					const map = maps[p.y][p.x];
					map.setNum(MapType.ROAD);
				});

				fires.forEach(e => {
					e.hide();
				})
			}, 1000);

			return itemArr;
		}

	}
}