interface Task {
    text: string;
    completed: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
    function $(id: string): HTMLElement {
        return document.getElementById(id) as HTMLElement;
    }

    function on<K extends keyof HTMLElementEventMap>(
        el: HTMLElement,
        event: K,
        handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
    ): void {
        el.addEventListener(event, handler);
    }

    const themeToggle = $('theme-toggle');
    const lightIcon = $('theme-toggle-light-icon');
    const darkIcon = $('theme-toggle-dark-icon');
    const gradientOverlay = $('gradient-overlay');
    const backgroundImage1 = $('background-image1') as HTMLImageElement;
    const backgroundImage2 = $('background-image2') as HTMLImageElement;

    const newTaskInput = $('new-task-input') as HTMLInputElement;
    const taskList = $('task-list');
    const itemsLeft = $('items-left');
    const allFilter = $('all-filter');
    const activeFilter = $('active-filter');
    const completedFilter = $('completed-filter');
    const clearCompleted = $('clear-completed');

    let tasks: Task[] = [];
    let draggedItem: HTMLElement | null = null;

    function updateTasks(): void {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'task-completed' : ''}`;
            li.draggable = true;
            li.setAttribute('data-index', index.toString());

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'task-completion';
            radio.checked = task.completed;
            on(radio, 'change', () => toggleTaskCompletion(index));

            const label = document.createElement('label');
            label.appendChild(radio);
            
            const span = document.createElement('span');
            span.textContent = task.text;
            label.appendChild(span);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.className = 'text-gray-500 dark:text-gray-400';
            on(deleteButton, 'click', () => deleteTask(index));

            li.appendChild(label);
            li.appendChild(deleteButton);

            on(li, 'dragstart', handleDragStart);
            on(li, 'dragover', handleDragOver);
            on(li, 'drop', handleDrop);
            on(li, 'dragenter', handleDragEnter);
            on(li, 'dragleave', handleDragLeave);

            taskList.appendChild(li);
        });
        updateItemsLeft();
    }

    function handleDragStart(e: DragEvent) {
        draggedItem = e.target as HTMLElement;
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.setData('text/html', draggedItem.innerHTML);
        draggedItem.classList.add('dragging');
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        const target = e.target as HTMLElement;
        const dropTarget = target.closest('.task-item') as HTMLElement;
        
        if (draggedItem && dropTarget && draggedItem !== dropTarget) {
            const fromIndex = parseInt(draggedItem.getAttribute('data-index')!);
            const toIndex = parseInt(dropTarget.getAttribute('data-index')!);
            
            const [removed] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, removed);
            
            updateTasks();
            saveTasks();
        }
        
        draggedItem?.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragEnter(e: DragEvent) {
        const target = e.target as HTMLElement;
        target.closest('.task-item')?.classList.add('drag-over');
    }

    function handleDragLeave(e: DragEvent) {
        const target = e.target as HTMLElement;
        target.closest('.task-item')?.classList.remove('drag-over');
    }

    function updateItemsLeft(): void {
        const activeTasks = tasks.filter(task => !task.completed).length;
        itemsLeft.textContent = `${activeTasks} items left`;
    }

    function addTask(text: string): void {
        tasks.push({ text, completed: false });
        updateTasks();
        saveTasks();
    }

    function toggleTaskCompletion(index: number): void {
        tasks[index].completed = !tasks[index].completed;
        updateTasks();
        saveTasks();
    }

    function deleteTask(index: number): void {
        tasks.splice(index, 1);
        updateTasks();
        saveTasks();
    }

    function clearCompletedTasks(): void {
        tasks = tasks.filter(task => !task.completed);
        updateTasks();
        saveTasks();
    }

    function filterTasks(filter: 'all' | 'active' | 'completed'): void {
        document.querySelectorAll('.task-item').forEach(task => {
            const display = filter === 'all' || 
                (filter === 'active' && !task.classList.contains('task-completed')) ||
                (filter === 'completed' && task.classList.contains('task-completed'))
                ? 'flex' : 'none';
            task.setAttribute('style', `display: ${display};`);
        });
    }

    function saveTasks(): void {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks(): void {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks) as Task[];
            updateTasks();
        }
    }

    function setTheme(isDark: boolean): void {
        document.documentElement.classList.toggle('dark', isDark);
        lightIcon.classList.toggle('hidden', !isDark);
        darkIcon.classList.toggle('hidden', isDark);
        gradientOverlay.style.backgroundImage = isDark
            ? 'linear-gradient(to right, rgba(85, 150, 255, 0.7), rgba(172, 45, 235, 0.5))'
            : 'linear-gradient(to right, rgba(55, 16, 189, 0.4), rgba(164, 35, 149, 0.2))';
        backgroundImage1.classList.toggle('hidden', isDark);
        backgroundImage2.classList.toggle('hidden', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    function loadTheme(): void {
        setTheme(localStorage.getItem('theme') === 'dark');
    }

    function toggleTheme(): void {
        setTheme(!document.documentElement.classList.contains('dark'));
    }

    on(newTaskInput, 'keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && newTaskInput.value.trim()) {
            addTask(newTaskInput.value.trim());
            newTaskInput.value = '';
        }
    });

    on(allFilter, 'click', () => filterTasks('all'));
    on(activeFilter, 'click', () => filterTasks('active'));
    on(completedFilter, 'click', () => filterTasks('completed'));
    on(clearCompleted, 'click', clearCompletedTasks);

    if (themeToggle && lightIcon && darkIcon && gradientOverlay && backgroundImage1 && backgroundImage2) {
        on(themeToggle, 'click', toggleTheme);
        loadTheme();
    }

    loadTasks();
});