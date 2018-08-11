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
  
  var PlayState = util.extend(Phaser.State, 'PlayState', {
    constructor: function PlayState() {
      this.constructor$State();
      this.zones = null;
      this.dragHandler = null;
    },
    create: function() {
      this.dragHandler = new item.DragHandler(this.game);
      this.zones = this.createZones();
      this.input.onDown.add(this.onClick, this);
    },
    createZones: function() {
      return [new zone.PermanentZone(this.game, new Phaser.Rectangle(0, 0, 640, 480), this.dragHandler)];
    },
    onClick: function(pointer) {
      for(var i=0; i<this.zones.length; i++) {
        if(this.zones[i].rect.contains(pointer.position.x, pointer.position.y)) {
          this.zones[i].onClick(pointer.position);
        }
      }
    },
    update: function() {
      
    }
  });
  
  return {
    init: init
  }
});