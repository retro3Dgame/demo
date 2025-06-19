import { game } from './MAIN.js'
import { clickBoxList, ent, gui, mat, consider, boxSizes } from './GAME_data.js';
import { actionIcons } from "./GUI_icons.js";
import { genID } from "./UTIL_idGen.js";
import { newBattle } from "./UTIL_battle.js";
import { d20 } from "./UTIL_dice.js";

let clicked = 'no intersection';
let hp_idx = 0;
let heal_idx = 0;
let info_idx = 0;
//let newSelect = false;


export const UI = {
    dialogueClick: false,           // prevent character from walking when closing text box
    dialogueBoxOpen: false,         // check if dialogueBox on screen
    dialogueBoxClose: null,         // () => {} clost dialogue box 
    actionIconsOpen: false,          // check if action menu on screen
    actionIconsTextOpen: false,      // check if waiting for action select
    actionIconsTextClose: null,      // () => {} close action select text
    actionIconsQueue: null,          // type of action select open

    dialogueBox: null,              // func loaded after DOMCONTENT in GUI_text.js
    actionIconsText: null,           // func loaded after DOMCONTENT in GUI_text.js
    considerText: null,             // func loaded after DOMCONTENT in GUI_text.js

    hitText: null,                  // func loaded after DOMCONTENT in GUI_text.js
    hitText2: null,
    hitTextOpen: false,             // hit text on screen
    hitTextClose: null,             // func loaded after DOMCONTENT in GUI_text.js

    debugPrint: function(){
        console.log(`UI: \n\
    dialogueClick = ${this.dialogueClick}\n\
    dialogueBoxOpen = ${this.dialogueBoxOpen}\n\
    dialogueBoxClose (function) = ${this.dialogueBoxClose !== null}\n\
    actionIconsOpen = ${this.actionIconsOpen}\n\
    actionIconsTextOpen = ${this.actionIconsTextOpen}\n\
    actionIconsTextClose (function) = ${this.actionIconsTextClose !== null}\n\
    actionIconsQueue = ${this.actionIconsQueue}\n\
    dialogueBox (function) = ${this.dialogueBox !== null}\n\
    actionIconsText (function) = ${this.actionIconsText !== null}\n\
    considerText (function) = ${this.considerText !== null}\n`);
    },
};
   
export const selected = {
    char: null,
    name: '_empty',
    set: function(ch){
        this.char = ch;
        this.name = ch.name;
    },
};

function getNormalizedMousePosition(canvas, event){
    // Adjust for offset (centered canvas)
    const bounds = canvas.getBoundingClientRect();
    //console.log('bounds = ', bounds);

    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.bottom) / bounds.height) * 2 + 1;

    //console.log("event.clientX, Y = ", event.clientX, event.clientY);
    //console.log("event.offsetX, Y = ", event.offsetX, event.offsetY);

    //console.log('x,y = ', x, y);
    return { x, y: 0 - y };
}

export function processInput(canvas, event, raycaster, camera){
    const { x, y } = getNormalizedMousePosition(canvas, event);
    const mouse = { x, y };
    const roomList = clickBoxList();
    //console.log('roomList = ', roomList);
    clicked = 'no intersection';

    raycaster.setFromCamera(mouse, camera);

    // *** make sure to BREAK to prevent pointer reset *** //
    selectLoop: for(let i = 0; i < roomList.length; i++){
        const host = roomList[i].host || { type: 'none' };

        // Check for character select
        if(host.type === 'player' || host.type === 'NPC') {
            
            const br = selectBox( roomList[i], raycaster );
            
            // if selected a player or NPC
            if(br){ 
                // hide 3d cursor for all not floor clicks
                gui['pointer1'].setVisible(false); 

                //for actionIconsQueue, handling attack, consider, examine etc
                if( UI.actionIconsQueue ){
                    handleActionQueue( roomList[i].host );

                    break selectLoop;
                }

                //for general clicks
                if(host.type === 'player'){
                    // if actionMenu already open
                    if( !UI.actionIconsOpen ){
                        actionIcons( host, camera );
                    }

                }

                // necessary so character doesn't walkTo() upon selection
                break selectLoop;
            } 

        } else if( host.type === 'boxButton' ){

            //const intersects = raycaster.intersectObject( roomList[i] );
            const br = selectBox( roomList[i], raycaster );

            if( br ){
                    selected.set( gui['pointer1'] );
                    gui['pointer1'].setVisible(false);
                    gui['select_icon'].setVisible(false); 
        
                    if( gui['actionIconsMenu'] ){
                        gui['actionIconsMenu'].close();
                    }
                    if( UI.dialogueBoxOpen ){
                        UI.dialogueBoxClose();
                    }
                    if( UI.actionIconsTextOpen ){
                        UI.actionIconsTextClose();
                    }
                    
                    if( host.name === 'box_hit1'){
                        const hp = [ 100, 110, 85, 99, 117 ];
                        UI.hitText({
                            text: `${ hp[hp_idx] + d20() }`,
                            color: 'hitRed',
                            position: ent['player1'].glb.position,
                            camera: game.camera,
                            textHeight: boxSizes['player'].textHeight,
                        });
                        hp_idx += 1; 
                        if(hp_idx === hp.length){ hp_idx = 0; }
                    } else if( host.name === 'box_heal1'){
                        const heal = [ 100, 110, 85, 99, 117 ];
                        UI.hitText({
                            text: `${ heal[heal_idx] + d20() }`,
                            color: 'healGreen',
                            position: ent['player1'].glb.position,
                            camera: game.camera,
                            textHeight: boxSizes['player'].textHeight,
                        });
                        heal_idx += 1;
                        if(heal_idx === heal.length){ heal_idx = 0; }
                    } else if( host.name === 'box_info1' ){
                        const info = ['found potion', 'level up (33)', 'sword +1% (94%)',
                            'found 34 silver', 'found 10 gold', 'parry +3% (88%)' ];
                        UI.hitText({
                            text: info[info_idx],
                            color: 'infoYellow',
                            position: ent['player1'].glb.position,
                            camera: game.camera,
                            textHeight: boxSizes['player'].textHeight,
                        });
                        info_idx += 1;
                        if(info_idx === info.length){ info_idx = 0; }
                    } else if( host.name === 'box_wire1' ){
                        mat['cBox'].visible = !mat['cBox'].visible;
                    }
                    break selectLoop;
                }
        } else if( roomList[i].type === 'floor' ){

            const intersects = raycaster.intersectObject( roomList[i] );

            if( intersects.length > 0 ){
                if( selected.name === 'pointer1' ){
                    // clicked coordinates
                    const p = { x: intersects[0].point.x,
                                y: intersects[0].point.y,
                                z: intersects[0].point.z };

                    // move 3d cursor to click spot
                    selected.char.setPosition( p.x,p.y,p.z );
                    
                    // make 3d cursor visible again
                    if( !gui['pointer1'].glb.visible ){
                        gui['pointer1'].setVisible(true);
                    }

                    // for dev debug
                    console.log(`pointer at:    X: ${p.x.toFixed(4)}` + 
                    `    Y: ${p.y.toFixed(4)}    Z: ${p.z.toFixed(4)}`);

                } else {
                    
                    //when selecting object for examine, attack, consider
                    if( UI.actionIconsTextOpen ){
                        handleActionQueue({ type: 'floor' });
                        clicked = 'floor';
                        return clicked;
                    }

                    // regular walkTo destination
                    selected.char.walkTo( intersects[0].point );
                    
                    // close icon menu if open
                    if( UI.actionIconsQueue ){                        
                        handleActionQueue( roomList[i] );
                    }

                    // close icon menu if open
                    if( UI.actionIconsOpen ){
                        gui['actionIconsMenu'].close();
                    }
                    
                    if( UI.dialogueBoxOpen ){
                        UI.dialogueBoxClose();
                    }
                }
                    
                // floor-only neutral click
                clicked = 'floor';
                break selectLoop;
            }
        } // floor select
        
    }  //selectLoop   
    
    if(clicked === 'no intersection'){
        // back to neutral selection
        selected.set( gui['pointer1'] );
        gui['pointer1'].setVisible(false);
        gui['select_icon'].setVisible(false); 
        
        if( gui['actionIconsMenu'] ){
            gui['actionIconsMenu'].close();
        }
        if( UI.dialogueBoxOpen ){
            UI.dialogueBoxClose();
        }
        if( UI.actionIconsTextOpen ){
            UI.actionIconsTextClose();
        }
    }
    return clicked;
}

function selectBox(item, raycaster){
    const intersects = raycaster.intersectObject( item.mesh );

    if(intersects.length > 0){
        clicked = item.host.name; // for dev debug

        // on neutral clicks, select character
        const q = UI.actionIconsQueue;
        
        // TEMP // boxButton dev purposes - delete later
        if( ent[ item.host.type === 'boxButton' ] ){ return true; }

        if(q !== 'attack' && q !== 'consider' && q !== 'examine'){
            if( !UI.actionIconsOpen){
                selected.set( ent[ item.host.name ] );
                gui['select_icon'].setVisible(true);
                gui['select_icon'].host = ent[ selected.name ];
            } else if( item.host.type !== 'player' ){
                selected.set( ent[ item.host.name ] );
                gui['select_icon'].setVisible(true);
                gui['select_icon'].host = ent[ selected.name ];
                if( gui['actionIconsMenu'] ){ gui['actionIconsMenu'].close(); }
                if(UI.dialogueBoxOpen){ UI.dialogueBoxClose(); }
                if( UI.actionIconsTextOpen ){ UI.actionIconsTextClose(); }
            } else {
                if( gui['actionIconsMenu'] ){ gui['actionIconsMenu'].close(); }
                if(UI.dialogueBoxOpen){ UI.dialogueBoxClose(); }
                if( UI.actionIconsTextOpen ){ UI.actionIconsTextClose(); }
            }

            // close playerActionMenu icons on neutral-entity-select
            if( gui['actionIconsMenu'] ){ gui['actionIconsMenu'].close(); }
            if( UI.dialogueBoxOpen ){ UI.dialogueBoxClose(); }
            if( UI.actionIconsTextOpen ){ UI.actionIconsTextClose(); }
        }
        // character clicked, break selectLoop
        return true;
    }
    // character not clicked, do not break selectLoop
    return false;
}

// Action distributor to Attack, Consider, Examine
function handleActionQueue(ent){
    switch(UI.actionIconsQueue){
        case 'attack': {
            handleAttackSelect(ent);            
        } break;
        case 'consider': {
            handleConsiderSelect(ent);
        } break;
        case 'examine': {
            handleExamineSelect(ent);
        } break;
    }
}

function handleAttackSelect(opp){
    console.log(`Attack opp = `, opp.type);
    switch(opp.type){
        case 'player': {
            UI.dialogueBox("You contemplate attacking yourself.");
        } break;
        case 'NPC': {
            UI.dialogueBox(`En garde, ${opp.creds.name2nd}, prepare for battle!`);

            const id = 'battle-' + genID();
            newBattle( id, ent['player1'], opp );
        } break;
        case 'floor': {
            UI.dialogueBox("There doesn't seem to be anything there.");
        } break;
    }

    UI.actionIconsTextClose();
}

function handleConsiderSelect(opp){
    //console.log(`Guarding ${ent.name}`);
    switch(opp.type){
        case 'player': {
            UI.dialogueBox(`You ponder your strengths and weaknesses in battle.`);
        } break;
        case 'NPC': {
            UI.considerText( consider(opp, ent['player1']) );
        } break;
        case 'floor': {
            UI.dialogueBox("There doesn't seem to be anything there.");
        } break;
    }

    UI.actionIconsTextClose();
}

function handleExamineSelect(char){
    switch(char.type){
        case 'player': {
            UI.dialogueBox("You are in good health and see nothing of concern.");
        } break;
        case 'NPC': {
            UI.dialogueBox(`${char.creds.desc}`);
        } break;
        case 'floor': {
            UI.dialogueBox("You examine the ground and see nothing in particular.");
        } break;
    }
    UI.actionIconsTextClose();
}

