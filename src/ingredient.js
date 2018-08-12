base.registerModule('ingredient', function() {
  var util = base.importModule('util');
  var component = base.importModule('component');
  
  var IngredientType = util.extend(Object, 'IngredientType', {
    constructor: function IngredientType(graphic) {
      this.graphic = graphic;
    }
  });
  
  var INGREDIENT_TYPES = {
    WATER: new IngredientType('image/water'),
    FLOUR: new IngredientType('image/flour'),
    YEAST: new IngredientType('image/yeast'),
    TOMATO: new IngredientType('image/tomato'),
    POT: new IngredientType('image/pot'),
    BOWL: new IngredientType('image/bowl'),
  };
  
  var Ingredient = util.extend(Object, 'Ingredient', {
    constructor: function Ingredient(world, type) {
      this.world = world;
      this.type = type;
      this.components = [];
      this.item = null;
    },
    getGraphic: function() {
      return this.type.graphic;
    },
    addComponent: function(component) {
      this.components.push(component);
      component.ingredient = this;
    },
    update: function(time) {
      for(var i=0; i<this.components.length; i++) {
        this.components[i].update(time);
      }
    },
    kill: function() {
      for(var i=0; i<this.components.length; i++) {
        this.components[i].kill();
      }
    }
  });
  
  var BowlType = util.extend(Object, 'BowlType', {
    constructor: function BowlType(graphic, allowed) {
      this.graphic = graphic
      this.allowed = allowed;
    }
  });
  
  var BOWL_TYPES = {
    EMPTY: new BowlType('image/bowl', null),
    DOUGH: new BowlType('image/doughBowl', [INGREDIENT_TYPES.WATER, INGREDIENT_TYPES.FLOUR, INGREDIENT_TYPES.YEAST])
  };
  
  function getBowlTypeForIngredient(ingredient) {
    var names = Object.getOwnPropertyNames(BOWL_TYPES);
    for(var i=0; i<names.length; i++) {
      var value = BOWL_TYPES[names[i]];
      if(value.allowed !== null && value.allowed.indexOf(ingredient.type) !== -1) {
        return value;
      }
    }
    return null;
  }
  
  var MAX_BOWL_AMOUNT = 1;
  
  var Bowl = util.extend(Ingredient, 'Bowl', {
    constructor: function Bowl(world, bowlType, contents) {
      this.constructor$Ingredient(world, INGREDIENT_TYPES.BOWL);
      this.bowlType = bowlType;
      this.contents = contents;
      this.addComponent(new component.CookedComponent(world));
      this.addComponent(new component.CompleteComponent(world));
    },
    canAddIngredient: function(other) {
      //if empty, you can put in whatever
      if(this.bowlType === BOWL_TYPES.EMPTY) {
        return getBowlTypeForIngredient(other) !== null;
      //if of a certain type, only certain things allowed
      } else if(this.bowlType.allowed.indexOf(other.type) === -1) {
        return false;
      //maximum amount of stuff
      } else {
        return !this.contents.contains(other.type) || this.contents.get(other.type) < MAX_BOWL_AMOUNT;
      }
    },
    addIngredient: function(other) {
      var newContents = new util.Map();
      for(var i=0; i<this.contents.entries.length; i++) {
        var entry = this.contents.entries[i];
        newContents.put(entry.key, entry.value);
      }
      if(newContents.contains(other.type)) {
        newContents.put(other.type, newContents.get(other.type) + 1);
      } else {
        newContents.put(other.type, 1);
      }
      
      var bowlType;
      if(this.bowlType === BOWL_TYPES.EMPTY) {
        bowlType = getBowlTypeForIngredient(other);
      } else {
        bowlType = this.bowlType;
      }
      return new Bowl(this.world, bowlType, newContents);
    },
    getGraphic: function() {
      return this.bowlType.graphic;
    }
  });
  
  function mix(a, b) {
    if(a.type == INGREDIENT_TYPES.BOWL) {
      return mixBowl(a, b);
    } else if(b.type == INGREDIENT_TYPES.BOWL) {
      return mixBowl(b, a);
    } else {
      return null;
    }
  }
  
  function mixBowl(bowl, other) {
    if(bowl.canAddIngredient(other)) {
      return bowl.addIngredient(other);
    } else {
      return null;
    }
  }
  
  function toCookingIngredient(world, original) {
    if(original.type === INGREDIENT_TYPES.BOWL) {
      return new Bowl(world, BOWL_TYPES.EMPTY, new util.Map());
    } else {
      return new Ingredient(world, original.type);
    }
  }
  
  function toMovingIngredient(world, original) {
    return new Ingredient(world, original.type);
  }
  
  return {
    INGREDIENT_TYPES: INGREDIENT_TYPES,
    Ingredient: Ingredient,
    mix: mix,
    toCookingIngredient: toCookingIngredient,
    toMovingIngredient: toMovingIngredient
  };
});