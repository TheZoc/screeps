/**
 * FlatQueue - Original Implementation by mourner: https://github.com/mourner/flatqueue
 *
 * Quoting the author, this is "A very fast binary heap priority queue in JavaScript."
 *
 * I changed the queue, so the data and priority arrays have the actual elements removed,
 * when pop() is called. A small trade off between speed and memory: A bit slower, but
 * better memory efficiency - Which is a must in Screeps.
 *
 * Something else I changed as well is the initialization of the data structure.
 * To be able to make it persistent in Screeps, we need to address the global Memory
 * object. It is not a pretty adaptation, but it works.
 */
class FlatQueue
{
    /**
     * Creates a Priority queue.
     * To avoid future frustration, I added a trap if the memory_structure param is undefined.
     * You must pass either an empty object - i.e.: let queue = new FlatQueue({});
     * or a Screeps memory object - i.e.: let queue = new FlatQueue(Memory.test).
     *
     * IMPORTANT: When using a Screeps memory object, make sure to initialize it first!
     * i.e.: Memory.test = {}
     *
     * @param memory_structure {Object} Empty object or Screeps memory object
     */
    constructor(memory_structure)
    {
        if (memory_structure === undefined)
        {
            console.log('Memory structure is undefined! Initialize the memory first!\n' + Error().stack);

            // This will abort code execution, forcing us to look at the code
            throw 'Memory structure is undefined! Initialize the memory first!';
        }

        // If we're storing in a Screeps memory object, initialize for the first use.
        if (memory_structure.data === undefined ||
            memory_structure.priority === undefined ||
            memory_structure.length === undefined)
        {
            memory_structure.data = [];
            memory_structure.priority = [];
            memory_structure.length = 0;
        }

        // Since javascript can't pass by reference when we want, there is
        // no way to bind "length" (a number) to a member variable. So, we
        // store the entire data structure in a member variable.
        this.memory_structure = memory_structure;
    }

    /**
     * Empties the priority queue
     */
    clear()
    {
        this.memory_structure.data = [];
        this.memory_structure.priority = [];
        this.memory_structure.length = 0;
    }

    /**
     * Add a new element to the priority queue
     *
     * @param priorityNum {Number} This is the priority number of the data added. Smaller elements have higher priority.
     * @param data {*} Data to be stored. It can be of any type.
     */
    push(priorityNum, data)
    {
        let pos = this.memory_structure.length++;
        this.memory_structure.data[pos] = data;
        this.memory_structure.priority[pos] = priorityNum;

        while (pos > 0)
        {
            const parent = (pos - 1) >> 1;
            const parentValue = this.memory_structure.priority[parent];

            if (priorityNum >= parentValue)
                break;

            this.memory_structure.data[pos] = this.memory_structure.data[parent];
            this.memory_structure.priority[pos] = parentValue;
            pos = parent;
        }

        this.memory_structure.data[pos] = data;
        this.memory_structure.priority[pos] = priorityNum;
    }

    /**
     * Removes and returns the highest priority element of the queue.
     * If the queue is empty, undefined is returned.
     *
     * @return {undefined|*} The highest priority element of the queue. If the queue is empty, undefined is returned.
     */
    pop()
    {
        if (this.memory_structure.length === 0)
            return undefined;

        const top = this.memory_structure.data[0];
        this.memory_structure.length--;

        if (this.memory_structure.length > 0)
        {
            const id = this.memory_structure.data[0] = this.memory_structure.data[this.memory_structure.length];
            const value = this.memory_structure.priority[0] = this.memory_structure.priority[this.memory_structure.length];
            const halfLength = this.memory_structure.length >> 1;
            let pos = 0;

            while (pos < halfLength)
            {
                let left = (pos << 1) + 1;
                const right = left + 1;
                let bestIndex = this.memory_structure.data[left];
                let bestValue = this.memory_structure.priority[left];
                const rightValue = this.memory_structure.priority[right];

                if (right < this.memory_structure.length && rightValue < bestValue)
                {
                    left = right;
                    bestIndex = this.memory_structure.data[right];
                    bestValue = rightValue;
                }
                if (bestValue >= value) break;

                this.memory_structure.data[pos] = bestIndex;
                this.memory_structure.priority[pos] = bestValue;
                pos = left;
            }

            this.memory_structure.data[pos] = id;
            this.memory_structure.priority[pos] = value;
        }

        // Lose some speed to use less memory
        this.memory_structure.data.pop();
        this.memory_structure.priority.pop();

        return top;
    }

    /**
     * Look at the top element of the priority queue, without removing it.
     *
     * @return {undefined|*} The top element. If there isn't one, undefined is returned.
     */
    peek()
    {
        if (this.memory_structure.length === 0)
            return undefined;
        return this.memory_structure.data[0];
    }

    /**
     * Take a peek at the priority number for the top element of the priority queue.
     *
     * @return {undefined|*} Priority of the top element. If there isn't one, undefined is returned.
     */
    peekPriority()
    {
        if (this.memory_structure.length === 0)
            return undefined;
        return this.memory_structure.priority[0];
    }

    /**
     * Dumps the contents of the priority queue.
     * Hint: Use an external text editor to sort it ;)
     *
     * @return {string} output text data
     */
    dumpNicely()
    {
        let output = "";
        for (let i = 0; i < this.memory_structure.length; ++i)
        {
            output += this.memory_structure.priority[i];
            output += ", ";
            output += JSON.stringify(this.memory_structure.data[i]);
            output += "\n";
        }

        return output;
    }
}

module.exports = FlatQueue;