import BaseProcess from './BaseProcess'
import C from '/include/constants'
import map from 'lodash-es/map'
import each from 'lodash-es/each'
import invoke from 'lodash-es/invoke'
import filter from 'lodash-es/filter'

export default class Colony extends BaseProcess {
  constructor(context) {
    super(context)
    this.context = context
    this.kernel = context.queryPosisInterface('baseKernel')
    this.segments = context.queryPosisInterface('segments')
  }

  get rooms() {
    this.memory.rooms = this.memory.rooms || {}
    return this.memory.rooms
  }

  run() {
    each(Game.rooms, (room, name) => {
      let homeOrRemote
      if(room.controller.my){
        homeOrRemote = room.controller.my
      } else if(room.controller.reservation){
        if(room.controller.reservation.username == C.USERNAME) homeOrRemote = true
        else homeOrRemote = false
      }
      console.log(`${room.controller}  ${homeOrRemote}`)
      if (!room.controller || !homeOrRemote) return
      if (!this.rooms[name]) {
        this.rooms[name] = {}
      }
    })
    each(this.rooms, (Room, room) => {
      let proc = this.kernel.getProcessById(Room.pid)
      if (!Game.rooms[room] || !Game.rooms[room].controller || !Game.rooms[room].controller.my) {
        if (proc) {
          this.kernel.killProcess(Room.pid)
        }
        delete this.rooms[room]
      }
      if (!proc) {
        this.log.info(`Room not managed, beginning management of ${room}`)
        let {
          pid
        } = this.kernel.startProcess('JuicedProcesses/Room', {
          room
        })
        Room.pid = pid
      }
    })
    let want = Math.max(1, this.rooms.length / 2)
    for (let i = 0; i < want; i++) {
      let cid = this.ensureCreep(`creep_${i}`, {
        rooms: map(filter(Game.rooms, r => r.controller && r.controller.my), 'name'),
        body: [
          [TOUGH, MOVE]
        ],
        priority: 10
      })
      this.ensureChild(`creep_${i}_${cid}`, 'JuicedProcesses/stackStateCreep', {
        spawnTicket: cid,
        base: ['scout']
      })
    }
    if (Game.flags.claim) {
      if (Game.gcl.level > Game.spawns.length) {
        let {
          pos: {
            x,
            y,
            roomName
          }
        } = Game.flags.claim
        let room = Game.rooms[roomName]
        if (room && room.controller.my) {
          invoke(room.find(FIND_HOSTILE_STRUCTURES), 'destroy')
          invoke(room.find(FIND_HOSTILE_CONSTRUCTION_SITES), 'remove')
          Game.flags.claim.remove()
        } else {
          let cid = this.ensureCreep(`claimer_${roomName}`, {
            rooms: [roomName],
            body: [
              [MOVE, CLAIM]
            ],
            priority: 10
          })
          this.ensureChild(`claimer_${roomName}_${cid}`, 'JuicedProcesses/stackStateCreep', {
            spawnTicket: cid,
            base: ['claimer', {
              x,
              y,
              roomName
            }]
          })
        }
      }

      if (Game.flags.reserve) {
        let {
          pos: {
            x,
            y,
            roomName
          }
        } = Game.flags.reserve
        let room = Game.rooms[roomName]
        if (room && room.controller.my) {
          invoke(room.find(FIND_HOSTILE_STRUCTURES), 'destroy')
          invoke(room.find(FIND_HOSTILE_CONSTRUCTION_SITES), 'remove')
          Game.flags.reserve.remove()
        } else {
          let cid = this.ensureCreep(`reserver_${roomName}`, {
            rooms: [roomName],
            body: [
              [MOVE, MOVE, CLAIM, CLAIM]
            ],
            priority: 10
          })
          this.ensureChild(`reserver_${roomName}_${cid}`, 'JuicedProcesses/stackStateCreep', {
            spawnTicket: cid,
            base: ['reserver', {
              x,
              y,
              roomName
            }]
          })
        }
      }

    }
    this.ensureChild('intel', 'JuicedProcesses/intel')
    this.ensureChild('flagManager', 'JuicedProcesses/flagManager', this.context)
    this.sleep.sleep(5)
  }

  interrupt({
    hook: {
      type,
      stage
    },
    key
  }) {
    this.log.info(`INT ${type} ${stage} ${key}`)
  }

  wake() {
    this.log.info('I Have awoken!')
  }

  toString() {
    let rooms = Object.keys(this.rooms)
    return `Rooms: ${rooms.length}`
  }
}