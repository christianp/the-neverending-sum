import {choice,number_of_digits,randrange} from './maths.js';
import * as maths from './maths.js';
import {ops,Op} from './ops.js';

window.maths = maths;

class Sum {
    constructor(input, level, op) {
        this.id = Sum.acc++;
        this.input = input;
        this.level = level;
        this.op = op;
        const {target, description} = op.instance(input, level);
        this.target = target;
        this.description = description;
        this.answer = '';
        this.working_out = '';
        const hue = Math.random()*360;
        const sat = randrange(70, 80);
        const val = randrange(70, 80);
        this.bg = `hsl(${hue}, ${sat}%, ${val}%)`;
    }
}
Sum.acc = 0;

function resize_textarea() {
    this.style.height = (this.value.split('\n').length*1.2+1)+'em';
}
function resize_input() {
    const width = Math.max(this.value.length*.6+3, 5);
    this.style.width = (width)+'em';
}
Vue.directive('autosize', {
    bind: function(el, binding) {
        const tagName = el.tagName
        if (tagName == 'TEXTAREA') {
            el.addEventListener('keypress',resize_textarea);
            resize_textarea.apply(el);
        } else if (tagName == 'INPUT' && (el.type == 'text' || el.type == 'number')) {
            ['keypress','change','keydown','keyup'].forEach(evt=>{
                el.addEventListener(evt,resize_input);
            });
            resize_input.apply(el);
        }
    },

    componentUpdated: function(el, binding, vnode) {
        const tagName = el.tagName;
        if (tagName == 'TEXTAREA') {
            resize_textarea.apply(el);
        } else if (tagName == 'INPUT' && (el.type == 'text' || el.type == 'number')) {
            resize_input.apply(el);
        }
    },

    unbind: function(el) {
        el.removeEventListener('change',resize_textarea);
        el.removeEventListener('change',resize_input);
    }
});

Vue.component('sum', {
    props: ['sum', 'active'], 
    data: function() {
        return {};
    }, 
    computed: {
        answer_number: function() {
            return parseInt(this.sum.answer);
        }, 
        correct: function() {
            return this.answer_number == this.sum.target;
        }
    }, 
    watch: {
        "sum.working_out": function(v){
            const lines = v.trim().split('\n');
            const last_line = lines[lines.length-1];
            this.sum.answer = last_line;
        },
    },
    methods: {
        harder: function() {
            this.$emit('harder');
        }, 
        easier: function() {
            this.$emit('easier');
        }, 
        next: function() {
            if(this.correct) {
                this.$emit('next');
            }
        }
    }, 
    mounted: function() {
        if(this.active) {
            this.$el.querySelector('.answer input').focus();
            this.$el.scrollIntoView({behavior:'smooth', inline: 'center' });
        }
    }, 
    template: `
    <div :class="[{active: active, correct: correct}, 'sum']" :style="{'background-color': sum.bg}">
        <button class="easier" @click="easier" :disabled="sum.level==0">easier</button>
        <p class="op" v-html="sum.description"></p>
        <button class="harder" @click="harder">harder</button>
        <span :class="[{active: answer_number &lt; sum.target}, 'higher']">higher</span>
        <div class="equals">=</div>
        <div class="answer">
            <input type="number" v-autosize="sum.answer" :disabled="!active" v-model="sum.answer" @keyup.13="next">
        </div>
        <span :class="[{active: answer_number &gt; sum.target}, 'lower']">lower</span>
        <button :class="[{active:correct}, 'next']" @click="next">next</button>
        <textarea :disabled="!active" class="working-out" v-model="sum.working_out" v-autosize="sum.working_out"></textarea>
    </div>
    `
})

const data = {
    ops: ops, 
    solved_sums: [], 
    level: 10,
    number: 1,
    current_sum: undefined
}

const vm = new Vue({
    el: '#game', 
    data: data, 
    methods: {
        harder: function() {
            this.level += 1;
            this.new_sum();
        }, 
        easier: function() {
            if(this.level>0) {
                this.level -= 1;
            }
            this.new_sum();
        }, 
        next: function() {
            this.number = this.current_sum.target;
            this.solved_sums.push(this.current_sum);
            this.new_sum();
        }, 
        new_sum: function() {
            const level = Math.floor(this.level / number_of_digits(this.number));
            const ops = this.ops
                .filter(x=>(this.current_sum===undefined || x!=this.current_sum.op) && x.from<=level/x.scale && x.to>=level/x.scale && x.from_input <= this.number)
                .filter(x=>{
                    const s = x.instance(this.number,level);
                    return s.target>1;
                })
            ;
            
            const op = choice(ops);
            if(!op) {
                throw(new Error("no ops"));
            }
            console.log(`level ${this.level} ${level} (${op.from} ${level/op.scale})`);
            this.current_sum = new Sum(this.number, level, op);
        }
    }
})
vm.new_sum();
window.vm = vm;
