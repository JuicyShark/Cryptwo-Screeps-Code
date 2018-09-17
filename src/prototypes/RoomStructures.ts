// Intra- and inter-tick structure caching, adapted from semperRabbit's IVM module

import { getCacheExpiration } from '../utils/helperFunctions';

var roomStructureIDs: { [roomName: string]: { [structureType: string]: string[] } } = {};
var roomStructuresExpiration: { [roomName: string]: number } = {};

const multipleList = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_WALL,
  STRUCTURE_RAMPART, STRUCTURE_KEEPER_LAIR, STRUCTURE_PORTAL, STRUCTURE_LINK,
  STRUCTURE_TOWER, STRUCTURE_LAB, STRUCTURE_CONTAINER, STRUCTURE_POWER_BANK
];

const singleList = [
  STRUCTURE_OBSERVER, STRUCTURE_POWER_SPAWN, STRUCTURE_EXTRACTOR, STRUCTURE_NUKER
];

const notRepairable: string[] = [STRUCTURE_KEEPER_LAIR, STRUCTURE_PORTAL, STRUCTURE_POWER_BANK];
Room.prototype._refreshStructureCache = function () {
  // if cache is expired or doesn't exist
  if (!roomStructuresExpiration[this.name]
    || !roomStructureIDs[this.name]
    || Game.time > roomStructuresExpiration[this.name]) {
    roomStructuresExpiration[this.name] = getCacheExpiration(50);
    roomStructureIDs[this.name] = _.mapValues(_.groupBy(this.find(FIND_STRUCTURES),
      (s: Structure) => s.structureType),
      (structures: Structure[]) => _.map(structures, s => s.id));
  }
};

multipleList.forEach(function (type) {
  Object.defineProperty(Room.prototype, type + 's', {
    get: function () {
      if (this['_' + type + 's']) {
        return this['_' + type + 's'];
      } else {
        this._refreshStructureCache();
        if (roomStructureIDs[this.name][type]) {
          return this['_' + type + 's'] = _.compact(_.map(roomStructureIDs[this.name][type],
            Game.getObjectById));
        } else {
          return this['_' + type + 's'] = [];
        }
      }
    },
    configurable: true,
  });
});

singleList.forEach(function (type) {
  Object.defineProperty(Room.prototype, type, {
    get: function () {
      if (this['_' + type]) {
        return this['_' + type];
      } else {
        this._refreshStructureCache();
        if (roomStructureIDs[this.name][type]) {
          return this['_' + type] = Game.getObjectById(roomStructureIDs[this.name][type][0]);
        } else {
          return this['_' + type] = undefined;
        }
      }
    },
    configurable: true,
  });
});


Object.defineProperty(Room.prototype, 'storageUnits', {
  get() {
    if (!this._storageUnits) {
      this._storageUnits = _.compact([this.storage, this.terminal]).concat(this.containers);
    }
    return this._storageUnits;
  },
  configurable: true,
});

Object.defineProperty(Room.prototype, 'sources', {
  get() {
    if (!this._sources) {
      this._sources = this.find(FIND_SOURCES);
    }
    return this.find(FIND_SOURCES);
  },
  configurable: true,
});

Object.defineProperty(Room.prototype, 'mineral', {
  get() {
    if (!this._mineral) {
      this._mineral = this.find(FIND_MINERALS)[0];
    }
    return this._mineral;
  },
  configurable: true,
});

Object.defineProperty(Room.prototype, 'repairables', {
  get() {
    if (!this._repairables) {
      this._refreshStructureCache();
      if (roomStructureIDs[this.name]['repairables']) {
        return this._repairables = _.compact(_.map(roomStructureIDs[this.name]['repairables'],
          Game.getObjectById));
      } else {
        let repairables: Structure[] = [];
        for (let structureType of singleList) {
          if (this[structureType]) {
            repairables.push(this[structureType]);
          }
        }
        for (let structureType of multipleList) {
          if (structureType != STRUCTURE_WALL &&
            structureType != STRUCTURE_RAMPART &&
            structureType != STRUCTURE_ROAD &&
            !notRepairable.includes(structureType)) {
            repairables = repairables.concat(this[structureType + 's']);
          }
        }
        roomStructureIDs[this.name]['repairables'] = _.map(repairables, s => s.id);
        return this._repairables = repairables;
      }
    }
    return this._repairables;
  },
  configurable: true,
});
Object.defineProperty(Room.prototype, 'walls', {
  get() {
    return this.constructedWalls;
  },
  configurable: true,
});


