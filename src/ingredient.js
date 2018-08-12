base.registerModule('ingredient', function() {
  var util = base.importModule('util');
  var component = base.importModule('component');
  
  var IngredientType = util.extend(Object, 'IngredientType', {
    constructor: function IngredientType(graphic) {
      this.graphic = graphic;
    }
  });
  
  var INGREDIENT_TYPES = {
    CHEESE: new IngredientType('image/cheese'),
    FLOUR: new IngredientType('image/flour'),
    PEPPER: new IngredientType('image/pepper'),
    TOMATO: new IngredientType('image/tomato'),
    WATER: new IngredientType('image/water'),
    PIZZA: new IngredientType('image/pizza'),
    YEAST: new IngredientType('image/yeast'),
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
    },
    init: function() {
      for(var i=0; i<this.components.length; i++) {
        this.components[i].init();
      }
    }
  });
  
  var ContainerType = util.extend(Object, 'BowlType', {
    constructor: function BowlType(graphic, allowed) {
      this.graphic = graphic
      this.allowed = allowed;
    }
  });
  
  function getContainerTypeForIngredient(types, ingredient) {
    var names = Object.getOwnPropertyNames(types);
    for(var i=0; i<names.length; i++) {
      var value = types[names[i]];
      if(value.allowed !== null && value.allowed.indexOf(ingredient.type) !== -1) {
        return value;
      }
    }
    return null;
  }
  
  var MAX_CONTAINER_AMOUNT = 1;
  
  var Container = util.extend(Ingredient, 'Container', {
    constructor: function Bowl(world, type, containerType, contents) {
      this.constructor$Ingredient(world, type);
      this.containerType = containerType;
      this.contents = contents;
      this.addComponent(new component.CookedComponent(world));
      this.addComponent(new component.CompleteComponent(world));
    },
    canAddIngredient: function(other) {
      //if empty, you can put in whatever
      if(this.containerType === this.getEmptyType()) {
        return getContainerTypeForIngredient(this.getTypes(), other) !== null;
      //if of a certain type, only certain things allowed
      } else if(this.containerType.allowed.indexOf(other.type) === -1) {
        return false;
      //maximum amount of stuff
      } else {
        return !this.contents.contains(other.type) || this.contents.get(other.type) < MAX_CONTAINER_AMOUNT;
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
      
      var containerType;
      if(this.containerType === this.getEmptyType()) {
        containerType = getContainerTypeForIngredient(this.getTypes(), other);
      } else {
        containerType = this.containerType;
      }
      return this.createContainer(this.world, containerType, newContents);
    },
    getGraphic: function() {
      return this.containerType.graphic;
    },
    getEmptyType: function() {
      //abstract
    },
    getTypes: function() {
      //abstract
    },
    createContainer: function(world, containerType, newContents) {
      //abstract
    }
  });
  
  var BOWL_TYPES = {
    EMPTY: new ContainerType('image/bowl', null),
    DOUGH: new ContainerType('image/doughBowl', [INGREDIENT_TYPES.WATER, INGREDIENT_TYPES.FLOUR, INGREDIENT_TYPES.YEAST])
  };
  
  var Bowl = util.extend(Container, 'Bowl', {
    constructor: function Bowl(world, containerType, contents) {
      this.constructor$Container(world, INGREDIENT_TYPES.BOWL, containerType, contents);
    },
    getEmptyType: function() {
      return BOWL_TYPES.EMPTY
    },
    getTypes: function() {
      return BOWL_TYPES;
    },
    createContainer: function(world, containerType, newContents) {
      return new Bowl(world, containerType, newContents)
    }
  });
  
  var POT_TYPES = {
    EMPTY: new ContainerType('image/pot', null),
    SAUCE: new ContainerType('image/saucePot', [INGREDIENT_TYPES.TOMATO, INGREDIENT_TYPES.PEPPER, INGREDIENT_TYPES.FLOUR])
  };
  
  var Pot = util.extend(Container, 'Pot', {
    constructor: function Bowl(world, containerType, contents) {
      this.constructor$Container(world, INGREDIENT_TYPES.POT, containerType, contents);
    },
    getEmptyType: function() {
      return POT_TYPES.EMPTY
    },
    getTypes: function() {
      return POT_TYPES;
    },
    createContainer: function(world, containerType, newContents) {
      return new Pot(world, containerType, newContents)
    }
  });
  
  function mix(a, b) {
    if(a.type == INGREDIENT_TYPES.BOWL) {
      return mixContainer(a, b);
    } else if(b.type == INGREDIENT_TYPES.BOWL) {
      return mixContainer(b, a);
    } else if(a.type == INGREDIENT_TYPES.POT) {
      return mixContainer(a, b);
    } else if(b.type == INGREDIENT_TYPES.POT) {
      return mixContainer(b, a);
    } else {
      return null;
    }
  }
  
  function mixContainer(container, other) {
    if(container.canAddIngredient(other)) {
      return container.addIngredient(other);
    } else {
      return null;
    }
  }
  
  function toCookingIngredient(world, original) {
    if(original.type === INGREDIENT_TYPES.BOWL) {
      return new Bowl(world, BOWL_TYPES.EMPTY, new util.Map());
    } else if(original.type === INGREDIENT_TYPES.POT) {
      return new Pot(world, POT_TYPES.EMPTY, new util.Map());
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