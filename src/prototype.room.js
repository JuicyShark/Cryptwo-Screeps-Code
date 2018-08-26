require("prototype.spawn")
var config = require("config")
require("prototype.roomBrain")
require("prototype.finder")

Room.prototype.tick = function() {

  if (this.isMine()) {
    if (!this.memory.timer || this.memory.timer % 60 === 0) {
      this.memory.timer = -1;
      this.memoryInit();
      this.memory.timer = 60;
      console.log(this.name + " Timer has been reset")
    }
      this.loadSource();
    if (this.memory.timer % 15 == 0) {
      this.initCreeps();
    }
    if (this.memory.timer % 16 == 0) {
      this.constantTasks();
      this.createNeeds();
    }
   this.loadContainers();
    this.loadConstructionSites();
  //  console.log("YEP")

    --this.memory.timer;
  }
  // Room is not Ours
  else {
    this.processAsGuest();
  }
}
Room.prototype.createNeeds = function() {
  var spawns = this.memory.structureIDs.Spawns
  if (spawns.length > 0) {
    var spawn = Game.getObjectById(spawns[0]);
    console.log(this.energyAvailable + "/" + this.energyCapacityAvailable + " Is the Current Energy @ " + this.name)
    var logger = function(text, text2){
      //console.log(text);
      //console.log(text2);
    }
    if (this.findType("ALL_ROUND").length == 0) {
      spawn.spawnBasicAllRounder()
    } else if (this.needBasicWorker()) {
      logger(this.needBasicWorker(), "Basic HERE!")
      spawn.spawnAllRounder()
    } else if (this.needLorry()) {
      logger(this.needLorry(), " Lorry HERE!")
      spawn.spawnLorry()
    } else if (this.needUpgrader()) {
      logger(this.needUpgrader(), " Upgrader HERE!")
      spawn.spawnUpgrader()
    } else if (this.needContainerMiner()) {
      logger(this.needContainerMiner(), " Container HERE!")
      spawn.spawnContainerMiner()
    } else {
      console.log("Needs have been Met!")
      console.log(this.energyAvailable + "/" + this.energyCapacityAvailable + " Is the energy Capacity of the room")
    }
  }
}


// need to start applying types to creeps based on body bodyParts
// need to create a legend of types and what tasks they are most suitable for
/*Legend can go in config file? */
Room.prototype.initCreeps = function() {
  if (!this.memory.creepsByType) {
    this.memory.creepsByType = config.defaultMem.creepTypes
  }
  let output = [];
     Object.keys(this.memory.creepsByType).forEach(i => {
    let list = this.memory.creepsByType[i]

    list.creeps = []
    let findCreeps = this.findType(list.type)
    for (var a = 0; a < findCreeps.length; a++) {
      var thisCreep = Game.getObjectById(findCreeps[a].id)
      if (thisCreep instanceof Creep) {
        if (thisCreep.memory.type == list.type) {
          list.creeps.push(thisCreep.id)

        }
      }
    }
  })
}
Room.prototype.memoryInit = function() {
  if (!this.memory.taskList) {
    this.memory.taskList = []
  }
  this.initStructures();
  this.initContainers();
  this.initConstructionSites();
  this.initSource();
  this.sourceNodesLoop();
}
Room.prototype.initStructures = function() {

  if (!this.memory.structureIDs) {
    this.structures = this.find(FIND_MY_STRUCTURES);
    this.memory.structureIDs = config.defaultMem.RoomStructureMem;
    let mem = this.memory.structureIDs;
    for (var i = 0; i < this.structures.length; i++) {
      if (this.structures[i].structureType == "tower") {
        mem.Towers.push(this.structures[i].id)
      }
      if (this.structures[i].structureType == "spawn") {
        mem.Spawns.push(this.structures[i].id)
      }
      if (this.structures[i].structureType == "extension") {
        mem.Extensions.push(this.structures[i].id)
      }
      if (this.structures[i].structureType == "road") {
        mem.Roads.push(this.structures[i].id)
      }
    }
    mem.controller.id = this.controller.id;
  }
}
Room.prototype.initContainers = function() {
  var containers = this.find(FIND_STRUCTURES, {
    filter: {
      structureType: STRUCTURE_CONTAINER
    }
  });
  if (containers) {
    for (var i = 0; i < containers.length; i++) {
      if (containers[i] instanceof StructureContainer) {
        this.memory.structureIDs.Containers[i] = containers[i].id
      } else {
        console.log('Container is not instanceof SturctureContainer')
        containers.splice(i);
      }
    }
  }
}
Room.prototype.initConstructionSites = function() {
  this.memory.constructionSites = [];
  this.constructionSites = this.find(FIND_CONSTRUCTION_SITES)
  for (var i = 0; i < this.constructionSites.length; i++) {
    this.memory.constructionSites[i] = this.constructionSites[i].id
    this.initConstructionTasks(this.constructionSites[i])
  }
}
Room.prototype.initConstructionTasks = function(constructionSite) {
  let siteType = constructionSite.structureType

  let priorityList = Object.entries(config.taskPriorities.constructionSites)
  for (let i = 0; i < priorityList.length; i++) {
    let sortingType = priorityList[i]
    if (siteType == sortingType[0]) {
      let selectedPriority = sortingType[1];
      details = {
        target: constructionSite.id
      };
      this.createTask("BUILD", "ALL_ROUND", selectedPriority, details)
    }
  }
}
Room.prototype.initSource = function() {
  this.memory.hostileSpawns = this.find(STRUCTURE_KEEPER_LAIR);
  if (!this.memory.sourceNodes) {
    this.memory.sourceNodes = {}
  }
  var sources = this.find(FIND_SOURCES)
  for (var i = 0; i < sources.length; i++) {
    var source = sources[i]
    if (!this.memory.sourceNodes[source.id]) {
      this.memory.sourceNodes[source.id] = {
        id: source.id,
        toBuild: config.buildingLevels.sources,
        container: null
      }
    }
    if (this.memory.sourceNodes[source.id].container == null) {
      let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER
      });
      if (containers != null || containers != undefined) {
        this.memory.sourceNodes[source.id].container = containers[0].id;
      }
    }
  }
}
Room.prototype.level = function() {
  if (this.isMine()) {
    return this.controller.level
  } else {
    return 0
  }
}
Room.prototype.safeGuardUp = function() {
  console.log("ENEMYSPOTTED!")
  this.saveLog(EnemySafeMode)
  this.controller.activateSafeMode()
}
Room.prototype.saveLog = function(type) {
  if (!this.memory.log) {
    this.memory.log = {}
    if (type == "EnemySafeMode") {
      let gameTime = Game.time
      this.memory.log.gameTime = Config.defaultLogs.EnemyInRoom + Config.defaultLogs.SafeModeActivate;
    }
  }
}

Room.prototype.loadSource = function() {
  this.sourceNodes = []
  Object.keys(this.memory.sourceNodes).forEach(id => {
    this.sourceNodes.push(Game.getObjectById(id))
  })
  this.hostileSpawns = [];
  for (var i = 0; i < this.memory.hostileSpawns.length; i++) {
    this.hostileSpawns.push(Game.getObjectById(this.hostileSpawns[i].id))
  }
}

Room.prototype.loadContainers = function() {
  this.containers = [];
  for (var id = 0; id < this.memory.structureIDs.Containers.length; id++) {
    this.containers[id] = (Game.getObjectById(this.memory.structureIDs.Containers[id]));
  }
}

Room.prototype.loadConstructionSites = function() {
  this.constructionSites = [];
  for (var i = 0; i < this.memory.constructionSites.length; i++) {
    this.constructionSites[i] = (Game.getObjectById(this.memory.constructionSites[i]));
  }
};
