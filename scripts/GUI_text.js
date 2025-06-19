import { game } from './MAIN.js';
import { logs, ent, boxSizes } from './GAME_data.js';
import { UI, processInput } from './GAME_input.js';
import { cameraPan } from './GAME_camera.js';
import { Vector3 } from "./THREE/three.core.js";
import { plasmaball } from "./FX_plasmaball.js";
import { events, addBattleEvent } from "./UTIL_events.js";
import { genID } from "./UTIL_idGen.js";
import { newBattle } from "./UTIL_battle.js";
import { d20 } from "./UTIL_dice.js";
//import { addTimedEvent } from "./UTIL_timers.js";
//import { genID } from "./UTIL_idGen.js";

document.addEventListener('DOMContentLoaded', () => {

    game.screen = document.getElementById("game-container");
    game.screen.appendChild( game.renderer.domElement );

/////************** MOUSE CLICK INPUT MAIN ***************************/
    game.screen.addEventListener('click', function(event){
        if(!UI.dialogueClick){
            const clicked = processInput(game.renderer.domElement, event, 
                                        game.raycaster, game.camera);
            console.log('clicked = ', clicked);
        } else {
            UI.dialogueClick = false;
        }
    });



/////******----  KEYBOARD INPUT (for debugging) ----*******************/
    document.addEventListener('keydown', (e) => {
        if(e.keyCode === 84){ // t for scoutDrone.talk()
            if(!UI.dialogueBoxOpen){
                ent['drone1'].talk();
                UI.dialogueBox(logs.welcome('friend'));
            } else {
                const box = document.getElementById("dialogueBox");
                game.screen.removeChild(box);
                UI.dialogueBoxOpen = false;
                UI.dialogueBoxClose = null;
            }
        } else if(e.keyCode === 13) {   // 13 = [Enter] key for testing
            UI.debugPrint();
        } else if(e.keyCode === 67) {
            console.log("scene.children = ", game.scene.children);
        } else if(e.keyCode === 68){    //d for hitText
            UI.hitText({
                text: '100',
                color: 'hitRed',
                position: ent['player1'].glb.position,
                camera: game.camera,
                textHeight: boxSizes['player'].textHeight,
            });

            UI.hitText({
                text: 'found potion',
                color: 'infoYellow',
                position: ent['char1'].glb.position,
                camera: game.camera,
                textHeight: boxSizes['char'].textHeight,
            });

            UI.hitText({
                text: '250',
                color: 'healGreen',
                position: ent['char2'].glb.position,
                camera: game.camera,
                textHeight: boxSizes['char_red'].textHeight,
            });
            UI.hitText({
                text: '300',
                color: 'hitRed',
                position: ent['drone1'].glb.position,
                camera: game.camera,
                textHeight: boxSizes['drone'].textHeight
            });
        } else if(e.keyCode === 76){ // L for battle testing
            //const pName = plasmaball( new Vector3(0,5,0), game.scene );
            //setTimeout( ent[ pName ].remove, 2000 );
           
            const id = 'battle-' + genID();
            const battleData = {
                opp1: ent['player1'],
                opp2: ent['drone1'],

            }
            addBattleEvent( id, battleData );
                    
        } else { // Defaults to cameraPan
            cameraPan(e.keyCode, game.camera);
        }
});
    


/////*****---- DIALOGUE BOX FUNCTION ----****************************/
    UI['dialogueBox'] = function(text, color = ""){
        this.dialogueBoxOpen = true;
    
        const box = document.createElement("div");
        const vis = document.createElement("span");
        const invis = document.createElement("span");
        vis.classList.add('textVis');
        if( color.length > 0 ){ vis.classList.add(color); }
        invis.classList.add('textInvis');

        box.classList.add('dialogue');
        box.id = 'dialogueBox';
        invis.textContent = text[0].toUpperCase() + text.slice(1);
        box.appendChild( vis );
        box.appendChild( invis );
        game.screen.appendChild( box );
        dialText(text, vis, invis);

        this.dialogueBoxClose = () => {
            this.dialogueBoxOpen = false;
            game.screen.removeChild(box);
        } 
    
        //click to remove box
        box.addEventListener('click', () => {
            this.dialogueClick = true;
            this.dialogueBoxClose();
        });
    };



/////********---- ACTION MENU TEXT FUNCTION ----********************/
    UI['actionIconsText'] = function(mode){
        this.actionIconsTextOpen = true;
        let text = 'default text (actionIconsText)';
        switch(mode){
            case 'attack': {
                text = logs.attackQueue;
                this.actionIconsQueue = mode;
            } break;
            case 'consider': {
                text = logs.considerQueue;
                this.actionIconsQueue = mode;
            } break;
            case 'examine': {
                text = logs.examineQueue;
                this.actionIconsQueue = mode;
            } break;
            case 'inventory': {
                text = logs.inventoryTemp;
                this.actionIconsQueue = mode;
            } break;
            case 'profile': {
                text = logs.profileTemp;
                this.actionIconsQueue = mode;
            } break;
        }

        // prepare HTML elements
        const box = document.createElement("div");
        const vis = document.createElement("span");
        const invis = document.createElement("span");
        vis.classList.add("textVis");
        invis.classList.add("textInvis");
        box.classList.add('dialogue');
        box.id = 'actionIconsText';
        invis.textContent = text;

        // add to game.screen DOM element in index.html
        box.appendChild( vis );
        box.appendChild( invis );
        game.screen.appendChild( box );
        dialText(text, vis, invis);

        // temp function to remove box
        this.actionIconsTextClose = () => {
            game.screen.removeChild(box);
            this.actionIconsTextOpen = false;
            // execute and destroy element :)
            this.actionIconsQueue = null;
            this.actionIconsTextClose = null;
        }

        if(mode === 'profile' || mode === 'inventory'){
            box.addEventListener('click', () => {
                this.dialogueClick = true;
                this.actionIconsTextClose();
            });
        }
    };



/////*******---- CONSIDER TEXT FUNCTION ----***************************/
    UI['considerText'] = function(textInfo){
        const text = textInfo.text;
        const color = textInfo.color;

        this.dialogueBox(text, color);
    };


/////******------ HIT TEXT FUNCTION -----***************************/
    UI['hitText'] = function(textInfo){
        this.hitTextOpen = true;
        const text = textInfo.text;
        const color = textInfo.color;
        const textHeight = textInfo.textHeight;

        const widthHalf = game.screen.clientWidth / 2;
        const heightHalf = game.screen.clientHeight / 2;

        const point = new Vector3().set(textInfo.position.x,
                                        textInfo.position.y + textHeight,
                                        textInfo.position.z )
                                        .project( textInfo.camera );

        const xp = (point.x * widthHalf) + widthHalf;
        const yp = -(point.y * heightHalf) + heightHalf;

        const box = document.createElement("div");
        const vis = document.createElement("span");
        const invis = document.createElement("span");

        box.style = `position: absolute; left: ${ xp }px; top: ${ yp - textHeight }px; \
            transform: translate(-50%, -50%); \ 
            border: none; \
            background: rgba(0,0,0,0); \
            border-radius: 3cqmin; \
            width: auto; \
            font-family: "Gerdana"; \
            font-weight: 800; \
            font-style: normal; \
            font-size: 4cqmin; \
            padding: 1cqmin; \
            color: #ccbbcc; \
            z-index: 10; `;

        box.style.animationName = 'hitTextFade';

        //box.style.animationDelay = '0.1s';
        box.style.animationDuration = '1.3s';
        //box.style.animationTimingFunction = 'ease-in';
        box.style.animationFillMode = 'forwards';

        vis.classList.add('hitTextVis');
        invis.classList.add('textInvis');

        invis.innerText = text;
        if(color.length > 0){ vis.classList.add(`${color}`); }

        box.appendChild( vis );
        box.appendChild( invis );
        game.screen.appendChild( box );

        if(color !== 'infoYellow'){
            hitDialText(text, vis, invis);
        } else {
            infoDialText(text, vis, invis);
        }

        /* REMOVE HIT-TEXT ELEMENT */
        this.hitTextClose = function(){
            this.hitTextOpen = false;
            game.screen.removeChild( box );
            
        };

        /* EXECUTE REMOVAL AFTER ANIMATION */
        setTimeout(this.hitTextClose, 1700);


    }

    console.log("DOMContentLoaded (from GUI text)");
});  // EventListener



////***** ON LOAD - ADJUST FOR FONT SPACING *****************************/
export function textFontInit(){
    const text = "abcdef ghijkl mnopqr stuvw xyz";
    const box = document.createElement("box");
    const invis = document.createElement("span");
    invis.classList.add('textInvis');
    box.classList.add('dialogue_init');
    invis.innerText = text;
    box.appendChild( invis );
    game.screen.appendChild( box );
    setTimeout(() => {
        game.screen.removeChild( box );
    }, 350);
}



/////************ - UNIVERSAL TEXT BOX - **********************************/
function dialText(text, vis, invis, speed = 13){
    let i = 0;
    function type(){
        // check box size for long text, implement V arrow icon for "next"
        if(i < text.length){
            vis.innerText += text[i];
            invis.innerText = text.slice(i+1);
            i += 1;
            setTimeout(type, speed);
        }
    }
    type();
}



function hitDialText(text, vis, invis, speed = 10){
    let i = 0;
    function type(){
        if(i < text.length){
            vis.innerText += text[i];
            invis.innerText = text.slice(i+1);
            i += 1;
            setTimeout(type, speed);
        }
    }
    type();
}

function infoDialText(text, vis, invis, speed = 2){
    let i = 0;
    function type(){
        if(i < text.length){
            vis.innerText += text[i];
            invis.innerText = text.slice(i+1);
            i += 1;
            setTimeout(type, speed);
        }
    }
    type();
}



/* 
// Create stylesheet for custom style injections if necessary

let dynamicStyleSheet = null;

function getDynamicStyleSheet(){
    if(!dynamicStyleSheet){
        const styleEl = document.createElement('style');
        styleEl.type = 'text/css';
        document.head.appendChild( styleEl );
        dynamicStyleSheet = styleEl.sheet;
        if(!dynamicStyleSheet){
            console.log(`ERROR creating dynamic stylesheet`);
            return null;
        }
    }
    return dynamicStyleSheet;
} */




