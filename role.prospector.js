
// Consider if it's a good idea to move this to util.constants.js
const STATE_SPAWNING    = 0;
const STATE_MOVING      = 1;
const STATE_MINING      = 2;
const STATE_DEPOSITING  = 3;

let roleProspector = {

    /**
     *  @param {Creep} creep
     */
    run: function (creep)
    {
        if (creep.memory.state === undefined)
        {
            this.init_memory(creep);
        }

        switch (creep.memory.state)
        {
            case STATE_SPAWNING:
                this.do_spawning(creep, {nextState: STATE_MOVING});
                break;
            case STATE_MOVING:
                this.do_move(creep, {context: this.prospector_context});
                break;
            case STATE_MINING:
                this.do_mining(creep, {context: this.prospector_context});
                break;
            case STATE_DEPOSITING:
                this.do_depositing(creep, {context: this.prospector_context});
                break;
        }
    },

    /**
     *
     * @param {Creep} creep
     */
    init_memory: function (creep)
    {
        const mineralSource = creep.room.find(FIND_MINERALS);
        creep.memory.mineralId   = mineralSource[0].id; // Deposit Id
        creep.memory.mineralType = mineralSource[0].mineralType;
        creep.memory.mineralPos  = mineralSource[0].pos;
        creep.memory.targetPos   = mineralSource[0].pos;

        // TODO: Cache fixed/best path here.

        creep.memory.state = STATE_SPAWNING;
    },

    /**
     *
     * @param {Creep} creep
     */
    do_spawning(creep)
    {
        if(creep.spawning)
            return;

        creep.memory.state = STATE_MOVING;
        this.run(creep); // Save a tick
    },

    prospector_context(creep, currentState)
    {
        switch (currentState)
        {
            case STATE_MOVING:
                return (creep.store.getUsedCapacity() === 0) ? {nextState: STATE_MINING}
                                                             : {nextState: STATE_DEPOSITING};
            case STATE_MINING:
                // Check if it's a good idea to take it to the terminal right away.
                creep.memory.targetPos = this.get_prospector_deposit_target(creep);
                return {nextState: STATE_MOVING};

            case STATE_DEPOSITING:
                creep.memory.targetPos = this.get_prospector_mineral_target(creep);
                return {nextState: STATE_MOVING};
        }

    },

    /**
     *
     * @param {Creep} creep
     * @return {Position}
     */
    get_prospector_mineral_target: function(creep)
    {
        return creep.memory.mineralPos;
    },

    /**
     *
     * @param {Creep} creep
     * @return {Position}
     */
    get_prospector_deposit_target(creep)
    {
        if (creep.room.terminal !== undefined)
            return creep.room.terminal.pos;
        else
            return creep.room.storage.pos;
    },

    /**
     *
     * @param {Creep} creep
     * @param {Object} options
     */
    do_move(creep, options)
    {
        const targetPos = new RoomPosition(creep.memory.targetPos.x,
                                           creep.memory.targetPos.y,
                                           creep.memory.targetPos.roomName);

        // Has the creep arrived?
        if(creep.pos.getRangeTo(targetPos) <= 1)
        {
            creep.memory.state = options.context ? this.prospector_context(creep, STATE_MOVING).nextState
                                                 : options.nextState;
            this.run(creep);
            return;
        }

        // Not there yet? Move.
        if (!creep.fatigue)
            creep.moveTo(targetPos);
    },

    /**
     *
     * @param {Creep} creep
     * @param {Object} options
     */
    do_mining(creep, options)
    {
        const mineralDeposit = Game.getObjectById(creep.memory.mineralId);
        creep.harvest(mineralDeposit);

        if (creep.store.getFreeCapacity() === 0)
        {
            creep.memory.state = options.context ? this.prospector_context(creep, STATE_MINING).nextState
                                                 : options.nextState;
        }
    },

    /**
     *
     * @param {Creep} creep
     * @param {Object} options
     */
    do_depositing(creep, options)
    {
        const targetPos = new RoomPosition(creep.memory.targetPos.x,
                                           creep.memory.targetPos.y,
                                           creep.memory.targetPos.roomName);

        const structures = targetPos.lookFor(LOOK_STRUCTURES);
        if (structures.length === 0)
        {
            creep.say("PANIC");
            return;
        }

        let depositTarget = null;
        for (let i = 0; i < structures.length; ++i)
        {
            if (structures[i].structureType === STRUCTURE_STORAGE ||
                structures[i].structureType === STRUCTURE_TERMINAL ||
                structures[i].structureType === STRUCTURE_LAB)
            {
                depositTarget = structures[i];
            }
        }

        if (depositTarget === null)
        {
            creep.say("PANIC2");
            return;
        }

        const transferResult = creep.transfer(depositTarget, creep.memory.mineralType);
        if (transferResult !== OK)
        {
            creep.say("> " + transferResult);
            return;
        }

        // Avoid dropping precious metal to the group. Check if it's possible to repair the creep.
        if (creep.ticksToLive < 200)
        {
            creep.suicide();
        }

        creep.memory.state = options.context ? this.prospector_context(creep, STATE_DEPOSITING).nextState
                                             : options.nextState;
    },
};

module.exports = roleProspector;