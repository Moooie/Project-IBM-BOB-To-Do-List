/**
 * store.js — Data layer
 * Handles all state mutations and localStorage persistence.
 */

const STORAGE_KEY = 'todo-app-v1';

const Store = (() => {
  let _tasks = [];

  /**
   * Load tasks from localStorage, fallback to empty array.
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _tasks = raw ? JSON.parse(raw) : [];
    } catch {
      _tasks = [];
    }
  }

  /**
   * Persist current tasks to localStorage.
   */
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_tasks));
  }

  /**
   * Get all tasks (shallow copy).
   * @param {'all'|'active'|'completed'} filter
   * @returns {Task[]}
   */
  function getTasks(filter = 'all') {
    switch (filter) {
      case 'active':    return _tasks.filter(t => !t.completed);
      case 'completed': return _tasks.filter(t => t.completed);
      default:          return [..._tasks];
    }
  }

  /**
   * Add a new task.
   * @param {string} text
   * @param {string|null} dueDate  ISO date string "YYYY-MM-DD" or null
   * @param {string|null} dueTime  "HH:MM" or null
   * @returns {Task}
   */
  function addTask(text, dueDate = null, dueTime = null) {
    const task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: dueDate || null,
      dueTime: dueTime || null,
    };
    _tasks.unshift(task);
    persist();
    return task;
  }

  /**
   * Toggle a task's completed state.
   * @param {string} id
   * @returns {Task|null}
   */
  function toggleTask(id) {
    const task = _tasks.find(t => t.id === id);
    if (!task) return null;
    task.completed = !task.completed;
    persist();
    return task;
  }

  /**
   * Update a task's text and optionally its due date/time.
   * @param {string}      id
   * @param {string}      newText
   * @param {string|null} dueDate
   * @param {string|null} dueTime
   * @returns {Task|null}
   */
  function editTask(id, newText, dueDate = null, dueTime = null) {
    const task = _tasks.find(t => t.id === id);
    if (!task) return null;
    task.text    = newText.trim();
    task.dueDate = dueDate || null;
    task.dueTime = dueTime || null;
    persist();
    return task;
  }

  /**
   * Remove a task by id.
   * @param {string} id
   * @returns {boolean}
   */
  function deleteTask(id) {
    const idx = _tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    _tasks.splice(idx, 1);
    persist();
    return true;
  }

  /**
   * Remove all completed tasks.
   * @returns {number} count removed
   */
  function clearCompleted() {
    const before = _tasks.length;
    _tasks = _tasks.filter(t => !t.completed);
    persist();
    return before - _tasks.length;
  }

  /**
   * Get stats for progress calculation.
   * @returns {{ total: number, completed: number }}
   */
  function getStats() {
    const total = _tasks.length;
    const completed = _tasks.filter(t => t.completed).length;
    return { total, completed };
  }

  return { load, getTasks, addTask, toggleTask, editTask, deleteTask, clearCompleted, getStats };
})();
