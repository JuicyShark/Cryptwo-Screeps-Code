
var tasks = {

  upgradeTask: function(creep) {

    if(creep.memory.task.name == "UPGRADE"){
    creep.checkDeath();
    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = "true";
    }
    if (creep.carry.energy == 0) {
      creep.memory.working = "false";
    }
    if (creep.carry.energy != creep.carryCapacity && creep.memory.working == "false") {
      creep.getEnergy(true, true)
    }
    if (creep.carryCapacity != 0 && creep.memory.working == "true") {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.ourPath(creep.room.controller);
      }
    }
  }},

  repairTask: function(creep) {
    creep.checkDeath(creep)

    if (creep.carry.energy == creep.carryCapacity) {
      creep.memory.working = "true";
    }
    if (creep.carry.energy == 0) {
      creep.memory.working = "false";
    }
    if (creep.carry.energy != 0 && creep.memory.working == "true") {
      var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
      });
      if (structure == undefined) {
        structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (s) => s.hits < s.hitsMax && s.structureType == STRUCTURE_WALL ||
            s.structureType == STRUCTURE_CONTAINER ||
            s.structureType == STRUCTURE_EXTENSION
        });
      }
      if (creep.repair(structure) == ERR_NOT_IN_RANGE && structure != undefined) {
        creep.ourPath(structure);
      }
    } else if (creep.memory.working == "false") {
      creep.getEnergy(true, true)
    }
  },

  harvestTask: function(creep) {

    creep.checkDeath();
      if(creep.room.name == creep.memory.home) {
    var taskSource = Game.getObjectById(creep.memory.task.details.target)
    if (creep.carry.energy == 0) {
      creep.memory.working = "true";
    }
    if (creep.memory.working == "false") {
      creep.findDeliveryTarget()
    }
    if (creep.carry.energy != creep.carryCapacity && creep.memory.working == "true") {
      if(creep.harvest(taskSource) == ERR_NOT_IN_RANGE) {
        creep.ourPath(taskSource)
      }
     } else if (creep.carry.energy == creep.carryCapacity && creep.memory.working == "true") {
      creep.memory.working = "false"
    }
  } else if (creep.room.name != creep.memory.home) {
    let getSpawn = Game.getObjectById(Memory.rooms[creep.memory.home].structureIDs.Spawns[0])
    creep.ourPath(getSpawn)
  }
},

  buildTask: function (creep) {
    creep.checkDeath();
    if (creep.memory.working == "false") {
      creep.getEnergy(true, true)
    } else if (creep.memory.working == "true") {
      var  creepTask = creep.memory.task.details.target
        var creepTarget = Game.getObjectById(creepTask);

      if (creepTarget != null) {
        if (creep.build(creepTarget) == ERR_NOT_IN_RANGE) {
          creep.ourPath(creepTarget)
        }
      } else{
        console.log(creep.name + ", Target is nowhere to be found. Removing task");
        creep.memory.task = null;
        creep.room.memory.avaliableCreeps.push(creep.id)
      }
    }
    if (creep.carry.energy == creep.carryCapacity && creep.memory.working == "false") {
     creep.memory.working = "true";
   } else if (creep.carry.energy == 0 && creep.memory.working == "true"){
     creep.memory.working = "false";
   }
  }

}


module.exports = tasks;