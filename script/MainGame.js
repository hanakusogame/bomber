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
            cssColor: "white",
            opacity: 0.5
        });
        _this.append(bg);
        //火力とおける爆弾の数
        var sprPower = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 520,
            y: 100,
            srcX: 60
        });
        _this.append(sprPower);
        var labelPower = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 590,
            y: 115
        });
        _this.append(labelPower);
        var sprBomb = new g.Sprite({
            scene: scene,
            src: scene.assets["item"],
            width: 60,
            height: 60,
            x: 520,
            y: 180
        });
        _this.append(sprBomb);
        var labelBomb = new g.Label({
            scene: scene,
            font: scene.numFont,
            fontSize: 32,
            text: "2",
            x: 590,
            y: 195
        });
        _this.append(labelBomb);
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
            height: 100,
            frames: [0, 1, 2],
            x: 430,
            y: 100
        });
        mapBase.append(sprPlayer);
        //爆風作成
        var fires = [];
        for (var i = 0; i < 100; i++) {
            var spr = new g.FrameSprite({
                scene: scene,
                src: scene.assets["fire"],
                width: mapSize,
                height: mapSize,
                frames: [0, 1, 2]
            });
            spr.hide();
            fires.push(spr);
            mapBase.append(spr);
        }
        //爆弾作成
        var stockBombs = []; //ストックされている爆弾
        var bombs = []; //フィールド上に設置されている爆弾
        for (var i = 0; i < 5; i++) {
            var spr = new Bomb_1.Bomb({
                scene: scene,
                width: mapSize,
                height: mapSize,
            });
            spr.hide();
            stockBombs.push(spr);
            mapBase.append(spr);
        }
        var player = new Player_1.Player(); //プレイヤー
        //敵作成
        var enemys = [];
        var dx = [1, 0, -1, 0]; //４方向
        var dy = [0, 1, 0, -1];
        var frameCnt = 0;
        //ゲームループ
        mapBase.update.add(function () {
            if (!scene.isStart)
                return;
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
                    enemy.hit();
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
            if (frameCnt % 320 === 0) {
                setBlock();
            }
            frameCnt++;
        });
        //爆弾設置
        var setBomb = function (x, y, bomb) {
            var arr = [];
            for (var i = 0; i < 4; i++) {
                var x_1 = bomb.px;
                var y_1 = bomb.py;
                for (var j = 0; j < bomb.power; j++) {
                    x_1 += dx[i];
                    y_1 += dy[i];
                    var map = maps[y_1][x_1];
                    if (map.num === 2 /* BOMB */ || map.num === 4 /* BLOCK */ || map.num === 1 /* WALL */) {
                        break;
                    }
                    map.setNum(5 /* WAIT_FIRE */);
                    arr.push({ x: x_1, y: y_1, time: j + 1, angle: i * 90, num: 0 });
                }
            }
            bomb.arr = arr;
            scene.playSound("se_move");
        };
        //爆発
        var blast = function (bomb) {
            bomb.hide();
            scene.playSound("se_bomb");
            bomb.arr.forEach(function (p) {
                var map = maps[p.y][p.x];
                if (map.num === 2 /* BOMB */)
                    return;
                map.setNum(0 /* ROAD */);
            });
            var arr = [];
            arr.push({ x: bomb.px, y: bomb.py, time: 0, angle: 0, num: 0 });
            for (var i = 0; i < 4; i++) {
                var x = bomb.px;
                var y = bomb.py;
                for (var j = 0; j < bomb.power; j++) {
                    x += dx[i];
                    y += dy[i];
                    var map = maps[y][x];
                    if (map.num === 1 /* WALL */)
                        break;
                    var num = 1;
                    if (j + 1 === bomb.power || map.num === 4 /* BLOCK */)
                        num = 2;
                    arr.push({ x: x, y: y, time: j + 1, angle: i * 90, num: num });
                    if (map.num === 2 /* BOMB */ || map.num === 4 /* BLOCK */) {
                        break;
                    }
                    else {
                        map.setNum(5 /* WAIT_FIRE */);
                    }
                }
            }
            //爆風表示
            arr.forEach(function (p) {
                var map = maps[p.y][p.x];
                scene.setTimeout(function () {
                    if (map.num === 2 /* BOMB */) {
                        map.bomb.cnt = 0;
                        map.bomb = null;
                    }
                    if (map.num === 4 /* BLOCK */ && scene.random.get(0, 6) === 0) {
                        //アイテム作成
                        var num = scene.random.get(0, 1);
                        var item_1 = new Item_1.Item(scene, p.x, p.y, num);
                        mapBase.append(item_1);
                        //アイテム自然消滅
                        var timer_1 = scene.setTimeout(function () {
                            item_1.destroy();
                        }, 5000);
                        //アイテム取得
                        item_1.pointDown.add(function () {
                            scene.playSound("se_item");
                            scene.addScore(30);
                            if (item_1.num === 0) {
                                if (player.bombMax < 5) {
                                    player.bombMax++;
                                    labelBomb.text = "" + player.bombMax;
                                    labelBomb.invalidate();
                                }
                            }
                            else {
                                if (player.power < 5) {
                                    player.power++;
                                    labelPower.text = "" + player.power;
                                    labelPower.invalidate();
                                }
                            }
                            timer_1.destroy();
                            item_1.touchable = false;
                            timeline.create(item_1).scaleTo(0, 1, 100).scaleTo(1, 1, 100).call(function () {
                                item_1.destroy();
                            });
                        });
                    }
                    map.setNum(3 /* FIRE */);
                    var fire = fires.pop();
                    fire.moveTo(map.x, map.y);
                    fire.frameNumber = p.num;
                    fire.angle = p.angle;
                    fire.modified();
                    fire.show();
                    map.fires.unshift(fire);
                }, p.time * ((10 - bomb.power) * 10));
            });
            //爆風を消す
            timeline.create().wait(1000).call(function () {
                arr.forEach(function (p) {
                    var map = maps[p.y][p.x];
                    var fire = map.fires.pop();
                    fire.hide();
                    fires.unshift(fire);
                    if (map.fires.length === 0) {
                        map.setNum(0 /* ROAD */);
                    }
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
            if (!(maps[y][x].num === 0 /* ROAD */ || maps[y][x].num === 5 /* WAIT_FIRE */) || bombs.length >= player.bombMax)
                return;
            var bomb = stockBombs.pop();
            bomb.show();
            bomb.y = y * mapSize;
            bomb.x = 450;
            bomb.modified();
            bomb.px = x;
            bomb.py = y;
            bomb.cnt = player.time / 30;
            bomb.power = player.power;
            bombs.push(bomb);
            maps[y][x].setNum(2 /* BOMB */);
            maps[y][x].bomb = bomb;
            //投げるアニメーション
            sprPlayer.frameNumber = 2;
            sprPlayer.modified();
            scene.setTimeout(function () {
                if (bombs.length === player.bombMax) {
                    sprPlayer.frameNumber = 0;
                }
                else {
                    sprPlayer.frameNumber = 1;
                }
                sprPlayer.modified();
            }, 300);
            timeline.create(bomb).every(function (a, b) {
                bomb.x = (x * mapSize) + (450 - (x * mapSize)) * (1 - b);
                bomb.y = (y * mapSize) + ((Math.pow((b - 0.5) * 2, 2) - 1) * 80);
                bomb.modified();
            }, 500).call(function () {
                //爆弾設置
                setBomb(x, y, bomb);
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
        };
        //ブロック配置
        var setBlock = function () {
            var x = 0;
            var y = 0;
            while (true) {
                x = scene.random.get(1, mapX - 1);
                y = scene.random.get(1, mapY - 1);
                if (maps[y][x].num === 0 /* ROAD */)
                    break;
            }
            maps[y][x].setNum(4 /* BLOCK */);
        };
        _this.finish = function () {
        };
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
            player.bombMax = 2;
            labelBomb.text = "" + player.bombMax;
            labelBomb.invalidate();
            player.power = 2;
            labelPower.text = "" + player.power;
            labelPower.invalidate();
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
