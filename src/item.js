base.registerModule('item', function() {
  var util = base.importModule('util');
  var ingredient = base.importModule('ingredient');
  
  var DragHandler = util.extend(Object, 'DragHandler', {
    constructor: function DragHandler(world) {
      this.world = world;
      this.movingItem = null;
      this.world.game.input.addMoveCallback(this.onMouseMove, this);
      this.world.game.input.onUp.add(this.onMouseUp, this);
    },
    createDraggable: function(moving) {
      if(this.movingItem !== null) {
        this.movingItem.kill();
      }
      this.movingItem = moving;
      this.movingItem.whenKill.add(function() {
        this.movingItem = null;
      }, this);
    },
    onMouseMove: function(pointer, x, y, clicked, event) {
      if(this.movingItem !== null) {
        this.movingItem.onMouseMove(pointer.position);
      }
    },
    onMouseUp: function(pointer) {
      if(this.movingItem !== null) {
        this.movingItem.onMouseUp(pointer.position);
      }
    }
  });
  
  var Item = util.extend(Object, 'Item', {
    constructor: function Item(world, x, y, ingredient) {
      this.sprite = world.game.add.sprite(x, y, ingredient.getGraphic());
      this.sprite.scale.x = 3;
      this.sprite.scale.y = 3;
      this.world = world;
      this.ingredient = ingredient;
      this.whenKill = new Phaser.Signal();
      this.zone = null; //set by zones
      ingredient.item = this;
    },
    containsPoint: function(point) {
      return this.sprite.getBounds().contains(point.x, point.y);
    },
    onClick: function() {
      //abstract
    },
    kill: function() {
      this.sprite.kill();
      if(this.zone !== null) {
        this.zone.removeItem(this);
      }
      this.whenKill.dispatch();
      this.ingredient.kill();
    },
    canBeMixed: function() {
      return false;
    },
    onMixed: function() {
      //abstract
    },
    onMoveFail: function() {
      //abstract
    },
    place: function(zone, draggable) {
      //abstract
    },
    update: function(time) {
      this.ingredient.update(time);
    }
  });
  
  var PermanentItem = util.extend(Item, 'PermanentItem', {
    constructor: function PermanentItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingItem(this.world, this, point);
      this.world.dragHandler.createDraggable(moving);
    },
    place: function(zone, draggable) {
      var ingred = ingredient.toCookingIngredient(this.world, this.ingredient);
      zone.addItem(new CookingItem(this.world, draggable.sprite.position.x, draggable.sprite.position.y, ingred));
    }
  });
  
  var CookingItem = util.extend(Item, 'CookingItem', {
    constructor: function CookingItem(world, x, y, ingredient) {
      this.constructor$Item(world, x, y, ingredient);
    },
    onClick: function(point) {
      var moving = new MovingItem(this.world, this, point)
      this.world.dragHandler.createDraggable(moving);
      this.sprite.alpha = 0.5;
    },
    canBeMixed: function() {
      return true;
    },
    onMixed: function() {
      this.kill();
    },
    onMoveFail: function() {
      this.sprite.alpha = 1;
    },
    place: function(zone, draggable) {
      this.sprite.alpha = 1;
      this.sprite.position.x = draggable.sprite.position.x;
      this.sprite.position.y = draggable.sprite.position.y;
      zone.addItem(this);
    }
  });
  
  var MovingItem = util.extend(Item, 'MovingItem', {
    constructor: function MovingItem(world, item, point) {
      var ingred = ingredient.toMovingIngredient(world, item.ingredient);
      this.constructor$Item(world, item.sprite.position.x, item.sprite.position.y, ingred);
      this.offset = new Phaser.Point(point.x - item.sprite.x, point.y - item.sprite.y);
      this.whenUsed = new Phaser.Signal();
      this.underlyingItem = item;
    },
    onMouseMove: function(position) {
      this.sprite.position.x = position.x - this.offset.x;
      this.sprite.position.y = position.y - this.offset.y;
    },
    onMouseUp: function(position) {
      this.kill();
      var zone = this.world.zones.getZone(position);
      if(zone !== null) {
        var overItem = zone.getItem(position);
        if(overItem !== null) {
          if(overItem.canBeMixed()) {
            var mixedIngredient = ingredient.mix(this.underlyingItem.ingredient, overItem.ingredient);
            if(mixedIngredient !== null) {
              var position = overItem.sprite.position;
              this.underlyingItem.onMixed();
              overItem.onMixed();
              zone.addItem(new CookingItem(this.world, position.x, position.y, mixedIngredient));
            } else {
              this.underlyingItem.onMoveFail();
            }
          } else {
            this.underlyingItem.onMoveFail();
          }
        } else if(zone.canPlaceItem(this)) {
          this.underlyingItem.place(zone, this);
        } else {
          this.underlyingItem.onMoveFail();
        }
      } else {
        this.underlyingItem.onMoveFail();
      }
    }
  });
  
  return {
    DragHandler: DragHandler,
    PermanentItem: PermanentItem
  }
});