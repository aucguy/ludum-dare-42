base.registerModule('zone', function() {
  var util = base.importModule('util');
  var item = base.importModule('item');
  var ingredient = base.importModule('ingredient');
  
  var ZONE_BORDERS = true; //for debugging
  
  var ZoneContainer = util.extend(Object, 'ZoneContainer', {
    constructor: function ZoneContainer(world) {
      this.world = world;
      this.children = [];
    },
    createZones: function(data) {
      for(var i=0; i<data.zones.length; i++) {
        var zoneData = data.zones[i];
        var constructor = ZONE_CONSTRUCTORS[zoneData.type];
        var zone = constructor(this.world, zoneData);
        this.children.push(zone);
      }
      if(ZONE_BORDERS) {
        var bitmap = this.world.game.add.bitmapData(this.world.game.width, this.world.game.height);
        bitmap.context.save();
        bitmap.context.strokeStyle = '#FFFFFF';
        bitmap.context.lineWidth = 5;
        for(var i=0; i<this.children.length; i++) {
          var rect = this.children[i].rect;
          bitmap.context.beginPath();
          bitmap.context.rect(rect.left, rect.top, rect.width, rect.height);
          bitmap.context.closePath();
          bitmap.context.stroke();
        }
        bitmap.context.restore();
        this.world.game.add.sprite(0, 0, bitmap);
      }
    },
    getZone: function(position) {
      for(var i=0; i<this.children.length; i++) {
        if(this.children[i].rect.contains(position.x, position.y)) {
          return this.children[i];
        }
      }
      return null;
    },
    onClick: function(position) {
      var zone = this.getZone(position);
      if(zone !== null) {
        return zone.onClick(position);
      }
    },
    update: function() {
      for(var i=0; i<this.children.length; i++) {
        this.children[i].update();
      }
    }
  });
  
  var Zone = util.extend(Object, 'Zone', {
    constructor: function Zone(rect) {
      this.rect = rect; //Phaser.Rect
      this.items = []; //[Item]
    },
    getItem: function(position) {
     for(var i=0; i<this.items.length; i++) {
        if(this.items[i].containsPoint(position)) {
          return this.items[i];
        }
      }
      return null;
    },
    onClick: function(position) {
      var item = this.getItem(position);
      if(item !== null) {
        return item.onClick(position);
      }
    },
    addItem: function(item) {
      if(item.zone !== null) {
        item.zone.removeItem(item);
      }
      this.items.push(item);
      item.whenKill.add(function() {
        this.items.splice(this.items.indexOf(item), 1);
      }, this);
      item.zone = this;
    },
    removeItem: function() {
      this.items.splice(this.items.indexOf(item), 1);
      this.zone = null;
    },
    canPlaceItem: function(draggable) {
      //items can't straddle borders
      if(!this.rect.containsRect(draggable.sprite.getBounds())) {
        return false;
      }
      for(var i=0; i<this.items.length; i++) {
        var item = this.items[i];
        if(item !== draggable && draggable.sprite.getBounds().intersects(item.sprite.getBounds())) {
          return false;
        }
      }
      return true;
    },
    update: function() {
      //abstract
    }
  });
  
  var PermanentZone = util.extend(Zone, 'PermanentZone', {
    constructor: function PermanentZone(rect) {
      this.constructor$Zone(rect);
    },
    canPlaceItem: function(item) {
      return false;
    }
  });
  
  var GarbageZone = util.extend(Zone, 'GarbageZone', {
    constructor: function GarbageZone(rect) {
      this.constructor$Zone(rect);
    },
    update: function() {
      while(this.items.length !== 0) {
        this.items[0].kill();
      }
    }
  });
  
  function constructZone(world, zoneData) {
    return new Zone(new Phaser.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
  }
  
  function constructPermanentZone(world, zoneData) {
    var zone = new PermanentZone(new Phaser.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
    if(zoneData.items) {
      for(var i=0; i<zoneData.items.length; i++) {
        var itemData = zoneData.items[i];
        zone.addItem(new item.PermanentItem(world, itemData.x, itemData.y, new ingredient.Ingredient(itemData.graphic)));
      }
    }
    return zone;
  }
  
  function constructGarbageZone(world, zoneData) {
    return new GarbageZone(new Phaser.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
  }
  
  var ZONE_CONSTRUCTORS = {
    order: constructZone,
    counter: constructZone,
    ingredient: constructPermanentZone,
    stove: constructZone,
    oven: constructZone,
    warm: constructZone,
    garbage: constructGarbageZone
  }
  
  return {
    ZoneContainer: ZoneContainer,
  }
});