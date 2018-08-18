require("prototype.spawn")
var config = require("config")
require("prototype.roomBrain")

Room.prototype.tick = function() {
  if (this.isMine()) {
    this.initCreeps();
    if (!this.memory.timer || this.memory.timer % 60 === 0) {
      this.memory.timer = -1;
      this.memoryInit();

      this.memory.timer = 60;
      console.log(this.name + " Timer has been reset")
    }
    // load things needed each tick without if statement
    this.loadSource();
    this.loadConstructionSites();

    if (this.memory.timer % 30 == 0) {
      this.initSource();
      this.createNeeds();
    var availableBuilder = this.findBuilder()
      if (availableBuilder != null) {
        for(let i in availableBuilder){
          var newTask = this.filterTasks("BUILD")
          console.log(availableBuilder[i]);
          console.log(availableBuilder[i].memory.task)
        availableBuilder[i].memory.task.push(newTask)
}
      }
    }
    --this.memory.timer;
  }
// Room is not Ours
  else {
    this.processAsGuest();
  }
}




Room.prototype.createNeeds = function() {
  var spawns = this.find(FIND_MY_SPAWNS)
  var spawn = spawns[0];
  if (this.needBasicWorker()) {
    spawn.spawnHarvester("n/a", "n/a")
  } else if (this.needLorry()) {
    let longDistance = false
    spawn.spawnLorry(longDistance) // false meaning long distance or not
  } else if (this.needContainerMiner()) {

      //  spawn.spawnContainerMiner(this.memory.sourceNodes[i].id)
      }

   else if (this.needUpgrader()) {
    spawn.spawnUpgrader()
  } else if (this.needBuilder()) {
    spawn.spawnBuilder()
  } else if (this.needRepairer()) {
    spawn.spawnRepairer()
  } else if (this.needDefender()) {
    spawn.spawnDefender()
  }

  else if (this.needSourceScouts()) {
    let theReturned = this.needSourceScouts()
    let roomName = theReturned[0]
    let flag = theReturned[1]
    spawn.spawnHarvester(roomName, flag.name)
  } else {
    console.log("Needs have been Met!")
    console.log(this.energyAvailable + "/" + this.energyCapacityAvailable + " Is the energy Capacity of the room")
  }
}


// need to start applying types to creeps based on body bodyParts
// need to create a legend of types and what tasks they are most suitable for
Room.prototype.initCreeps = function() {
  this.creepsAllRound = this.find(FIND_MY_CREEPS, {
    filter: {
      memory: {
        type: "ALL_ROUND"
      }
    }
  });
}

Room.prototype.memoryInit = function() {
  if(!this.memory.taskList){
    this.memory.taskList = []
  }
  this.initStructures();
  this.initContainers();
  this.initConstructionSites();
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

Room.prototype.initSource = function() {
  if (!this.memory.sourceNodes) {
    this.memory.sourceNodes = {}
  }
  for (let source of this.find(FIND_SOURCES)) {
    if (!this.memory.sourceNodes[source.id]) {
      this.memory.sourceNodes[source.id] = {
        id: source.id
      }
    }
    this.memory.hostileSpawns = this.find(STRUCTURE_KEEPER_LAIR);
    let miners = this.find(FIND_MY_CREEPS, {
      filter: {
        memory: {
          task: {details: {sourceId: source.id}}
        }
      }
    });
    this.memory.sourceNodes[source.id].miners = miners.length
    if (!this.memory.sourceNodes[source.id].toBuild) {
      this.memory.sourceNodes[source.id].toBuild = config.buildingLevels.sources;
    }
    if (!this.memory.sourceNodes[source.id].container) {

      let containers = this.find(FIND_STRUCTURES, {
       filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1)
   });
      console.log(containers)
      this.memory.sourceNodes[source.id].container = containers[0].id;
    }
  }

}

Room.prototype.loadSource = function() {
  this.sourceNodes = {};
  for (let id in this.memory.sourceNodes) {

    this.sourceNodes[id] = Game.getObjectById(id)
  }
  this.hostileSpawns = [];
  for (let i in this.memory.hostileSpawns) {
    this.hostileSpawns[i] = Game.getObjectById(i.id)
  }
}

Room.prototype.initStructures = function() {
  if (!this.memory.structureIDs) {
    this.memory.structureIDs = config.defaultMem.RoomStructureMem;
  }
}

Room.prototype.initContainers = function() {
  var containers = this.find(FIND_STRUCTURES, {
    filter: {
      structureType: STRUCTURE_CONTAINER
    }
  });
  if (containers) {
    for (let i in containers) {
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
  for (let i in this.constructionSites) {
    this.memory.constructionSites[i] = this.constructionSites[i].id
    this.initConstructionTasks(this.constructionSites[i].id )
  }
};

Room.prototype.initConstructionTasks = function(constructionSite){
  details = {target: constructionSite};

  this.createTask("BUILD", "ALL_ROUND", 3, details)
}
Room.prototype.loadConstructionSites = function() {
  this.constructionSites = [];
  for (let i in this.memory.constructionSites) {
    this.constructionSites[i] = (Game.getObjectById(this.memory.constructionSites[i]));
  }
};




/** @function ConvertsToLocation
    @param {string} RoomName
    @return {X:"", Y:""}*/
Room.prototype.getRoomLocation = function(roomName) {
  let temp1 = [];
  let thisString = roomName.split("");
  for (let i = 0; i < thisString.length; i++) {
    let result = thisString[i];
    if (result == "W" || result == "S") {
      temp1.push("-")
    } else if (result == "E" || result == "N") {
      temp1.push("+")
    } else {
      temp1.push(result)
    }
  }
  let temp2 = temp1.join("");
  let outX = temp2.slice(0, 3);
  let outY = temp2.slice(3, 6)
  var output = {
    x: outX,
    y: outY
  }
  return output;
}
