/**
 * app.js — Application controller
 * Wires the Store and Dom layers together; handles all user events.
 */

(() => {
  /* ── State ────────────────────────────────────────────── */
  let currentFilter = 'all';
  let editingTaskId  = null;

  /* ── Element refs ────────────────────────────────────── */
  const addTaskForm     = document.getElementById('addTaskForm');
  const taskInput       = document.getElementById('taskInput');
  const taskDate        = document.getElementById('taskDate');
  const taskTime        = document.getElementById('taskTime');
  const clearDatetime   = document.getElementById('clearDatetime');
  const taskList        = document.getElementById('taskList');
  const emptyState      = document.getElementById('emptyState');
  const taskCount       = document.getElementById('taskCount');
  const clearCompleted  = document.getElementById('clearCompleted');
  const progressFill    = document.getElementById('progressFill');
  const progressLabel   = document.getElementById('progressLabel');
  const modalOverlay    = document.getElementById('modalOverlay');
  const modalInput      = document.getElementById('modalInput');
  const modalDate       = document.getElementById('modalDate');
  const modalTime       = document.getElementById('modalTime');
  const modalSave       = document.getElementById('modalSave');
  const modalCancel     = document.getElementById('modalCancel');
  const filterBtns      = document.querySelectorAll('.filter-btn');

  /* ── Init ────────────────────────────────────────────── */
  Store.load();
  render();

  /* ── Render ──────────────────────────────────────────── */
  function render() {
    const tasks = Store.getTasks(currentFilter);

    taskList.innerHTML = '';

    tasks.forEach(task => {
      const el = Dom.createTaskEl(task);
      taskList.appendChild(el);
    });

    updateMeta();
  }

  function updateMeta() {
    const stats   = Store.getStats();
    const active  = stats.total - stats.completed;
    const pct     = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

    // Task count badge
    taskCount.textContent = `${active} task${active !== 1 ? 's' : ''}`;

    // Empty state
    const visible = Store.getTasks(currentFilter).length === 0;
    emptyState.classList.toggle('is-visible', visible);

    // Progress bar
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = `${pct}% complete`;

    if (pct === 100 && stats.total > 0) {
      progressFill.style.animation = 'progressPulse 1.2s ease infinite';
    } else {
      progressFill.style.animation = '';
    }
  }

  /* ── Clear datetime ──────────────────────────────────── */
  clearDatetime.addEventListener('click', () => {
    taskDate.value = '';
    taskTime.value = '';
  });

  /* ── Add task ────────────────────────────────────────── */
  addTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = taskInput.value.trim();

    if (!text) {
      taskInput.classList.add('anim-shake');
      taskInput.addEventListener('animationend', () => {
        taskInput.classList.remove('anim-shake');
      }, { once: true });
      return;
    }

    const task = Store.addTask(text, taskDate.value || null, taskTime.value || null);
    taskInput.value = '';
    taskDate.value  = '';
    taskTime.value  = '';

    // If not on 'all' or 'active', re-render full list; otherwise prepend
    if (currentFilter === 'completed') {
      // task won't show in completed filter — just update meta
      updateMeta();
      return;
    }

    const el = Dom.createTaskEl(task);
    taskList.prepend(el);
    emptyState.classList.remove('is-visible');
    updateMeta();
  });

  /* ── Toggle / Edit / Delete (event delegation) ───────── */
  taskList.addEventListener('change', e => {
    if (!e.target.matches('.task-checkbox')) return;
    const li = e.target.closest('.task-item');
    const id = li?.dataset.id;
    if (!id) return;

    const task = Store.toggleTask(id);
    if (!task) return;

    li.classList.toggle('is-completed', task.completed);

    // Animate checkbox
    e.target.classList.add('anim-pop-in');
    e.target.addEventListener('animationend', () => {
      e.target.classList.remove('anim-pop-in');
    }, { once: true });

    // If filter is active/completed, remove the item from view
    if (currentFilter !== 'all') {
      Dom.animateRemove(li, updateMeta);
    } else {
      updateMeta();
    }
  });

  taskList.addEventListener('click', e => {
    const editBtn   = e.target.closest('.task-action-btn--edit');
    const deleteBtn = e.target.closest('.task-action-btn--delete');

    if (editBtn) {
      const li   = editBtn.closest('.task-item');
      const id   = li.dataset.id;
      const task = Store.getTasks('all').find(t => t.id === id);
      openModal(id, task?.text ?? '', task?.dueDate ?? '', task?.dueTime ?? '');
      return;
    }

    if (deleteBtn) {
      const li = deleteBtn.closest('.task-item');
      const id = li.dataset.id;
      Store.deleteTask(id);
      Dom.animateRemove(li, updateMeta);
    }
  });

  /* ── Filters ─────────────────────────────────────────── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  /* ── Clear completed ─────────────────────────────────── */
  clearCompleted.addEventListener('click', () => {
    const removed = Store.clearCompleted();
    if (removed === 0) return;

    // Animate out all completed items currently in DOM
    const completedEls = taskList.querySelectorAll('.task-item.is-completed');
    let pending = completedEls.length;

    if (pending === 0) {
      updateMeta();
      return;
    }

    completedEls.forEach(el => {
      Dom.animateRemove(el, () => {
        pending--;
        if (pending === 0) updateMeta();
      });
    });
  });

  /* ── Edit modal ──────────────────────────────────────── */
  function openModal(taskId, currentText, currentDate = '', currentTime = '') {
    editingTaskId    = taskId;
    modalInput.value = currentText;
    modalDate.value  = currentDate;
    modalTime.value  = currentTime;
    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    // Focus after transition
    setTimeout(() => {
      modalInput.focus();
      modalInput.select();
    }, 80);
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    editingTaskId = null;
  }

  function saveModal() {
    const newText = modalInput.value.trim();
    if (!newText) {
      modalInput.classList.add('anim-shake');
      modalInput.addEventListener('animationend', () => {
        modalInput.classList.remove('anim-shake');
      }, { once: true });
      return;
    }

    const task = Store.editTask(editingTaskId, newText, modalDate.value || null, modalTime.value || null);
    if (task) {
      const li = taskList.querySelector(`[data-id="${editingTaskId}"]`);
      if (li) {
        // Re-render the entire item so the due badge updates correctly
        const fresh = Dom.createTaskEl(task);
        fresh.classList.remove('anim-slide-in');
        li.replaceWith(fresh);
      }
    }
    closeModal();
  }

  modalSave.addEventListener('click', saveModal);
  modalCancel.addEventListener('click', closeModal);

  modalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveModal();
    if (e.key === 'Escape') closeModal();
  });

  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  /* ── Global keyboard shortcuts ───────────────────────── */
  document.addEventListener('keydown', e => {
    // Escape closes modal
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
      closeModal();
    }
    // Ctrl/Cmd + K focuses input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      taskInput.focus();
    }
  });
})();
