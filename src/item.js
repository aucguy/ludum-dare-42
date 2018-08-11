base.registerModule('item', function() {
  var util = base.importModule('util');
  
  var DragHandler = util.extend(Object, 'DragHandler', {
    constructor: function DragHandler(game) {
      this.game = game;
      this.movingItem = null;
      this.game.input.addMoveCallback(this.onMouseMove, this);
      this.game.input.onUp.add(this.onMouseUp, this);
    },
    createDraggable: function(game, item, point) {
      if(this.movingItem !== null) {
        this.movingItem.kill();
      }
      this.movingItem = new MovingItem(game, this, item, point);
      this.movingItem.onKill.add(function() {
        this.movingItem = null;
      }, this);
    },
    onMouseMove: function(pointer, x, y, clicked, event) {
      if(this.movingItem !== null) {
        this.movingItem.onMouseMove(pointer.position);
      }
    },
    onMouseUp: function() {
      if(this.movingItem !== null) {
        this.movingItem.kill();
      }
    }
  });
  
  var Item = util.extend(Object, 'Item', {
    constructor: function Item(game, dragHandler) {
      this.game = game;
      this.sprite = game.add.sprite(16, 16, 'image/flour'); //Phaser.Sprite
      this.sprite.scale.x = 2;
      this.sprite.scale.y = 2;
      this.dragHandler = dragHandler;
      this.onKill = new Phaser.Signal();
    },
    containsPoint: function(point) {
      return this.sprite.getBounds().contains(point.x, point.y);
    },
    onClick: function() {
    },
    kill: function() {
      this.sprite.kill();
      this.onKill.dispatch();
    }
  });
  
  var PermanentItem = util.extend(Item, 'PermanentItem', {
    onClick: function(point) {
      this.dragHandler.createDraggable(this.game, this, point);
    }
  });
  
  var MovingItem = util.extend(Item, 'MovingItem', {
    constructor: function(game, dragHandler, item, point) {
      this.constructor$Item(game, dragHandler);
      this.offset = new Phaser.Point(point.x - item.sprite.x, point.y - item.sprite.y);
    },
    onMouseMove: function(position) {
      this.sprite.position.x = position.x - this.offset.x;
      this.sprite.position.y = position.y - this.offset.y;
    }
  });
  
  return {
    DragHandler: DragHandler,
    PermanentItem: PermanentItem
  }
});