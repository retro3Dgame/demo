import { game } from './MAIN.js';
import { clone } from './THREE/SkeletonUtils.js';
import { models, mat, boxSizes, ent, gui } from './GAME_data.js';
import { UI } from './GAME_input.js';
import { BufferGeometry, Mesh, Float32BufferAttribute, BufferAttribute } from './THREE/three.core.js';
import { Vector3 } from './THREE/three.module.js';

// update gui in MAIN.js animate()
export function guiUpdate(delta){
    for(const key in gui){
        gui[key].update(delta);
    }
}

export function UI_init(){
    UI.considerIcon = document.createElement("img");
    UI.considerIcon.src = './assets/icon_considerDot.png';

    UI.attackIcon = document.createElement("img");
    UI.attackIcon.src = './assets/icon_swordDot.png';

    UI.inventoryIcon = document.createElement("img");
    UI.inventoryIcon.src = './assets/icon_inventoryDot.png';

    UI.profileIcon = document.createElement("img");
    UI.profileIcon.src = './assets/icon_hoodedDot.png';

    UI.examineIcon = document.createElement("img");
    UI.examineIcon.src = './assets/icon_examineDot.png';
}

export function actionIcons(player, camera){
    UI.actionIconsOpen = true;
    if( gui['select_icon'].mesh.visible === true ){
        gui['select_icon'].setVisible(false);
    }
    // if necessary, reuse this logic in update() to follow character location
    const point = new Vector3();
    point.copy( player.glb.position );
    point.project( camera );

    const b = game.renderer.domElement.getBoundingClientRect();
    const xp = ( (point.x + 1) / 2 ).toFixed(4) * 100;
    const yp = ( (-point.y + 1) / 2 ).toFixed(4) * 100;
    
    const r = b.width < 1000 ? b.width * 0.0087 : 
              b.width < 1200 ? b.width * 0.0077 :
              b.width < 1400 ? b.width * 0.0067 :
              b.width < 1600 ? b.width * 0.004 : b.width * 0.0045;
    const a = (16/9);
    
    //console.log("boundw = ", b, "\nw_ratio = ", r, "\nh_ratio = ", r*a);
    UI.attackCanvas = document.createElement("canvas");
    UI.attackCtx = UI.attackCanvas.getContext("2d");
    const rw = UI.attackCanvas.width; const rh = UI.attackCanvas.height;

    UI.attackCanvas.style.width = `${r}%`;
    UI.attackCanvas.style.height = `${r*a}%`;
    UI.attackCanvas.style.display = `inline`;
    UI.attackCanvas.style.position = 'absolute';
    UI.attackCanvas.style.top = `${yp - 30}%`;
    UI.attackCanvas.style.left = `${xp - 10.3}%`;
    
    UI.considerCanvas = document.createElement("canvas");
    UI.considerCtx = UI.considerCanvas.getContext("2d");
    const r2w = UI.attackCanvas.width; const r2h = UI.attackCanvas.height;

    UI.considerCanvas.style.width = `${r}%`;
    UI.considerCanvas.style.height = `${r*a}%`;
    UI.considerCanvas.style.display = `inline`;
    UI.considerCanvas.style.position = 'absolute';
    UI.considerCanvas.style.top = `${yp - 30}%`;
    UI.considerCanvas.style.left = `${xp + 4}%`;

    UI.inventoryCanvas = document.createElement("canvas");
    UI.inventoryCtx = UI.inventoryCanvas.getContext("2d");
    const r3w = UI.attackCanvas.width; const r3h = UI.attackCanvas.height;

    UI.inventoryCanvas.style.width = `${r}%`;
    UI.inventoryCanvas.style.height = `${r*a}%`;
    UI.inventoryCanvas.style.display = `inline`;
    UI.inventoryCanvas.style.position = 'absolute';
    UI.inventoryCanvas.style.top = `${yp - 9.4}%`;
    UI.inventoryCanvas.style.left = `${xp - 12.5}%`;

    UI.profileCanvas = document.createElement("canvas");
    UI.profileCtx = UI.profileCanvas.getContext("2d");
    const r4w = UI.attackCanvas.width; const r4h = UI.attackCanvas.height;

    UI.profileCanvas.style.width = `${r}%`;
    UI.profileCanvas.style.height = `${r*a}%`;
    UI.profileCanvas.style.display = `inline`;
    UI.profileCanvas.style.position = 'absolute';
    UI.profileCanvas.style.top = `${yp - 9.4}%`;
    UI.profileCanvas.style.left = `${xp + 5.3}%`;

    UI.examineCanvas = document.createElement("canvas");
    UI.examineCtx = UI.examineCanvas.getContext("2d");
    const r5w = UI.attackCanvas.width; const r5h = UI.attackCanvas.height;

    UI.examineCanvas.style.width = `${r}%`;
    UI.examineCanvas.style.height = `${r*a}%`;
    UI.examineCanvas.style.display = `inline`;
    UI.examineCanvas.style.position = 'absolute';
    UI.examineCanvas.style.top = `${yp + 5}%`;
    UI.examineCanvas.style.left = `${xp - 3.3}%`;

    const actionIconsMenu = {
        attackIcon: UI.attackCtx,
        considerIcon: UI.considerCtx,
        inventoryIcon: UI.inventoryCtx,
        profileIcon: UI.profileCtx,
        examineIcon: UI.examineCtx,
        type: 'action_icon_menu',
        openLoadComplete: false,
        closeMenu: false,
        tick: 0,
        host: player,
        camera: camera,
        close: function(){
            this.closeMenu = true;
        },
        update: function(_delta){
           
            // animate icons scales in and out
            if(!this.openLoadComplete || this.closeMenu){
                // TODO // draw from center and migrate towards top-left
                const aw = rw * this.tick; const ah = rh * this.tick;
                const awc = rw/2 - (aw*0.5); 
                const ahc = rh/2 - (ah*0.5);

                const cw = r2w * this.tick; const ch = r2h * this.tick;
                const cwc = r2w/2 - (cw*0.5);
                const chc = r2h/2 - (ch*0.5);

                const iw = r3w * this.tick; const ih = r3h * this.tick;
                const iwc = r3w/2 - (iw*0.5);
                const ihc = r3h/2 - (ih*0.5);

                const pw = r4w * this.tick; const ph = r4h * this.tick;
                const pwc = r4w/2 - (pw*0.5);
                const phc = r4h/2 - (ph*0.5);

                const ew = r5w * this.tick; const eh = r5h * this.tick;
                const ewc = r5w/2 - (ew*0.5);
                const ehc = r5h/2 - (eh*0.5);

                UI.attackCtx.clearRect(0,0,rw,rh);
                UI.attackCtx.drawImage(UI.attackIcon, awc, ahc, aw, ah);
                UI.considerCtx.clearRect(0,0,r2w,r2h);
                UI.considerCtx.drawImage(UI.considerIcon,cwc,chc,cw,ch);
                UI.inventoryCtx.clearRect(0,0,r3w,r3h);
                UI.inventoryCtx.drawImage(UI.inventoryIcon,iwc,ihc,iw,ih);
                UI.profileCtx.clearRect(0,0,r4w,r4h);
                UI.profileCtx.drawImage(UI.profileIcon,pwc,phc,pw,ph);
                UI.examineCtx.clearRect(0,0,r5w, r5h);
                UI.examineCtx.drawImage(UI.examineIcon,ewc,ehc,ew,eh);

                    if(!this.openLoadComplete){    
                        this.tick += 0.06;
                        if(this.tick >= 1.0){
                            this.tick = 1;
                            this.openLoadComplete = true;
                        }
                    } else if(this.closeMenu){
                    if( !gui['select_icon'].mesh.visible ){
                            gui['select_icon'].setVisible(true);
                    }
                    this.tick -= 0.06;
                    if(this.tick <= 0){
                        this.tick = 0;
                        // cleanup scene
                        try{
                            game.screen.removeChild( UI.attackCanvas );
                            game.screen.removeChild( UI.considerCanvas );
                            game.screen.removeChild( UI.inventoryCanvas );
                            game.screen.removeChild( UI.profileCanvas );
                            game.screen.removeChild( UI.examineCanvas );
                        } catch(e) {
                            console.log("error removing UI.attackCanvas from game.screen:" , e);
                        }
                        

                        
                        delete UI.attackCanvas;
                        delete UI.considerCanvas;
                        delete UI.inventoryCanvas;
                        delete UI.profileCanvas;
                        delete UI.examineCanvas;

                        delete UI.attackCtx;
                        delete UI.considerCtx;
                        delete UI.inventoryCtx;
                        delete UI.profileCtx;
                        delete UI.examineCtx;
                        
                        // update state cleanup gui data
                        UI.actionIconsOpen = false;
                        this.closeMenu = false;

                        delete gui['actionIconsMenu'];
                    }
                }
            }
        }
    }

    gui['actionIconsMenu'] = actionIconsMenu;

    UI.attackCanvas.addEventListener('click', () => {
        UI.dialogueClick = true;
        UI.actionIconsTextOpen = true;
        UI.actionIconsText('attack');
        gui['actionIconsMenu'].close();
    });

    UI.considerCanvas.addEventListener('click', () => {
        UI.dialogueClick = true;
        UI.actionIconsTextOpen = true;
        UI.actionIconsText('consider');
        gui['actionIconsMenu'].close();
    });

    UI.inventoryCanvas.addEventListener('click', () => {
        UI.dialogueClick = true;
        UI.actionIconsTextOpen = true;
        UI.actionIconsText('inventory');
        gui['actionIconsMenu'].close();
    });

    UI.profileCanvas.addEventListener('click', () => {
        UI.dialogueClick = true;
        UI.actionIconsTextOpen = true;
        UI.actionIconsText('profile');
        gui['actionIconsMenu'].close();
    });
    
    UI.examineCanvas.addEventListener('click', () => {
        UI.dialogueClick = true;
        UI.actionIconsTextOpen = true;
        UI.actionIconsText('examine');
        gui['actionIconsMenu'].close();
    });

    game.screen.appendChild(UI.attackCanvas);
    game.screen.appendChild(UI.considerCanvas);
    game.screen.appendChild(UI.inventoryCanvas);
    game.screen.appendChild(UI.profileCanvas);
    game.screen.appendChild(UI.examineCanvas);
    
}

// Highlight selected characters
export function genSelectIcon(baseModel, host, ratio){
    const { x, z } = boxSizes[baseModel];
    const r = ratio;
    const box = new BufferGeometry();
    const vertices = new Float32Array([ -x * r, 0.1, z * r, x * r, 0.1, z * r, x * r, 0.1, -z * r, 
                                        -x * r, 0.1, -z * r ]);
    box.setAttribute('position', new Float32BufferAttribute( vertices, 3));

    const indices = new Uint16Array([ 0,1,2,2,3,0 ]);
    box.setIndex( new BufferAttribute(indices, 1) );

    const normals = new Float32Array([ 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0, 
        0.0, 1.0, 0.0 ]);
    box.setAttribute('normal', new Float32BufferAttribute(normals, 3));

    const uvs = new Float32Array([ 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0 ]);
    box.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

    const mesh1 = new Mesh(box, mat['select_icon']);

    // iniate on invis
    mesh1.visible = false;

    const sFrame = {
        name: `selectIcon`,
        mesh: mesh1,
        base: baseModel,
        type: 'selectIcon',
        host: ent[host],
        tick: 0.5,
        setVisible: function(bool){
            if(bool){
                this.mesh.visible = true;
            } else {
                this.mesh.visible = false;
            }
        },
        pulse: function(){      // for the yellow fade
            this.tick += 0.05;
            if(this.tick >= 6.283185){
                this.tick = 0;
            }
        },
        spin: function(speed){      // rotation animation
            this.mesh.rotation.y -= speed;
            //console.log(this.glb.rotation.y);
            if(this.mesh.rotation.y <= 0) {
                this.mesh.rotation.y = 6.28318;
            }
        },
        update: function(_delta){
            this.spin(0.013);
            this.pulse();
            this.mesh.position.set( this.host.glb.position.x, 0.1,
                this.host.glb.position.z );
            this.mesh.material.opacity = 0.27 + Math.sin(this.tick*2) * 0.04;
            this.mesh.scale.set(1.1 + Math.sin(this.tick) * 0.07,
                                1.1,// + Math.sin(this.tick) * 0.04,
                                1.1 + Math.sin(this.tick) * 0.07 );
        },
        
    }; //sFrame

    gui['select_icon'] = sFrame;

    const p = ent[host].glb.position;
    sFrame.mesh.position.set(p.x, 0.1, p.z);

    game.scene.add(mesh1);
}



export function genPointer(vec3, light, scene) {
    const mod = clone(models['pointer'].scene); //clone blender scene
    mod.position.set(vec3.x, vec3.y, vec3.z);
    light.position.set(vec3.x, vec3.y + 10, vec3.z);
    
    const pointer = {
        glb: mod,           // the .glb object
        base: 'pointer',
        name: 'pointer1',         // in-game description
        flags: [],          // for statuses like chased or glowing etc
        setVisible: function(bool){
            if(bool){
                this.glb.visible = true;
            } else {
                this.glb.visible = false;
            }
        },
        scale: function(s){
            this.glb.scale.set(s,s,s);
        },
        spin: function(speed){
            this.glb.rotation.y += speed;
            //console.log(this.glb.rotation.y);
            if(this.glb.rotation.y >= 6.283185) {
                this.glb.rotation.y = 0
            }
        },
        setPosition: function(x,y,z){
            this.glb.position.set(x,y,z);
            light.position.set(x,y+10,z);
        },
        update: function(_delta){
           this.spin(0.03); 
        }
    }
    gui['pointer1'] = pointer;
    //console.log("ent[name].current_anim =", ent[name].current_anim);
    scene.add( pointer.glb );
    scene.add( light );
}

