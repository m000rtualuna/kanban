Vue.component('task', {

    props: ['task', 'isEditable', 'status'],

    data() {
        return {
            editing: false,
            editTitle: this.task.title,
            editDescription: this.task.description,
            editDeadline: this.task.deadline
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
                this.$emit('edit-task', this.task.id, {
                    title: this.editTitle.trim(),
                    description: this.editDescription.trim(),
                    deadline: this.editDeadline,
                    updatedAt: new Date().toISOString()
                });
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
            if (this.editing) {
                event.preventDefault();
                return;
            }
            event.dataTransfer.setData('text/plain', this.task.id);
            event.dataTransfer.effectAllowed = "move";
        },

        formattedDate(dateString) {
            if (!dateString) return '';
            const d = new Date(dateString);
            return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' });
        },
    },

    template: `
<div class="task" :draggable="!editing" @dragstart="onDragStart">
  <div v-if="!editing">
    <h4>{{ task.title }}</h4>
    <p>{{ task.description || 'Задача без описания' }}</p>
    <small><strong>Задача поставлена:</strong> {{ formattedDate(task.createdAt) }}</small><br />
    <small><strong>Дедлайн:</strong> {{ task.deadline ? formattedDate(task.deadline) : 'не указан' }}</small>
    <small v-if="task.updatedAt"><strong>Отредактировано:</strong> {{ formattedDate(task.updatedAt) }}</small><br>
   
     <small v-if="task.returnReason" class="return-reason">
        <strong>Причина возврата:</strong> {{ task.returnReason }}
     </small>
     
     <small v-if="task.status === 'Выполненные задачи'">
        <span v-if="task.isOverdue">Выполнено с опозданием</span>
        <span v-else>Выполнено в срок</span>
    </small>

    <template v-if="isEditable">
    <div class="btns">
          <button @click="startEdit">Редактировать</button>
      <button v-if="isEditable && !(status === 'Задачи в работе' || status === 'Тестирование')" @click="deleteTask">Удалить</button>
    </div>
    </template>
  </div>

  <div class="task-edit" v-else>
    <input v-model="editTitle" placeholder="Заголовок" />
    <textarea v-model="editDescription" placeholder="Описание"></textarea>
    <input type="date" v-model="editDeadline" />

    <div class="btns">
        <button @click="saveEdit">Сохранить</button>
        <button @click="cancelEdit">Отмена</button>
</div>

  </div>
</div>
  `
});


Vue.component('column', {
    props: ['status', 'tasks', 'isFirst'],
    data() {
        return {
            newTaskTitle: '',
            newTaskDescription: '',
            newTaskDeadline: ''
        };
    },

    computed: {
        isEditable() {
            return ['Запланированные задачи', 'Задачи в работе', 'Тестирование'].includes(this.status);
        }
    },

    methods: {
        addTask() {
            const title = this.newTaskTitle.trim();
            const description = this.newTaskDescription.trim();
            const deadline = this.newTaskDeadline.trim();

            if (!title) {
                alert('Пожалуйста, введите заголовок задачи');
                return;
            }
            if (!description) {
                alert('Пожалуйста, введите описание задачи');
                return;
            }
            if (!deadline) {
                alert('Пожалуйста, укажите дедлайн');
                return;
            }

            this.$emit('add-task', {
                title,
                description,
                deadline
            });

            this.newTaskTitle = '';
            this.newTaskDescription = '';
            this.newTaskDeadline = '';
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

        editTask(id, updatedFields) {
            this.$emit('edit-task', id, updatedFields);
        },

        deleteTask() {
            if (this.isEditable && !(this.status === 'Задачи в работе' || this.status === 'Тестирование')) {
                this.$emit('delete-task', this.task.id);
            }
        }
    },

    template: `
    <div class="column" @dragover="onDragOver" @drop="onDrop">
      <h3>{{ status }}</h3>

     <div v-if="isFirst" class="add-task">
          <input v-model="newTaskTitle" placeholder="Заголовок задачи" />
          <textarea v-model="newTaskDescription" placeholder="Описание задачи"></textarea>
          <input type="date" v-model="newTaskDeadline" />
          <button @click="addTask">Добавить</button>
    </div>
    
      <task 
  v-for="task in tasks" 
  :key="task.id" 
  :task="task" 
  :isEditable="isEditable" 
  :status="task.status"
  @edit-task="editTask" 
  @delete-task="deleteTask"
/>
    </div>
  `
});


new Vue({
    el: '#app',
    data: {
        statuses: ['Запланированные задачи', 'Задачи в работе', 'Тестирование', 'Выполненные задачи'],
        tasks: [],
        nextId: 4,
        returnReasonModal: {
            visible: false,
            taskId: null,
            reason: ''
        }
    },

    created() {
        const savedTasks = localStorage.getItem('kanban-tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);

            if (this.tasks.length) {
                this.nextId = Math.max(...this.tasks.map(t => t.id)) + 1;
            }
        }
    },

    watch: {
        tasks: {
            handler(newTasks) {
                localStorage.setItem('kanban-tasks', JSON.stringify(newTasks));
            },
            deep: true
        }
    },

    methods: {
        filteredTasks(status) {
            return this.tasks.filter(t => t.status === status);
        },

        addTask({ title, description, deadline }) {
            const now = new Date().toISOString();

            this.tasks.unshift({
                id: this.nextId++,
                title,
                description,
                deadline,
                createdAt: now,
                status: this.statuses[0]
            });
        },

        editTask(id, updatedFields) {
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                Object.assign(task, updatedFields);
            }
        },

        deleteTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id);
        },

        onDropTask({ id, newStatus }) {
            const task = this.tasks.find(t => t.id === id);
            if (!task) return;

            const currentIndex = this.statuses.indexOf(task.status);
            const newIndex = this.statuses.indexOf(newStatus);

            if (currentIndex === 2) {
                if (newIndex === 3) {
                    task.status = newStatus;

                    if (task.deadline) {
                        const deadlineDate = new Date(task.deadline);
                        const now = new Date();

                        if (deadlineDate < now) {
                            Vue.set(task, 'isOverdue', true);
                            Vue.set(task, 'completedOnTime', false);
                        } else {
                            Vue.set(task, 'isOverdue', false);
                            Vue.set(task, 'completedOnTime', true);
                        }
                    } else {
                        Vue.set(task, 'isOverdue', false);
                        Vue.set(task, 'completedOnTime', true);
                    }

                    Vue.set(task, 'completedAt', new Date().toISOString());

                } else if (newIndex === 1) {
                    this.showReturnReasonModal(id);
                }
            } else {
                if (newIndex === currentIndex + 1) {
                    task.status = newStatus;
                }
            }
        },

        showReturnReasonModal(taskId) {
            this.returnReasonModal.visible = true;
            this.returnReasonModal.taskId = taskId;
            this.returnReasonModal.reason = '';
        },

        confirmReturnTask() {
            const { taskId, reason } = this.returnReasonModal;
            if (!reason.trim()) {
                alert('Пожалуйста, укажите причину возврата');
                return;
            }
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = this.statuses[1];
                Vue.set(task, 'returnReason', reason.trim());
                Vue.set(task, 'updatedAt', new Date().toISOString());
            }
            this.returnReasonModal.visible = false;
            this.returnReasonModal.taskId = null;
            this.returnReasonModal.reason = '';
        },

        cancelReturnTask() {
            this.returnReasonModal.visible = false;
            this.returnReasonModal.taskId = null;
            this.returnReasonModal.reason = '';
        }
    }
});