/* TRIX @2025 */

window.SelectExtention = {
  name: 'SelectFix',
  type: 'response',
  match: ({ trace }) =>
    trace?.type === 'ext_select_input' || trace?.payload?.name === 'ext_select_input',

  render: ({ trace, element }) => {
    try {
      const bodyRaw = trace.payload?.body;
      let parsed = {};
      if (bodyRaw) {
        try {
          parsed = typeof bodyRaw === 'string' ? JSON.parse(bodyRaw) : bodyRaw;
        } catch {}
      } else {
        parsed = trace.payload;
      }

      const OPTIONS = Array.isArray(parsed.data) ? parsed.data : [];
      if (!OPTIONS.length) return;

      const lang = (parsed.lang || 'cs').toLowerCase().startsWith('en') ? 'en' : 'cs';
      const T = {
        placeholder: lang === 'cs' ? 'Vyber možnost' : 'Choose an option',
        confirm: lang === 'cs' ? 'Potvrdit' : 'Confirm',
        cancel: lang === 'cs' ? 'Zrušit' : 'Cancel'
      };

      element.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

          .sf-wrap {
            --accent: #FF4F00;
            --accent-600: #E64800;
            --accent-100: #FFF3EC;
            --accent-200: #FFE5D6;
            --grey-50: #f3f5f7;
            --grey-100: #eceff3;
            --grey-200: #e3e7ed;
            --grey-300: #d7dbe0;
            --grey-text: #1a1e23;
            font-family: 'Poppins', sans-serif;
            width: 320px;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 12px;
            box-sizing: border-box;
            position: relative;
          }
          .sf-wrap.disabled { opacity: .6; pointer-events: none; }

          .sf-control {
            display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
            padding: 6px 12px;
            border: 1px solid #c4c4c4;
            border-radius: 20px;
            background: #f1f2f2;
            cursor: pointer; position: relative;
          }
          .sf-control.open { border-color: var(--accent); background: var(--accent-100); }

          .sf-tags { display: flex; flex-wrap: wrap; gap: 4px; overflow: hidden; flex: 1; min-width: 0; }
          .ph { color: #9ca3af; font-size: 13px; flex: 1000; text-align: left; }

          .sf-tag {
            display: flex; align-items: center;
            background: var(--accent-200);
            border: 1px solid var(--accent);
            border-radius: 10px;
            padding: 2px 6px; font-size: 13px; color: #7a2a00;
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .sf-tag .rm { margin-left: 6px; cursor: pointer; font-weight: bold; color: #7a2a00; }

          .arrow {
            width: 16px; height: 16px;
            background: url(https://i.imgur.com/vjFwEJ5.png) center/contain no-repeat;
            position: absolute; right: 12px; top: 50%;
            transform: translateY(-50%) rotate(0); transition: transform .2s;
          }
          .sf-control.open .arrow { transform: translateY(-50%) rotate(180deg); }

          .sf-list {
            margin-top: 6px;
            background: #fff;
            border: 1px solid #c4c4c4;
            border-radius: 20px;
            max-height: 0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            opacity: 0;
            transition: max-height .22s ease, opacity .22s ease;
            will-change: max-height, opacity;
          }
          .sf-list.open { max-height: 220px; opacity: 1; }

          .itm {
            padding: 10px 12px; font-size: 13px; color: #374151; cursor: pointer;
            transition: background .15s, color .15s;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }
          .itm:hover, .itm.active { background: var(--accent); color: #fff; }

          .sf-act { display: flex; gap: 8px; margin-top: 12px; }
          .sf-act button {
            flex: 1; padding: 10px 0; font-size: 13px; font-weight: 700; border: none;
            border-radius: 10px; cursor: pointer; position: relative; overflow: hidden;
            isolation: isolate; transition: background .15s; will-change: opacity;
          }

          .sf-list {
            margin-top: 6px;
            background: #fff;
            border: 1px solid #c4c4c4;
            border-radius: 20px;
            max-height: 0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            opacity: 0;
            transition: max-height .22s ease, opacity .22s ease;
            will-change: max-height, opacity;
          }
          .sf-list.open {
            max-height: 220px;
            opacity: 1;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .sf-list.open { scrollbar-color: #FF4F00 #FFF3EC; scrollbar-width: thin; }
          .sf-list.open::-webkit-scrollbar { width: 8px; }
          .sf-list.open::-webkit-scrollbar-thumb { background: #FF4F00; border-radius: 8px; }
          .sf-list.open::-webkit-scrollbar-track { background: #FFF3EC; border-radius: 8px; }

          .btn-yes { color: #fff !important; background: var(--accent); }
          .btn-yes:disabled { background: #ffb592; cursor: not-allowed; }
          .btn-yes::before {
            content: ""; position: absolute; inset: 0;
            background: linear-gradient(95deg, #FF4F00 0%, #7437F6 100%);
            opacity: 0; transition: opacity .15s ease; z-index: -1;
          }
          .btn-yes:hover:not(:disabled)::before { opacity: 1; }
          .btn-yes:hover:not(:disabled) { color: #fff !important; }

          .btn-no {
            color: var(--grey-text);
            background: linear-gradient(180deg, var(--grey-100), var(--grey-50));
            border: 1px solid var(--grey-300);
          }
          .btn-no:hover {
            background: linear-gradient(180deg, var(--grey-200), var(--grey-100));
          }
        </style>

        <div class="sf-wrap" role="group" aria-label="Výběr možností">
          <div class="sf-control" role="button" aria-expanded="false">
            <div class="sf-tags"></div>
            <span class="ph">${T.placeholder}</span>
            <div class="arrow" aria-hidden="true"></div>
          </div>
          <div class="sf-list" role="listbox"></div>
          <div class="sf-act">
            <button class="btn-yes" disabled>${T.confirm}</button>
            <button class="btn-no">${T.cancel}</button>
          </div>
        </div>
      `;

      const wrap = element.querySelector('.sf-wrap');
      const ctrl = element.querySelector('.sf-control');
      const tagsEl = element.querySelector('.sf-tags');
      const phEl = element.querySelector('.ph');
      const listEl = element.querySelector('.sf-list');
      const yesBtn = element.querySelector('.btn-yes');
      const noBtn = element.querySelector('.btn-no');

      let selected = null;

      function renderTags() {
        tagsEl.innerHTML = '';
        if (selected) {
          const tag = document.createElement('div');
          tag.className = 'sf-tag';
          tag.textContent = selected;
          const rm = document.createElement('span');
          rm.className = 'rm';
          rm.textContent = '×';
          rm.onclick = (e) => {
            e.stopPropagation();
            selected = null;
            rebuild();
          };
          tag.appendChild(rm);
          tagsEl.appendChild(tag);
        }
        phEl.style.display = selected ? 'none' : 'inline';
        yesBtn.disabled = !selected;
      }

      function renderList() {
        listEl.innerHTML = '';
        OPTIONS.forEach((v) => {
          const it = document.createElement('div');
          it.className = 'itm' + (v === selected ? ' active' : '');
          it.textContent = v;
          it.setAttribute('role', 'option');
          it.onclick = () => {
            selected = v;
            ctrl.classList.remove('open');
            listEl.classList.remove('open');
            ctrl.setAttribute('aria-expanded', 'false');
            rebuild();
          };
          listEl.appendChild(it);
        });
      }

      function rebuild() {
        renderTags();
        renderList();
      }
      rebuild();

      ctrl.onclick = () => {
        const open = !listEl.classList.contains('open');
        ctrl.classList.toggle('open', open);
        listEl.classList.toggle('open', open);
        ctrl.setAttribute('aria-expanded', open ? 'true' : 'false');
      };

      yesBtn.onclick = () => {
        if (!selected) return;
        wrap.classList.add('disabled');
        ctrl.classList.remove('open');
        listEl.classList.remove('open');
        window.voiceflow.chat.interact({
          type: 'complete',
          payload: { value: selected }
        });
      };

      noBtn.onclick = () => {
        wrap.classList.add('disabled');
        ctrl.classList.remove('open');
        listEl.classList.remove('open');
        window.voiceflow.chat.interact({ type: 'cancel' });
      };
    } catch (err) {
      window.voiceflow.chat.interact({
        type: 'error',
        payload: { message: err?.message || 'Unknown error' }
      });
    }
  }
};
