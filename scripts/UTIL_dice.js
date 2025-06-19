function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function d20(){
    return randomInt(1,20);
}

export function d12(){
    return randomInt(1,12);
}

export function d6(){
    return randomInt(1,6);
}