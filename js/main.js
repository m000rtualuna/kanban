Vue.component('task', {
    props: ['task', 'isEditable'],

    data() {
        return {
            editing: false,
            editTitle: this.task.title,
        };
    },

    methods: {
        startEdit() {
            if (this.isEditable) {
                this.editing = true;
                this.editTitle = this.task.title;
            }
        },

        saveEdit() {
            if (this.editTitle.trim()) {
                this.$emit('edit-task', this.task.id, this.editTitle.trim());
                this.editing = false;
            }
        },
        cancelEdit() {
            this.editing = false;
        },
    },

    template: `
    <div class="task">
    <div v-if="!editing">
    <span>{{ task.title }}</span>
    <template v-if="isEditable">
    <button @click="startEdit">редактировать</button>
</template>
    <div v-else>
    <input v-model="editTitle" @keyup.enter="saveEdit">
    <button @click="saveEdit">сохранить</button>
    <button @click="cancelEdit">отмена</button>
</div>
</div>
    </div>
  `
});

Vue.component('column', {
    props: ['tasks'],

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
        },

        editTask(id, newTitle) {
            this.$emit('edit-task', id, newTitle);
        }
    },

    template: `
    <div class="column">
     
      <div class="add-task">
        <input placeholder="Новая задача" v-model="newTaskTitle" @keyup.enter="addTask"/>
        <button @click="addTask">Добавить</button>
      </div>
      
      <task v-for="task in tasks" :task="task" @edit-task=editTask"></task>
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
        },

        editTask(id, newTitle) {
            const t = this.tasks.find(t => t.id === id);
        }

    },
});