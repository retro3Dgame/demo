import { MeshBasicMaterial, MeshLambertMaterial, TextureLoader } from "./THREE/three.core.js";
//import { game } from './MAIN.js';

export const textures = {};         // image textures
export const models = {};           // Blender .glb models
export const ent = {};              // Character Entities
export const clickBoxes = {};       // Entity clickBox and AABB collision
export const totems = {};           // For measuring character animation points
export const mat = {};              // Materials for generated objects
export const gui = {};              // Objects for GUI functions and data
export const projectiles = {};      // materials for projectiles 

// clickBox dimensions for entity types
export const boxSizes = {
    // xyz for size, h for hitText height
    'char': { x: 3.15, y: 12.6, z: 3.15, textHeight: 7 },
    "char_red": { x: 3.15, y: 12.6, z: 3.15, textHeight: 7 },
    "player": { x: 3.15, y: 12.6, z: 3.15, textHeight: 7 },
    "player_blk": { x: 3.15, y: 12.6, z: 3.15, textHeight: 7 },
    "drone": {x: 3.15, y: 7, z: 3.15, textHeight: 4.5 },
    "box_hit": { x: 1.0, y: 2.0, z: 1.0 },
    "box_heal": { x: 1.0, y: 2.0, z: 1.0 },
    "box_info": { x: 1.0, y: 2.0, z: 1.0 },
    "box_wire": { x: 1.0, y: 2.0, z: 1.0 },
};

const tloader = new TextureLoader();

export function loadTexture(name, path) {
    return new Promise((resolve, reject) => {
        tloader.load(path, (txt) => {
            const texture = txt;
            textures[name] = texture;
            resolve(texture);

        },undefined, // optional function for % loaded (see docs)
        (err) => {
            console.error(`Error loading texture ${path}`, err);
            reject(err);
        });
    });
}

// list of entities in scene (TODO list for each room in game)
export function entList(){
    const list = [];
    for(const key in ent){
        list.push({
            name: ent[key].name,
            mesh: ent[key].glb,
        });
    }
    return list;
}

// list of clickBoxes for click-input scanning
export function clickBoxList(){
    const list = [];
    for(const key in clickBoxes){
        list.push(clickBoxes[key])
    }
    return list;
}

// run first with loadModels in main.js ////////////////////////////////
export function loadTextures(){
    return [
        loadTexture('80s_palette','./assets/80s_palette.png'),
        loadTexture('20x20grid', './assets/tan_grid20x20.png'),
        loadTexture('floor_stone', './assets/gray_stone_floor.png'),
        loadTexture('select_icon', './assets/select_icon_yellow3.png'),
        //loadTexture('select_icon_yl', './assets/select_icon_yellow3.png'),
    ];
}

// run after loadTextures in scene file
export function genMaterials(){
    mat['cBox'] = new MeshBasicMaterial({ 
        visible: false, wireframe: true, color: 0x00FF00 });
    mat['pointer'] = new MeshBasicMaterial({ color: 0x00FF00 });
    mat['select_icon'] = new MeshBasicMaterial({ 
        map: textures['select_icon'], transparent: true });
    //mat['select_icon_yl'] = new MeshBasicMaterial({ 
    //    map: textures['select_icon_yl'], transparent: true });
    mat['invis'] = new MeshBasicMaterial({visible: false});

}

// material data for individual scenes
export function genRoomMaterials(room){
    switch(room){
    case 'testScene': {
        mat['80s_palette'] = new MeshLambertMaterial({ map: textures['80s_palette'] });
        mat['20x20grid'] = new MeshLambertMaterial({ map: textures['20x20grid'] });
        mat['floor_stone'] = new MeshLambertMaterial({ map: textures['floor_stone'] });
        }
    }
}

// in-game text archives
export const logs = {
    broadsword: "You found a broadsword.",
    welcome: function(friend){
        return `Welcome to the Tulpanet game, ${friend}, we're glad you're\
        here to experiment in this world`;
    },
    attackQueue: 'Attack whom or what?',
    considerQueue: 'Consider attacking whom or what?',
    examineQueue: 'Examine whom or what?',
    inventoryTemp: 'Current inventory ...',
    profileTemp: 'Character profile ...',
};

// Custom text data for consider action
export function consider(opponent, player){
    const diff = opponent.creds.level - player.creds.level; // level difference between combatants
    let text = 'default consider() text'; // for debug
    let color = '';
    const name = opponent.creds.name3rd;
    if (diff <= -13){
        text = `${name} is too weak to be an opponent in combat.`;
        color = 'weak';
    } else if (diff <= -8){
        text = `${name} would hardly be a threat in combat.`;
        color = 'hardly';
    } else if (diff <= -4){
        text = `${name} should be an easy match in combat.`;
        color = 'easy';
    } else if (diff <= 3){
        text = `${name} looks like a worthy opponent.`;
        color = 'worthy';
    } else if (diff <= 10){
        text = `${name} strikes caution as a formidable opponent.`;
        color = 'formidable';
    } else if (diff <= 15){
        text = `You will need a miracle to best ${name} in combat.`;
        color = 'miracle';
    } else if (diff <= 25){
        text = `You tremble at the thought of facing ${name} in battle.`;
        color = 'tremble';
    } else {
        text = `Provoking ${name} in battle would be a death wish.`;
        color = 'dire';
    }

    return { text: text[0].toUpperCase() + text.slice(1), color };
}