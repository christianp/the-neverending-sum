import {randrange, partition, number_of_digits, gcd, lcm, digits_of, sum, n_digit_number, join_and, base_digits_of} from './maths.js';

export class Op {
    constructor(name, fn, scale, from, to=Infinity, from_input = 0) {
        this.name = name;
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
ops.push(new Op('add a number',add, 3, 0, 2));

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
ops.push(new Op('add a number modulo another',add_modulo, 3, 5, 4));

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
ops.push(new Op('add several numbers',add_several, 1, 2));

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
ops.push(new Op('find the sum of Nth powers of the digits',find_digit_sum, 1.2, 1, 5, 11));

function multiply(input, level) {
    const n = n_digit_number(level);
    return {
        target: n*input, 
        description: `${input} × ${n}`
    }
}
ops.push(new Op('multiply by a number',multiply, 2, 0, Infinity, 1));

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
ops.push(new Op('multiply by a number, modulo another number',multiply_modulo, 3, 5, 5));

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
ops.push(new Op('multiply by several numbers',multiply_several, 4, 6, 6));

function integer_divide(input, level) {
    const n = n_digit_number(Math.min(number_of_digits(input)-1, level));
    return {
        target: Math.floor(input/n), 
        description: `number of times ${n} goes into ${input}`
    }
}
ops.push(new Op('divide by a number',integer_divide, 3, 2, Infinity, 10));

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
ops.push(new Op('find the remainder when dividing by a number',remainder, 3, 2, Infinity, 100));

function find_gcd(input, level) {
    const b = n_digit_number(number_of_digits(input)+level);
    return {
        target: gcd(input, b), 
        description: `greatest common divisor of ${input} and ${b}`
    };
}
ops.push(new Op('find the greatest common divisor with a number',find_gcd, 5, 6, Infinity, 12));

function find_lcm(input, level) {
    const b = n_digit_number(level+1);
    return {
        target: lcm(input, b), 
        description: `lowest common multiple of ${input} and ${b}`
    };
}
ops.push(new Op('find the lowest common multiple with a number',find_lcm, 6, 6, Infinity, 12));

function biggest_power_under(input, level) {
    const base = randrange(2,level);
    const p = Math.floor(Math.log(input)/Math.log(base));
    const target = Math.pow(base, p);
    return {
        target: target, 
        description: `largest power of ${base} less than or equal to ${input}`
    }
}
ops.push(new Op('find the largest power of a given number under the input',biggest_power_under, 1, 5, Infinity, 2));

function find_arithmetic_mean(input, level) {
    let total = input;
    const nd = number_of_digits(input);
    const ns = [input];
    const denom = level+2;
    const base = n_digit_number(nd);
    for(let i=0;i<level+1;i++) {
        let n = n_digit_number(nd) + base;
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
ops.push(new Op('find the arithmetic mean of a list of numbers',find_arithmetic_mean, 2, 3));

function find_mode(input,level) {
    const n = level+2;
    const nd = number_of_digits(input);
    const numbers = [];
    for(let i=0;i<n;i++) {
        numbers.push(randrange(1,Math.pow(10,nd)));
    }
    const number_set = new Set(numbers);
    let max = 0;
    let maxx = undefined;
    const out = [];
    for(let x of number_set) {
        const count = randrange(1,5);
        if(count>max) {
            max = count;
            maxx = x;
        }
        for(let i=0;i<count;i++) {
            out.splice(randrange(0,out.length),0,x);
        }
    }
    out.splice(randrange(0,out.length),0,maxx);
    return {
        target: maxx,
        description: `modal value of ${join_and(out)}`
    }
}
ops.push(new Op('find the modal value in a list',find_mode,1,2));

function in_base(input,level) {
    const base = level>=8 ? level+3 : level+2;
    const ds = base_digits_of(input,base);
    let base_desc = ['binary','ternary'][base-2] || `base ${base}`;
    return {
        target: parseInt(ds.join('')),
        description: `${input} in ${base_desc}`
    };
}
ops.push(new Op('rewrite in a given base',in_base, 2, 7));
