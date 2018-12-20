
import { getCacheExpiration } from '../utils/helperFunctions';
import { ColonyHub } from '../roomTypes/colony_Hub'
import { Outposts } from '../roomTypes/outposts'

const RECACHE_TIME = 2500;
const OWNED_RECACHE_TIME = 1000;


export class RoomBrain {
    /* Records all info for permanent room objects, e.g. sources, controllers, etc. */
    private static recordPermanentObjects(room: Room): void {
        let savedSources: SavedSource[] = [];
        for (let source of room.sources) {
            let container = source.pos.findClosestByLimitedRange(room.containers, 2);
            let miners: boolean | undefined;
            if (source.pos.findClosestByLimitedRange(room.creepsByType.Miner, 1)) {
                miners = true
            } else {
                miners = undefined
            }
            savedSources.push({
                c: source ? source.pos.coordName : undefined,
                contnr: container ? container.pos.coordName : undefined,
                miner: source ? source.hasMiner() : false

            });
        }
        room.memory.src = savedSources;
        room.memory.ctrl = room.controller ? {
            c: room.controller.pos.coordName,
            level: room.controller.level,
            owner: room.controller.owner ? room.controller.owner.username : undefined,
            res: room.controller.reservation,
            SM: room.controller.safeMode,
            SMavail: room.controller.safeModeAvailable,
            SMcd: room.controller.safeModeCooldown,
            prog: room.controller.progress,
            progTot: room.controller.progressTotal
        } : undefined;
        room.memory.mnrl = room.mineral ? {
            c: room.mineral.pos.coordName,
            density: room.mineral.density,
            mineralType: room.mineral.mineralType
        } : undefined;
        room.memory.SKlairs = _.map(room.keeperLairs, lair => {
            return { c: lair.pos.coordName };
        });
        if (room.controller && room.controller.owner) {
            room.memory.importantStructs = {
                towers: _.map(room.towers, t => t.pos.coordName),
                spawns: _.map(room.spawns, s => s.pos.coordName),
                storage: room.storage ? room.storage.pos.coordName : undefined,
                terminal: room.terminal ? room.terminal.pos.coordName : undefined,
                walls: _.map(room.walls, w => w.pos.coordName),
                ramparts: _.map(room.ramparts, r => r.pos.coordName),
            };
        } else {
            room.memory.importantStructs = undefined;
        }
        room.memory.roomPos = room.getRoomLocation(room.name)
        room.memory.tick = Game.time;

    }

    /** Room Timer
     *
     * @param room Room
     */
    static runTimer(room: Room): void {
        if (room.towers != undefined && room.towers.length != 0) {
            room.towers.forEach(tower => (tower.run()))
        }
        if (room.hostiles != undefined && room.hostiles.length >= 1) {
            //room.defend
            //CombatBrain.defendeRoom(room)
        }
        if (!room.memory.timer || room.memory.timer == 0) {
            if (room.memory.log != undefined && room.memory.log.length >= 30) {
                delete room.memory.log;
                room.memory.log = [];
            }
            else if (room.memory.log == undefined) {
                room.memory.log = [];
            }
            room.memory.timer = 60;
        }
        // Removed timers update.
        //console.log(room.name + " Timer: " + room.memory.timer)
        room.memory.timer--
    }

    /**
     *
     * @param roomName string
     */
    static roomReservedBy(roomName: string): string | undefined {
        if (Memory.rooms[roomName] && Memory.rooms[roomName].ctrl && Memory.rooms[roomName].ctrl!.res) {
            if (Game.time - (Memory.rooms[roomName].tick || 0) < 10000) { // reservation expires after 10k ticks
                return Memory.rooms[roomName].ctrl!.res!.username;
            }

        }
    }
    /**RoomBrain.run(room)
     * Records permanetObjs and Refresh the cache.
     * Then runs room Timer
     */
    static run(room: Room): void {

        // Record location of permanent objects in room and recompute score as needed
        if (!room.memory.expiration || Game.time > room.memory.expiration) {
            this.recordPermanentObjects(Game.rooms[room.name]);

            // Refresh cache
            let recacheTime = room.owner ? OWNED_RECACHE_TIME : RECACHE_TIME;
            room.memory.expiration = getCacheExpiration(recacheTime, 250);
        }

        this.runTimer(room)

    }
    /**
     * @param Colony colony Object
     * Runes all the room Types. Currently only ColonyHub Exists.
     */

    static setRoomTasks(Colony: Colony) {
        let roomTypes = {
            ["ColonyHub"]: ColonyHub,
            ["Outpost"]: Outposts

        }

        for (let room in Game.rooms) {
            if (Game.rooms[room].RoomTask == null) {
                //initiate the newRoomTask
                if (Game.rooms[room].roomType) {
                    roomTypes[Game.rooms[room].roomType].newRoomTask(Colony, Game.rooms[room])
                } else {
                    console.log(Game.rooms[room].roomType)
                }
            }
        }

    }

}

