let game = new iLGE_2D_Engine(
    "NPC",
    null,
    document.getElementById("GameScreen"),
    320, 200,
    true
);

let scene;

class MapMatrix {
    x = 0;
    y = 0;
    array = [];
    safe_zones = [0];
    visible_zones = [0];

    /**
     * 
     * @param {Number} safe_zone 
     */
    addSafeZone(safe_zone = 0) {
        for (const zone of this.safe_zones) {
            if (zone === safe_zone)
                return;
        }
        this.safe_zones.push(safe_zone);
    }

    /**
     * 
     * @param {Number} visible_zone 
     */
    addVisibleZone(visible_zone = 0) {
        for (const zone of this.visible_zones) {
            if (zone === visible_zone)
                return;
        }
        this.visible_zones.push(visible_zone);
    }

    /**
     * 
     * @param {iLGE_2D_Vector2} vector 
     * @returns {iLGE_2D_Vector2}
     */
    getArrayVector(vector) {
        let convertedVector = new iLGE_2D_Vector2(
            Math.floor(vector.x / this.size),
            Math.floor(vector.y / this.size)
        );
        if (convertedVector.x < this.x ||
            convertedVector.y < this.y ||
            convertedVector.y >= this.array.length ||
            convertedVector.x >= this.array[convertedVector.y].length) {
            return null;
        }
        convertedVector.x -= this.x;
        convertedVector.y -= this.y;
        return convertedVector;
    }

    /**
     * 
     * @param {iLGE_2D_Vector2} vector 
     * @returns {iLGE_2D_Vector2}
     */
    getArrayCellCenter(vector) {
        if (!vector ||
            vector.y >= this.array.length ||
            vector.x >= this.array[vector.y].length)
            return null;
        return new iLGE_2D_Vector2(
            (vector.x + this.x + 0.5) * this.size,
            (vector.y + this.y + 0.5) * this.size
        );
    }

    /**
     * 
     * @param {Number} zone 
     * @returns {Number}
     */
    countZones(zone = 0) {
        let zones = 0;
        for (let y = 0; y < this.array.length; y++) {
            let horizontal = this.array[y];
            for (let x = 0; x < horizontal.length; x++) {
                if (horizontal[x] === zone)
                    zones++;
            }
        }
        return zones;
    }

    /**
     * 
     * @param {Number} zone 
     * @param {Number} index 
     */
    getZonePosition(zone = 0, index = 0) {
        for (let y = 0; y < this.array.length; y++) {
            let horizontal = this.array[y];
            for (let x = 0; x < horizontal.length; x++) {
                if (horizontal[x] === zone) {
                    if (index < 1)
                        return this.getArrayCellCenter(new iLGE_2D_Vector2(x, y));
                    index--;
                }
            }
        }
        return null;
    }

    /**
     * 
     * @param {iLGE_2D_Object} object1 
     * @param {iLGE_2D_Object} object2 
     * @returns {Boolean}
     */
    canSee(object1, object2) {
        let tmpVector1 = new iLGE_2D_Vector2(
            object1.x + object1.width / 2,
            object1.y + object1.height / 2
        );
        let tmpVector2 = new iLGE_2D_Vector2(
            object2.x + object2.width / 2,
            object2.y + object2.height / 2
        );
        let convertedVector1 = new iLGE_2D_Vector2(
            Math.floor(tmpVector1.x / this.size),
            Math.floor(tmpVector1.y / this.size)
        );
        let convertedVector2 = new iLGE_2D_Vector2(
            Math.floor(tmpVector2.x / this.size),
            Math.floor(tmpVector2.y / this.size)
        );
        if (convertedVector1.x < this.x ||
            convertedVector1.y < this.y ||
            convertedVector1.y >= this.array.length ||
            convertedVector1.x >= this.array[convertedVector1.y].length) {
            return false;
        }
        if (convertedVector2.x < this.x ||
            convertedVector2.y < this.y ||
            convertedVector2.y >= this.array.length ||
            convertedVector2.x >= this.array[convertedVector2.y].length) {
            return false;
        }
        convertedVector1.x -= this.x;
        convertedVector1.y -= this.y;
        convertedVector2.x -= this.x;
        convertedVector2.y -= this.y;
        const dx = Math.abs(convertedVector2.x - convertedVector1.x);
        const dy = Math.abs(convertedVector2.y - convertedVector1.y);
        const sx = (convertedVector1.x < convertedVector2.x) ? 1 : -1;
        const sy = (convertedVector1.y < convertedVector2.y) ? 1 : -1;
        let err = dx - dy;
        while (
            convertedVector1.x !== convertedVector2.x ||
            convertedVector1.y !== convertedVector2.y
        ) {
            if (!this.visible_zones.includes(this.array[convertedVector1.y][convertedVector1.x])) {
                return false;
            }
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                convertedVector1.x += sx;
            }
            if (e2 < dx) {
                err += dx;
                convertedVector1.y += sy;
            }
        }
        return this.visible_zones.includes(this.array[convertedVector1.y][convertedVector1.x]) ?
            true : false;
    }

    constructor(array, x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.array = array;
    }
}

let classic_map = new MapMatrix([
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 9, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
], 0, 0, 256);

classic_map.addSafeZone(2);
classic_map.addSafeZone(8);
classic_map.addSafeZone(9);
classic_map.addVisibleZone(2);
classic_map.addVisibleZone(8);
classic_map.addVisibleZone(9);

function loadMap(scene, map) {
    let offset = new iLGE_2D_Vector2(
        map.x * map.size,
        map.y * map.size
    );
    for (let y = 0; y < map.array.length; y++) {
        let array = map.array[y];
        for (let x = 0; x < array.length; x++) {
            let value = array[x];
            switch (value) {
                case 1:
                    /* setup the wall */
                    let wall = new iLGE_2D_Object(
                        "Wall_" + (y * array.length + x), "wall",
                        iLGE_2D_Object_Type_Custom,
                        x * map.size + offset.x, y * map.size + offset.y, 0, 1, map.size, map.size
                    );
                    /* add rectangle to wall */
                    wall.addElement(new iLGE_2D_Object_Element_Rectangle("#ffff00", "rect", true));
                    /* add collider to wall */
                    wall.addElement(new iLGE_2D_Object_Element_Collider(
                        true, false, "blocker",
                        0, 0, wall.width, wall.height
                    ));
                    scene.addObject(wall);
                    break;
            }
        }
    }
}

/**
 * 
 * @param {iLGE_2D_Engine} engine 
 */
game.start_function = function (engine) {
    /* setup the scene and camera */
    let camera = new iLGE_2D_Object("MyCamera", "camera", iLGE_2D_Object_Type_Camera);
    let mini_camera = new iLGE_2D_Object("MiniCamera", "camera", iLGE_2D_Object_Type_Camera);
    let mini_map = new iLGE_2D_Object("MiniCamera", "camera");
    scene = new iLGE_2D_Scene("MyScene", "SceneClass", true);

    /* set scene map */
    scene.map = classic_map;

    /* set camera background */
    camera.addElement(new iLGE_2D_Object_Element_Rectangle("#ffffff", "rect", true));

    /* set the scene that camera will render */
    mini_camera.scene = scene;

    /* set camera background */
    mini_camera.addElement(new iLGE_2D_Object_Element_Rectangle("#ffffff", "rect", true));

    /* setup the camera viewer for minimap */
    mini_map.addElement(new iLGE_2D_Object_Element_Camera_Viewer(
        mini_camera,
        "mini",
        true
    ));


    let teleport_zones = scene.map.countZones(2);

    /**
    * 
    * @param {iLGE_2D_Object} object 
    */
    function teleport_object(object, zone, index) {
        let teleport_position = scene.map.getZonePosition(zone, index);
        if (!teleport_position)
            return;
        object.x = teleport_position.x - object.width / 2;
        object.y = teleport_position.y - object.height / 2;
    }

    /* setup the controls */
    this.control_map_set("cursorX", "Mouse_MovementX_Positive");
    this.control_map_set("noclip", "Keyboard_Code_KeyQ");
    this.control_map_set("up", "Keyboard_Code_KeyW");
    this.control_map_set("down", "Keyboard_Code_KeyS");
    this.control_map_set("left", "Keyboard_Code_KeyA");
    this.control_map_set("right", "Keyboard_Code_KeyD");
    this.control_map_set("run", ["Keyboard_Code_ShiftLeft", "Keyboard_Code_ShiftRight"]);

    loadMap(scene, scene.map);

    mini_camera.scale = scene.map.array.length * scene.map.size;
    mini_map.scale = 640;

    /* set minimap size */
    mini_map.width = 320;
    mini_map.height = mini_map.width;

    /* add the minimap to this engine */
    this.addObject(mini_map);

    /**
     * 
     * @param {iLGE_2D_Engine} engine
     */
    mini_map.start_function = function (engine) {
        this.z_order = 1;
        this.margin = 16;
        this.rect = new iLGE_2D_Object(this.id + "_rect", "rect");
        this.rect.addElement(new iLGE_2D_Object_Element_Rectangle("#000000", "rect", true));
        engine.addObject(this.rect);
        this.dot = new iLGE_2D_Object(this.id + "_dot", "rect");
        this.dot.addElement(new iLGE_2D_Object_Element_Rectangle("#000000", "rect", true));
        engine.addObject(this.dot);
        this.dot.width = this.dot.height = 4;
        this.dot.z_order++;
    }

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    mini_map.update_function = function (engine) {
        this.scaled_margin = this.margin * this.scale_output;
        mini_camera.x = camera.x - ((mini_camera.width - camera.width) / 2);
        mini_camera.y = camera.y - ((mini_camera.height - camera.height) / 2);
        mini_camera.rotation = camera.rotation;
        this.x = (engine.width - this.width * this.scale_output - this.scaled_margin);
        this.y = (engine.height - this.height * this.scale_output - this.scaled_margin);
        this.rect.x = this.x - this.scaled_margin;
        this.rect.y = this.y - this.scaled_margin;
        this.rect.width = this.width + this.margin * 2;
        this.rect.height = this.height + this.margin * 2;
        this.rect.scale = this.scale;
        this.dot.x = this.x + ((this.width - this.dot.width) / 2) * this.scale_output;
        this.dot.y = this.y + ((this.height - this.dot.height) / 2) * this.scale_output;
        this.dot.scale = this.scale;
    }

    /* set camera scale */
    camera.scale = 360;

    /* set the scene that camera will render */
    camera.scene = scene;

    /* setup the camera viewer */
    let camera_viewer = new iLGE_2D_Object("MyViewer", "camera_viewer", iLGE_2D_Object_Type_Custom);
    camera_viewer.addElement(new iLGE_2D_Object_Element_Camera_Viewer(camera, "viewer", true));

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    camera_viewer.start_function = function (engine) {
        /* set z_order */
        this.z_order = -1;
    }

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    camera_viewer.update_function = function (engine) {
        /* set the x, y and scale to zero */
        this.x = this.y = this.scale = 0;

        /* set fullscreen */
        this.width = engine.width;
        this.height = engine.height;
    };
    /* add scene object for updates */
    this.addObject(scene);

    /* add camera viewer to hud */
    this.addObject(camera_viewer);

    /* setup player */
    let player = new iLGE_2D_Object(
        "Player", "player",
        iLGE_2D_Object_Type_Custom,
        0, 0, 0, 1, 32, 64
    );

    /* setup npc */
    let npc = new iLGE_2D_Object(
        "NPC", "npc",
        iLGE_2D_Object_Type_Custom,
        0, 0, 0, 1, 32, 64
    );

    npc.map = scene.map;

    teleport_object(player, 9, 0);
    teleport_object(npc, 8, 0);

    /* add rectangle to npc */
    npc.addElement(new iLGE_2D_Object_Element_Rectangle("#00ff00", "rect", true));

    npc.start_function = npc_ai_start;
    npc.update_function = npc_ai_update;

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    npc.npc_start_function = function (engine) {
        this.step_delay = 1000;
        this.max_speed = 24;
        this.collider = new iLGE_2D_Object_Element_Collider(
            false, false, "collider",
            0, 0, this.width, this.height
        );
        this.addElement(this.collider);
    };

    /**
     * 
     * @param {iLGE_2D_Object} object 
     */
    npc.alert = function (object) {
        this.target = new iLGE_2D_Vector2(object.x, object.y);
    }

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    npc.npc_update_function = function (engine) {
        let collided_player = this.collider.collidedWithByClass("player");
        if (collided_player) {
            let player_zone = Math.floor(Math.random() * teleport_zones),
                npc_zone = Math.floor(Math.random() * teleport_zones);
            while (player_zone === npc_zone) {
                player_zone = Math.floor(Math.random() * teleport_zones);
                npc_zone = Math.floor(Math.random() * teleport_zones);
            }
            teleport_object(this, 2, npc_zone);
            teleport_object(collided_player, 2, player_zone);
            this.alert(collided_player);
        }
        if (scene.map.canSee(this, player)) {
            this.alert(player);
        }
        if (this.delay < 1) {
            this.speed = this.max_speed;
            this.delay = this.step_delay;
        }
        if (this.speed > 0) {
            this.x += this.direction.x * this.speed * engine.deltaTime;
            this.y += this.direction.y * this.speed * engine.deltaTime;
            this.speed -= engine.deltaTime;
        }
    };

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    player.start_function = function (engine) {
        engine.pointerLock = true;
        console.log("Hello!, It's me " + player.id + "!");
        this.max_stamina = 1024;
        this.stamina = this.max_stamina;
        this.stamina_hud_green = new iLGE_2D_Object(
            "hud3", null, iLGE_2D_Object_Type_Custom,
            0, 0, 0, 320, 128, 8
        );
        this.stamina_hud_green.addElement(
            new iLGE_2D_Object_Element_Rectangle("#00ff00", "wall", true)
        );
        this.stamina_hud_red = new iLGE_2D_Object(
            "hud4", null, iLGE_2D_Object_Type_Custom, 0, 0, this.stamina_hud_green.rotation,
            this.stamina_hud_green.scale, this.stamina_hud_green.width, this.stamina_hud_green.height, 0, 0);
        this.stamina_hud_red.addElement(
            new iLGE_2D_Object_Element_Rectangle("#ff0000", "wall", true)
        );
        engine.addObject(this.stamina_hud_red);
        engine.addObject(this.stamina_hud_green);
        this.min_speed = 4;
        this.max_speed = this.min_speed * 2;
        this.mouse_sensitivity = 1000 / 180;
        this.camera_rotation_delay = 4;
        this.collider = new iLGE_2D_Object_Element_Collider(
            false, false, "collider",
            0, 0, this.width, this.height
        );
        this.addElement(this.collider);
        camera.speed = 16;
    };

    /**
     * 
     * @param {iLGE_2D_Engine} engine 
     */
    player.update_function = function (engine) {
        let stamina = this.stamina / this.max_stamina;
        this.stamina_hud_green.width = stamina * this.stamina_hud_red.width;
        this.stamina_hud_red.x = 4 * this.stamina_hud_red.scale_output;
        this.stamina_hud_green.x = this.stamina_hud_red.x;
        this.stamina_hud_red.y =
            (engine.height - this.stamina_hud_red.height * this.stamina_hud_red.scale_output)
            - 4 * this.stamina_hud_red.scale_output;
        this.stamina_hud_green.y = this.stamina_hud_red.y;
        this.collider.width = this.width;
        this.collider.height = this.height;
        let left = engine.control_map_get("right", true) - engine.control_map_get("left", true),
            up = engine.control_map_get("down", true) - engine.control_map_get("up", true),
            run = engine.control_map_get("run", true);
        this.rotation += engine.control_map_get("cursorX") / this.mouse_sensitivity;
        this.collider.noclip = engine.control_map_get("noclip", true) ? true : false;
        if (camera.rotation < this.rotation) {
            camera.rotation +=
                (this.rotation - camera.rotation) / this.camera_rotation_delay *
                engine.deltaTime;
            if (camera.rotation > this.rotation)
                camera.rotation = this.rotation;
        }
        else {
            camera.rotation +=
                (this.rotation - camera.rotation) / this.camera_rotation_delay *
                engine.deltaTime;
            if (camera.rotation < this.rotation)
                camera.rotation = this.rotation;
        }
        let vector_movement = new iLGE_2D_Vector2(
            left, up
        );
        vector_movement.transform(this.getRotationVector());
        vector_movement.normalize();
        if (run && this.stamina > 0) {
            this.speed = this.max_speed;
            if (vector_movement.x || vector_movement.y)
                this.stamina -= engine.deltaTime * this.min_speed;
            if (this.stamina < 0)
                this.stamina = 0;
        }
        else {
            this.speed = this.min_speed;
        }
        if (!vector_movement.x && !vector_movement.y) {
            this.stamina += engine.deltaTime * this.max_speed;
            if (this.stamina > this.max_stamina)
                this.stamina = this.max_stamina;
        }
        this.x += vector_movement.x * this.speed * engine.deltaTime;
        this.y += vector_movement.y * this.speed * engine.deltaTime;
        camera.x = this.x - (camera.width - this.width) / 2;
        camera.y = this.y - (camera.height - this.height) / 2;
    };

    /* add rectangle to player */
    player.addElement(new iLGE_2D_Object_Element_Rectangle("#0000ff", "rect", true));

    /* add player and npc to scene */
    scene.addObject(player);
    scene.addObject(npc);
};
game.start();