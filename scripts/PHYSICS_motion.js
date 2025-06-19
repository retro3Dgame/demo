import { clickBoxList } from './GAME_data.js';

let start = false;
let boxList = {};

export function detectCollisions(){

    if(!start){ 
        boxList = clickBoxList(); 
        start = true; 
    }

    // iterate through entity pairs
    for(let i=0; i<boxList.length - 1; i++){
        for(let ii=i+1; ii<boxList.length; ii++){
            if(boxList[i].type !== "clickFrame" || boxList[ii].type !== "clickFrame"){ continue; }
            const box1 = boxList[i].getAABB(); const box2 = boxList[ii].getAABB();
            const check = testCollision(box1, box2);
            if(check){
                console.log(`COLLISION between '${box1.name} - ${boxList[i].host.state}' \n \
\t and '${box2.name} - ${boxList[ii].host.state}'`);

                boxList[i].host.colliding = true;
                boxList[ii].host.colliding = true;

            }
        }
    }

}

function testCollision(one, two){
    let collision = false;
    if((one.right > two.left) && (one.left < two.right) && 
       (one.front > two.back) && (one.back < two.front) && 
       (one.top > two.bottom) && (one.bottom < two.top) ){
        collision = true;
    }

    return collision;
}