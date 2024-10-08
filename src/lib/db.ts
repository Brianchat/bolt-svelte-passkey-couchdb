import nano from 'nano';

const couchdbUrl = 'http://admin:password@localhost:5984'; // Replace with your CouchDB URL
const db = nano(couchdbUrl).use('todos');

export async function getTodos(userId: string) {
  const result = await db.view('todos', 'by_user', { key: userId });
  return result.rows.map(row => row.value);
}

export async function addTodo(userId: string, text: string) {
  return await db.insert({ userId, text, completed: false, type: 'todo' });
}

export async function updateTodo(id: string, rev: string, updates: Partial<{ text: string, completed: boolean }>) {
  const todo = await db.get(id);
  const updatedTodo = { ...todo, ...updates };
  return await db.insert(updatedTodo);
}

export async function deleteTodo(id: string, rev: string) {
  return await db.destroy(id, rev);
}