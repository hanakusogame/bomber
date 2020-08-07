"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//プレイヤークラス(右側のステータス表示)
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    //コンストラクタ
    function Player(scene) {
        var _this = _super.call(this, {
            scene: scene
        }) || this;
        _this.power = 2;
        _this.powerMax = 5;
        _this.bomb = 2;
        _this.bombMax = 5;
        _this.bombType = 0;
        _this.time = 3000;
        //初期化
        _this.init = function () {
            _this.power = 2;
            _this.bomb = 2;
            _this.setBombType(0);
        };
        //爆弾の種類表示用
        var sprTypeBase = new g.Sprite({
            scene: scene,
            src: scene.assets["type_base"],
            x: 515,
            y: 65,
        });
        _this.append(sprTypeBase);
        var sprType = new g.FrameSprite({
            scene: scene,
            src: scene.assets["bomb"],
            width: 60,
            height: 60,
            frames: [0, 2, 4, 6],
            frameNumber: 0
        });
        sprTypeBase.append(sprType);
        var font = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.Monospace,
            size: 20
        });
        var labelType = new g.Label({
            scene: scene,
            font: font,
            fontSize: 20,
            text: "ノーマル爆弾",
            x: 3,
            y: 50
        });
        sprTypeBase.append(labelType);
        var labelInfo = new g.Label({
            scene: scene,
            font: font,
            fontSize: 16,
            text: "普通の爆弾",
            x: 3,
            y: 80
        });
        sprTypeBase.append(labelInfo);
        //火力表示用
        var sprPowerBase = new g.Sprite({
            scene: scene,
            src: scene.assets["item_base"],
            x: 515,
            y: 190,
        });
        _this.append(sprPowerBase);
        var sprPower = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 0,
            y: -2,
            srcX: 60
        });
        sprPowerBase.append(sprPower);
        var labelPower = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 60,
            y: 10
        });
        sprPowerBase.append(labelPower);
        var labelPowerMax = new g.Label({
            scene: scene,
            font: font,
            fontSize: 24,
            text: "/5",
            x: 85,
            y: 25
        });
        sprPowerBase.append(labelPowerMax);
        //爆弾数表示用
        var sprBombBase = new g.Sprite({
            scene: scene,
            src: scene.assets["item_base"],
            x: 515,
            y: 252
        });
        _this.append(sprBombBase);
        var sprBomb = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 0,
            y: -2
        });
        sprBombBase.append(sprBomb);
        var labelBomb = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 60,
            y: 10
        });
        sprBombBase.append(labelBomb);
        var labelBombMax = new g.Label({
            scene: scene,
            font: font,
            fontSize: 24,
            text: "/5",
            x: 85,
            y: 25
        });
        sprBombBase.append(labelBombMax);
        var names = ["ノーマル爆弾", "リモコン爆弾", "トゲ爆弾", "ドクロ爆弾"];
        var infos = ["普通の爆弾", "クリックで爆発", "一撃必殺", "火力ランダム"];
        _this.setBombType = function (num) {
            var maxBombs = [5, 4, 3, 5, 8];
            var maxPowers = [5, 4, 3, 5, 5];
            _this.bombType = num;
            _this.bombMax = maxBombs[num];
            _this.powerMax = maxPowers[num];
            sprType.frameNumber = num;
            sprType.modified();
            labelType.text = names[num];
            labelType.invalidate();
            labelInfo.text = infos[num];
            labelInfo.invalidate();
            //種類ごとの上限に補正
            _this.power = Math.min(_this.power, _this.powerMax);
            _this.bomb = Math.min(_this.bomb, _this.bombMax);
            labelPower.text = "" + _this.power;
            labelPower.invalidate();
            labelPowerMax.text = "/" + _this.powerMax;
            labelPowerMax.invalidate();
            labelBomb.text = "" + _this.bomb;
            labelBomb.invalidate();
            labelBombMax.text = "/" + _this.bombMax;
            labelBombMax.invalidate();
        };
        _this.addPower = function () {
            if (_this.power < _this.powerMax) {
                _this.power++;
                labelPower.text = "" + _this.power;
                labelPower.invalidate();
            }
        };
        _this.addBomb = function () {
            if (_this.bomb < _this.bombMax) {
                _this.bomb++;
                labelBomb.text = "" + _this.bomb;
                labelBomb.invalidate();
            }
        };
        return _this;
    }
    return Player;
}(g.E));
exports.Player = Player;
