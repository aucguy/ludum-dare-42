import * as zoneType from './zoneType.js';
import * as util from '/lib/util.js';

var IngredientComponent = util.extend(Object, 'IngredientComponent', {
  constructor: function IngredientComponent(world) {
    this.world = world;
    this.ingredient = null;
  },
  update: function(time) {
    //abstract
  },
  kill: function() {
    //abstract
  }
});

var MAX_COOK_TIME = 30000; //30s

var CookedComponent = util.extend(IngredientComponent, 'CookedComponent', {
  constructor: function CookedComponent(world, cookZone) {
    this.constructor$IngredientComponent(world);
    this.cookTime = 0;
    this.barSprite = null;
    this.arrowSprite = null;
    this.cookZone = cookZone;
  },
  clone: function() {
    var component = new CookedComponent(this.world);
    component.startTime = this.startTime;
    return component;
  },
  update: function(time) {
    if(this.ingredient.item.zone.type === this.cookZone && this.ingredient.isComplete()) {
      this.cookTime += time;
      if(this.cookTime > MAX_COOK_TIME) {
        this.cookTime = MAX_COOK_TIME;
      }
    }
    this.updateSprites();
  },
  updateSprites: function() {
    this.barSprite.x = this.ingredient.item.sprite.x;
    this.barSprite.y = this.ingredient.item.sprite.y;

    var progress = this.cookTime / MAX_COOK_TIME * this.barSprite.getBounds().width;
    this.arrowSprite.x = this.barSprite.x - this.arrowSprite.getBounds().width / 2 + progress;
    this.arrowSprite.y = this.barSprite.getBounds().bottom;
  },
  kill: function() {
    this.barSprite.destroy();
    this.arrowSprite.destroy();
  },
  init: function() {
    this.barSprite = this.world.scene.add.sprite(0, 0, 'image/cookBar');
    this.barSprite.setOrigin(0, 0);
    this.arrowSprite = this.world.scene.add.sprite(0, 0, 'image/cookArrow');
    this.arrowSprite.setOrigin(0, 0);
    this.updateSprites();
  }
});

var CompleteComponent = util.extend(IngredientComponent, 'CompleteComponent', {
  constructor: function CompleteComponent(world) {
    this.constructor$IngredientComponent(world);
    this.sprite = null;
  },
  update: function(time) {
    this.sprite.x = this.ingredient.item.sprite.getBounds().right - this.sprite.getBounds().width;
    this.sprite.y = this.ingredient.item.sprite.y;

    this.sprite.visible = this.isComplete();
  },
  isComplete: function() {
    var allowed = this.ingredient.containerType.allowed;
    var contents = this.ingredient.contents;

    if(allowed === null) {
      return false;
    }
    for(var i = 0; i < allowed.length; i++) {
      if(!contents.has(allowed[i]) || contents.get(allowed[i]) === 0) {
        return false;
      }
    }
    return true;
  },
  kill: function() {
    this.sprite.destroy();
  },
  init: function() {
    this.sprite = this.world.scene.add.sprite(0, 0, 'image/complete');
    this.sprite.setOrigin(0, 0);
    this.update(0);
  }
});

var MAX_WELLNESS = 100;

var WellnessComponent = util.extend(IngredientComponent, 'WellnessComponent', {
  constructor: function WellnessComponent(world, wellness) {
    this.constructor$IngredientComponent(world);
    this.barSprite = null;
    this.arrowSprite = null;
    this.wellness = wellness;
  },
  init: function() {
    this.barSprite = this.world.scene.add.sprite(0, 0, 'image/wellnessBar');
    this.barSprite.setOrigin(0, 0);
    this.arrowSprite = this.world.scene.add.sprite(0, 0, 'image/cookArrow');
    this.arrowSprite.setOrigin(0, 0);
    this.update(0);
  },
  update: function() {
    this.barSprite.x = this.ingredient.item.sprite.x;
    this.barSprite.y = this.ingredient.item.sprite.getBounds().bottom - this.barSprite.getBounds().height - this.arrowSprite.getBounds().height;

    var progress = this.wellness / MAX_WELLNESS * this.barSprite.getBounds().width;
    this.arrowSprite.x = this.barSprite.x - this.arrowSprite.getBounds().width / 2 + progress;
    this.arrowSprite.y = this.barSprite.getBounds().bottom;
  },
  kill: function() {
    this.barSprite.destroy();
    this.arrowSprite.destroy();
  }
});

export {
  CookedComponent,
  CompleteComponent,
  WellnessComponent,
  MAX_COOK_TIME,
  MAX_WELLNESS
};