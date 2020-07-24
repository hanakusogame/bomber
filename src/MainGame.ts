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

		//火力とおける爆弾の数
		const sprPowerBase = new g.Sprite({
			scene: scene,
			src: scene.assets["item_base"],
			x: 515,
			y: 102,
			opacity: 0.7
		});
		this.append(sprPowerBase);

		const sprPower = new g.Sprite({
			scene: scene,
			src: scene.assets["item"],
			width: 60,
			height: 60,
			x: 520,
			y: 100,
			srcX: 60
		});
		this.append(sprPower);

		const labelPower = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 590,
			y: 115
		})
		this.append(labelPower);

		const sprBombBase = new g.Sprite({
			scene: scene,
			src: scene.assets["item_base"],
			x: 515,
			y: 182,
			opacity: 0.7
		});
		this.append(sprBombBase);

		const sprBomb = new g.Sprite({
			scene: scene,
			src: scene.assets["item"],
			width: 60,
			height: 60,
			x: 520,
			y: 180
		});
		this.append(sprBomb);

		const labelBomb = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 590,
			y: 195
		})
		this.append(labelBomb);

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

		//爆風作成
		let fires: g.FrameSprite[] = [];
		for (let i = 0; i < 100; i++) {
			const spr = new g.FrameSprite({
				scene: scene,
				src: scene.assets["fire"] as g.ImageAsset,
				width: mapSize,
				height: mapSize,
				frames: [0, 1, 2, 3]
			});
			spr.hide();
			fires.push(spr);
			mapBase.append(spr);
		}

		//爆弾作成
		const stockBombs: Bomb[] = [];//ストックされている爆弾
		let bombs: Bomb[] = [];//フィールド上に設置されている爆弾
		for (let i = 0; i < 5; i++) {
			const spr = new Bomb({
				scene: scene,
				width: mapSize,
				height: mapSize,
			});
			spr.hide();
			stockBombs.push(spr);
			mapBase.append(spr);
		}

		const player = new Player();//プレイヤー

		//敵作成
		let enemys: Enemy[] = [];

		const dx = [1, 0, -1, 0];//４方向
		const dy = [0, 1, 0, -1];
		let frameCnt = 0;
		//ゲームループ
		mapBase.update.add(() => {
			if (!scene.isStart) return;

			//敵の処理
			enemys = enemys.filter(enemy => {
				if (enemy.destroyed()) return false;

				const cx = enemy.x + (enemy.width / 2);
				const cy = enemy.y + (enemy.height / 2);
				const x = Math.floor(cx / mapSize);
				const y = Math.floor(cy / mapSize);

				//爆風に当たった時
				if (maps[y][x].num === 3 && enemy.isCollision) {
					enemy.hit();

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
					blast(bomb);
					stockBombs.unshift(bomb);

					if (sprPlayer.frameNumber === 0) {
						sprPlayer.frameNumber = 1;
						sprPlayer.modified();
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

		//爆弾設置
		const setBomb = (x: number, y: number, bomb: Bomb) => {

			const arr: Fire[] = [];
			for (let i = 0; i < 4; i++) {
				let x = bomb.px;
				let y = bomb.py;
				for (let j = 0; j < bomb.power; j++) {
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
			bomb.arr = arr;

			scene.playSound("se_move")
		}

		//アイテム発生
		const setItem = (x: number, y: number) => {
			//アイテム作成
			const num = scene.random.get(0, 1);
			const item = new Item(scene, x, y, num);
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
				if (item.frameNumber === 0) {
					if (player.bombMax < 5) {
						player.bombMax++;
						labelBomb.text = "" + player.bombMax;
						labelBomb.invalidate();
					}
				} else {
					if (player.power < 5) {
						player.power++;
						labelPower.text = "" + player.power;
						labelPower.invalidate();
					}
				}
				timer.destroy();
				item.touchable = false;
				timeline.create(item).scaleTo(0, 1, 100)
					.scaleTo(1, 1, 100).wait(600).call(() => {
						item.destroy();
					});
			});
		}

		let dropCnt = 0;

		//爆発
		const blast = (bomb: Bomb) => {
			bomb.hide()

			scene.playSound("se_bomb");

			bomb.arr.forEach(p => {
				const map = maps[p.y][p.x];
				if (map.num === MapType.BOMB) return;
				map.setNum(MapType.ROAD);
			});

			const arr: Fire[] = [];
			arr.push({ x: bomb.px, y: bomb.py, time: 0, angle: 0, num: 0 });

			for (let i = 0; i < 4; i++) {
				let x = bomb.px;
				let y = bomb.py;
				for (let j = 0; j < bomb.power; j++) {
					x += dx[i];
					y += dy[i];

					const map = maps[y][x];
					if (map.num === MapType.WALL) break;

					let num = 1;
					if (j + 1 === bomb.power) num = 2
					if (map.num === MapType.BLOCK) num = 3;

					arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: num });

					if (map.num === MapType.BOMB || map.num === MapType.BLOCK) {
						break;
					} else {
						map.setNum(MapType.WAIT_FIRE);
					}
				}
			}

			//爆風表示
			arr.forEach(p => {
				const map = maps[p.y][p.x];

				scene.setTimeout(() => {
					if (map.num === MapType.BOMB) {
						map.bomb.cnt = 0;
						map.bomb = null;
					}

					if (map.num === MapType.BLOCK) {
						if (scene.random.get(0, 7) === 0 || dropCnt % 11 === 5) {
							setItem(p.x, p.y);
						}
						dropCnt++;
					}

					map.setNum(MapType.FIRE);

					const fire = fires.pop();
					fire.moveTo(map.x, map.y);
					fire.frameNumber = p.num;
					fire.angle = p.angle;
					fire.modified();
					fire.show();

					map.fires.unshift(fire);
				}, p.time * ((10 - bomb.power) * 10));
			});

			//爆風を消す
			timeline.create().wait(1000).call(() => {
				arr.forEach(p => {
					const map = maps[p.y][p.x];
					const fire = map.fires.pop();
					fire.hide();
					fires.unshift(fire);
					if (map.fires.length === 0) {
						map.setNum(MapType.ROAD);
					}
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
			if (!(map.num === MapType.ROAD || map.num === MapType.WAIT_FIRE) || bombs.length >= player.bombMax) return

			const bomb = stockBombs.pop();
			bomb.show();
			bomb.y = y * mapSize;
			bomb.x = 450;
			bomb.modified();

			bomb.px = x;
			bomb.py = y;
			bomb.cnt = player.time / 30;
			bomb.power = player.power;
			bombs.push(bomb);

			map.setNum(MapType.BOMB);
			map.bomb = bomb;

			//投げるアニメーション
			sprPlayer.frameNumber = 2;
			sprPlayer.modified();
			scene.setTimeout(() => {
				if (bombs.length === player.bombMax) {
					sprPlayer.frameNumber = 0;
				} else {
					sprPlayer.frameNumber = 1;
				}
				sprPlayer.modified();
			}, 300);

			const shadow = new g.Sprite({
				scene: scene,
				src: scene.assets["bomb"],
				x: bomb.x,
				y: bomb.y,
				srcX: 100
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
				setBomb(x, y, bomb);
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
			let x = 0;
			let y = 0;
			while (true) {
				x = scene.random.get(1, mapX - 1);
				y = scene.random.get(1, mapY - 1);
				if (maps[y][x].num === MapType.ROAD) break;
			}
			maps[y][x].setNum(MapType.BLOCK);
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

			player.bombMax = 2;
			labelBomb.text = "" + player.bombMax;
			labelBomb.invalidate();

			player.power = 2;
			labelPower.text = "" + player.power;
			labelPower.invalidate();

		};

		//リセット
		this.reset = () => {
			start();
		};

	}
}
