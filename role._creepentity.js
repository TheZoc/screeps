//////////////////////////////////////////////////////////////////////////////
// role._creepEntity
// This file defines the common features for a creep, like spawning and moving.
//
// This class shouldn't be used on it's own, needing to be extended to define
// the various possible creeps behaviors.
//////////////////////////////////////////////////////////////////////////////

global.Creeps = new Map();

class CreepEntity
{
    /**
     * Constructor of the base class for the creeps
     *
     * @param {Creep} creep
     */
    constructor(creep)
    {
        // Initialize member variables
        this.name = creep.name;
        this.type = this.constructor.name;
        this.instance = creep;
        this.memory = Memory.creeps[creep.name];

        // Hopefully, in a near future, have a task management system
        // this.task = undefined;
        // this.target = undefined;

        Creeps.set(this.name, this);
        //this.room = Game.rooms[this.memory.room];


        //this.init();
    }

    /**
     * Runs the main logic for the creep.
     * This should be overridden in the derived classes, calling this base class version right away.
     * and implementing the custom behavior if it's not handled correctly here.
     *
     * @return {boolean} Returns if the current state was handled or not.
     */
    run()
    {
        if (this.memory.state === undefined)
            this.initMemory();

        switch (this.memory.state)
        {
            case CreepEntity.STATE_SPAWNING:
                this.runSpawning();
                return true;
            case CreepEntity.STATE_MOVING:
                this.runMove();
                return true;
            case CreepEntity.STATE_IDLE:
                this.runIdle();
        }

        return false;
    }

    /**
     *  Initialize the memory for the creep.
     *
     *  e.g. Get the first target for the role. (For derived creeps)
     */
    initMemory()
    {
        this.memory.state = CreepEntity.STATE_SPAWNING;
    }

    /**
     * This function returns the next state the creep should transition to, based
     * on the current state.
     *
     * Override this in derived creep classes.
     * @param {Object} optional - Optional parameter with extra data for the state change
     */
    calcNextState(optional = {})
    {
        const currentState = this.memory.state;
        switch (currentState)
        {
            case CreepEntity.STATE_SPAWNING:
                this.memory.state = CreepEntity.STATE_MOVING;
                return;
            case CreepEntity.STATE_MOVING:
                console.log("[ERROR] Going idle from State Moving. - Current state: " + currentState);
                this.memory.state = CreepEntity.STATE_IDLE;
                return;
        }

        // Something went wrong...
        console.log("[ERROR] Going idle - Current state: " + currentState);
        this.memory.state = CreepEntity.STATE_IDLE;
    }

    /**
     * What the creep should do while spawning.
     * By default, it just idle until the spawn is complete, and to the next state supplied by calcNextState()
     */
    runSpawning()
    {
        if (this.instance.spawning)
            return;

        this.calcNextState();
        this.run(); // Save a tick
    }

    /**
     * This function moves the creep until it's 1 cell away from the target.
     * Then, it uses calcNextState() to get the next appropriate state.
     */
    runMove()
    {
        const targetPos = new RoomPosition(this.memory.targetPos.x,
                                           this.memory.targetPos.y,
                                           this.memory.targetPos.roomName);

        // Has the creep arrived?
        if (this.instance.pos.getRangeTo(targetPos) <= 1)
        {
            this.calcNextState();
            this.run();
            return;
        }

        // Not there yet? Move.
        if (!this.instance.fatigue)
            this.instance.moveTo(targetPos, {visualizePathStyle: {stroke: '#ffffff'}});
    }

    /**
     * This function, for the base class, only displays the message "🧟Panic" and stops the creep from doing anything else.
     * This should be overridden in derived classes, without calling the base class function, if the creep is expected to idle.
     */
    runIdle()
    {
        this.instance.say("🧟 PANIC");
    }

    /**
     * This function moves the creep to the exact destination.
     * It must be only used with free spaces as a target (i.e. spaces that the creep can move on).
     */
    runExactMove()
    {
        const targetPos = new RoomPosition(this.memory.targetPos.x,
                                           this.memory.targetPos.y,
                                           this.memory.targetPos.roomName);

        if (this.instance.pos === targetPos)
        {
            this.calcNextState();
            this.run();
            return;
        }

        // Not there yet? Move.
        if (!this.instance.fatigue)
            this.instance.moveTo(targetPos, {visualizePathStyle: {stroke: '#ffffff'}});
    }
}

// Creep states
CreepEntity.STATE_SPAWNING = 0;
CreepEntity.STATE_IDLE     = 1;
CreepEntity.STATE_MOVING   = 2;

global.CreepEntity = CreepEntity;
global.CreepType = {};
