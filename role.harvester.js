// Game.spawns['Spawn1'].spawnCreep([MOVE,WORK,CARRY], 'harvester', {memory: {role: 'harvester', source: 0}});

//require("role._creepentity")

const constants = require("util.constants");

class Harvester extends CreepEntity
{
    // static getParts(room, targetRoom)
    // {
    //     return [WORK, CARRY, MOVE];
    // }

    /**
     * @return {boolean} Returns if the current state was handled or not.
     */
    run()
    {
        const stateHandled = super.run();
        if (stateHandled)
            return stateHandled;

        switch (this.memory.state)
        {
            case Harvester.STATE_MINING:
                this.runMining();
                return true;
            case Harvester.STATE_DEPOSITING:
                this.runDepositing();
                return true;
            case Harvester.STATE_POST_DEPOSIT:
                this.runStatePostDeposit();
                return true;
            case Harvester.STATE_PREPARE_STORAGE:
                this.runPrepareStorage();
                return true;
            case Harvester.STATE_SLOW_BUILD:
                this.runSlowBuild();
                return true;
        }

        return false;
    }


    /**
     *  Initialize the memory for the creep.
     *  e.g. Get the first target for the role.
     */
    initMemory()
    {
        // On the very first ticket, the creep will not have a defined id.
        if (this.instance.id === undefined)
            return;

        super.initMemory();

        const sourceData = this.instance.room.memory.sources[this.memory.source];
        sourceData.harvester = this.instance.id;

        const targetSource = Game.getObjectById(sourceData.id);
        this.memory.sourceId  = targetSource.id;
        this.memory.sourcePos = targetSource.pos;
        this.memory.targetPos = targetSource.pos;
    }

    /**
     * Given the current state, return the next state, while adjusting internal variables for the next state.
     *
     * Important: Since this function is passed as context, `creepEntity` must be supplied with `this` when calling this
     * function internally.
     * (It would be great to find a workaround for this limitation)
     * @param {Object} optional - Optional parameter with extra data for the state change
     */
    calcNextState(optional = {})
    {
        const currentState = this.memory.state;
        switch (currentState)
        {
            case Harvester.STATE_MOVING:
                // This checks if there's a valid deposit structure at the target coordinates.
                let depositToTarget = false;
                const targetPos = new RoomPosition(this.memory.targetPos.x,
                                                   this.memory.targetPos.y,
                                                   this.memory.targetPos.roomName);

                const structures = targetPos.lookFor(LOOK_STRUCTURES);
                for (let i = 0; i < structures.length; ++i)
                {
                    if (structures[i].structureType === STRUCTURE_SPAWN ||
                        structures[i].structureType === STRUCTURE_EXTENSION ||
                        structures[i].structureType === STRUCTURE_STORAGE)
                    {
                        depositToTarget = true;
                        break;
                    }
                }

                this.memory.state = depositToTarget ? Harvester.STATE_DEPOSITING
                                                    : Harvester.STATE_MINING;
                return;

            case Harvester.STATE_MINING:
                this.memory.targetPos = this.getDepositTargetPos();
                this.memory.state = (this.memory.targetPos === undefined) ? Harvester.STATE_PREPARE_STORAGE
                                                                          : Harvester.STATE_MOVING;
                return;

            case Harvester.STATE_DEPOSITING:
                this.memory.state = Harvester.STATE_POST_DEPOSIT;
                return;

            case Harvester.STATE_POST_DEPOSIT:
                // Empty? Go back to mine more
                if (this.instance.store.getUsedCapacity() === 0)
                {
                    this.memory.targetPos = this.getSourceTargetPos();
                    this.memory.state = Harvester.STATE_MOVING;
                    return;
                }

                // Still have some resources? Find a new place to deposit them (Same logic as from STATE_MINING)
                this.memory.targetPos = this.getDepositTargetPos();
                this.memory.state = (this.memory.targetPos === undefined) ? Harvester.STATE_PREPARE_STORAGE
                                                                          : Harvester.STATE_MOVING;
                return;

            case Harvester.STATE_PREPARE_STORAGE:
                this.memory.state = Harvester.STATE_SLOW_BUILD;
                return;

            case Harvester.STATE_SLOW_BUILD:
                // If we detect a structure that can receive resources, we revert to regular harvester behavior.
                this.memory.targetPos = this.getSourceTargetPos();
                this.memory.state = Harvester.STATE_MINING;
                return;
        }

        super.calcNextState();
    }

    /**
     * Returns a viable deposit target, at the moment of running this function.
     * If there is no available place, returns undefined.
     * @return {RoomPosition|undefined}
     */
    getDepositTargetPos()
    {
        if (this.instance.room.storage !== undefined)
            return this.instance.room.storage.pos;

        const targets = this.instance.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType === STRUCTURE_EXTENSION ||
                                    structure.structureType === STRUCTURE_SPAWN) &&
                                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if (targets !== null)
            return targets.pos;

        return undefined;
    }

    /**
     * Returns the source position assigned to this creep.
     * @return {RoomPosition}
     */
    getSourceTargetPos()
    {
        return this.memory.sourcePos;
    }

    /**
     * Execute the harvest action until the creeps is with the store full.
     */
    runMining()
    {
        const source = Game.getObjectById(this.memory.sourceId);
        this.instance.harvest(source);

        if (this.instance.store.getFreeCapacity() === 0)
        {
            this.calcNextState();
            this.run();
        }
    }

    /**
     *
     */
    runDepositing()
    {
        const targetPos = new RoomPosition(this.memory.targetPos.x,
                                           this.memory.targetPos.y,
                                           this.memory.targetPos.roomName);


        const structures = targetPos.lookFor(LOOK_STRUCTURES);
        if (structures.length === 0)
        {
            console.log(this.name + " in Panic: No structure found at target location (1).");
            this.instance.say("PANIC!");
            return;
        }

        let depositTarget = null;
        for (let i = 0; i < structures.length; ++i)
        {
            if (structures[i].structureType === STRUCTURE_SPAWN ||
                structures[i].structureType === STRUCTURE_EXTENSION ||
                structures[i].structureType === STRUCTURE_STORAGE)
            {
                depositTarget = structures[i];
            }
        }

        let validDepositTarget = true;

        if (depositTarget === null)
        {
            console.log(this.name + " in trouble (EEK!): No *VALID* structure found at target location (2).");
            this.instance.say("EEK");
            validDepositTarget = false;
        }

        if (validDepositTarget)
        {
            // If we're here, we have a valid deposit target.
            const transferResult = this.instance.transfer(depositTarget, RESOURCE_ENERGY);
            if (transferResult !== OK && transferResult !== ERR_FULL)
            {
                this.instance.say("> " + transferResult);
                console.log(this.name + " in trouble: transfer failed with error: " + transferResult);
            }
        }

        // This will lead to the state STATE_POST_DEPOSIT, which will only be able to check the state of the
        // creep store in the next stick. Do not use `this.run()` after setting it.
        this.calcNextState();
    }

    /**
     * Since can't evaluate the store in the same tick a deposit operation happens, this
     * function is here as step between ticks and immediately calculates and run the next state.
     */
    runStatePostDeposit()
    {
        this.calcNextState();
        this.run();
    }

    /**
     * This function only runs if there is absolutely no available space to deposit,
     * so the creep starts preparing the container for the static harvesting.
     * After this is done, proceeds to slowly build the container.
     */
    runPrepareStorage()
    {
        const targetPos = new RoomPosition(this.instance.room.memory.sources[this.instance.memory.source].x,
                                           this.instance.room.memory.sources[this.instance.memory.source].y,
                                           this.instance.room.name);
        this.memory.targetPos = targetPos;

        // Check if there is a container in targetPos, and build if there isn't one
        const structures = targetPos.lookFor(LOOK_STRUCTURES);
        let existingContainer = false;
        if (structures.length)
        {
            for (let i = 0; i < structures.length; ++i)
            {
                if (structures[i].structureType === STRUCTURE_CONTAINER)
                {
                    existingContainer = true;
                    break;
                }
            }
        }

        if (!existingContainer)
        {
            const cs = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (!cs.length)
            {
                this.instance.room.createConstructionSite(targetPos, STRUCTURE_CONTAINER);
            }
        }

        this.calcNextState();
        this.run();
    }

    /**
     * This function will build the storage and keep checking if more container space opens
     */
    runSlowBuild()
    {
        // If there is a structure that has free space on their storage, revert to regular harvesting behavior.
        if (this.getDepositTargetPos() !== undefined)
        {
            this.calcNextState();
            this.run();
            return;
        }

        const targetPos = new RoomPosition(this.memory.targetPos.x,
                                           this.memory.targetPos.y,
                                           this.memory.targetPos.roomName);

        // This spends some extra processing power, but... should be fine for RCL1.
        if (this.instance.pos !== targetPos && !this.instance.fatigue)
        {
            this.instance.moveTo(targetPos, {visualizePathStyle: {stroke: '#ffffff'}});
        }

        // Only work if we have enough energy to make it count!
        const maxWorkTickCost = (this.instance.body.filter(x => x.type === WORK).length * BUILD_POWER);
        if (this.instance.store.getUsedCapacity(RESOURCE_ENERGY) > maxWorkTickCost)
        {
            if (this.instance.pos.getRangeTo(targetPos) <= 1)
            {
                const cs = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);

                if (cs.length)
                {
                    const buildResult = this.instance.build(cs[0]);
                    if (buildResult !== OK)
                        console.log(this.name + " build action failed with error: " + buildResult);
                }
                else
                {
                    console.log("Promoting " + this.name + " to Static Harvester. The room will start spawning Transporters/Haulers.");
                    this.instance.say("🤵");
                    this.instance.room.memory.staticHarvesting = true;
                    this.instance.memory.role = constants.ROLE_STATIC_HARVESTER;
                }
            }
        }
        else
        {
            const source = Game.getObjectById(this.memory.sourceId);
            if (this.instance.pos.getRangeTo(source.pos) <= 1)
            {
                const harvestResult = this.instance.harvest(source);
            }
        }
    }
}

Harvester.STATE_MINING = 3;
Harvester.STATE_DEPOSITING = 4;
Harvester.STATE_POST_DEPOSIT = 5;
Harvester.STATE_PREPARE_STORAGE = 6;
Harvester.STATE_SLOW_BUILD = 7;

CreepType.Harvester = Harvester;
