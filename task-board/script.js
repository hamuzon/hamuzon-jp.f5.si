(() => {
  const APP_SAVE_VERSION = "1.0";
  const STORAGE_KEY = "taskboard_data";
  const SUPPORTED_VERSIONS = ["1.0"];
  const groupsContainer = document.getElementById('groups-container');
  const saveBtn = document.getElementById('save-btn');
  const loadBtn = document.getElementById('load-btn');
  const loadInput = document.getElementById('load-input');
  const addGroupBtn = document.getElementById('add-group-btn');
  const overallProgressBar = document.querySelector('.progress-overall > div');
  const overallProgressText = document.querySelector('.progress-overall > span');
  const clearStorageBtn = document.getElementById('clear-storage-btn');
  let taskData = [];

  function getDefaultGroups() {
    return [
      { title: '📥 未着手', tasks: [] },
      { title: '🚧 進行中', tasks: [] },
      { title: '✅ 完了', tasks: [] }
    ];
  }

  function calcProgress(tasks) {
    return tasks.length ? Math.round(tasks.filter(t => t.done).length / tasks.length * 100) : 0;
  }

  let dragSrcGroupIdx = null, dragSrcTaskIdx = null;

  function createGroupElement(group, groupIndex) {
    const groupDiv = document.createElement('section');
    groupDiv.className = 'group';
    groupDiv.setAttribute('draggable', 'true');
    groupDiv.dataset.groupIndex = groupIndex;

    // グループのドラッグ
    groupDiv.addEventListener('dragstart', e => {
      dragSrcGroupIdx = groupIndex;
      e.dataTransfer.effectAllowed = 'move';
      groupDiv.style.opacity = '0.5';
    });
    groupDiv.addEventListener('dragend', e => {
      dragSrcGroupIdx = null;
      groupDiv.style.opacity = '';
      document.querySelectorAll('.group.drag-over').forEach(el => el.classList.remove('drag-over'));
    });
    groupDiv.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    groupDiv.addEventListener('dragenter', () => { if (dragSrcGroupIdx !== null && dragSrcGroupIdx !== groupIndex) groupDiv.classList.add('drag-over'); });
    groupDiv.addEventListener('dragleave', () => groupDiv.classList.remove('drag-over'));
    groupDiv.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrcGroupIdx === null || dragSrcGroupIdx === groupIndex) return;
      const dragged = taskData.splice(dragSrcGroupIdx, 1)[0];
      taskData.splice(groupIndex, 0, dragged);
      saveToStorage();
      render();
    });

    // グループヘッダー
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';

    const h2 = document.createElement('h2');
    h2.contentEditable = true;
    h2.spellcheck = false;
    h2.textContent = group.title;
    h2.setAttribute('aria-label', 'グループ名編集');
    h2.addEventListener('input', () => {
      taskData[groupIndex].title = h2.textContent.trim() || '無題グループ';
      saveToStorage();
    });

    const deleteGroupBtn = document.createElement('button');
    deleteGroupBtn.className = 'group-delete-btn';
    deleteGroupBtn.title = 'グループ削除';
    deleteGroupBtn.textContent = '✖';
    deleteGroupBtn.addEventListener('click', () => {
      if (confirm(`グループ「${taskData[groupIndex].title}」を削除しますか？ タスクも全て削除されます。`)) {
        taskData.splice(groupIndex, 1);
        saveToStorage();
        render();
      }
    });

    groupHeader.appendChild(h2);
    groupHeader.appendChild(deleteGroupBtn);
    groupDiv.appendChild(groupHeader);

    // グループ進捗
    const progressWrapper = document.createElement('div');
    progressWrapper.className = 'group-progress';
    const progressFill = document.createElement('div');
    const progressPercent = calcProgress(group.tasks);
    progressFill.style.width = progressPercent + '%';
    const progressText = document.createElement('span');
    progressText.textContent = progressPercent + '%';
    progressWrapper.appendChild(progressFill);
    progressWrapper.appendChild(progressText);
    groupDiv.appendChild(progressWrapper);

    // タスクコンテナ
    const tasksDiv = document.createElement('div');
    tasksDiv.className = 'tasks';
    tasksDiv.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    tasksDiv.addEventListener('dragenter', () => { if (dragSrcGroupIdx !== null && dragSrcTaskIdx !== null) groupDiv.classList.add('drag-over'); });
    tasksDiv.addEventListener('dragleave', () => groupDiv.classList.remove('drag-over'));
    tasksDiv.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrcGroupIdx === null || dragSrcTaskIdx === null) return;
      const draggedTask = taskData[dragSrcGroupIdx].tasks.splice(dragSrcTaskIdx, 1)[0];
      taskData[groupIndex].tasks.push(draggedTask);
      saveToStorage();
      render();
    });

    group.tasks.forEach((task, taskIndex) => {
      const taskDiv = document.createElement('div');
      taskDiv.className = 'task';
      taskDiv.setAttribute('draggable', 'true');
      taskDiv.dataset.groupIndex = groupIndex;
      taskDiv.dataset.taskIndex = taskIndex;

      taskDiv.addEventListener('dragstart', e => {
        dragSrcGroupIdx = groupIndex;
        dragSrcTaskIdx = taskIndex;
        e.dataTransfer.effectAllowed = 'move';
        taskDiv.style.opacity = '0.5';
      });
      taskDiv.addEventListener('dragend', e => {
        dragSrcGroupIdx = null;
        dragSrcTaskIdx = null;
        document.querySelectorAll('.task.drag-over').forEach(el => el.classList.remove('drag-over'));
        taskDiv.style.opacity = '';
      });
      taskDiv.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      taskDiv.addEventListener('dragenter', () => { if (dragSrcGroupIdx !== null && dragSrcTaskIdx !== null) taskDiv.classList.add('drag-over'); });
      taskDiv.addEventListener('dragleave', () => taskDiv.classList.remove('drag-over'));
      taskDiv.addEventListener('drop', e => {
        e.stopPropagation(); // 親(tasksDiv)へのイベント伝播を停止
        e.preventDefault();
        if (dragSrcGroupIdx === null || dragSrcTaskIdx === null) return;
        if (dragSrcGroupIdx === groupIndex) {
          const arr = taskData[groupIndex].tasks;
          const t = arr.splice(dragSrcTaskIdx, 1)[0];
          arr.splice(taskIndex, 0, t);
        } else {
          const t = taskData[dragSrcGroupIdx].tasks.splice(dragSrcTaskIdx, 1)[0];
          taskData[groupIndex].tasks.splice(taskIndex, 0, t);
        }
        saveToStorage();
        render();
      });

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => {
        taskData[groupIndex].tasks[taskIndex].done = checkbox.checked;
        saveToStorage();
        render();
      });
      taskDiv.appendChild(checkbox);

      const taskText = document.createElement('span');
      taskText.className = 'task-text';
      taskText.contentEditable = true;
      taskText.spellcheck = false;
      taskText.dataset.placeholder = 'タスク名を入力';
      taskText.textContent = task.text;
      taskText.addEventListener('input', () => {
        taskData[groupIndex].tasks[taskIndex].text = taskText.textContent;
        saveToStorage();
      });
      taskDiv.appendChild(taskText);

      const delBtn = document.createElement('button');
      delBtn.className = 'task-delete';
      delBtn.title = 'タスク削除';
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', () => {
        taskData[groupIndex].tasks.splice(taskIndex, 1);
        saveToStorage();
        render();
      });
      taskDiv.appendChild(delBtn);

      tasksDiv.appendChild(taskDiv);
    });

    groupDiv.appendChild(tasksDiv);

    const addTaskBtn = document.createElement('button');
    addTaskBtn.className = 'add-task-btn';
    addTaskBtn.textContent = '＋ タスク追加';
    addTaskBtn.addEventListener('click', () => {
      const taskCount = taskData[groupIndex].tasks.length + 1;
      taskData[groupIndex].tasks.push({ text: `タスク(${taskCount})`, done: false });
      saveToStorage();
      render();
    });
    groupDiv.appendChild(addTaskBtn);

    return groupDiv;
  }

  function render() {
    const scrollPositions = [];
    document.querySelectorAll('.tasks').forEach((el, index) => {
      const groupIndex = el.closest('.group')?.dataset.groupIndex;
      if (groupIndex) scrollPositions[groupIndex] = el.scrollTop;
    });
    groupsContainer.innerHTML = '';
    taskData.forEach((g, i) => groupsContainer.appendChild(createGroupElement(g, i)));
    document.querySelectorAll('.tasks').forEach((el, i) => {
      const groupIndex = el.closest('.group')?.dataset.groupIndex;
      if (groupIndex && scrollPositions[groupIndex] !== undefined) el.scrollTop = scrollPositions[groupIndex];
    });
    const allTasks = taskData.flatMap(g => g.tasks);
    const overallPercent = calcProgress(allTasks);
    overallProgressBar.style.width = overallPercent + '%';
    overallProgressText.textContent = overallPercent + '%';
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: APP_SAVE_VERSION, data: taskData }));
  }

  function saveToFile() {
    saveToStorage();
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const filename = `TaskBoard-${APP_SAVE_VERSION}_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.json`;
    const blob = new Blob([JSON.stringify({ version: APP_SAVE_VERSION, data: taskData }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target.result);
        if (!obj.version || !SUPPORTED_VERSIONS.includes(obj.version)) {
          alert('非対応バージョンのデータです');
          return;
        }
        taskData = obj.data;
        saveToStorage();
        render();
      } catch (err) {
        alert('読み込み失敗: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // イベント設定
  addGroupBtn.addEventListener('click', () => {
    const groupCount = taskData.length + 1;
    taskData.push({ title: `グループ(${groupCount})`, tasks: [] });
    saveToStorage();
    render();
  });
  saveBtn.addEventListener('click', saveToFile);
  loadBtn.addEventListener('click', () => loadInput.click());
  loadInput.addEventListener('change', e => { if (e.target.files.length) loadFromFile(e.target.files[0]); });
  clearStorageBtn.addEventListener('click', () => {
    if (confirm('ローカルストレージを全て消去しますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      taskData = getDefaultGroups();
      render();
    }
  });

  // 初回ロード
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      taskData = obj.version && SUPPORTED_VERSIONS.includes(obj.version) ? obj.data : getDefaultGroups();
    } else taskData = getDefaultGroups();
  } catch (e) {
    taskData = getDefaultGroups();
  }

  render();
})();