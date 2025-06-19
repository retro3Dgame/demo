import { game } from './MAIN.js';
import { Vector3, PerspectiveCamera, Raycaster } from './THREE/three.module.js';
import { ent } from './GAME_data.js';

export function setupCamera(game){
    game.camera = new PerspectiveCamera( 50, (16/9), 0.1, 1000 );
    game.raycaster = new Raycaster();
}


// get current angle and distance between player and camera
export const getCameraAngle = function(){
    const distX = this.camera.position.x - ent['player1'].glb.position.x;
    const distY = this.camera.position.y - ent['player1'].glb.position.y;
    const distZ = this.camera.position.z - ent['player1'].glb.position.z;

    return { x: distX, y: distY, z: distZ };
}

// Initiate first camera angle on game load
export const setCameraAngle =  function(){
    this.cameraAngle = this.getCameraAngle();
}

// Maintain camera angle as player moves
export const updateCamera = function(){
    if(!this.cameraAngle){
        this.setCameraAngle();
    } else {
        const newA = this.getCameraAngle();
        const origA = this.cameraAngle;
        const cam = this.camera.position;

        if((newA.x !== origA.x || newA.y !== origA.y || newA.z !== origA.z) && !this.cameraAngleChange){
            const diffX = newA.x - origA.x;
            const diffY = newA.y - origA.y;
            const diffZ = newA.z - origA.z;
            this.camera.position.set(
                cam.x - diffX, cam.y - diffY, cam.z - diffZ
            );
            this.cameraFollow = ent['player1'].glb.position;  
        } else {
            this.cameraAngleChange = false;
        }

        game.camera.lookAt( game.cameraFollow );
    } 
}

// Change camera angle (for dev)
export function cameraPan(dir, camera){
    let x = camera.position.x;
    let y = camera.position.y;
    let z = camera.position.z;

    switch(dir){
        case 37: { // left
             const cd = orbitCamera(x,y,z, 1);
             x = cd.x; y = cd.y; z = cd.z;
             break;
        }
        case 38: { // up
            if(y <= 35){ y += 1; } break; 
        }
        case 39: { // right
            const cd = orbitCamera(x,y,z, -1); 
            x = cd.x; y = cd.y; z = cd.z;
            break;
        }
        case 40: { // down
            if(y >= 0){ y -= 1; } break; 
        }
        case 33: {
            const p = zoomCamera(camera, 1);
            x = p.x; y = p.y; z = p.z;
            break;
        }
        case 34: {
            const p = zoomCamera(camera, -1);
            x = p.x; y = p.y; z = p.z;
            break;
        }
        default: console.log("Unassigned camera keyCode = ", dir);
    }
    
    camera.position.set(x,y,z);
    game.cameraAngleChange = true;
    game.setCameraAngle();
    camera.lookAt( game.cameraFollow );
    console.log(`camera x: ${x} z: ${z}`);
}

// Rotate camera around player (for dev, create Pi/2 rotate for gameplay)
function orbitCamera(camX,camY,camZ, dir){
    const p = ent['player1'].glb.position;
    // get relative position then convert back
    // from (0,0,0) after unit circle Math
    const relX = camX - p.x;
    const relZ = camZ - p.z;

    const currentAngle = Math.atan2(relZ, relX);
    const angleStep = 0.05; //radians

    const newAngle = currentAngle + (angleStep * dir); // dir is + or - 1 for left/right

    const radius = Math.sqrt(relX*relX + relZ*relZ);
    const newX = radius * Math.cos(newAngle);
    const newZ = radius * Math.sin(newAngle);

    // new camera coordinates, don't forget to camera.lookAt(object3D) too if needed
    return {x: newX + p.x, y: camY, z: newZ + p.z};
}

// For dev only, zoom complicates action icons menu
function zoomCamera(camera, dir){
    const player = ent['player1'].glb.position;
    const cam = camera.position;
    // get relative position because Vec3.length() calculates from (0,0,0)
    const newPos = new Vector3(
        cam.x - player.x, 
        cam.y - player.y, 
        cam.z - player.z );
    const distance = newPos.length();
    const zoomStep = 1;
    let newDistance = distance + (zoomStep * dir);
    if(newDistance < 5.0){ newDistance = 5.0; }
    newPos.setLength(newDistance);
    const p = {x: newPos.x + player.x,
               y: newPos.y + player.y,
               z: newPos.z + player.z };
    return { x: p.x, y: p.y, z: p.z };
}