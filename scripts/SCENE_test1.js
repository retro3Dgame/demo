import { game } from './MAIN.js';
import { Scene, PointLight, Vector3 } from './THREE/three.module.js';
import { ent, gui, genRoomMaterials, mat } from './GAME_data.js';
//import { spawnTotem, genClickBox } from './COMPONENT_models.js';
import { spawnPlayer } from "./CHAR_player.js";
import { spawnCivilian } from "./CHAR_civilian.js";
import { spawnDroneScout } from './CHAR_droneScout.js';
import { spawnBoxButton } from "./COMPONENT_models.js";
import { genSelectIcon, genPointer } from "./GUI_icons.js";
import { genFloor } from './COMPONENT_environ.js';
//import { genID } from "./UTIL_idGen.js";
import { setupCamera } from "./GAME_camera.js";
//import { plasmaball } from "./FX_plasmaball.js";
import { DirectionalLight } from "./THREE/three.core.js";

const vec3 = (x,y,z) => new Vector3(x,y,z);

// vector3 starting positions //
const vec = {
    "camera": vec3(-6, 35, 45),
    "pointer": vec3(3,0,0),
    "player1": vec3(10,0,10),
    "char1": vec3(29.2, 0, 17),
    "char2": vec3(-20.47, 0, -2.71),
    "player2": vec3(50,0,50),
    "drone": vec3(20,2,-24),
    
    "float": vec3(-7, 2, 7),
    "plasma": vec3(20, 6, -18),
    "box_hit": vec3(-20,0,-40),
    "box_heal": vec3(20,0,-40),
    "box_info": vec3(0,0,-40),
    "box_wire": vec3(40, 0, -40),
}

export function testScene(){
    game.scene = new Scene();

    // setupCamera, config game.renderer, and game.raycaster
    setupCamera(game);    

    const pointLight = new PointLight(0xFFFFFF, 0);
    //game.light = new HemisphereLight(0xFFFFFF, 0x3e2723, 1.3);
    game.light = new DirectionalLight(0xFFFFFF, 1.3);
    game.light.position.set(0, 25, 0);
    //game.light.distance = 20;
    game.light.target.position.set(0,0,0);

    //pointLight.position.set(0,10,0);
    //game.light.target.position.set(0,0,0);
    game.scene.add( game.light );

    genRoomMaterials('testScene'); // run before spawning entities and environment

    //for now, spawn the floor last for selection hierarchy
    genPointer(vec.pointer, pointLight, game.scene);
    gui['pointer1'].glb.children[0].material = mat['pointer'];

    spawnPlayer('player', 'player1', vec.player1, game.scene, {
        level: 10,
        t_pose: true,
    });

    spawnCivilian('player_blk', 'player_blk1', vec.player2, game.scene, {
        name3rd: 'the void guardian',
        name2nd: 'void guardian',
        quals: { human: false, person: true, civilized: true, combat: true },
        type: 'astral creature',
        desc: "The void guardian looks like a mirror of your image.  He doesn't \
    seem to be a direct threat.",
        level: 40,
        t_pose: true,
    });

    spawnCivilian('char', 'char1', vec.char1, game.scene, {
        name3rd: 'the civilian',
        name2nd: 'civilian',
        quals: { human: true, person: true, civilized: true, combat: true },
        type: 'civilian',
        desc: 'The civilian is wearing plain clothes with a blue shirt.  His \
demeanor is unalarming.',
        level: 10,
        t_pose: true,
    });
    spawnCivilian('char_red', 'char2', vec.char2, game.scene, {
        name3rd: 'the civilian',
        name2nd: 'civilian',
        quals: { human: true, person: true, civilized: true, combat: true },
        type: 'civilian',
        desc: 'The civilian is wearing plain clothes with a red shirt.  His \
demeanor is unalarming.',
        level: 20,
        t_pose: true,
    });
    spawnDroneScout('drone', 'drone1', vec.drone, game.scene, {
        name3rd: 'a scout drone',
        name2nd: 'scout drone',
        quals: { human: false, person: false, civilized: true, combat: true },
        type: 'drone',
        desc: 'Smooth metal and glowing lights captivate the onlooker with an \
ambient humming.',
        level: 27,
        t_pose: true,
    });

    spawnBoxButton('box_hit', 'box_hit1', vec.box_hit, game.scene);
    ent['box_hit1'].scale(3);
    spawnBoxButton('box_heal', 'box_heal1', vec.box_heal, game.scene);
    ent['box_heal1'].scale(3);
    spawnBoxButton('box_info', 'box_info1', vec.box_info, game.scene);
    ent['box_info1'].scale(3);
    spawnBoxButton('box_wire', 'box_wire1', vec.box_wire, game.scene);
    ent['box_wire1'].scale(3);

    //const ballID = plasmaball( 'plasmaball', vec.plasma, game.scene );
    //setTimeout( ent[ ballID ].remove, 2500 );

    genSelectIcon('player', 'player1', 1);

    genFloor('floor1', 20.0, vec3(0, 0, 0), 'floor_stone');
    genFloor('floor2', 20.0, vec3(40, 0, 0), 'floor_stone');
    genFloor('floor3', 20.0, vec3(-40,0,0),'floor_stone');

    genFloor('floor4', 20.0, vec3(0,0,40), 'floor_stone');
    genFloor('floor5', 20.0, vec3(40,0,40), 'floor_stone');
    genFloor('floor6', 20.0, vec3(-40,0,40),'floor_stone');

    genFloor('floor7', 20.0, vec3(0, 0, -40), 'floor_stone');
    genFloor('floor8', 20.0, vec3(40, 0, -40), 'floor_stone');
    genFloor('floor9', 20.0, vec3(-40,0, -40),'floor_stone');

    game.cameraFollow = ent['player1'].glb.position;
    const c = vec.camera;
    game.camera.position.set(c.x, c.y, c.z);
    game.camera.lookAt( game.cameraFollow );
    game.scene.add( game.camera );


}