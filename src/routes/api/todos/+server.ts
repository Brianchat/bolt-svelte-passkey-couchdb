import { json } from '@sveltejs/kit';
import * as db from '$lib/db';

export async function GET({ locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const todos = await db.getTodos(userId);
  return json(todos);
}

export async function POST({ request, locals }) {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { text } = await request.json();
  const result = await db.addTodo(userId, text);
  return json(result);
}