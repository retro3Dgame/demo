import { spawnEntity, genClickBox } from "./COMPONENT_models.js";
import { ent } from './GAME_data.js';
import { PointLight } from "./THREE/three.module.js";

export function spawnDroneScout(baseModel, name, vec3, scene, creds) {
    
    const entity = spawnEntity(baseModel, vec3);
    entity.type = 'NPC';
    entity.name = name;
    entity.baseModel = baseModel;
    creds.stats = {
        "strength": 65,
        "speed": 55,
        "constitution": 70,
        "dexterity": 30,
        "wisdom": 65,
        "intellect": 65,
        "skills": {
            "dodge": 70,
            "parry": 70,
            "jolt": 75,
        },
        "HP": 150,
        "MP": 100,
        "HPMAX": 150,
        "MPMAX": 100,
        "physicalAttack": 60,
        "spiritualAttack": 40,
        "physicalDefense": 60,
        "spiritualDefense": 50,
        "currentWeapon": {
            "name": "jolt blast",
            "type": "energy",
            "attackType": "shock",
            "attackStrength": 10,
        },
    };
    entity.creds = creds;
    entity.move = droneScountMove,
    entity.speed = 15;
    entity.light = new PointLight(0x67e2fa, 0, 30, 2);
    entity.lightBase = 10;
    entity.anchorLight = anchorLight;
    entity.tick = 0;
    entity.walkTo = droneScoutWalkTo;
    entity.update = droneScoutUpdate;
    entity.lightOn = lightOn;
    entity.lightOff = lightOff;
    entity.lightPause = false;
    entity.hoverLight = true;
    entity.talk = function(){
        entity.state = 'talk';
        const currentAnim = entity.current_anim;
        entity.current_anim = 'talk1';
        entity.anim['talk1'].reset().play().fadeIn(0.2);
        entity.anim[currentAnim].fadeOut(0.2);

        entity.lightBase = 60;
        //entity.lightOn();

        setTimeout(() =>{
            entity.state = 'idle';
            const currentAnim = entity.current_anim;
            entity.current_anim = 'idle_ready';
            entity.anim['idle_ready'].reset().play().fadeIn(0.2);
            entity.anim[currentAnim].fadeOut(0.2);

            //entity.lightBase = 10;
            entity.lightOff();
        }, 700);
    };
    ent[ name ] = entity;

    scene.add(ent[ name ].glb);
    scene.add(ent[ name ].light);

    // add clickBox to player
    genClickBox(baseModel, name);
}

const anchorLight = function(){
    const p = this.glb.position;
    this.light.position.set(p.x, p.y-0.5, p.z);

    
}

const lightOn = function(){
    this.lightBase = 30;
    //this.hoverLight = true;
}

const lightOff = function(){
    this.lightBase = 10;
    //this.hoverLight = false;
    //this.tick = 0;
}

// general linear movement function with collisions
const droneScountMove = function(dest, delta){ 
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
                /*
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.lightOff();
                this.anim['idle_ready'].reset().play().fadeIn(0.2);
                this.anim['walk1'].fadeOut(0.2);
                */
                if(this.state !== "talk"){
                    this.talk();
                }

                // set position to previous step to avoid AABB box snags
                this.glb.position.set( this.glb.position.x - this.lastStep.x, currentY, 
                                       this.glb.position.z - this.lastStep.z);

                // reset collision detection
                this.colliding = false;

            } else if(distanceRemain <= 0.001){ // set to dest if close enough

                this.glb.position.set(destX, currentY, destZ);

                // set to idle state
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.lightOff();
                this.anim['idle_ready'].reset().play().fadeIn(0.2);
                this.anim['walk1'].fadeOut(0.2);

            } else if(moveDistance >= distanceRemain){ // when reached dest point
                
                this.glb.position.set(destX, currentY, destZ);

                // set to idle state
                this.state = 'idle';
                this.current_anim = 'idle_ready';
                this.lightOff();
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
                this.lastStep.set(normalDx * moveDistance, currentY, normalDz * moveDistance); //  previous tick to pad collisions
                this.glb.position.set(nextX, currentY, nextZ); //add Y movement later

            }
            // after all is said and done, anchor clickBox to mesh position
            this.glb.clickBox.anchor();   
            this.anchorLight();
}

const droneScoutWalkTo = function(dest){ // trigger walking animation and movement
            dest.y = this.glb.position.y;
            this.dest.set(dest);
            this.state = 'walking';
            if(this.current_anim !== 'walk1'){

                this.current_anim = 'walk1';
                this.lightOn();

                this.anim['walk1'].reset().play().fadeIn(0.2);
                this.anim['idle_ready'].fadeOut(0.2);
            }
};

        // GLOBAL ENTITY UPDATE FUNCTION ////////////////////
const droneScoutUpdate = function(delta){
            
            switch(this.state){
                case 'idle': {
                    // idle logic
                    if(this.colliding){
                        console.log(`${this.name} was collided with moving target.`);
                        this.talk();
                        this.colliding = false;
                        
                    }
                } break; 
                case 'walking': {
                    //this.speed = 10;
                    this.move(this.dest, delta); // walk to dest
                } break;
            }

            if(this.hoverLight){
                this.tick += 0.05;
                if(this.tick === 6.28318) { this.tick = 0; }
                this.light.intensity = this.lightBase + 10 * Math.sin(this.tick*2) * 0.3;
            }
};