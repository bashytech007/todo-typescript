


interface Task {
    text: string;
    completed: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Elements
    const themeToggle = document.getElementById('theme-toggle') as HTMLElement;
    const lightIcon = document.getElementById('theme-toggle-light-icon') as HTMLElement;
    const darkIcon = document.getElementById('theme-toggle-dark-icon') as HTMLElement;
    const gradientOverlay = document.getElementById('gradient-overlay') as HTMLElement;
    const backgroundImage1 = document.getElementById('background-image1') as HTMLImageElement;
    const backgroundImage2 = document.getElementById('background-image2') as HTMLImageElement;

    // Task Elements
    const newTaskInput = document.getElementById('new-task-input') as HTMLInputElement;
    const taskList = document.getElementById('task-list') as HTMLElement;
    const itemsLeft = document.getElementById('items-left') as HTMLElement;
    const allFilter = document.getElementById('all-filter') as HTMLElement;
    const activeFilter = document.getElementById('active-filter') as HTMLElement;
    const completedFilter = document.getElementById('completed-filter') as HTMLElement;
    const clearCompleted = document.getElementById('clear-completed') as HTMLElement;

    let tasks: Task[] = [];

    function updateTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'task-completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600';
            checkbox.addEventListener('change', () => toggleTaskCompletion(index));

            const label = document.createElement('label');
            label.textContent = task.text;
            label.className = 'flex-1 text-gray-700 dark:text-gray-300';

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.className = 'text-gray-500 dark:text-gray-400';
            deleteButton.addEventListener('click', () => deleteTask(index));

            li.append(checkbox, label, deleteButton);
            taskList.appendChild(li);
        });
        updateItemsLeft();
    }

    function updateItemsLeft() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        itemsLeft.textContent = `${activeTasks} items left`;
    }

    function addTask(text: string) {
        tasks.push({ text, completed: false });
        updateTasks();
        saveTasks();
    }

    function toggleTaskCompletion(index: number) {
        tasks[index].completed = !tasks[index].completed;
        updateTasks();
        saveTasks(); 
    }

    function deleteTask(index: number) {
        tasks.splice(index, 1);
        updateTasks();
        saveTasks(); 
    }

    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        updateTasks();
        saveTasks(); 
    }

    function filterTasks(filter: string) {
        const allTasks = document.querySelectorAll('.task-item');
        allTasks.forEach(task => {
            switch (filter) {
                case 'all':
                    task.setAttribute('style', 'display: flex;');
                    break;
                case 'active':
                    if (task.classList.contains('task-completed')) {
                        task.setAttribute('style', 'display: none;');
                    } else {
                        task.setAttribute('style', 'display: flex;');
                    }
                    break;
                case 'completed':
                    if (task.classList.contains('task-completed')) {
                        task.setAttribute('style', 'display: flex;');
                    } else {
                        task.setAttribute('style', 'display: none;');
                    }
                    break;
            }
        });
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            updateTasks();
        }
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
            gradientOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(85, 150, 255, 0.7), rgba(172, 45, 235, 0.5))';
            backgroundImage1.classList.add('hidden');
            backgroundImage2.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            gradientOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(55, 16, 189, 0.4), rgba(164, 35, 149, 0.2))';
            backgroundImage1.classList.remove('hidden');
            backgroundImage2.classList.add('hidden');
        }
    }

    function toggleTheme() {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
            gradientOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(85, 150, 255, 0.7), rgba(172, 45, 235, 0.5))';
            backgroundImage1.classList.add('hidden');
            backgroundImage2.classList.remove('hidden');
        } else {
            localStorage.setItem('theme', 'light');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            gradientOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(55, 16, 189, 0.4), rgba(164, 35, 149, 0.2))';
            backgroundImage1.classList.remove('hidden');
            backgroundImage2.classList.add('hidden');
        }
    }

    newTaskInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && newTaskInput.value.trim()) {
            addTask(newTaskInput.value.trim());
            newTaskInput.value = '';
        }
    });

    allFilter.addEventListener('click', () => filterTasks('all'));
    activeFilter.addEventListener('click', () => filterTasks('active'));
    completedFilter.addEventListener('click', () => filterTasks('completed'));
    clearCompleted.addEventListener('click', clearCompletedTasks);

    
    if (themeToggle && lightIcon && darkIcon && gradientOverlay && backgroundImage1 && backgroundImage2) {
        themeToggle.addEventListener('click', toggleTheme);

        
        loadTheme();
    }


    loadTasks();
});
