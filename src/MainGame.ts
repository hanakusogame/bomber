import { Item } from './Item';
import { Enemy } from './Enemy';
import { Player } from './Player';
import { Bomb } from './Bomb';
import { Map, MapType } from './Map';
import { MainScene } from "./MainScene";
import { SceneComment } from "@atsumaru/api-types";
declare function require(x: string): any;

export type Fire = { x: number, y: number, time: number, angle: number, num: number };

//メインのゲーム画面
export class MainGame extends g.E {
	public reset: () => void;
	public finish: () => void;
	public setMode: (num: number) => void;

	constructor(scene: MainScene) {
		const tl = require("@akashic-extension/akashic-timeline");
		const timeline = new tl.Timeline(scene);
		super({ scene: scene, x: 0, y: 0, width: 640, height: 360 });

		const bg = new g.FilledRect({
			scene: scene,
			width: 640,
			height: 360,
			cssColor: "#303030",
			opacity: 0.5
		});
		this.append(bg);

		//マップ作成
		const mapX = 11;
		const mapY = 11;
		const mapSize = 38;

		const mapBase = new g.E({
			scene: scene,
			x: 60 - mapSize,
			y: 10 - mapSize,
			width: mapSize * mapX,
			height: mapSize * mapY,
			touchable: true
		});
		this.append(mapBase);

		const maps: Map[][] = [];
		for (let y = 0; y < mapY; y++) {
			maps[y] = [];
			for (let x = 0; x < mapX; x++) {
				const num = (x === 0 || x === mapX - 1 || y === 0 || y === mapY - 1 ||
					(x % 2 === 0 && y % 2 === 0)) ? 1 : 0
				const spr = new Map(scene, x, y, num);
				maps[y][x] = spr;
				mapBase.append(spr);
			}
		}

		//みそボン作成
		const sprPlayer = new g.FrameSprite({
			scene: scene,
			src: scene.assets["player"] as g.ImageAsset,
			width: 60,
			height: 120,
			frames: [0, 1, 2],
			x: 430,
			y: 100
		});
		mapBase.append(sprPlayer);

		//持ってる爆弾表示用
		const sprB = new g.FrameSprite({
			scene: scene,
			src: scene.assets["bomb"] as g.ImageAsset,
			width: 60,
			height: 60,
			frames: [0, 1],
			x: 0,
			y: -10,
			interval:300
		});
		sprB.start();
		sprPlayer.append(sprB);

		//爆弾作成
		const stockBombs: Bomb[] = [];//ストックされている爆弾
		let bombs: Bomb[] = [];//フィールド上に設置されている爆弾
		for (let i = 0; i < 8; i++) {
			const spr = new Bomb({
				scene: scene,
				width: mapSize,
				height: mapSize
			}, mapBase);
			spr.hide();
			stockBombs.push(spr);
			mapBase.append(spr);
		}

		//プレイヤー
		const player = new Player(scene);
		this.append(player);

		//敵作成
		let enemys: Enemy[] = [];

		const dx = [1, 0, -1, 0];//４方向
		const dy = [0, 1, 0, -1];
		let frameCnt = 0;
		
		//ゲームループ
		mapBase.update.add(() => {
			//敵の処理
			enemys = enemys.filter(enemy => {
				if (enemy.destroyed()) return false;

				const cx = enemy.x + (enemy.width / 2);
				const cy = enemy.y + (enemy.height / 2);
				const x = Math.floor(cx / mapSize);
				const y = Math.floor(cy / mapSize);

				//爆風に当たった時
				if (maps[y][x].num === 3 && enemy.isCollision) {
					enemy.hit((player.bombType !== 2) ? 1 : 2);

					scene.playSound("se_hit");

					if (enemy.life <= 0) {
						scene.addScore(enemy.score);
					}

					//エフェクト表示
					const effect = new g.FrameSprite({
						scene: scene,
						src: scene.assets["effect"] as g.ImageAsset,
						frames: [0, 1, 2],
						width: 120,
						height: 120,
						interval: 100,
						x: enemy.x - (120 - enemy.width) / 2,
						y: enemy.y - (120 - enemy.height) / 2
					});
					mapBase.append(effect);
					effect.start();
					scene.setTimeout(() => {
						effect.destroy();
					}, 500);
				}

				if (enemy.isMove) return true;

				enemy.move(maps);//移動

				return true;
			});

			//爆発
			bombs = bombs.filter(bomb => {
				if (bomb.cnt <= 0) {
					bomb.blast(maps).forEach(p => {
						setItem(p.x, p.y, p.num);
					});
					stockBombs.unshift(bomb);

					if (sprPlayer.frameNumber === 0) {
						sprPlayer.frameNumber = 1;
						sprPlayer.modified();
						sprB.show();
					}

					return false;
				}
				bomb.cnt--;
				return true;
			});

			//敵の発生
			if (frameCnt % 60 === 0 && enemys.length < 7) {
				setEnemy();
			}

			//ブロック発生
			if (frameCnt % 240 === 0) {
				setBlock();
			}

			frameCnt++;
		});

		//アイテム発生
		const setItem = (x: number, y: number, num:number) => {
			//アイテム作成
			const type = scene.random.get(0, 1);
			let arr = [0, 1];
			if (type === 1) {
				while (true) {
					const num = scene.random.get(0, 3);
					if (num !== player.bombType) {
						arr = [num + 2];
						break;
					}
				}
			} 

			const item = new Item(scene, x, y, num, arr);
			mapBase.append(item);

			//アイテム自然消滅
			const timer = scene.setTimeout(() => {
				item.destroy();
			}, 5000);

			//アイテム取得
			item.pointDown.add(() => {
				scene.playSound("se_item");
				scene.addScore(30);
				item.stop();

				//console.log("x=" + x + "y=" + y + "num=" + num);

				if (type === 0) {
					if (item.frameNumber === 0) {
						player.addBomb();
					} else {
						player.addPower();
					}
				} else {
					const num = item.frames[0] - 2;
					player.setBombType(num);

					sprB.frames = [num * 2, num * 2 + 1];
					sprB.frameNumber = 0;
					sprB.modified();
				}

				timer.destroy();
				item.touchable = false;
				timeline.create(item).scaleTo(0, 1, 100)
					.scaleTo(1, 1, 100).wait(600).call(() => {
						item.destroy();
					});
			});

		}

		mapBase.pointDown.add(e => {
			if (!scene.isStart) return;
			//爆弾を移動
			const x = Math.floor(e.point.x / mapSize);
			const y = Math.floor(e.point.y / mapSize);

			sprPlayer.y = y * mapSize - 50;
			sprPlayer.modified();

			const map = maps[y][x];
			if (!(map.num === MapType.ROAD || map.num === MapType.WAIT_FIRE) || bombs.length >= player.bomb) return

			const bomb = stockBombs.pop();
			bomb.show();
			bomb.y = y * mapSize;
			bomb.x = 450;
			bomb.modified();

			bomb.init(x, y, player);
			bombs.push(bomb);

			map.setNum(MapType.WAIT_BOMB);
			
			//投げるアニメーション
			sprPlayer.frameNumber = 2;
			sprPlayer.modified();
			sprB.hide();
			scene.setTimeout(() => {
				if (bombs.length === player.bomb) {
					sprPlayer.frameNumber = 0;
				} else {
					sprB.show();
					sprPlayer.frameNumber = 1;
				}
				sprPlayer.modified();
			}, 300);

			const shadow = new g.Sprite({
				scene: scene,
				src: scene.assets["shadow"],
				x: bomb.x,
				y: bomb.y
			});
			mapBase.append(shadow);

			mapBase.append(bomb);//重ね順を変える

			timeline.create(shadow).moveTo(map.x - 6, map.y, 500).call(() => {
				shadow.destroy();
			});

			timeline.create(bomb).every((a: number, b: number) => {
				//放物線を描いて移動
				bomb.x = (x * mapSize) + (450 - (x * mapSize)) * (1 - b);
				bomb.y = (y * mapSize) + ((Math.pow((b - 0.5) * 2, 2) - 1) * 80);
				bomb.modified();
			}, 500).call(() => {
				//爆弾設置
				bomb.setArea(maps);

				if (map.num === MapType.FIRE) {
					bomb.cnt = 0;
				}

				map.setNum(MapType.BOMB);
				map.bomb = bomb;

				scene.playSound("se_move")
			});

		});

		//敵配置
		const setEnemy = () => {
			let min = 0;
			let max = 0;
			if (frameCnt / 30 < 30) {
				max = 2
			} else if (frameCnt / 30 < 60) {
				max = 5
			} else {
				max = 5
				min = 3
			}
			const num = scene.random.get(min, max);
			const enemy = new Enemy(scene, num);
			enemys.push(enemy);

			let x = 0;
			let y = 0;
			while (true) {
				x = scene.random.get(1, mapX - 1);
				y = scene.random.get(1, mapY - 1);
				if (maps[y][x].num === MapType.ROAD) break;
			}
			mapBase.append(enemy);
			enemy.px = x;
			enemy.py = y;
			enemy.moveTo(x * mapSize, y * mapSize);
			enemy.modified();
			enemy.isCollision = false;
			enemy.scaleX = 0;
			enemy.scaleY = 2.5;
			timeline.create(enemy).scaleTo(1, 1, 300).call(() => {
				enemy.isCollision = true;
			})
		}

		//ブロック配置
		const setBlock = () => {
			for (let i = 0; i < 50; i++) {
				const x = scene.random.get(1, mapX - 1);
				const y = scene.random.get(1, mapY - 1);
				if (maps[y][x].num === MapType.ROAD) {
					maps[y][x].setNum(MapType.BLOCK);
					break;
				}
			}
		}

		//終了
		this.finish = () => {

		};

		//スタート
		const start = () => {
			frameCnt = 0;

			for (let y = 0; y < mapY; y++) {
				for (let x = 0; x < mapX; x++) {
					if (maps[y][x].num !== MapType.WALL) {
						maps[y][x].setNum(MapType.ROAD)
					}
				}
			}

			bombs.forEach(b => {
				b.hide();
				stockBombs.unshift(b);
			});
			bombs.length = 0;

			//ブロック配置
			for (let i = 0; i < 20; i++) {
				setBlock();
			}

			enemys.forEach(e => {
				if (!e.destroyed()) e.destroy();
			});
			enemys.length = 0;

			//敵配置
			for (let i = 0; i < 5; i++) {
				setEnemy();
			}

			player.init();

			sprPlayer.frameNumber = 1;
			sprPlayer.modified();

			sprB.frames = [0, 1];
			sprB.frameNumber = 0;
			sprB.modified();
		};

		//リセット
		this.reset = () => {
			start();
		};

	}
}