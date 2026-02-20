
Vue.component('task', {
    props: ['task', 'isEditable'],
    data() {
        return {
            editing: false,
            editTitle: this.task.title
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
            this.editTitle = this.task.title;
        },
        deleteTask() {
            if (this.isEditable) this.$emit('delete-task', this.task.id);
        },
        onDragStart(event) {
            event.dataTransfer.setData('text/plain', this.task.id);
            event.dataTransfer.effectAllowed = "move";
        }
    },
    template: `
    <div class="task" draggable="true" @dragstart="onDragStart">
      <div class="task-container" v-if="!editing">
        <span>{{ task.title }}</span>
        <template v-if="isEditable">
          <button @click="startEdit">Редактировать</button>
          <button @click="deleteTask">Удалить</button>
        </template>
      </div>
      <div v-else>
        <input v-model="editTitle" @keyup.enter="saveEdit" />
        <button @click="saveEdit">Сохранить</button>
        <button @click="cancelEdit">Отмена</button>
      </div>
    </div>
  `
});

Vue.component('column', {
    props: ['status', 'tasks', 'isFirst'],
    data() {
        return {
            newTaskTitle: ''
        };
    },
    methods: {
        addTask() {
            const title = this.newTaskTitle.trim();
            if (title) {
                this.$emit('add-task', title);
                this.newTaskTitle = '';
            }
        },
        onDrop(event) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('text/plain');
            if (taskId) {
                this.$emit('drop-task', { id: parseInt(taskId), newStatus: this.status });
            }
        },
        onDragOver(event) {
            event.preventDefault();
        },
        editTask(id, title) {
            this.$emit('edit-task', id, title);
        },
        deleteTask(id) {
            this.$emit('delete-task', id);
        }
    },
    template: `
    <div class="column" @dragover="onDragOver" @drop="onDrop">
      <h3>{{ status }}</h3>

      <div v-if="isFirst" class="add-task">
        <input v-model="newTaskTitle" placeholder="Новая задача" @keyup.enter="addTask" />
        <button @click="addTask">Добавить</button>
      </div>

      <task 
        v-for="task in tasks" 
        :key="task.id" 
        :task="task" 
        :isEditable="isFirst" 
        @edit-task="editTask" 
        @delete-task="deleteTask"
      ></task>
    </div>
  `
});

new Vue({
    el: '#app',
    data: {
        statuses: ['Запланированные задачи', 'Задачи в работе', 'Тестирование', 'Выполненные задачи'],
        tasks: [
            { id: 1, title: 'Задача 1', status: 'To Do' },
            { id: 2, title: 'Задача 2', status: 'In Progress' },
            { id: 3, title: 'Задача 3', status: 'Review' }
        ],
        nextId: 4
    },
    methods: {
        filteredTasks(status) {
            return this.tasks.filter(t => t.status === status);
        },
        addTask(title) {
            this.tasks.push({
                id: this.nextId++,
                title,
                status: this.statuses[0]
            });
        },
        editTask(id, newTitle) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.title = newTitle;
            }
        },
        deleteTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
        },
        onDropTask({ id, newStatus }) {
            const task = this.tasks.find(t => t.id === id);
            if (task && task.status !== newStatus) {
                task.status = newStatus;
            }
        }
    }
});