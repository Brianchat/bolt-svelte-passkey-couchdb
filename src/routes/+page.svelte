<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getSession } from '$lib/auth';

  let todos: { id: string; text: string; completed: boolean }[] = [];
  let newTodo = '';

  onMount(async () => {
    const session = await getSession();
    if (!session) {
      goto('/login');
    } else {
      loadTodos();
    }
  });

  async function loadTodos() {
    const response = await fetch('/api/todos');
    todos = await response.json();
  }

  async function addTodo() {
    if (newTodo.trim()) {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTodo })
      });
      if (response.ok) {
        newTodo = '';
        loadTodos();
      }
    }
  }

  async function toggleTodo(id: string) {
    const response = await fetch(`/api/todos/${id}`, { method: 'PATCH' });
    if (response.ok) {
      loadTodos();
    }
  }

  async function deleteTodo(id: string) {
    const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      loadTodos();
    }
  }
</script>

<h1>Todo List</h1>

<form on:submit|preventDefault={addTodo}>
  <input bind:value={newTodo} placeholder="Add a new todo" />
  <button type="submit">Add</button>
</form>

<ul>
  {#each todos as todo (todo.id)}
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        on:change={() => toggleTodo(todo.id)}
      />
      <span class:completed={todo.completed}>{todo.text}</span>
      <button on:click={() => deleteTodo(todo.id)}>Delete</button>
    </li>
  {/each}
</ul>

<style>
  .completed {
    text-decoration: line-through;
  }
</style>