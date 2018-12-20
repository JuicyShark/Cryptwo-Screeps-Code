import { GameCache } from "utils/caching/gameCache";

// RoomObject prototypes
Object.defineProperty(RoomObject.prototype, 'ref', { // reference object; see globals.deref (which includes Creep)
    get: function () {
        return this.id || this.name || '';
    },
    configurable: true,
});

Object.defineProperty(RoomObject.prototype, 'targetedBy', { // List of creep names with tasks targeting this object
    get: function () {
        GameCache.checkCache()
        return _.map(Game.TargetCache.targets[this.ref], name => Game.creeps[name]);
    },
    configurable: true,
});

Source.prototype.hasMiner = function () {
    var creepsByMiners: Creep[] | undefined = this.room.creepsByType.Miner;
    var anyMiners: Creep | undefined = this.pos.findClosestByLimitedRange(creepsByMiners, 3)
    var found: boolean = false
    if (anyMiners != undefined) {
        found = true;
    } else if (anyMiners == undefined) {
        if (creepsByMiners != undefined) {
            creepsByMiners.forEach(function (creep: Creep) {
                if (this.hasContainer != false && creep.memory.myContainer == this.hasContainer.id) {
                    found = true;
                }
            }, this)
        }
    } else if (this.targetedBy.length >= 1) {
        this.targetedBy.foreach(function (creep: Creep) {
            if (creep.memory.type == "Miner") {
                return true;
            }
        })
    }
    return found
}
Source.prototype.hasContainer = function () {
    if (this.pos.findClosestByLimitedRange(this.room.containers, 2)) {
        return this.pos.findClosestByLimitedRange(this.room.containers, 2);
    }
    else {
        return false;
    }
};

RoomObject.prototype.serialize = function (): protoRoomObject {
    let pos: protoPos = {
        x: this.pos.x,
        y: this.pos.y,
        roomName: this.pos.roomName
    };
    return {
        pos: pos,
        ref: this.ref
    };
};
