//////////////////////////////////////////////////////////////////////////////
// This file contains a set of functions to display some utilities in the
// screen - e.g. Creep counter, spawning messages, target locations for
// storages (for the static harvesters) and some other experimental,
// currently not used functions.
//////////////////////////////////////////////////////////////////////////////

const constants = require("util.constants");

const utilVisualizer =
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
                    '🏭️' + constants.HUMAN_READABLE_ROLE_NAME[spawningCreep.memory.role],
                    spawns[i].pos.x + 1,
                    spawns[i].pos.y + 0.5,
                    {align: 'left', opacity: 0.8});
            }
        }

    },

    /**
     * @param {Room} room
     */
    draw_creep_count: function(room)
    {
        // Initialize out creep counter with the constants we have defined.
        let creepCounter = {};
        for(const role in constants.HUMAN_READABLE_ROLE_NAME)
            creepCounter[role] = 0;

        // Count the amount of creeps
        for(const [/* creepName */, creep] of Object.entries(Game.creeps))
        {
            // Handle unknown creeps (code transitions, etc.)
            if (creepCounter[creep.memory.role] === undefined)
                creepCounter[creep.memory.role] = 1;
            else
                ++creepCounter[creep.memory.role];
        }

        const creepsWanted = {
            [constants.ROLE_BUILDER]          : constants.MAX_BUILDERS_PER_ROOM,
            [constants.ROLE_STATIC_HARVESTER] : room.memory.sources.length,
            [constants.ROLE_PROSPECTOR]       : constants.MAX_PROSPECTORS_PER_ROOM,
            [constants.ROLE_TRANSPORTER]      : constants.MAX_TRANSPORTERS_PER_SOURCE * room.memory.sources.length,
            [constants.ROLE_UPGRADER]         : constants.MAX_UPGRADERS_PER_ROOM,
        };

        // Draw the fancy rectangle
        const rectStartX = 0;
        const rectStartY = 0;
        const rectWidth = 10;
        const rectHeight = 7.5;
        const fontSize = 0.6;
        const textStyle = {color: '#aaa', font: fontSize + " Roboto", align: "left"};
        const headerTextStyle = {color: '#E0E0E0', font: fontSize + " Roboto", align: "left"};
        const offsetX = 0.5;
        let offsetY = 1; // Increased for each entry

        // Background rectangle
        room.visual.rect(rectStartX,
            rectStartY,
            rectWidth,
            rectHeight,
            {fill: '#00897B', stroke: '#00ACC1', strokeWidth: '0.05', opacity: '0.1'});

        room.visual.text('Cur',  rectStartX + offsetX,     rectStartY + offsetY, headerTextStyle);
        room.visual.text('Max',  rectStartX + offsetX + 2, rectStartY + offsetY, headerTextStyle);
        room.visual.text('Role', rectStartX + offsetX + 4, rectStartY + offsetY, headerTextStyle);

        offsetY += fontSize;
        for(const [role,amount] of Object.entries(creepCounter))
        {
            const hrRole = constants.HUMAN_READABLE_ROLE_NAME[role];
            let currentTextStyle = _.cloneDeep(textStyle);
            if (creepsWanted[role] !== undefined)
            {
                currentTextStyle.color = (amount === creepsWanted[role]) ? '#43A047' : '#FB8C00';
                room.visual.text(creepsWanted[role], rectStartX + offsetX + 2, rectStartY + offsetY, currentTextStyle);
            }

            room.visual.text(amount,             rectStartX + offsetX,     rectStartY + offsetY, currentTextStyle);
            room.visual.text(hrRole,             rectStartX + offsetX + 4, rectStartY + offsetY, currentTextStyle);
            offsetY += fontSize;
        }

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
        const rectStartX = 34;
        const rectStartY = 0;
        const rectWidth = 15;
        const rectHeight = 7.5;
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
            room.visual.text("Cost", rectStartX + offsetX + 5, rectStartY + offsetY, headerTextStyle);
            room.visual.text("Name", rectStartX + offsetX + 7, rectStartY + offsetY, headerTextStyle);
            room.visual.text("Role", rectStartX + offsetX + 9, rectStartY + offsetY, headerTextStyle);
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

        //let entry_no = 0;
        while (spawnQueueCopy.getLength() > 0)
        {
            const priority = spawnQueueCopy.peekPriority();
            const data = spawnQueueCopy.pop();

            const totalCost = util.calculateBodyPartsCost(data.bodyParts);
            const hrRole = constants.HUMAN_READABLE_ROLE_NAME[data.memory.role];

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
            room.visual.text(totalCost,        rectStartX + offsetX + 5, rectStartY + offsetY, entryTextStyle);
            room.visual.text(data.name,        rectStartX + offsetX + 7, rectStartY + offsetY, entryTextStyle);
            room.visual.text(hrRole,           rectStartX + offsetX + 9, rectStartY + offsetY, entryTextStyle);


            // Previously, we'd have 2 columns with 6 entries each, now we only draw a single column, planned for 10 entries.
            // Every 6 entries, create a new column. WARNING: 3rd column will be hidden, since it's out of bounds (!)
            // ++entry_no;
            // if (entry_no % 6 === 0)
            // {
            //     offsetX += 12;
            //     offsetY = initialOffsetY;
            //     printHeader();
            // }

            offsetY += fontSize;
        }
    }
};


module.exports = utilVisualizer;