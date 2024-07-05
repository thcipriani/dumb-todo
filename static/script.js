
const todos = document.querySelector('.todos'),
      dones = document.querySelector('.done'),
      errors = document.querySelector('.error'),
      messages = document.querySelector('.messages')
      addTodo = document.querySelector('.add-todo'),

function error() {
    errors.innerHTML = 'An error occurred. Please try again later.';
    setTimeout(() => {
        errors.innerHTML = '';
    }, 3000);
}

function makeTodo(todo, done = false) {
    let li = document.createElement('li');
    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.todo = todo.id;
    if (done) {
        checkbox.checked = true;
    }
    checkbox.addEventListener('change', handleCheckboxChange);
    li.appendChild(checkbox);
    li.appendChild(document.createTextNode(todo.content));
    return li;
}

function handleCheckboxChange(event) {
    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: event.target.dataset.todo,
            done: event.target.checked
        }),
    }).then(response => {
        if (!response.ok) {
            event.target.checked = !event.target.checked;
            error();
        } else {
            event.target.checked = event.target.checked;
            messages.innerHTML = 'Todo updated successfully.';
            setTimeout(() => {
                getTodos();
            }, 3000);
        }
    }).catch(error => {
        event.target.checked = !event.target.checked;
        error();
    });
}

function populateTodos(todoList, doneList) {
    todos.innerHTML = '';
    todoList.forEach(td => {
        todos.appendChild(td);
    });
    dones.innerHTML = '';
    doneList.forEach(td => {
        dones.appendChild(td);
    });
}

function getTodos() {
    var fetchedTodos = [],
        fetchedDones = [];
    fetch('/api').then(response => {
        let todoList = document.createElement('ul');
        response.json().then(data => {
            data.forEach(todo => {
                if (todo.done) {
                    fetchedDones.push(makeTodo(todo, true));
                    //dones.appendChild(makeTodo(todo, true));
                } else {
                    fetchedTodos.push(makeTodo(todo));
                    //todoList.appendChild(makeTodo(todo));
                }
            });
            populateTodos(fetchedTodos, fetchedDones);
        });
    }).catch(error => {
        console.error(error);
    });
};

addTodo.addEventListener('submit', event => {
    event.preventDefault();
    let todo = event.target.querySelector('input').value;
    let body = event.target.querySelector('textarea').value;
    if (todo === '') {
        errors.innerHTML = 'Please enter a todo.';
        setTimeout(() => {
            errors.innerHTML = '';
        }, 3000);
        return;
    }
    fetch('/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            todo: todo,
            body: body
        }),
    }).then(response => {
        if (!response.ok) {
            error();
        } else {
            messages.innerHTML = 'Todo added successfully.';
            setTimeout(() => {
                getTodos();
            }, 3000);
            getTodos();
        }
    }).catch(error => {
        error();
    });
});

getTodos();
