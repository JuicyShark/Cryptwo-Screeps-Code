require('nameGen')
var minRoles = {
  harvester: "1",
  upgrader: "2",
  builder: "1",
  repairer: "0"
}

StructureSpawn.prototype.bodyBuilder = function(role, energy) {
  let outputArray = [];
  let numberOfParts = Math.floor(energy / 200);
  var body = [];

  for (let i = 0; i < numberOfParts; i++) {
    outputArray.push(WORK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    outputArray.push(CARRY);
  }
  for (let i = 0; i < numberOfParts; i++) {
    outputArray.push(MOVE);
  }
  return outputArray
}

StructureSpawn.prototype.newCreepDebug = function(creepRole) {

};

StructureSpawn.prototype.spawnNewCreep = function(bodyParts, role) {
  var name = this.nameGen();
  var testCreep = this.spawnCreep(bodyParts, name, {
    dryRun: true
  });
  if (testCreep == 0) {
    this.spawnCreep(bodyParts, name, {
      memory: {
        role: role,
        working: false
      }
    });
    console.log("Spawning a " + role + ", named " + name);
  } else {
    console.log("Spawn Unsuccesful");
  }
};

StructureSpawn.prototype.findRoleNeeded = function(energy) {
  var canSpawn = false;
  if(!this.memory.totalRoles){
    this.memory.totalRoles = {};
    return this.spawnNewCreep([WORK, CARRY, MOVE], "harvester");
  }
  // Find amount of different roles alive currently
  this.memory.minRoles = minRoles;
  for(var i in this.memory.minRoles){
  this.memory.totalRoles[i] = _.sum(Game.creeps, (c) => c.memory.role == i);
  if(this.room.energyAvailable == energy){
    if (this.memory.totalRoles[i] <= this.memory.minRoles[i] && this.spawning == null) {
     var bodyParts = this.bodyBuilder(i, energy);
     var role = i
    return this.spawnNewCreep(bodyParts, role);
  }
}}
};
