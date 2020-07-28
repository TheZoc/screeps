//////////////////////////////////////////////////////////////////////////////
// This file contains a set of functions to display some utilities in the
// screen - e.g. Creep counter, spawning messages, target locations for
// storages (for the static harvesters) and some other experimental,
// currently not used functions.
//////////////////////////////////////////////////////////////////////////////

const constants = require("util.constants");

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
        this.draw_spawn_queue(room);
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
                    '🏭️' + spawningCreep.memory.role,
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
        const staticHarvesterAmount = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_STATIC_HARVESTER) && (creep.memory.room === room.name)).length;
        const haulerAmount          = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_TRANSPORTER)      && (creep.memory.room === room.name)).length;
        const upgraderAmount        = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_UPGRADER)         && (creep.memory.room === room.name)).length;
        const builderAmount         = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_BUILDER)          && (creep.memory.room === room.name)).length;
        const prospectorAmount      = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_PROSPECTOR)       && (creep.memory.room === room.name)).length;

        let line = 0;
        room.visual.text('Creep summary:', 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Static Harvesters: ' + staticHarvesterAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Haulers: ' + haulerAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Upgrader: ' + upgraderAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Builder: ' + builderAmount, 0, line++, {align: 'left', opacity: 0.8});
        room.visual.text('Prospector: ' + prospectorAmount, 0, line++, {align: 'left', opacity: 0.8});
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
    },

    /**
     * Draw the spawn queue
     *
     * @param room {Room}
     */
    draw_spawn_queue: function(room)
    {
        const rectStartX = 26;
        const rectStartY = 0;
        const rectWidth = 23;
        const rectHeight = 5;
        const fontSize = 0.6;
        const textStyle = {font: fontSize + " Roboto", align: "left"};
        const headerTextStyle = {color: '#E0E0E0', font: fontSize + " Roboto", align: "left"};
        const initialOffsetY = 1;
        let offsetY = initialOffsetY; // Increased for each entry
        let offsetX = 0.5;

        // Background rectangle
        room.visual.rect(rectStartX,
            rectStartY,
            rectWidth,
            rectHeight,
            {fill: '#00897B', stroke: '#00ACC1', strokeWidth: '0.05', opacity: '0.1'});

        // Auxiliary lambda function to print the header
        const printHeader = function() {
            room.visual.text("Prio", rectStartX + offsetX,     rectStartY + offsetY, headerTextStyle);
            room.visual.text("Room", rectStartX + offsetX + 2, rectStartY + offsetY, headerTextStyle);
            room.visual.text("Role", rectStartX + offsetX + 5, rectStartY + offsetY, headerTextStyle);
            room.visual.text("Cost", rectStartX + offsetX + 7, rectStartY + offsetY, headerTextStyle);
            room.visual.text("Name", rectStartX + offsetX + 9, rectStartY + offsetY, headerTextStyle);
        }

        printHeader();
        offsetY += fontSize;

        if (room.memory.spawnQueue === undefined)
            return;

        // Spawn queue data
        let spawnQueueCopy = new FlatQueue({
            data: [...room.memory.spawnQueue.data],
            priority: [...room.memory.spawnQueue.priority],
            length: room.memory.spawnQueue.length,
        })

        let entry_no = 0;
        while (spawnQueueCopy.getLength() > 0)
        {
            const priority = spawnQueueCopy.peekPriority();
            const data = spawnQueueCopy.pop();

            let totalCost = 0;
            for (let i = 0; i <  data.bodyParts.length; ++i)
            {
                totalCost += BODYPART_COST[data.bodyParts[i]];
            }

            let entryTextStyle = textStyle;
            // Color based on the priority
            if (priority <= constants.PRIORITY_EMERGENCY)
                entryTextStyle.color = "#E53935";
            else if (priority <= constants.PRIORITY_IMMEDIATE)
                entryTextStyle.color = "#F4511E";
            else if (priority <= constants.PRIORITY_VERY_HIGH)
                entryTextStyle.color = "#FFB300";
            else if (priority <= constants.PRIORITY_HIGH)
                entryTextStyle.color = "#FDD835";
            else if (priority <= constants.PRIORITY_NORMAL)
                entryTextStyle.color = "#7CB342";
            else if (priority <= constants.PRIORITY_LOW)
                entryTextStyle.color = "#43A047";
            else
                entryTextStyle.color = "#8E24AA";

            room.visual.text(priority,         rectStartX + offsetX,     rectStartY + offsetY, entryTextStyle);
            room.visual.text(data.memory.room, rectStartX + offsetX + 2, rectStartY + offsetY, entryTextStyle);
            room.visual.text(data.memory.role, rectStartX + offsetX + 5, rectStartY + offsetY, entryTextStyle);
            room.visual.text(totalCost,        rectStartX + offsetX + 7, rectStartY + offsetY, entryTextStyle);
            room.visual.text(data.name,        rectStartX + offsetX + 9, rectStartY + offsetY, entryTextStyle);

            // Every 6 entries, create a new column. WARNING: 3rd column will be hidden, since it's out of bounds (!)
            ++entry_no;
            if (entry_no % 6 === 0)
            {
                offsetX += 12;
                offsetY = initialOffsetY;
                printHeader();
            }

            offsetY += fontSize;
        }
    }
};


module.exports = utilVisualizer;