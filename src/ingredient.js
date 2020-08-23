import * as util from '/lib/util.js';
import * as component from './component.js';
import * as zoneType from './zoneType.js';

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
  SAUCE_PIZZA: new IngredientType('image/saucePizza'),
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
    for(var i = 0; i < this.components.length; i++) {
      this.components[i].update(time);
    }
  },
  kill: function() {
    for(var i = 0; i < this.components.length; i++) {
      this.components[i].kill();
    }
  },
  init: function() {
    for(var i = 0; i < this.components.length; i++) {
      this.components[i].init();
    }
  }
});

var ContainerType = util.extend(Object, 'BowlType', {
  constructor: function BowlType(graphic, allowed) {
    this.graphic = graphic;
    this.allowed = allowed;
  }
});

function getContainerTypeForIngredient(types, ingredient) {
  var names = Object.getOwnPropertyNames(types);
  for(var i = 0; i < names.length; i++) {
    var value = types[names[i]];
    if(value.allowed !== null && value.allowed.indexOf(ingredient.type) !== -1) {
      return value;
    }
  }
  return null;
}

var MAX_CONTAINER_AMOUNT = 1;

var Container = util.extend(Ingredient, 'Container', {
  constructor: function Container(world, type, containerType, contents) {
    this.constructor$Ingredient(world, type);
    this.containerType = containerType;
    this.contents = contents;
    this.cookedComponent = new component.CookedComponent(world, this.getCookZone());
    this.addComponent(this.cookedComponent);
    this.completeComponent = new component.CompleteComponent(world);
    this.addComponent(this.completeComponent);
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
      return !this.contents.has(other.type) || this.contents.get(other.type) < MAX_CONTAINER_AMOUNT;
    }
  },
  addIngredient: function(other) {
    var newContents = new Map();
    for(var entry of this.contents.entries()) {
      newContents.set(entry[0], entry[1]);
    }
    if(newContents.has(other.type)) {
      newContents.set(other.type, newContents.get(other.type) + 1);
    } else {
      newContents.set(other.type, 1);
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
  },
  getCookZone: function() {
    //abstract
  },
  getCooked: function() {
    return this.cookedComponent.cookTime;
  },
  isComplete: function() {
    return this.completeComponent.isComplete();
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
    return BOWL_TYPES.EMPTY;
  },
  getTypes: function() {
    return BOWL_TYPES;
  },
  createContainer: function(world, containerType, newContents) {
    return new Bowl(world, containerType, newContents);
  },
  getCookZone: function() {
    return zoneType.ZONE_TYPES.WARM;
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
    return POT_TYPES.EMPTY;
  },
  getTypes: function() {
    return POT_TYPES;
  },
  createContainer: function(world, containerType, newContents) {
    return new Pot(world, containerType, newContents);
  },
  getCookZone: function() {
    return zoneType.ZONE_TYPES.STOVE;
  }
});

var SaucePizza = util.extend(Ingredient, 'SaucePizza', {
  constructor: function SaucePizza(world, wellness) {
    this.constructor$Ingredient(world, INGREDIENT_TYPES.SAUCE_PIZZA);
    this.wellnessComponent = new component.WellnessComponent(world, wellness);
    this.addComponent(this.wellnessComponent);
  }
});

var Pizza = util.extend(Ingredient, 'Pizza', {
  constructor: function Pizza(world, wellness) {
    this.constructor$Ingredient(world, INGREDIENT_TYPES.PIZZA);
    this.cookedComponent = new component.CookedComponent(world, zoneType.ZONE_TYPES.OVEN);
    this.addComponent(this.cookedComponent);
    this.wellnessComponent = new component.WellnessComponent(world, wellness);
    this.addComponent(this.wellnessComponent);
    this.originalWellness = wellness;
  },
  isComplete: function() {
    return true;
  },
  update: function(time) {
    this.update$Ingredient(time);
    var cookWellness = Math.abs(this.cookedComponent.cookTime / component.MAX_COOK_TIME) * component.MAX_WELLNESS;
    this.wellnessComponent.wellness = (cookWellness + this.originalWellness) / 2;
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
  } else if(a.type === INGREDIENT_TYPES.SAUCE_PIZZA && b.type === INGREDIENT_TYPES.CHEESE) {
    return new Pizza(a.world, a.wellnessComponent.wellness);
  } else if(a.type === INGREDIENT_TYPES.CHEESE && b.type === INGREDIENT_TYPES.SAUCE_PIZZA) {
    return new Pizza(a.world, b.wellnessComponent.wellness);
  } else {
    return null;
  }
}

function canMakeSaucePizza(a, b) {
  return (a.type === INGREDIENT_TYPES.BOWL && a.containerType === BOWL_TYPES.DOUGH && a.getCooked() !== 0 &&
      b.type === INGREDIENT_TYPES.POT && b.containerType === POT_TYPES.SAUCE && b.getCooked() !== 0) ||
    (b.type === INGREDIENT_TYPES.BOWL && b.containerType === BOWL_TYPES.DOUGH && b.getCooked() !== 0 &&
      a.type === INGREDIENT_TYPES.POT && a.containerType === POT_TYPES.SAUCE && a.getCooked() !== 0);
}

function mixContainer(container, other) {
  if(container.canAddIngredient(other)) {
    return container.addIngredient(other);
  } else if(canMakeSaucePizza(container, other)) {
    var wellness1 = 1 - 2 * Math.abs(container.cookedComponent.cookTime / component.MAX_COOK_TIME - 0.5);
    var wellness2 = 1 - 2 * Math.abs(other.cookedComponent.cookTime / component.MAX_COOK_TIME - 0.5);
    var wellness = (wellness1 + wellness2) / 2;
    return new SaucePizza(container.world, wellness * component.MAX_WELLNESS);
  } else {
    return null;
  }
}

function toCookingIngredient(world, original) {
  if(original.type === INGREDIENT_TYPES.BOWL) {
    return new Bowl(world, BOWL_TYPES.EMPTY, new Map());
  } else if(original.type === INGREDIENT_TYPES.POT) {
    return new Pot(world, POT_TYPES.EMPTY, new Map());
  } else {
    return new Ingredient(world, original.type);
  }
}

function toMovingIngredient(world, original) {
  return new Ingredient(world, original.type);
}

export {
  INGREDIENT_TYPES,
  Ingredient,
  mix,
  toCookingIngredient,
  toMovingIngredient
};