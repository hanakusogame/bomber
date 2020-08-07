import { MainScene } from './MainScene';
//プレイヤークラス(右側のステータス表示)
export class Player extends g.E {
	public power: number = 2;
	public powerMax = 5;
	public bomb: number = 2;
	public bombMax = 5;
	public bombType: number = 0;
	public time: number = 3000;

	//初期化
	public init: () => void = () => {
		this.power = 2;
		this.bomb = 2;
		this.setBombType(0);
	};

	//火力アップ
	public addPower:() => void;

	//爆弾数アップ
	public addBomb: () => void;

	//爆弾の種類設定
	public setBombType: (num:number) => void;

	//コンストラクタ
	constructor(scene: MainScene) {
		super({
			scene:scene
		});

		//爆弾の種類表示用
		const sprTypeBase = new g.Sprite({
			scene: scene,
			src: scene.assets["type_base"],
			x: 515,
			y: 65,
		});
		this.append(sprTypeBase);

		const sprType = new g.FrameSprite({
			scene: scene,
			src: scene.assets["bomb"] as g.ImageAsset,
			width: 60,
			height: 60,
			frames: [0,2,4,6],
			frameNumber:0
		});
		sprTypeBase.append(sprType);

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.Monospace,
			size: 20
		});

		const labelType = new g.Label({
			scene: scene,
			font: font,
			fontSize: 20,
			text: "ノーマル爆弾",
			x: 3,
			y:50
		});
		sprTypeBase.append(labelType);

		const labelInfo = new g.Label({
			scene: scene,
			font: font,
			fontSize: 16,
			text: "普通の爆弾",
			x: 3,
			y: 80
		});
		sprTypeBase.append(labelInfo);

		//火力表示用
		const sprPowerBase = new g.Sprite({
			scene: scene,
			src: scene.assets["item_base"],
			x: 515,
			y: 190,
		});
		this.append(sprPowerBase);

		const sprPower = new g.Sprite({
			scene: scene,
			src: scene.assets["item"],
			width: 60,
			height: 60,
			x: 0,
			y: -2,
			srcX: 60
		});
		sprPowerBase.append(sprPower);

		const labelPower = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 60,
			y: 10
		})
		sprPowerBase.append(labelPower);

		const labelPowerMax = new g.Label({
			scene: scene,
			font: font,
			fontSize: 24,
			text: "/5",
			x: 85,
			y: 25
		});
		sprPowerBase.append(labelPowerMax);

		//爆弾数表示用
		const sprBombBase = new g.Sprite({
			scene: scene,
			src: scene.assets["item_base"],
			x: 515,
			y: 252
		});
		this.append(sprBombBase);

		const sprBomb = new g.Sprite({
			scene: scene,
			src: scene.assets["item"],
			width: 60,
			height: 60,
			x: 0,
			y: -2
		});
		sprBombBase.append(sprBomb);

		const labelBomb = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 60,
			y: 10
		});
		sprBombBase.append(labelBomb);

		const labelBombMax = new g.Label({
			scene: scene,
			font: font,
			fontSize: 24,
			text: "/5",
			x: 85,
			y: 25
		});
		sprBombBase.append(labelBombMax);

		const names = ["ノーマル爆弾", "リモコン爆弾", "トゲ爆弾", "ドクロ爆弾"];
		const infos = ["普通の爆弾", "クリックで爆発", "一撃必殺", "火力ランダム"];
		
		this.setBombType = (num: number) => {
			const maxBombs = [5, 4, 3, 5, 8];
			const maxPowers = [5, 4, 3, 5, 5];
			this.bombType = num;
			this.bombMax = maxBombs[num];
			this.powerMax = maxPowers[num];

			sprType.frameNumber = num;
			sprType.modified();

			labelType.text = names[num];
			labelType.invalidate();

			labelInfo.text = infos[num];
			labelInfo.invalidate();

			//種類ごとの上限に補正
			this.power = Math.min(this.power, this.powerMax);
			this.bomb = Math.min(this.bomb, this.bombMax);

			labelPower.text = "" + this.power;
			labelPower.invalidate();

			labelPowerMax.text = "/" + this.powerMax;
			labelPowerMax.invalidate();

			labelBomb.text = "" + this.bomb;
			labelBomb.invalidate();

			labelBombMax.text = "/" + this.bombMax;
			labelBombMax.invalidate();
		}

		this.addPower = () => {
			if (this.power < this.powerMax) {
				this.power++;
				labelPower.text = "" + this.power;
				labelPower.invalidate();
			}
		}

		this.addBomb = () => {
			if (this.bomb < this.bombMax) {
				this.bomb++;
				labelBomb.text = "" + this.bomb;
				labelBomb.invalidate();
			}
		}

	}
}