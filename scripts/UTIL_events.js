
import { genID } from "./UTIL_idGen.js";
// TODO // Implement timing system - increment in MAIN animate()
// TODO // For things like battle rounds, power-ups, other timed events

// GLOBAL EVENTS //
export const events = {};

///////////////// CREATE TIMED EVENT //////////////////////////////
export function addTimedEvent(name, duration, data, update, exec){
    const idKey = name + '-' + genID();
    console.log(`Added event: ${data.eventType}`);
    events[ idKey ] = {
        type: 'timed',
        name,
        tick: 0,            // counter for elapsed time in deltaFrames
        rounds: 1,
        duration,
        started: false,
        completed: false,   // true when completed
        data,               // event message / data
        exec,               // () => {} on create event
        incr: function(delta){
            if(!this.started){      // execute on event start
                this.started = true;
                this.exec();
            }
            this.tick += 1 * delta;
            update( delta );

            if(this.tick >= this.rounds){
                console.log(`${this.name} event round${this.rounds} complete.`);
                this.rounds += 1;
            }
            if(this.tick >= this.duration){ 
                console.log(`${this.name} event completed in ${this.duration} deltaFrames.`);
                this.completed = true;
             }

        }
    }
}

/////////////////////  CREATE CONDITIONAL EVENT ///////////////////////////////////
export function addConditionalEvent(name, data, update, initExec, finalExec){
    events[name] = {
        type: 'conditional',
        name,
        tick: 0,
        rounds: 1,
        started: false,
        completed: false,
        data,
        initExec,
        finalExec,

        incr: function(delta){
            if(!this.started){
                this.started = true;
                initExec( data );
            }

            this.tick += delta;
            if(this.tick >= this.rounds){
                update(this.name, this.rounds);
                //console.log(`${this.name} event round${this.rounds} complete.`);
                this.rounds += 1;
            }
        },

        finish: function(){
            console.log(`Event ${this.name} final execution...`);
            this.finalExec();
            this.completed = true;
        },
    }
}

export function addBattleEvent(name, data, roundStart, initExec, finalExec){
    events[name] = {
        type: 'battle',
        state: 'new',
        name,
        tick: 0,
        rounds: 1,
        strikeCount: 0,
        started: false,
        completed: false,
        data,
        initExec,
        finalExec,
        roundStart,

        incr: function(delta){
            if(!this.started){
                this.started = true;
                this.state = 'roundStart';
                this.initExec();
            }

            switch(this.state){
                case "roundStart": {
                    this.roundStart( this.rounds );
                    this.state = "roundProgress";
                } break;

                case "roundProgress": {
                    this.tick += delta;
                    const strikeAmount = 3;
                    if(this.tick >= 0.3){
                        console.log(`strikes = ${this.strikeCount}`);
                        this.tick = 0;
                        this.strikeCount += 1;
                        if(this.strikeCount === strikeAmount){
                            // TODO // create an ongoing battle sequence
                            // TODO // for now complete for demo purposes
                            this.state = "finish";
                        }
                    }
                } break;

                case "finish": {
                    this.finish();
                } break;
            }
        },

        finish: function(){
            console.log(`Event ${this.name} final execution...`);
            this.finalExec();
            this.completed = true;
        },
    }
}

// for MAIN animate()
export function eventsUpdate(delta){
    for(const key in events){
        events[key].incr(delta);
        if(events[key].completed){
            console.log(`${events[key].name} event completed.`);
            const delete_confirm = delete events[key];
            if(delete_confirm){
                console.log("Event removed successfully: ", key);
            } else {
                console.log("ERROR: deleting event: ", key);
            }
        }
    }
}
