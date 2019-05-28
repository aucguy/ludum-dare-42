import * as util from '/lib/util.js';
import * as zone from './zone.js';
import * as item from './item.js';

function init() {
  util.removeLoadingLogo();
  var game = new Phaser.Game({
    width: 640,
    height: 480,
    parent: 'gameContainer',
    canvasID: 'display',
    scene: new CustomBootScene()
  });
  game.scene.add('play', new PlayScene());
  return game;
}

var CustomBootScene = util.extend(util.BootScene, 'CustomBootScene', {
  update: function() {
    this.scene.start('play');
  }
});

var World = util.extend(Object, 'World', {
  constructor: function World(scene) {
    this.scene = scene;
    this.dragHandler = new item.DragHandler(this);
    this.zones = new zone.ZoneContainer(this);
    this.zones.createZones(util.getAsset('config/zones'));
    this.status = new Status(this);
  },
  update: function(time) {
    this.zones.update(time);
    this.status.update(time);
  }
});

var Status = util.extend(Object, 'Status', {
  constructor: function Status(world) {
    this.world = world;
    this.text = this.world.scene.add.text(16, 16, '');
    this.text.setColor('#FFFFFF');
    this.money = 0;
  },
  update: function(time) {
    this.text.text = '$' + this.money;
  }
});

var PlayScene = util.extend(Phaser.Scene, 'PlayScene', {
  constructor: function PlayState() {
    this.constructor$Scene();
    this.world = null;
    this.timer = null;
  },
  create: function() {
    var background = this.add.sprite(0, 0, 'image/background');
    background.setOrigin(0, 0);
    this.world = new World(this);
    this.input.on('pointerdown', this.onClick, this);
    this.lastTime = this.time.now;
  },
  onClick: function(pointer) {
    this.world.zones.onClick(pointer.position);
  },
  update: function() {
    var currentTime = this.time.now;
    this.world.update(currentTime - this.lastTime);
    this.lastTime = currentTime;
  }
});

export {
  init
};