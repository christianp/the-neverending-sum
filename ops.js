import {randrange, partition, number_of_digits, gcd, lcm, digits_of, sum, n_digit_number, join_and, base_digits_of} from './maths.js';

export class Op {
    constructor(fn, scale, from, to=Infinity, from_input = 0) {
        this.fn = fn;
        this.scale = scale;
        this.from = from;
        this.to = to;
        this.from_input = from_input;
    }
    closest_level(level) {
        const f = (level-this.from)/this.scale;
        return Math.random()>(f%1) ? Math.floor(f) : Math.ceil(f);
    }
    instance(input, level) {
        return this.fn(input, this.closest_level(level));
    }
}

export const ops = [];

function add(input, level) {
    const digits = Math.max(number_of_digits(input)+level, 1);
    const diff = n_digit_number(digits);
    if(diff<input && Math.random()<0.5) {
        return {
            description: `${input} - ${diff}`, 
            target: input-diff
        }
    } else {
        return {
            description: `${input} + ${diff}`, 
            target: input+diff
        }
    }
}
ops.push(new Op(add, 3, 0, 2));

function add_modulo(input, level) {
    [input, level] = [Math.max(input, level), Math.min(input, level)];
    const digits = Math.max(number_of_digits(input), 1);
    const diff = n_digit_number(digits);
    const mod = n_digit_number(level+1);
    return {
        description: `${input} + ${diff}, modulo ${mod}`, 
        target: (input+diff)%mod
    }
}
ops.push(new Op(add_modulo, 3, 1, 4));

function add_several(input, level) {
    level += 1;
    const nd = number_of_digits(input) * level;
    const p = partition(nd, level).filter(x=>x>0);
    let to_add = input;
    let total = input;
    for(let size of p) {
        const n = n_digit_number(size);
        if(n<total && Math.random()>0.5) {
            total -= n;
            to_add += ` - ${n}`;
        } else {
            total += n;
            to_add += ` + ${n}`;
        }
    }
    return {
        target: total, 
        description: to_add
    }
}
ops.push(new Op(add_several, 1, 2));

function find_digit_sum(input, level) {
    level += 1;
    const digits = digits_of(input);
    const target = sum(digits.map(x=>Math.pow(x, level)));
    let description;
    switch(level) {
        case 1:
            description = `sum of the digits of ${input}`;
            break;
        case 2:
            description = `sum of the squares of the digits of ${input}`;
            break;
        case 3:
            description = `sum of the cubes of the digits of ${input}`;
            break;
        default:
            description = `sum of the ${level}th powers of the digits of ${input}`;
    }
    return {target, description};
}
ops.push(new Op(find_digit_sum, 1.2, 0, 5, 11));

function multiply(input, level) {
    const n = n_digit_number(level);
    return {
        target: n*input, 
        description: `${input} × ${n}`
    }
}
ops.push(new Op(multiply, 2, 0, Infinity, 1));

function multiply_modulo(input, level) {
    [input, level] = [Math.max(input, level), Math.min(input, level)];
    const digits = Math.max(number_of_digits(input), 1);
    const b = n_digit_number(digits);
    const mod = n_digit_number(level+1);
    return {
        description: `${input} × ${b}, modulo ${mod}`, 
        target: (input*b)%mod
    }
}
ops.push(new Op(multiply_modulo, 3, 1, 5));

function multiply_several(input, level) {
    const nd = number_of_digits(input) * level;
    const p = partition(nd, level).filter(x=>x>0);
    let to_add = input;
    let total = input;
    for(let size of p) {
        const n = n_digit_number(size);
        total *= n;
        to_add += ` × ${n}`;
    }
    return {
        target: total, 
        description: to_add
    }
}
ops.push(new Op(multiply_several, 2, 2, 6));

function integer_divide(input, level) {
    const n = n_digit_number(Math.min(number_of_digits(input)-1, level));
    return {
        target: Math.floor(input/n), 
        description: `number of times ${n} goes into ${input}`
    }
}
ops.push(new Op(integer_divide, 3, 0, Infinity, 10));

function remainder(input, level) {
    let n = n_digit_number(level);
    while(input%n==0) {
        n += 1;
    }
    return {
        target: input % n, 
        description: `remainder when dividing ${input} by ${n}`
    }
}
ops.push(new Op(remainder, 3, 2, Infinity, 100));

function find_gcd(input, level) {
    const b = n_digit_number(number_of_digits(input)+level);
    return {
        target: gcd(input, b), 
        description: `greatest common divisor of ${input} and ${b}`
    };
}
ops.push(new Op(find_gcd, 1, 3, Infinity, 12));

function find_lcm(input, level) {
    const b = n_digit_number(number_of_digits(level+1));
    return {
        target: lcm(input, b), 
        description: `lowest common multiple of ${input} and ${b}`
    };
}
ops.push(new Op(find_lcm, 1, 3, Infinity, 12));

function biggest_power_under(input, level) {
    const p = Math.floor(Math.log(input)/Math.log(level));
    const target = Math.pow(level, p);
    return {
        target: target, 
        description: `largest power of ${level} less than or equal to${input}`
    }
}
ops.push(new Op(biggest_power_under, 1, 2, Infinity, 2));

function find_arithmetic_mean(input, level) {
    let total = input;
    const nd = number_of_digits(input);
    const ns = [input];
    const denom = level+2;
    for(let i=0;i<level+1;i++) {
        let n = n_digit_number(nd);
        total += n;
        if(i==level) {
            let d = (denom - total)%denom;
            if(n+d<0) {
                d += denom;
            }
            n += d;
            total += d;
        }
        ns.push(n);
    }
    return {
        target: total/denom, 
        description: `arithmetic mean of ${join_and(ns)}`
    }
}
ops.push(new Op(find_arithmetic_mean, 2, 0));

function in_base(input,level) {
    const base = level>=8 ? level+3 : level+2;
    const ds = base_digits_of(input,base);
    let base_desc = ['binary','ternary'][base-2] || `base ${base}`;
    return {
        target: parseInt(ds.join('')),
        description: `${input} in ${base_desc}`
    };
}
ops.push(new Op(in_base, 3, 3));
