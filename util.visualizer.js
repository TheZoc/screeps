//////////////////////////////////////////////////////////////////////////////
// This file contains a set of functions to display some utilities in the
// screen - e.g. Creep counter, spawning messages, target locations for
// storages (for the static harvesters) and some other experimental,
// currently not used functions.
//////////////////////////////////////////////////////////////////////////////

var utilVisualizer =
{
    /**
     * @param {Room} room
     */
    draw: function(room)
    {
        this.draw_storage_location(room);
        this.draw_spawn_message(room);
        this.draw_creep_count(room);
        // Experimental stuff
        // this.draw_centroid(room);
        // this.draw_centroid2(room);
    },

    /**
     * @param {Room} room
     */
    draw_storage_location: function(room)
    {
        for(let i = 0, l = room.memory.sources.length; i < l; ++i)
        {
            room.visual.rect(room.memory.sources[i].x - 0.5,
                             room.memory.sources[i].y - 0.5,
                             1,
                             1,
                             {fill: '#FDCE6F', stroke: '#FFEA88', strokeWidth: '0.05', opacity: '0.2'});
        }
    },

    /**
     * @param {Room} room
     */
    draw_spawn_message: function(room)
    {
        let spawns = room.find(FIND_MY_SPAWNS);
        for(let i = 0, l = spawns.length; i < l; ++i)
        {
            if(spawns[i].spawning)
            {
                let spawningCreep = Game.creeps[spawns[i].spawning.name];
                spawns[i].room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    spawns[i].pos.x + 1,
                    spawns[i].pos.y + 0.5,
                    {align: 'left', opacity: 0.8});
            }
        }

    },

    // This should be processing intensive. Only enable for debugging!
    /**
     * @param {Room} room
     */
    draw_creep_count: function(room)
    {
        const staticHarvesterAmount = _.filter(Game.creeps, (creep) => (creep.memory.role === 'staticHarvester') && (creep.memory.room === room.name)).length;
        const haulerAmount          = _.filter(Game.creeps, (creep) => (creep.memory.role === 'hauler')          && (creep.memory.room === room.name)).length;
        const upgraderAmount        = _.filter(Game.creeps, (creep) => (creep.memory.role === 'upgrader')        && (creep.memory.room === room.name)).length;
        const builderAmount         = _.filter(Game.creeps, (creep) => (creep.memory.role === 'builder')         && (creep.memory.room === room.name)).length;

        let line = 0;
        room.visual.text('Creep summary:', 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Static Harvesters: ' + staticHarvesterAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Haulers: ' + haulerAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Upgrader: ' + upgraderAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Builder: ' + builderAmount, 0, line++, {align: 'left', opacity: 0.8});
    },

    // Currently a test function. Should find the centroid between Sources and Room Controller. Might be useful for automated expansions.
    /**
     * @param {Room} room
     */
    draw_centroid: function(room)
    {
        const sources = room.find(FIND_SOURCES);

        let xPos = Array();
        let yPos = Array();

        xPos.push(room.controller.pos.x);
        yPos.push(room.controller.pos.y);

        for(let i = 0, l = sources.length; i < l; ++i)
        {
            xPos.push(sources[i].pos.x);
            yPos.push(sources[i].pos.y);
        }

        // TODO: Check if floor() or ceil() works better here
        const x = _.floor(_.sum(xPos) / xPos.length);
        const y = _.floor(_.sum(yPos) / yPos.length);

        room.visual.rect(x - 0.5,
                         y - 0.5,
                         1,
                         1,
                         {fill: '#3AE2CE', stroke: '#00FFA9', strokeWidth: '0.05', opacity: '0.2'});

        room.visual.text("C1", x, y + 0.25, {color: '#00FFA9', font: 0.8});
    },

    /**
     * @param {Room} room
     */
    draw_centroid2: function(room)
    {
        const sources = room.find(FIND_SOURCES);

        let xPos = Array();
        let yPos = Array();

        if (sources.length > 0)
        {
            for(let i = 0, l = sources.length; i < l; ++i)
            {
                xPos.push(sources[i].pos.x);
                yPos.push(sources[i].pos.y);

                // Lazy way of making a weighted average
                xPos.push(room.controller.pos.x);
                yPos.push(room.controller.pos.y);
            }
        }
        else
        {
            xPos.push(room.controller.pos.x);
            yPos.push(room.controller.pos.y);
        }

        // TODO: Check if floor() or ceil() works better here
        const x = _.floor(_.sum(xPos) / xPos.length);
        const y = _.floor(_.sum(yPos) / yPos.length);

        room.visual.rect(x - 0.5,
                         y - 0.5,
                         1,
                         1,
                         {fill: '#C57A1D', stroke: '#FF8C00', strokeWidth: '0.05', opacity: '0.2'});

        room.visual.text("C2", x, y + 0.25, {color: '#FF8C00', font: 0.8});
    }
};


module.exports = utilVisualizer;