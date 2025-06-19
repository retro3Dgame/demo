import { game } from './MAIN.js';
import { clickBoxes, mat } from './GAME_data.js';
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Mesh } from "./THREE/three.core.js";

// create flat floor panel - vectro3 is at center of panel
export function genFloor(name, size, vec3, material){
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([ -size, 0.00, size, size, 0.00, size, 
        size, 0.00, -size, -size, 0.00, -size, ]);
    geometry.setAttribute('position', new Float32BufferAttribute( vertices, 3));

    const indices = new Uint16Array([0,1,2,2,3,0]); // indexed vertices (remove corner duplicates)
    geometry.setIndex(new BufferAttribute(indices, 1));

    // panel is facing upwards towards sky
    const normals = new Float32Array([ 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0,
    ]);
    geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));

    // panel uses four corners of texture image
    const uvs = new Float32Array([ 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, ]);
    geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

    const mesh1 = new Mesh(geometry, mat[material]);
    mesh1.name = name;
    // check 'type' instead of 'name' in raycaster for better conditional
    mesh1.type = 'floor';

    clickBoxes[mesh1.name] = mesh1;
    mesh1.position.set(vec3.x, vec3.y, vec3.z);
    game.scene.add(mesh1);
}