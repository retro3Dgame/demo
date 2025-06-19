import { GLTFLoader } from "./THREE/gltfLoader.js";
import { game } from './MAIN.js';
import { clone } from './THREE/SkeletonUtils.js';
import { models, ent, clickBoxes, totems, mat, boxSizes, projectiles } from './GAME_data.js';
import { AnimationMixer, BufferGeometry, Mesh, Float32BufferAttribute, Color } from './THREE/three.core.js';
//import { genID } from "./UTIL_idGen.js";

const gloader = new GLTFLoader();

export function loadModel(name, path) {
    return new Promise((resolve, reject) => {
        gloader.load(path, (glb) => {
            const model = glb;
            model.scene.scale.set(1,1,1);

            model.scene.traverse((child) => {
                if(child.isMesh && child.material){
                    //console.log(`model: ${name}, materialName: ${child.material.name}`);
                    const mat = child.material;
                    mat.timer = false;
                    if(mat.name === "brightLights"){
                        mat.emissive = new Color( 0x00fff8 );
                        mat.emissiveIntensity = 1.5;
                        mat.needsUpdate = true;
                    }  
                }
            });

            models[name] = model;
            resolve(model);

        },undefined, // optional function for % loaded (see docs)
        (err) => {
            console.error(`Error loading model ${path}`, err);
            reject(err);
        });
    });
}

export function loadPlasmaModel(name, path) {
    return new Promise((resolve, reject) => {
        gloader.load(path, (glb) => {
            const model = glb;
            model.glowMat = {};
            model.scene.scale.set(1,1,1);

            model.scene.traverse((child) => {
                if(child.isMesh && child.material){
                    //console.log(`model: ${name}, materialName: ${child.material.name}`);
                    const mat = child.material;
                    if(mat.name === "Plasmaball"){
                        mat.emissive = new Color( 0x77fff8 );
                        mat.emissiveIntensity = 6.0;
                        mat.needsUpdate = true;
                    }  
                }
            });

            models[name] = model;
            resolve(model);

        },undefined, // optional function for % loaded (see docs)
        (err) => {
            console.error(`Error loading model ${path}`, err);
            reject(err);
        });
    });
}

export function spawnBoxButton(baseModel, name, vec3, scene){
    const mod = clone(models[baseModel].scene);
    mod.position.set(vec3.x, vec3.y, vec3.z);

    const box = {
        glb: mod,
        base: baseModel,
        name: name,
        type: 'boxButton',
        mixer: { update: function(){ /* anim update */ } },
        creds: { t_pose: false },
        update: function(){/* state update */ },
        scale: function(s){
            this.glb.scale.set(s,s,s);
            this.glb.clickBox.scale(s);
        },
    }; 

    ent[name] = box;
    scene.add(box.glb);

    genClickBox(baseModel, name);

}

export function spawnEntity(baseModel, vec3) {
    const mod = clone(models[baseModel].scene); //clone blender scene
    
    const mixer = new AnimationMixer(mod);
    const actionList = {};
    mod.position.set(vec3.x, vec3.y, vec3.z);

    // remember animations stored in baseModel and not baseModel.scene
    for(let x = 0; x < models[baseModel].animations.length; x++){
        const action = mixer.clipAction( models[baseModel].animations[x] );

        const clipName = action._clip.name;
        actionList[clipName] = action;
    }
    
    const spawn = {
        glb: mod,                   // the .glb object
        base: baseModel,            // .glb style
        name: 'defaultName',                 // in-game identifier
        type: 'defaultEntity',      // in-game class
        creds: {},                  // for in-story identification traits
        mixer: mixer,               // animation mixer
        anim: actionList,           // animation list
        state: 'idle',              // for positions and action properties
        flags: [],                  // for statuses like chased or glowing etc
        speed: 10,                  // default speed for walking
        colliding: false,           // AABB collision state
        scale: function(s){
            this.glb.scale.set(s,s,s);
            this.glb.clickBox.scale(s);
        },
        current_anim: 'idle_ready', // currently running animation
        lastStep: { // previous step from AABB collision to prevent clickBox snags
            x: vec3.x, y: vec3.y, z: vec3.z,
            set: function(lx, ly, lz){
                this.x = lx, this.y = ly, this.z = lz
            }
        },
        dest: { // destination point to move to 
            x: vec3.x, y: vec3.y, z: vec3.z, 
            set: function(d){
                this.x = d.x; this.y = d.y; this.z = d.z;
            }
        },
        move: function(dest, delta){ // general linear movement function with collisions
            const currentX = this.glb.position.x;
            const currentZ = this.glb.position.z;
            const currentY = this.glb.position.y;
            const destX = dest.x; const destZ = dest.z;
            // get vector towards dest
            const dx = destX - currentX;
            const dz = destZ - currentZ;
            const distanceRemain = Math.sqrt(dx*dx + dz*dz);
            const moveDistance = this.speed * delta;

            if(this.colliding){

                // set to idle state
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.anim['idle_ready'].reset().play().fadeIn(0.2);
                this.anim['walk1'].fadeOut(0.2);

                // set position to previous step to avoid AABB box snags
                this.glb.position.set( this.glb.position.x - this.lastStep.x, 0, 
                                       this.glb.position.z - this.lastStep.z);

                // reset collision detection
                this.colliding = false;

            } else if(distanceRemain <= 0.001){ // set to dest if close enough

                this.glb.position.set(destX, currentY, destZ);

                // set to idle state
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.anim['idle_ready'].reset().play().fadeIn(0.2);
                this.anim['walk1'].fadeOut(0.2);

            } else if(moveDistance >= distanceRemain){ // when reached dest point
                
                this.glb.position.set(destX, currentY, destZ);

                // set to idle state
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.anim['idle_ready'].reset().play().fadeIn(0.2);
                this.anim['walk1'].fadeOut(0.2);

            } else { // step towards dest point

                const normalDx = dx / distanceRemain;
                const normalDz = dz / distanceRemain;
                // apply movement on line
                const nextX = currentX + normalDx * moveDistance;
                const nextZ = currentZ + normalDz * moveDistance;
                this.glb.lookAt(this.dest.x, this.dest.y, this.dest.z );
                //this.state = 'walking';
                this.lastStep.set(normalDx * moveDistance, 0, normalDz * moveDistance); //  previous tick to pad collisions
                this.glb.position.set(nextX, currentY, nextZ); //add Y movement later

            }
            // after all is said and done, anchor clickBox to mesh position
            this.glb.clickBox.anchor();   
        },
        
        walkTo: function(dest){ // trigger walking animation and movement
            this.dest.set(dest);
            this.state = 'walking';
            if(this.current_anim !== 'walk1'){

                this.current_anim = 'walk1';
                this.anim['walk1'].reset().play().fadeIn(0.2);
                this.anim['idle_ready'].fadeOut(0.2);
            }
        },

        // GLOBAL ENTITY UPDATE FUNCTION ////////////////////
        update: function(delta){
                
            switch(this.state){
                case 'idle': {
                    if(this.colliding){
                        console.log(`${this.name} was collided with a moving target`);
                        this.colliding = false;
                    }
                    // idle logic
                } break; 
                case 'walking': {
                    //this.speed = 10;
                    this.move(this.dest, delta); // walk to dest
                } break;
            }
        }
    }

    // return spawnedEntity for further customization in char class function
    return spawn;
}

// for entity movement and/or status changes
export function entUpdate(delta){
    for(const key in ent){
        ent[key].mixer.update( delta ); // Blender animations
        ent[key].update(delta); // Three.js code update
    }
}

export function projectileUpdate(delta){
    for(const key in projectiles){
        projectiles[key].updateMaterial(delta);
        if(projectiles[key].timer){
            projectiles[key].removeMaterial();
        }
    }
}

let tc = 0;
export function spawnTotem(v, scene){
    const t1 = clone(models['totem'].scene);
    const t2 = clone(models['totem'].scene);
    const t3 = clone(models['totem'].scene);
    const t4 = clone(models['totem'].scene);
    t1.position.set(v.x, v.y, v.z);
    t2.position.y += 4;
    t3.position.y += 8;
    t4.position.y += 12;
    t1.add(t2); t1.add(t3); t1.add(t4);
    tc += 1;
    totems[`totem${tc}`] = t1;
    scene.add(t1);
}

export function genClickBox(baseModel, host){
    const { x, y, z } = boxSizes[baseModel];
    const boxName = `${host}_box`;
    const box = new BufferGeometry();
    const vertices = new Float32Array([ 
        -x, 0, z, x, 0, z, x, y, z, x, y, z, -x, y, z, -x, 0, z, -x, 0, -z,
        -x, 0, z, -x, y, z, -x, 0, -z, -x, y, z, -x, y, -z, x, 0, -z, -x, 0, -z,
        -x, y, -z, x, 0, -z, -x, y, -z, x, y, -z, x, 0, z, x, 0, -z, x, y, -z,
        x, 0, z, x, y, -z, x, y, z, -x, y, z, x, y, z, x, y, -z, -x, y, z,
        x, y, -z, -x, y, -z, ]);
    box.setAttribute('position', new Float32BufferAttribute( vertices, 3));

    const normals = new Float32Array([ 
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 
        0.0, 0.0, 1.0, 1.0, 0.0, 0.0,1.0, 0.0, 0.0,1.0, 0.0, 0.0,1.0, 0.0, 0.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 1.0, 0.0,
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, ]);
    box.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    
    const mesh1 = new Mesh(box, mat['cBox']);
    mesh1.name = boxName;

    const cBox = {
        name: boxName, 
        base: baseModel,
        type: 'clickFrame',
        mesh: mesh1,
        host: ent[host],
        scaleRatio: 1,
        anchor: function(){     // set box position with host position
            const p = this.host.glb.position;
            this.mesh.position.set(p.x, p.y, p.z);
        },
        scale: function(s){
            this.mesh.scale.set(s,s,s);
            this.scaleRatio = s;  // important for collision detection (see getAABB)
        },
        getAABB: function(){
            const r = this.scaleRatio * 0.7; // smaller box for collision than clicking
            const name = this.name;
            const left = this.mesh.position.x - x * r;      // left bounds
            const right = this.mesh.position.x + x * r;     // right bounds
            const back = this.mesh.position.z - z * r;      // back
            const front = this.mesh.position.z + z * r;     // front
            const top = this.mesh.position.y + y * r;       // top (y-axis origin at 0)
            const bottom = this.mesh.position.y;        // bottom (position.y = bottom of entity)
            return { name, top, bottom, left, right, front, back };
        },
        
    };

    // add to game data
    clickBoxes[boxName] = cBox;

    // attach clickBox to host entity
    ent[host].glb.clickBox = cBox;
    const p = ent[host].glb.position;
    mesh1.position.set( p.x, p.y, p.z );

    game.scene.add(mesh1);

}

