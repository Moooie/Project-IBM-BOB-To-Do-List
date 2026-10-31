/**
 * dom.js — DOM factory & helpers
 * Builds task elements and wires micro-interactions.
 */

const Dom = (() => {
  /**
   * Create a single task list item element.
   * @param {Task} task
   * @returns {HTMLLIElement}
   */
  function createTaskEl(task) {
    const li = document.createElement('li');
    li.className = 'task-item anim-slide-in';
    li.dataset.id = task.id;
    if (task.completed) li.classList.add('is-completed');

    const dueBadge  = buildDueBadge(task);
    const overdueClass = isOverdue(task) && !task.completed ? ' is-overdue' : '';

    li.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        id="chk-${task.id}"
        ${task.completed ? 'checked' : ''}
        aria-label="Toggle task"
      />
      <div class="task-body">
        <label class="task-text" for="chk-${task.id}">${escapeHtml(task.text)}</label>
        ${dueBadge ? `<span class="due-badge${overdueClass}">${dueBadge}</span>` : ''}
      </div>
      <div class="task-actions" aria-label="Task actions">
        <button class="task-action-btn task-action-btn--edit" title="Edit task" aria-label="Edit task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="task-action-btn task-action-btn--delete" title="Delete task" aria-label="Delete task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    `;

    return li;
  }

  /**
   * Animate an element out then remove it from the DOM.
   * @param {HTMLElement} el
   * @param {Function} [onDone]
   */
  function animateRemove(el, onDone) {
    el.classList.remove('anim-slide-in');
    el.classList.add('anim-slide-out');
    el.addEventListener('animationend', () => {
      el.remove();
      if (typeof onDone === 'function') onDone();
    }, { once: true });
  }

  /**
   * Escape HTML to prevent XSS.
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Build the human-readable due date/time badge string.
   * @param {Task} task
   * @returns {string}
   */
  function buildDueBadge(task) {
    if (!task.dueDate && !task.dueTime) return '';

    let parts = [];

    if (task.dueDate) {
      // Format: "Mon, 31 Oct 2026"
      const d = new Date(task.dueDate + 'T00:00:00');
      parts.push(d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    }

    if (task.dueTime) {
      // Format: "14:30" → "2:30 PM" using locale
      const [h, m] = task.dueTime.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      parts.push(d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }));
    }

    return parts.join(' · ');
  }

  /**
   * Returns true if the task's due datetime is in the past.
   * @param {Task} task
   * @returns {boolean}
   */
  function isOverdue(task) {
    if (!task.dueDate) return false;
    const timeStr = task.dueTime ? task.dueTime : '23:59';
    const due = new Date(`${task.dueDate}T${timeStr}:00`);
    return due < new Date();
  }

  return { createTaskEl, animateRemove, escapeHtml, buildDueBadge, isOverdue };
})();
