base.registerModule('component', function() {
  var zoneType = base.importModule('zoneType');
  var util = base.importModule('util');
  
  var IngredientComponent = util.extend(Object, 'IngredientComponent',{
    constructor: function IngredientComponent() {
    },
    clone: function() {
      //abstract
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
    constructor: function CookedComponent(world) {
      this.world = world;
      this.cookTime = 0;
      this.barSprite = world.game.add.sprite(0, 0, 'image/cookBar');
      this.arrowSprite = world.game.add.sprite(0, 0, 'image/cookArrow');
      this.ingredient = null;
    },
    clone: function() {
      var component = new CookedComponent(this.world);
      component.startTime = this.startTime;
      return component;
    },
    update: function(time) {
      if(this.ingredient.item.zone.type === zoneType.ZONE_TYPES.STOVE) {
        this.cookTime += time;
        if(this.cookTime > MAX_COOK_TIME) {
          this.cookTime = MAX_COOK_TIME
        }
      }
      
      this.barSprite.position.x = this.ingredient.item.sprite.position.x;
      this.barSprite.position.y = this.ingredient.item.sprite.position.y;
      
      var progress = this.cookTime / MAX_COOK_TIME * this.barSprite.getBounds().width;
      this.arrowSprite.position.x = this.barSprite.position.x - this.arrowSprite.getBounds().width / 2 + progress;
      this.arrowSprite.position.y = this.barSprite.getBounds().bottom;
    },
    kill: function() {
      this.barSprite.kill();
    }
  });
  
  return {
    CookedComponent: CookedComponent
  }
});