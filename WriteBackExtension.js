/* TRIX @2025 — write_back effect extension (Voiceflow -> Web) */
(function () {
    const normalize = (s='') =>
      s.toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  
    const labelToSelector = {
      'napad':'#f-1','muj napad':'#f-1',
      'jak to udelam':'#f-2',
      'pro koho':'#f-3',
      'cil':'#f-4',
      'naklady':'#f-5',
      'sestavit tym':'#f-6',
      'marketing':'#f-7'
    };
  
    function applyWriteBackItem(target, value) {
      let selector = null;
  
      // přímo CSS selektor (#id / .class)
      if (/^#|^\.[A-Za-z]/.test(target)) {
        selector = target;
      } else if (/^step[1-7]$/i.test(target)) {
        selector = `#f-${String(target).replace(/[^0-9]/g,'')}`;
      } else {
        selector = labelToSelector[normalize(target)] || null;
      }
      if (!selector) return;
  
      const el = document.querySelector(selector);
      if (!el) return;
  
      el.value = (value ?? '').toString().trim();
      el.dispatchEvent(new Event('input', { bubbles: true }));
  
      const idx = Number((el.id || '').split('-')[1] || '0');
      if (idx > 0) { try { localStorage.setItem('tw_step_'+idx, el.value); } catch {} }
    }
  
    window.WriteBackExtension = {
      name: 'write_back',
      type: 'effect',
      // u Custom Action je trace.type přímo jméno akce
      match: ({ trace }) => trace?.type === 'write_back' || trace?.payload?.name === 'write_back',
      effect: ({ trace }) => {
        try {
          const payload = trace?.payload || {};
          // podpora: { target, value } nebo { targets:[{target,value},...] }
          const items = Array.isArray(payload.targets)
            ? payload.targets
            : [{ target: payload.target, value: payload.value }];
  
          items.forEach(({ target, value }) => { if (target) applyWriteBackItem(target, value); });
  
          if (typeof window.updateLocks === 'function') window.updateLocks();
          if (typeof window.toast === 'function') window.toast('Vyplněno z AI ✓');
  
          // potvrď path "complete" (Stop on action v CA)
          window.voiceflow?.chat?.interact?.({ action:{ type:'complete' } });
        } catch (e) {
          console.error('write_back extension error', e);
        }
      }
    };
  })();
  