const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';



export function genID(){
    return grab5() + '-' + grab7() + '-' + performance.now();
}

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function grab5(){
    let res = "";
    for(let i = 0; i < 5; i++){
        res += alpha[ randomInt(0,61) ];
    }
    return res;
}

function grab7(){
    let res = '';
    for(let i = 0; i < 7; i++){
        res += alpha[ randomInt(0,61) ];
    }
    return res;
}
