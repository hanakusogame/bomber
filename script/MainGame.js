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
var Item_1 = require("./Item");
var Enemy_1 = require("./Enemy");
var Player_1 = require("./Player");
var Bomb_1 = require("./Bomb");
var Map_1 = require("./Map");
//メインのゲーム画面
var MainGame = /** @class */ (function (_super) {
    __extends(MainGame, _super);
    function MainGame(scene) {
        var _this = this;
        var tl = require("@akashic-extension/akashic-timeline");
        var timeline = new tl.Timeline(scene);
        _this = _super.call(this, { scene: scene, x: 0, y: 0, width: 640, height: 360 }) || this;
        var bg = new g.FilledRect({
            scene: scene,
            width: 640,
            height: 360,
            cssColor: "#303030",
            opacity: 0.5
        });
        _this.append(bg);
        //マップ作成
        var mapX = 11;
        var mapY = 11;
        var mapSize = 38;
        var mapBase = new g.E({
            scene: scene,
            x: 60 - mapSize,
            y: 10 - mapSize,
            width: mapSize * mapX,
            height: mapSize * mapY,
            touchable: true
        });
        _this.append(mapBase);
        var maps = [];
        for (var y = 0; y < mapY; y++) {
            maps[y] = [];
            for (var x = 0; x < mapX; x++) {
                var num = (x === 0 || x === mapX - 1 || y === 0 || y === mapY - 1 ||
                    (x % 2 === 0 && y % 2 === 0)) ? 1 : 0;
                var spr = new Map_1.Map(scene, x, y, num);
                maps[y][x] = spr;
                mapBase.append(spr);
            }
        }
        //みそボン作成
        var sprPlayer = new g.FrameSprite({
            scene: scene,
            src: scene.assets["player"],
            width: 60,
            height: 120,
            frames: [0, 1, 2],
            x: 430,
            y: 100
        });
        mapBase.append(sprPlayer);
        //持ってる爆弾表示用
        var sprB = new g.FrameSprite({
            scene: scene,
            src: scene.assets["bomb"],
            width: 60,
            height: 60,
            frames: [0, 1],
            x: 0,
            y: -10,
            interval: 300
        });
        sprB.start();
        sprPlayer.append(sprB);
        //爆弾作成
        var stockBombs = []; //ストックされている爆弾
        var bombs = []; //フィールド上に設置されている爆弾
        for (var i = 0; i < 8; i++) {
            var spr = new Bomb_1.Bomb({
                scene: scene,
                width: mapSize,
                height: mapSize
            }, mapBase);
            spr.hide();
            stockBombs.push(spr);
            mapBase.append(spr);
        }
        //プレイヤー
        var player = new Player_1.Player(scene);
        _this.append(player);
        //敵作成
        var enemys = [];
        var dx = [1, 0, -1, 0]; //４方向
        var dy = [0, 1, 0, -1];
        var frameCnt = 0;
        //ゲームループ
        mapBase.update.add(function () {
            //敵の処理
            enemys = enemys.filter(function (enemy) {
                if (enemy.destroyed())
                    return false;
                var cx = enemy.x + (enemy.width / 2);
                var cy = enemy.y + (enemy.height / 2);
                var x = Math.floor(cx / mapSize);
                var y = Math.floor(cy / mapSize);
                //爆風に当たった時
                if (maps[y][x].num === 3 && enemy.isCollision) {
                    enemy.hit((player.bombType !== 2) ? 1 : 2);
                    scene.playSound("se_hit");
                    if (enemy.life <= 0) {
                        scene.addScore(enemy.score);
                    }
                    //エフェクト表示
                    var effect_1 = new g.FrameSprite({
                        scene: scene,
                        src: scene.assets["effect"],
                        frames: [0, 1, 2],
                        width: 120,
                        height: 120,
                        interval: 100,
                        x: enemy.x - (120 - enemy.width) / 2,
                        y: enemy.y - (120 - enemy.height) / 2
                    });
                    mapBase.append(effect_1);
                    effect_1.start();
                    scene.setTimeout(function () {
                        effect_1.destroy();
                    }, 500);
                }
                if (enemy.isMove)
                    return true;
                enemy.move(maps); //移動
                return true;
            });
            //爆発
            bombs = bombs.filter(function (bomb) {
                if (bomb.cnt <= 0) {
                    bomb.blast(maps).forEach(function (p) {
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
        var setItem = function (x, y, num) {
            //アイテム作成
            var type = scene.random.get(0, 1);
            var arr = [0, 1];
            if (type === 1) {
                while (true) {
                    var num_1 = scene.random.get(0, 3);
                    if (num_1 !== player.bombType) {
                        arr = [num_1 + 2];
                        break;
                    }
                }
            }
            var item = new Item_1.Item(scene, x, y, num, arr);
            mapBase.append(item);
            //アイテム自然消滅
            var timer = scene.setTimeout(function () {
                item.destroy();
            }, 5000);
            //アイテム取得
            item.pointDown.add(function () {
                scene.playSound("se_item");
                scene.addScore(30);
                item.stop();
                //console.log("x=" + x + "y=" + y + "num=" + num);
                if (type === 0) {
                    if (item.frameNumber === 0) {
                        player.addBomb();
                    }
                    else {
                        player.addPower();
                    }
                }
                else {
                    var num_2 = item.frames[0] - 2;
                    player.setBombType(num_2);
                    sprB.frames = [num_2 * 2, num_2 * 2 + 1];
                    sprB.frameNumber = 0;
                    sprB.modified();
                }
                timer.destroy();
                item.touchable = false;
                timeline.create(item).scaleTo(0, 1, 100)
                    .scaleTo(1, 1, 100).wait(600).call(function () {
                    item.destroy();
                });
            });
        };
        mapBase.pointDown.add(function (e) {
            if (!scene.isStart)
                return;
            //爆弾を移動
            var x = Math.floor(e.point.x / mapSize);
            var y = Math.floor(e.point.y / mapSize);
            sprPlayer.y = y * mapSize - 50;
            sprPlayer.modified();
            var map = maps[y][x];
            if (!(map.num === 0 /* ROAD */ || map.num === 5 /* WAIT_FIRE */) || bombs.length >= player.bomb)
                return;
            var bomb = stockBombs.pop();
            bomb.show();
            bomb.y = y * mapSize;
            bomb.x = 450;
            bomb.modified();
            bomb.init(x, y, player);
            bombs.push(bomb);
            map.setNum(6 /* WAIT_BOMB */);
            //投げるアニメーション
            sprPlayer.frameNumber = 2;
            sprPlayer.modified();
            sprB.hide();
            scene.setTimeout(function () {
                if (bombs.length === player.bomb) {
                    sprPlayer.frameNumber = 0;
                }
                else {
                    sprB.show();
                    sprPlayer.frameNumber = 1;
                }
                sprPlayer.modified();
            }, 300);
            var shadow = new g.Sprite({
                scene: scene,
                src: scene.assets["shadow"],
                x: bomb.x,
                y: bomb.y
            });
            mapBase.append(shadow);
            mapBase.append(bomb); //重ね順を変える
            timeline.create(shadow).moveTo(map.x - 6, map.y, 500).call(function () {
                shadow.destroy();
            });
            timeline.create(bomb).every(function (a, b) {
                //放物線を描いて移動
                bomb.x = (x * mapSize) + (450 - (x * mapSize)) * (1 - b);
                bomb.y = (y * mapSize) + ((Math.pow((b - 0.5) * 2, 2) - 1) * 80);
                bomb.modified();
            }, 500).call(function () {
                //爆弾設置
                bomb.setArea(maps);
                if (map.num === 3 /* FIRE */) {
                    bomb.cnt = 0;
                }
                map.setNum(2 /* BOMB */);
                map.bomb = bomb;
                scene.playSound("se_move");
            });
        });
        //敵配置
        var setEnemy = function () {
            var min = 0;
            var max = 0;
            if (frameCnt / 30 < 30) {
                max = 2;
            }
            else if (frameCnt / 30 < 60) {
                max = 5;
            }
            else {
                max = 5;
                min = 3;
            }
            var num = scene.random.get(min, max);
            var enemy = new Enemy_1.Enemy(scene, num);
            enemys.push(enemy);
            var x = 0;
            var y = 0;
            while (true) {
                x = scene.random.get(1, mapX - 1);
                y = scene.random.get(1, mapY - 1);
                if (maps[y][x].num === 0 /* ROAD */)
                    break;
            }
            mapBase.append(enemy);
            enemy.px = x;
            enemy.py = y;
            enemy.moveTo(x * mapSize, y * mapSize);
            enemy.modified();
            enemy.isCollision = false;
            enemy.scaleX = 0;
            enemy.scaleY = 2.5;
            timeline.create(enemy).scaleTo(1, 1, 300).call(function () {
                enemy.isCollision = true;
            });
        };
        //ブロック配置
        var setBlock = function () {
            for (var i = 0; i < 50; i++) {
                var x = scene.random.get(1, mapX - 1);
                var y = scene.random.get(1, mapY - 1);
                if (maps[y][x].num === 0 /* ROAD */) {
                    maps[y][x].setNum(4 /* BLOCK */);
                    break;
                }
            }
        };
        //終了
        _this.finish = function () {
        };
        //スタート
        var start = function () {
            frameCnt = 0;
            for (var y = 0; y < mapY; y++) {
                for (var x = 0; x < mapX; x++) {
                    if (maps[y][x].num !== 1 /* WALL */) {
                        maps[y][x].setNum(0 /* ROAD */);
                    }
                }
            }
            bombs.forEach(function (b) {
                b.hide();
                stockBombs.unshift(b);
            });
            bombs.length = 0;
            //ブロック配置
            for (var i = 0; i < 20; i++) {
                setBlock();
            }
            enemys.forEach(function (e) {
                if (!e.destroyed())
                    e.destroy();
            });
            enemys.length = 0;
            //敵配置
            for (var i = 0; i < 5; i++) {
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
        _this.reset = function () {
            start();
        };
        return _this;
    }
    return MainGame;
}(g.E));
exports.MainGame = MainGame;
