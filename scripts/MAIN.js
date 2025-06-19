import { WebGLRenderer, Vector2 } from './THREE/three.module.js';
import { EffectComposer } from "./THREE/EffectComposer.js";
import { RenderPass } from "./THREE/RenderPass.js";
import { UnrealBloomPass } from "./THREE/UnrealBloomPass.js";
import { loadModel, loadPlasmaModel, entUpdate, projectileUpdate } from './COMPONENT_models.js';
import { ent, gui, loadTextures, genMaterials } from './GAME_data.js';
import { selected } from "./GAME_input.js";
import { getCameraAngle, setCameraAngle, updateCamera } from './GAME_camera.js';
import { textFontInit } from "./GUI_text.js";
import { testScene } from "./SCENE_test1.js";
import { detectCollisions } from "./PHYSICS_motion.js";
import { guiUpdate, UI_init } from "./GUI_icons.js";
import { eventsUpdate } from "./UTIL_events.js";
//import { genID } from "./UTIL_idGen.js";

const modelsLoaded = new Event("modelsLoaded");
const window = globalThis;


//game.screen for both renderer and hold GUI overlay for text and dialogue etc
export const game = {
    screen: null,
    // see resizeRenderer for size settings
    renderer: new WebGLRenderer({antialias: false /* alpha: true */ }),
    composer: null,
    renderPass: null,  // loaded after models and textures Promise.all()
    bloomPass: null,  // loaded after models and textures Promise.all()
    camera: null, // elements injected on scene_init() function
    scene: null,
    light: null,
    raycaster: null,
    cameraFollow: null,
    cameraAngle: null,
    cameraAngleChange: false,
    updateCamera: updateCamera,
    getCameraAngle: getCameraAngle,
    setCameraAngle: setCameraAngle,
}; 

Promise.all([
    ...loadTextures(), // from data.js
    loadModel('pointer', './models/pointer_pyramid.glb'),
    loadModel('floor', './models/floor_lava_plane.glb'),
    loadModel('player', './models/player1_new.glb'),
    loadModel('player_blk', './models/player1_new_blk.glb'),
    loadModel('char', './models/CHAR1.glb'),
    loadModel('char_red', './models/CHAR1_red.glb'),
    loadModel('totem', './models/block_totem.glb'),
    loadModel('drone', './models/scout_drone_metal3.glb'),
    loadPlasmaModel('plasmaball', './models/plasmaDisc1.glb'),
    loadModel('box_hit', './models/box_hit.glb'),
    loadModel('box_heal', './models/box_heal.glb'),
    loadModel('box_info', './models/box_info.glb'),
    loadModel('box_wire', './models/box_wire.glb'),
]).then(() => {
    genMaterials();
    testScene();

    selected.set( gui['pointer1'] );
    gui['pointer1'].setVisible(false); // start out with not 3d cursor visible

    game.renderPass = new RenderPass(game.scene, game.camera);
    game.composer = new EffectComposer( game.renderer );
    game.composer.addPass( game.renderPass );
    game.bloomPass = new UnrealBloomPass(
        new Vector2(game.screen.width, game.screen.height),
        1.5,    // strength
        0.4,    // radius
        0.85    // threshold
    );
    game.composer.addPass( game.bloomPass );

    document.dispatchEvent(modelsLoaded);

    textFontInit();
    UI_init();
    //testTimedEvent('testEvent1', 1, { eventType: 'testEvent00'});

    //console.log("new ID = ", genID());
    //UI.debugPrint();
});



let delta;
let lastFrame = performance.now();
let newFrame;

function animate(){
    newFrame = performance.now();
    delta = (newFrame - lastFrame) / 1000;
    lastFrame = newFrame;
    requestAnimationFrame( animate );

    eventsUpdate( delta );
    projectileUpdate( delta );
    detectCollisions();
    entUpdate( delta );
    //animUpdate( delta );
    guiUpdate( delta );
    game.updateCamera();

    //game.renderer.render( game.scene, game.camera );
    game.composer.render();
}

const rendererResizer = {};

// Wait until HTML DOM is loaded and the initial CSS is applied
document.addEventListener('DOMContentLoaded', () => {

    rendererResizer['resize'] = function(){
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const windowAspect = screenWidth / screenHeight;
        const desiredAspect = 16 / 9;

        let renderWidth, renderHeight;
        if(windowAspect > desiredAspect){
            renderHeight = screenHeight;
            renderWidth = renderHeight * desiredAspect;
        } else {
            renderWidth = screenWidth;
            renderHeight = renderWidth / desiredAspect;
        }

        game.screen.style.width = `${renderWidth}px`;
        game.screen.style.height = `${renderHeight}px`;
        game.screen.style.marginTop = `${(screenHeight - renderHeight) / 2}px`;
        game.screen.style.marginLeft = `${(screenWidth - renderWidth) / 2}px`;

        game.renderer.setSize(renderWidth, renderHeight);
        game.renderer.setViewport(0, 0, renderWidth, renderHeight);
        if(game.bloomPass){
            game.bloomPass.setSize( renderWidth, renderHeight );
        }

    }

    // Initiate first resize //
    rendererResizer.resize();

    window.addEventListener('resize', rendererResizer.resize);
    console.log("DOMContentLoaded (from MAIN)");
});

document.addEventListener('modelsLoaded', () => {
    // start animation loop
    animate(); 

    // init models so they jump from T-pose *shrug*
    for(const key in ent){
        if(ent[key].creds.t_pose){
            ent[key].walkTo(ent[key].glb.position);
        }
    }
});

