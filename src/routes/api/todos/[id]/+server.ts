import { json } from '@sveltejs/kit';
import * as db from '$lib/db';

export async function PATCH({ params, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = params;
  const todo = await db.getTodos(userId).find(t => t._id === id);
  if (!todo) {
    return new Response('Not Found', { status: 404 });
  }
  const result = await db.updateTodo(id, todo._rev, { completed: !todo.completed });
  return json(result);
}

export async function DELETE({ params, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { id } = params;
  const todo = await db.getTodos(userId).find(t => t._id === id);
  if (!todo) {
    return new Response('Not Found', { status: 404 });
  }
  const result = await db.deleteTodo(id, todo._rev);
  return json(result);
}