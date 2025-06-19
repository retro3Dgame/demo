import { game } from './MAIN.js';
import { boxSizes } from './GAME_data.js';
import { d20, d6 } from "./UTIL_dice.js";
import { addConditionalEvent, addBattleEvent } from "./UTIL_events.js";
import { events } from "./UTIL_events.js";
import { UI } from './GAME_input.js';

//////// CREATE NEW BATTLE ////////////////
export function newBattle(id, opp1, opp2){
    const data = { 
        type: 'battle',
        opp1: opp1,
        opp2: opp2,
        start: Date.now(),
        end: false,
    };

    addBattleEvent(
        id,
        data,
        // roundStart: //
        function( rounds ){
            calcRound(rounds, this.data);
            console.log(`round${rounds} in ${this.id} calculated`);

            // check if battle complete
            if(events[id].data.end === true){
                console.log("this.data.end === true");
                events[id].finish();
            }
        },
        // initExec: //
        function(){
            console.log(`battle executed OPP1: ${opp1.name}, OPP2: ${opp2.name}`);
            const stats1 = opp1.creds.stats;
            const stats2 = opp2.creds.stats;
            console.log("stats1 = ", stats1);
            console.log("stats2 = ", stats2);
        },
        // finalExec: //
        function(){
            console.log(`removing ${id} ...`);
            //delete events[battleID];
        },
    );

}

///////// CALCULATE ROUND STRIKES ///////////////
// TODO // Figure amount of strikes per round based on speed differences
// TODO // Create new scheduling system, where 2-3 strikes per round is possible
// TODO // Rounds should now not be time-based, but turn-based
// TODO // Allow multiple attacks to happen in sequence rather than execution-level speed
// TODO // After all attacks and/or moves are completed for both parties, round completion occurs
// TODO // number of attacks per round based on speed ratio (spd1 / spd2)
// TODO // Adjust ConditionalEvent or create new BattleEvent to adjust the 'rounds' timing system
function calcRound(rnd, data){
    const opp1 = data.opp1;
    const opp2 = data.opp2;
    const spd1 = opp1.creds.stats.speed; 
    const spd2 = opp2.creds.stats.speed; 

    const r1 = d20();
    const r2 = d20();

    const roundString = `opp1 rolled: ${ r1 }, opp2 rolled: ${ r2 }`;
    let roundStart;

    // later change to stats1.speed > stats2.speed etc
    if( spd1 > spd2 ){
        roundStart = 1;
    } else if( spd2 > spd1){
        roundStart = 2;
    } else {
        // Tiebreaker roll 50/50
        if( d20() <= 10 ){
            roundStart = 1;
        } else {
            roundStart = 2;
        }
    }

    console.log("Round: ", rnd, ", Start = ", roundStart);
    console.log( roundString );
    // determine how many times opp's attack per round based on speed difference ratio
    const attackVector = {
        spd: 0,
        opp1: 0,
        opp2: 0,
    };

    switch( roundStart ){
        case 1: {
            attackVector.spd = Math.round((spd1 / spd2) * 100)/100;
            const strikes = getAttacksPerRound(attackVector.spd);
            console.log("strikes = ", strikes);
            strikeOpp(opp1, opp2);
            strikeOpp(opp2, opp1);
        } break;
        case 2: {
            attackVector.spd = Math.round((spd2 / spd1) * 100)/100;
            const strikes = getAttacksPerRound(attackVector.spd);
            console.log("strikes = ", strikes);
            strikeOpp(opp2, opp1);
            strikeOpp(opp1, opp2);
        } break;
    }

    if(opp1.creds.stats.HP <= 0){
        data.end = true;
        console.log(`${opp1.name} fell unconscious.`);
    } else if(opp2.creds.stats.HP <= 0){
        data.end = true;
        console.log(`${opp2.name} fell unconscious.`);
    }
}

///////////  PROCESS STRIKE AND DISPLAY HP LOSS //////////////
function strikeOpp(o, d){
    const offense = o.creds.stats;
    const defense = d.creds.stats;
    
    const offRoll = d6() * 0.05;
    const defRoll = d6() * 0.03;

    const attackCalc = ((offense.physicalAttack * 0.1) 
                            + (offense.currentWeapon.attackStrength * 0.1) 
                            + (offense.strength * 0.1)
                            - (defense.strength * 0.05)
                            - (defense.physicalDefense * 0.05 ));
    
    const att = offRoll * attackCalc;
    const def = defRoll * attackCalc;
    const attackDamage = attackCalc + att - def;

    //console.log("att = ", att);
    //console.log("def = ", def);
    //console.log(`attackCalc = `, attackCalc);
    console.log(`attackDamage = `, attackDamage);
    //console.log(`offRoll = `, offRoll);
    //console.log(`defRoll = `, defRoll);

    defense.HP = Math.round( (defense.HP - attackDamage) * 100) / 100; // round to 2 decimals
    const damText = Math.round( attackDamage );

    // Display HP loss on screen
    UI.hitText({
                text: damText.toString(),
                color: 'hitRed',
                position: d.glb.position,
                camera: game.camera,
                textHeight: boxSizes[d.baseModel].textHeight,
    });

    console.log(`${d.name}'s HP remaining = `, defense.HP);
    console.log("********************");
}

function getAttacksPerRound(speed){
    if(speed < 1.3){
        return 1;
    } else if(speed < 1.55){
        return 2;
    } else if(speed < 1.7){
        return 3;
    } else if(speed <= 2){
        return 4;
    } else {
        return 5;
    }
}