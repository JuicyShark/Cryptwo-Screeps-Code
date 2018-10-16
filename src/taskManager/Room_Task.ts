import { initializeRoomTask } from '../utils/initializer'

export abstract class RoomTask implements RTask {

    static taskName: string;


    name: string;
    _room: Room;
    room: Room
    _parent: RTask | null;
    tick: number;
    settings: RoomTaskSettings;
    options: RoomTaskOptions;
    data: RoomTaskData | SpawnTaskData;
    constructor(taskName: string, data: RoomTaskData, options = {} as RoomTaskOptions) {
        this.name = taskName;
        this._parent = null;
        this.settings = {
            timeout: 20
        }
        _.defaults(options, {

        });
        this.tick = Game.time;
        this.options = options;
        this.data = data;
    }

    get proto(): protoRoomTask {
        return {
            name: this.name,
            _room: this._room,
            _parent: this._parent,
            options: this.options,
            data: this.data,
            tick: this.tick,
        }
    }

    set proto(protoRoomTask: protoRoomTask) {
        this._parent = protoRoomTask._parent;
        this.options = protoRoomTask.options;
        this.data = protoRoomTask.data;
        this.tick = protoRoomTask.tick;
    }

    get parent(): RTask | null {
        return (this._parent ? initializeRoomTask(this._parent) : null)
    }
    set parent(parentTask: RTask | null) {
        this._parent = parentTask ? parentTask.proto as RTask : null;

        if (this.room) {
            this.room.RoomTask = this as RTask | null;
        }
    }

    get manifest(): RTask[] {
        let manifest: RTask[] = [this];
        let parent = this.parent;
        while (parent) {
            manifest.push(parent);
            parent = parent.parent;
        }
        return manifest;
    }

    // Test every tick to see if task is still valid
    abstract isValidRoomTask(): boolean;

    isValid(): boolean {
        let validRoomTask = false;
        if (this.data) {
            validRoomTask = this.isValidRoomTask();
        }
        if (validRoomTask) {
            return true;
        } else {
            // Switch to parent task if there is one
            this.finish();
            return this.parent ? this.parent.isValid() : false;
        }
    }

    run(): number | null {
        if (this.isValid) {
            //Execute this each Tick
            let result = this.work();
            if (result == OK) {
                this.finish();
            }
            return result;
        }
        else {

        }
    }

    abstract work(): number;

    finish(): void {
        if (this._room) {
            Game.rooms[this._room.name].RoomTask = this._parent
        } else if (!this._room) {
            Game.rooms[this.data.roomName].RoomTask = this._parent

        }

    }
}
