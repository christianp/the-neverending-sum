import {choice,weighted_choice,number_of_digits,randrange} from './maths.js';
import * as maths from './maths.js';
import {ops,Op} from './ops.js';

window.maths = maths;

class Sum {
    constructor(input, level) {
        this.id = Sum.acc++;
        this.input = input;
        this.level = level;
        this.answer = '';
        this.working_out = '';
        const hue = Math.random()*360;
        const sat = randrange(70, 80);
        const val = randrange(70, 80);
        this.bg = `hsl(${hue}, ${sat}%, ${val}%)`;
    }

    set_target(op) {
        this.target = op.target;
        this.description = op.description;
    }

    toJSON() {
        return {
            input: this.input,
            level: this.level,
            target: this.target,
            description: this.description,
            answer: this.answer,
            working_out: this.working_out,
            bg: this.bg
        };
    }
    static load(data) {
        const s = new Sum();
        Object.assign(s,data);
        return s;
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
            const answer = this.sum.answer;
            if(!answer.match(/^\d+$/)) {
                return NaN;
            }
            return parseInt(answer);
        }, 
        correct: function() {
            return this.answer_number == this.sum.target;
        }
    }, 
    watch: {
        "sum.working_out": function(v){
            const lines = v.trim().split('\n');
            const last_line = lines[lines.length-1].trim();
            if(!isNaN(last_line)) {
                this.sum.answer = last_line;
            }
        },
    },
    methods: {
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
        <p class="op" v-html="sum.description"></p>
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
    current_sum: undefined,
    storage_key: 'neverending-sum',
    faces: ["😇","😎","😁","😀","😄","😃","😅","😂","😆","😬","😏","😐","😑","😕","😒","😔","😓","😞","😟","😢","😖","😣","😠","😦","😧","😨","😥","😭","😤","😡","😈"]
}

const vm = new Vue({
    el: '#game', 
    data: data, 
    watch: {
        current_sum: function() {
            this.save();
        }
    },
    computed: {
        face: function() {
            const n = Math.min(this.faces.length-1,this.level);
            return this.faces[n];
        }
    },
    methods: {
        save: function() {
            const data = {
                solved_sums: this.solved_sums.map(s=>s.toJSON()),
                current_sum: this.current_sum.toJSON(),
                level: this.level,
                number: this.number,
            }
            localStorage.setItem(this.storage_key, JSON.stringify(data));
        },
        load: function() {
            const j = localStorage.getItem(this.storage_key);
            if(!j) {
                this.reset();
                return;
            }
            const d = JSON.parse(j);
            this.solved_sums = d.solved_sums.map(Sum.load);
            this.current_sum = Sum.load(d.current_sum);
            this.level = d.level;
            this.number = d.number;
            Sum.acc = this.solved_sums.length + 1;
        },
        try_reset: function() {
            if(!confirm("Reset all your data? You'll lose all your solved sums")) {
                return;
            }
            this.reset();
        },
        reset: function() {
            this.solved_sums = [];
            this.level = 1;
            this.number = 1;
            this.current_sum = undefined;
            this.new_sum();
        },
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
            ;
            const instances = ops
                .map(x=>{ return {op:x,instance:x.instance(this.number,level)} })
                .filter(x=>x.instance.target>1)
            ;
 
            const weight_of = x=>1/(1+Math.abs(level-x.op.from));
            const op = weighted_choice(instances,weight_of);
            if(!op) {
                throw(new Error("no ops"));
            }
            this.current_sum = new Sum(this.number, level);
            this.current_sum.set_target(op.instance);
        }
    }
})
vm.load();
window.vm = vm;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
