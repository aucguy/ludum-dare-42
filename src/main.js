base.registerModule('main', function() {
  var util = base.importModule('util');
  var zone = base.importModule('zone');
  var item = base.importModule('item');
  
  function init() {
    util.removeLoadingScreen();
    var game = new Phaser.Game({
      width: 640,
      height: 480,
      parent: 'gameContainer',
      canvasID: 'display',
      state: new CustomBootState()
    });
    game.state.add('play', new PlayState());
  }
  
  var CustomBootState = util.extend(util.BootState, 'CustomBootState', {
    update: function() {
      this.state.start('play');
    }
  });
  
  var World = util.extend(Object, 'World', {
    constructor: function World(game) {
      this.game = game;
      this.dragHandler = new item.DragHandler(this);
      this.zones = new zone.ZoneContainer(this);
    }
  });
  
  var PlayState = util.extend(Phaser.State, 'PlayState', {
    constructor: function PlayState() {
      this.constructor$State();
      this.dragHandler = null;
    },
    create: function() {
      this.world = new World(this.game);
      this.input.onDown.add(this.onClick, this);
    },
    onClick: function(pointer) {
      this.world.zones.onClick(pointer.position);
    },
    update: function() {
    }
  });
  
  return {
    init: init
  }
});