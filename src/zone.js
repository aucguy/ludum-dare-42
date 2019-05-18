import * as util from '/lib/util.js';
import * as item from './item.js';
import * as ingredient from './ingredient.js';
import * as zoneType from './zoneType.js';

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
      var size = this.world.scene.scale.gameSize;
      var canvas = util.createCanvas(size.width, size.height);
      var ctx = canvas.getContext('2d');
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 5;
      for(var i=0; i<this.children.length; i++) {
        var rect = this.children[i].rect;
        ctx.beginPath();
        ctx.rect(rect.left, rect.top, rect.width, rect.height);
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
      var name = '$ZONE_BORDERS$' + Math.random();
      this.world.scene.textures.addCanvas(name, canvas);
      var sprite = this.world.scene.add.sprite(0, 0, name);
      sprite.setOrigin(0, 0);
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
  update: function(time) {
    for(var i=0; i<this.children.length; i++) {
      this.children[i].update(time);
    }
  }
});

var Zone = util.extend(Object, 'Zone', {
  constructor: function Zone(rect, type) {
    this.rect = rect; //Phaser.Rect
    this.type = type;
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
    item.zone = this;
  },
  removeItem: function(item) {
    if(this.items.indexOf(item) !== -1) {
      this.items.splice(this.items.indexOf(item), 1);
      item.zone = null;
    }
  },
  canPlaceItem: function(draggable) {
    //items can't straddle borders
    if(!Phaser.Geom.Rectangle.ContainsRect(this.rect, draggable.sprite.getBounds())) {
      return false;
    }
    for(var i=0; i<this.items.length; i++) {
      var item = this.items[i];
      if(item !== draggable && Phaser.Geom.Rectangle.Overlaps(draggable.sprite.getBounds(), item.sprite.getBounds())) {
        return false;
      }
    }
    return true;
  },
  update: function(time) {
    for(var i=0; i<this.items.length; i++) {
      this.items[i].update(time);
    }
  }
});

var PermanentZone = util.extend(Zone, 'PermanentZone', {
  constructor: function PermanentZone(rect) {
    this.constructor$Zone(rect, zoneType.ZONE_TYPES.INGREDIENTS);
  },
  canPlaceItem: function(item) {
    return false;
  }
});

var GarbageZone = util.extend(Zone, 'GarbageZone', {
  constructor: function GarbageZone(rect) {
    this.constructor$Zone(rect, zoneType.ZONE_TYPES.GARBAGE);
  },
  update: function() {
    this.update$Zone();
    while(this.items.length !== 0) {
      this.items[0].kill();
    }
  }
});

var VALUE_MULTIPLIER = 10;

var OrderZone = util.extend(Zone, 'OrderZone', {
  constructor: function OrderZone(rect) {
    this.constructor$Zone(rect, zoneType.ZONE_TYPES.ORDER);
  },
  update: function() {
    this.update$Zone();
    while(this.items.length !== 0) {
      var item = this.items[0];
      if(item.ingredient.type === ingredient.INGREDIENT_TYPES.PIZZA) {
        var value = item.ingredient.wellnessComponent.wellness / VALUE_MULTIPLIER;
        item.world.status.money += Math.round(value);
      }
      item.kill();
    }
  },
  canPlaceItem: function(item) {
    return item.ingredient.type === ingredient.INGREDIENT_TYPES.PIZZA;
  }
});

function createZoneConstructor(type) {
  return function(world, zoneData) {
    return new Zone(new Phaser.Geom.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height), type);
  };
}

function constructPermanentZone(world, zoneData) {
  var zone = new PermanentZone(new Phaser.Geom.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
  if(zoneData.items) {
    for(var i=0; i<zoneData.items.length; i++) {
      var itemData = zoneData.items[i];
      var ingred = new ingredient.Ingredient(world, ingredient.INGREDIENT_TYPES[itemData.ingredientType.toUpperCase()]);
      zone.addItem(new item.PermanentItem(world, itemData.x, itemData.y, ingred));
    }
  }
  return zone;
}

function constructGarbageZone(world, zoneData) {
  return new GarbageZone(new Phaser.Geom.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
}

function constructOrderZone(world, zoneData) {
  return new OrderZone(new Phaser.Geom.Rectangle(zoneData.left, zoneData.top, zoneData.width, zoneData.height));
}

var ZONE_CONSTRUCTORS = {
  order: constructOrderZone,
  counter: createZoneConstructor(zoneType.ZONE_TYPES.COUNTER),
  ingredient: constructPermanentZone,
  stove: createZoneConstructor(zoneType.ZONE_TYPES.STOVE),
  oven: createZoneConstructor(zoneType.ZONE_TYPES.OVEN),
  warm: createZoneConstructor(zoneType.ZONE_TYPES.WARM),
  garbage: constructGarbageZone
}

export {
  ZoneContainer,
};