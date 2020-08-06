import { MainScene } from './MainScene';
//プレイヤークラス(右側のステータス表示)
export class Player extends g.E {
	public power: number = 2;
	public powerMax = 5;
	public bomb: number = 2;
	public bombMax = 5;
	public bombType: number = 0;
	public time: number = 3000;

	private labelBomb: g.Label;
	private labelPower: g.Label;

	//初期化
	public init: () => void = () => {
		this.power = 2;
		this.bomb = 2;
		this.setBombType(0);
	};

	//火力アップ
	public addPower = () => {
		if (this.power < this.powerMax) {
			this.power++;
			this.labelPower.text = "" + this.power;
			this.labelPower.invalidate();
		}
	}

	//爆弾数アップ
	public addBomb = () => {
		if (this.bomb < this.bombMax) {
			this.bomb++;
			this.labelBomb.text = "" + this.bomb;
			this.labelBomb.invalidate();
		}
	}

	//爆弾の種類設定
	public setBombType = (num: number) => {
		const maxBombs = [5, 4, 3, 5, 8];
		const maxPowers = [5, 4, 3, 5, 5];
		this.bombType = num;
		this.bombMax = maxBombs[num];
		this.powerMax = maxPowers[num];

		//種類ごとの上限に補正
		this.power = Math.min(this.power, this.powerMax);
		this.bomb = Math.min(this.bomb, this.bombMax);

		this.labelPower.text = "" + this.power;
		this.labelPower.invalidate();

		this.labelBomb.text = "" + this.bomb;
		this.labelBomb.invalidate();
	}

	//コンストラクタ
	constructor(scene: MainScene) {
		super({
			scene:scene
		});

		//火力表示用
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

		this.labelPower = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 590,
			y: 115
		})
		this.append(this.labelPower);

		//爆弾数表示用
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

		this.labelBomb = new g.Label({
			scene: scene,
			font: scene.numFont,
			fontSize: 32,
			text: "2",
			x: 590,
			y: 195
		});
		this.append(this.labelBomb);
	}
}