import { spawnEntity, genClickBox } from "./COMPONENT_models.js";
import { ent } from './GAME_data.js';

export function spawnPlayer(baseModel, name, vec3, scene, creds) {
    
    const entity = spawnEntity(baseModel, vec3);
    entity.type = 'player';
    entity.baseModel = baseModel;
    entity.name = name;
    creds.stats = {
        "strength": 50,
        "dexterity": 45,
        "speed": 50,
        "constitution": 45,
        "wisdom": 45,
        "intellect": 50,
        "skills": {
            "sword": 70,
            "dodge": 50,
            "parry": 45,
        },
        "HP": 100,
        "MP": 50,
        "HPMAX": 100,
        "MPMAX": 50,
        "physicalAttack": 50,
        "spiritualAttack": 50,
        "physicalDefense": 60,
        "spiritualDefense": 60,
        "currentWeapon": {
            "name": "bronze sword",
            "type": "melee sword",
            "attackType": "slice",
            "attackStrength": 12,

        },
    };
    entity.creds = creds;
    
    ent[name] = entity;

    scene.add(ent[name].glb);

    // add clickBox to player
    genClickBox(baseModel, name);
}