import { genClickBox } from "./COMPONENT_models.js";
import { clone } from './THREE/SkeletonUtils.js';
import { PointLight } from "./THREE/three.core.js";
import { genID } from "./UTIL_idGen.js";
import { ent, models } from './GAME_data.js';

export function plasmaball( vec3, scene ) {
    
    const clone1 = clone( models['plasmaball'].scene );
    const plasma = {
        clone: clone1,
        tick: 0,
        id: genID(),
        light: new PointLight(0x00fff8, 100),
        type: 'FX_blast',
        name: function(){
            return 'plasma-' + this.id;
        },
        mixer: { update: function(){}, },
        creds: {},
        brightness: 'up',
    };

    plasma.light.position.set( vec3.x, vec3.y + 3, vec3.z );
    
    plasma.update = function(delta){
        //console.log(`${plasma.name} update called . `, delta);
        plasma.tick += delta;
        //console.log(`this.tick = ${this.tick}`);
        plasma.light.intensity = Math.sin( plasma.tick * 8) * 50 + 100;
        
    };

    plasma.remove = function(){
        scene.remove( ent[ plasma.name() ].clone );
        scene.remove( plasma.light );
        console.log(`removed plasma: '${ plasma.name() }'`);
        delete ent[ plasma.name() ];
    };

    ent[ plasma.name() ] = plasma;
    scene.add( ent[ plasma.name() ].clone );
    scene.add( plasma.light );

    // add clickBox
    // genClickBox(baseModel, name);

    return plasma.name();
}