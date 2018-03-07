export function choice(list) {
    const i = Math.floor(Math.random()*list.length);
    return list[i];
}
export function weighted_choice(list,key) {
    const weights = list.map(key);
    const total = weights.reduce((a,b)=>a+b,0);
    const r = Math.random()*total;
    let t = 0;
    for(let [i,w] of weights.entries()) {
        t += w;
        if(t>=r) {
            return list[i];
        }
    }
}
export function randrange(a, b) {
    return Math.floor(Math.random()*(b-a)+a);
}

export function partition(n,pieces) {
    const f = [];
    let ft = 0;
    for(let i=0;i<pieces;i++) {
        const fi = Math.random();
        ft += fi;
        f.push(fi);
    }
    const p = [];
    let t = 0;
    for(let i=0;i<pieces;i++) {
        const k = Math.floor(n*f[i]/ft);
        t += k;
        p.push(k);
    }
    while(t<n) {
        const i = Math.floor(Math.random()*pieces);
        p[i] += 1;
        t += 1;
    }
    return p;
}

export function number_of_digits(n) {
    return Math.floor(Math.abs(n)).toString().length;
}
export function gcd(a, b) {
    if(b>a) {
        [a, b] = [b, a];
    }
    while(b>0) {
        const r = a%b;
        [a, b] = [b, r];
    }
    return a;
}
export function lcm(a,b) {
    const g = gcd(a,b);
    return a*b/g;
}

export function digits_of(n) {
    n = Math.floor(Math.abs(n));
    let ds = [];
    while(n) {
        const r = n%10;
        ds.splice(0, 0, r);
        n = (n-r)/10;
    }
    return ds;
}

export function base_digits_of(n,b) {
    const ds = [];
    while(n) {
        const d = n%b;
        ds.splice(0,0,d);
        n = (n-d)/b;
    }
    return ds;
}
export const binary_digits_of = n => base_digits_of(n,2);

export function sum(ns) {
    return ns.reduce((a, b)=>a+b, 0);
}

export function n_digit_number(n) {
    if(n<2) {
        return randrange(2,9);
    }
    return Math.floor(Math.random()*9+1)*Math.pow(10, n-1)+ (Math.floor(Math.random()*Math.pow(10, n-1)))
}

export function join_and(list) {
    if(!list.length) { 
        return '';
    }
    return list.slice(0,list.length-1).join(', ')+(list.length>1 ? ` and ${list[list.length-1]}` : list[0]+'');
}
