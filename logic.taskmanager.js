/**
 * Task manager for Screeps
 *
 * This class is responsible to finding all the tasks that need to be done in a room and
 * keep track of them, using a priority queue
 */

var taskManager =
{
    EMERGENCY_PRIORITY  : 10,
    IMMEDIATE_PRIORITY  : 20,
    VERY_HIGH_PRIORITY  : 50,
    HIGH_PRIORITY       : 100,
    NORMAL_PRIORITY     : 200,
    LOW_PRIORITY        : 300,

    /**
     * Get all the tasks from a room and add them to the target priority queue
     * @param room {Room}
     * @param roomJobQueue {FlatQueue}
     */
    gather_room_tasks: function(room, roomJobQueue)
    {
        // Test with a simple job
        this.fill_spawn_extension_jobs(room, roomJobQueue);
    },

    /**
     * Get all the extensions in a room that aren't filed and create jobs for them
     * @param room {Room}
     * @param roomJobQueue {FlatQueue}
     */
    fill_spawn_extension_jobs : function(room, roomJobQueue)
    {
        const freeExtensions = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType === STRUCTURE_SPAWN || structure.structureType === STRUCTURE_EXTENSION) &&
                         structure.store.getUsedCapacity(RESOURCE_ENERGY) < structure.store.getCapacity(RESOURCE_ENERGY));
            }
        });

        for (const key in freeExtensions)
        {
            const job = {
                type: "fillSpawnExtension", // TODO: Change this to a constant or enum
                room: room.name,
                x: freeExtensions[key].pos.x,
                y: freeExtensions[key].pos.y,
                id: freeExtensions[key].id,
                allowedCreeps: ['Hauler'] // TODO: Change to a single character per role
            }
            roomJobQueue.push(this.NORMAL_PRIORITY, job);
        }
    }
}

module.exports = taskManager;