class AStar_Node {
    constructor(x, y, parent = null) {
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.g = 0;
        this.h = 0;
        this.f = 0;
    }

    isEqual(other) {
        return this.x === other.x && this.y === other.y;
    }
}

class AStar {
    constructor(matrix) {
        this.matrix = matrix;
    }

    heuristic(node, end) {
        return Math.abs(node.x - end[0]) + Math.abs(node.y - end[1]);
    }

    getNeighbors(node) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
        ];
        const diagonalTop = [
            [-1, -1], [1, -1]
        ];
        const diagonalBottom = [
            [-1, 1], [1, 1]
        ];
        const neighbors = [];
        let freeDiagonalTop = 0;
        let freeDiagonalBottom = 0;

        const checkSafeZone = (x, y) => {
            if (y >= 0 && y < this.matrix.array.length && x >= 0 && x < this.matrix.array[y].length) {
                const zone = this.matrix.array[y][x];
                return this.matrix.safe_zones.includes(zone);
            }
            return false;
        };

        for (const [dx, dy] of [...diagonalTop, ...[[0, -1], [-1, 0], [1, 0]]]) {
            if (checkSafeZone(node.x + dx, node.y + dy))
                freeDiagonalTop++;
        }
        for (const [dx, dy] of [...diagonalBottom, ...[[0, 1], [-1, 0], [1, 0]]]) {
            if (checkSafeZone(node.x + dx, node.y + dy))
                freeDiagonalBottom++;
        }

        if (freeDiagonalTop > 2) {
            directions.push([-1, -1]);
            if (freeDiagonalTop > 4)
                directions.push([1, -1]);
        }
        if (freeDiagonalBottom > 2) {
            directions.push([-1, 1]);
            if (freeDiagonalBottom > 4)
                directions.push([1, 1]);
        }

        for (const [dx, dy] of directions) {
            const x = node.x + dx;
            const y = node.y + dy;
            if (checkSafeZone(x, y)) {
                neighbors.push(new AStar_Node(x, y, node));
            }
        }

        return neighbors;
    }

    findPath(start_vector, goal_vector2) {
        const start = [start_vector.x, start_vector.y];
        const end = [goal_vector2.x, goal_vector2.y];

        const openSet = [];
        const closedSet = new Set();

        const startNode = new AStar_Node(start[0], start[1]);
        const endNode = new AStar_Node(end[0], end[1]);

        openSet.push(startNode);

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            if (current.isEqual(endNode)) {
                const path = [];
                let node = current;
                while (node !== null) {
                    path.unshift([node.x, node.y]);
                    node = node.parent;
                }
                return path;
            }
            closedSet.add(`${current.x}, ${current.y}`);
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(`${neighbor.x}, ${neighbor.y}`)) {
                    continue;
                }
                const tentativeGScore = current.g + 1;
                if (!openSet.some(node => node.isEqual(neighbor)) || tentativeGScore < neighbor.g) {
                    neighbor.parent = current;
                    neighbor.g = tentativeGScore;
                    neighbor.h = this.heuristic(neighbor, end);
                    neighbor.f = neighbor.g + neighbor.h;
                    if (!openSet.some(node => node.isEqual(neighbor))) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        return null;
    }
}

/**
 * 
 * @param {iLGE_2D_Engine} engine 
 */
function npc_ai_start(engine) {
    this.direction = new iLGE_2D_Vector2();
    if (this.npc_start_function)
        this.npc_start_function(engine);
}

/**
 * 
 * @param {iLGE_2D_Engine} engine 
 */
function npc_ai_update(engine) {
    this.collider.width = this.width;
    this.collider.height = this.height;
    if (this.target && this.map) {
        let npc_matrix_position = this.map.getArrayVector(new iLGE_2D_Vector2(
            this.x + this.width / 2,
            this.y + this.height / 2
        ));
        let target_matrix_position = this.map.getArrayVector(this.target);
        this.npc_step = new iLGE_2D_Vector2(this.x, this.y);
        if (npc_matrix_position && target_matrix_position) {
            const path = (new AStar(this.map)).findPath(
                npc_matrix_position,
                target_matrix_position
            );
            if (path && path.length > 1) {
                this.npc_step = this.map.getArrayCellCenter(new iLGE_2D_Vector2(path[1][0], path[1][1]));
                this.npc_step.x -= this.width / 2;
                this.npc_step.y -= this.height / 2;
            }
            else if (path) {
                this.npc_step = new iLGE_2D_Vector2(this.target.x, this.target.y);
            }
        }
        if (this.npc_step) {
            this.direction.x = this.npc_step.x - this.x;
            this.direction.y = this.npc_step.y - this.y;
        }
        this.direction.normalize();
    }
    if (this.npc_update_function)
        this.npc_update_function(engine);
}