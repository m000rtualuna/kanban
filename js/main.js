Vue.component('task', {
    data() {
        return {
        };
    },

    template: `
    <div class="task">
    </div>
  `
});

Vue.component('column', {
    methods: {
    },

    template: `
    <div class="column">
     
    </div>
  `
});


new Vue({
    el: '#app',
    data: {
        statuses: ['To Do', 'In Progress', 'Review', 'Done'],
    },
    methods: {

    },
});