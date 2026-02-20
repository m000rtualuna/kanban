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
    data() {
        return {
            newTaskTitle:''
        }
    },
    methods: {
        addTask() {
            const title = this.newTaskTitle.trim();
            if (title) {
                this.$emit('add-task', title);
                this.newTaskTitle = '';
            }
        }
    },

    template: `
    <div class="column">
     
      <div class="add-task">
        <input placeholder="Новая задача" v-model="newTaskTitle" @keyup.enter="addTask" />
        <button @click="addTask">Добавить</button>
      </div>
      
    </div>
  `
});


new Vue({
    el: '#app',
    data: {
        statuses: ['To Do', 'In Progress', 'Review', 'Done'],
        tasks: [
            { id: 1, title: 'Задача 1', status: 'To Do' },
            { id: 2, title: 'Задача 2', status: 'In Progress' },
            { id: 3, title: 'Задача 3', status: 'Review' }
        ],
        nextId: 4,
    },
    methods: {
        addTask(title) {
            this.tasks.push({id: this.nextId++, title, status: this.statuses[0] })
        }

    },
});