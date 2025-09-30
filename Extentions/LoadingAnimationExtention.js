/* TRIX @2025 */

window.LoadingAnimationExtention = {
  name: 'LoadingAnimationExtention',
  type: 'response',
  match: ({ trace }) =>
    trace?.type === 'ext_loadingAnimation' || trace?.payload?.name === 'ext_loadingAnimation',

  render: ({ trace, element }) => {
    try {
      const payload = trace?.payload || {};
      const phase = payload.phase || 'output';
      const type = String(payload.type || 'SMT').toUpperCase();
      const lang = ((payload.lang || 'cs') + '').toLowerCase().startsWith('en') ? 'en' : 'cs';

      const messageSequences = {
        cs: {
          analysis: {
            DEFAULT: ['Chvilku strpení.'],
            SMT: ['Zpracovávám váš dotaz.', 'Ještě okamžik.'],
            SWEARS: ['Zpracovávám dotaz.', 'Chvilku strpení.'],
            OTHER: ['Zkoumám zadání.', 'Ještě moment.'],
            KB: ['Zjišťuji souvislosti.', 'Zpracovávám data.', 'Chvilku strpení.'],
            KB_WS: ['Hledám odpověď.', 'Zpracovávám informace.', 'Ještě okamžik.']
          },
          rewrite: ['Připravuji výstižnější odpověď.'],
          output: {
            SMT: ['Tvořím odpověď.'],
            KB_WS: ['Hledám v databázi Twineru.', 'Získávám relevantní informace.', 'Formuluji odpověď.'],
            OTHER: ['Ověřuji vhodnost obsahu.'],
            SWEARS: ['Kontroluji jazykový obsah.'],
            KB: ['Získávám informace.', 'Zpracovávám odpověď.', 'Formuluji reakci.']
          },
          all: {
            KB: ['Procházím databázi Twineru.', 'Ověřuji dostupná fakta.', 'Připravuji odpověď.'],
            KB_WS: ['Hledám v databázi Twineru.', 'Analyzuji webové zdroje.', 'Ověřuji souvislosti.', 'Píši odpověď.']
          }
        },
        en: {
          analysis: {
            DEFAULT: ['One moment, please.'],
            SMT: ['Processing your request.', 'Just a sec.'],
            SWEARS: ['Processing the request.', 'A moment, please.'],
            OTHER: ['Reviewing your input.', 'Hold on.'],
            KB: ['Checking context.', 'Processing data.', 'One moment, please.'],
            KB_WS: ['Looking for an answer.', 'Gathering information.', 'Just a moment.']
          },
          rewrite: ['Preparing a clearer response.'],
          output: {
            SMT: ['Composing the reply.'],
            KB_WS: ['Searching the knowledge base.', 'Collecting relevant info.', 'Drafting the answer.'],
            OTHER: ['Validating content suitability.'],
            SWEARS: ['Checking language content.'],
            KB: ['Gathering information.', 'Processing the reply.', 'Formulating the response.']
          },
          all: {
            KB: ['Scanning the knowledge base.', 'Verifying available facts.', 'Preparing the answer.'],
            KB_WS: ['Searching the knowledge base.', 'Analyzing web sources.', 'Verifying context.', 'Writing the answer.']
          }
        }
      };

      let messages;
      if (phase === 'all' && (type === 'KB' || type === 'KB_WS')) {
        messages = messageSequences[lang]?.all?.[type];
      } else if (phase === 'output') {
        messages = messageSequences[lang]?.output?.[type];
      } else if (phase === 'analysis') {
        messages = messageSequences[lang]?.analysis?.[type] || messageSequences[lang]?.analysis?.DEFAULT;
      } else {
        messages = messageSequences[lang]?.[phase];
      }
      if (!messages || !messages.length) return;

      let totalDuration;
      const customDurationSeconds = payload.duration;
      if (typeof customDurationSeconds === 'number' && customDurationSeconds > 0) {
        totalDuration = customDurationSeconds * 1000;
      } else {
        if (phase === 'analysis') {
          if (type === 'SMT' || type === 'SWEARS' || type === 'OTHER') totalDuration = 5000;     // + ~25%
          else if (type === 'KB' || type === 'KB_WS')                 totalDuration = 15000;    // + ~25%
          else                                                        totalDuration = 4000;
        } else if (phase === 'output') {
          if (type === 'SMT' || type === 'SWEARS' || type === 'OTHER') totalDuration = 5000;
          else if (type === 'KB')                                      totalDuration = 15000;
          else if (type === 'KB_WS')                                   totalDuration = 28000;
          else                                                         totalDuration = 4000;
        } else {
          totalDuration = 4000;
        }
      }

      const messageInterval = Math.max(1200, Math.floor(totalDuration / messages.length));

      const container = document.createElement('div');
      container.className = 'vfrc-message vfrc-message--extension LoadingAnimationExtention';

      const style = document.createElement('style');
      style.textContent = `
        .vfrc-message.vfrc-message--extension.LoadingAnimationExtention {
          opacity: 1;
          transition: opacity 0.3s ease-out;
          width: 100%;
          display: block;
        }
        .vfrc-message.vfrc-message--extension.LoadingAnimationExtention.hide {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }
        .loading-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin: 0;
          width: 100%;
          box-sizing: border-box;
          background-color: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
        }
        .loading-text {
          color: rgba(26,30,35,0.7);
          font-size: 12px;
          line-height: 1.3;
          font-family: var(--_1bof89na, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif);
          position: relative;
          display: flex;
          flex-direction: column;
          max-width: 100%;
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.35s ease-out, transform 0.35s ease-out;
          flex: 1;
          min-width: 0;
          font-style: italic;
        }
        .loading-text.changing { opacity: 0; transform: translateY(-6px); }
        .loading-text.entering { opacity: 0; transform: translateY(6px); }

        @keyframes loading-spinner-spin { 0% {transform: rotate(0)} 100% {transform: rotate(360deg)} }
        .rotating-point-spinner {
          position: relative;
          width: 16px;
          height: 16px;
          animation: loading-spinner-spin 1.05s linear infinite;
          flex-shrink: 0;
          transition: opacity 0.3s ease-out, width 0.3s ease-out;
          opacity: 1;
        }
        .rotating-point-spinner::before {
          content: "";
          box-sizing: border-box;
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.12);
        }
        .rotating-point-spinner::after {
          content: "";
          box-sizing: border-box;
          position: absolute;
          width: 5px;
          height: 5px;
          background-color: var(--spinner-point-colour, #696969);
          border-radius: 50%;
          top: -1.5px;
          left: calc(50% - 2.5px);
        }
        .rotating-point-spinner.hide {
          opacity: 0;
          visibility: hidden;
          width: 0 !important;
          display: none;
        }
      `;
      container.appendChild(style);

      const box = document.createElement('div');
      box.className = 'loading-box';

      const spinner = document.createElement('div');
      spinner.className = 'rotating-point-spinner';
      spinner.style.setProperty('--spinner-point-colour', '#FF4F00');

      const text = document.createElement('span');
      text.className = 'loading-text';

      box.appendChild(spinner);
      box.appendChild(text);
      container.appendChild(box);

      let idx = 0;

      const updateText = (t) => {
        text.classList.add('changing');
        setTimeout(() => {
          text.textContent = t;
          text.classList.remove('changing');
          text.classList.add('entering');
          requestAnimationFrame(() => text.classList.remove('entering'));
        }, 360);
      };

      updateText(messages[idx]);

      let intervalId = null;
      if (messages.length > 1) {
        intervalId = setInterval(() => {
          if (idx < messages.length - 1) {
            idx += 1;
            updateText(messages[idx]);
          } else {
            clearInterval(intervalId);
            intervalId = null;
          }
        }, messageInterval);
      }

      const endTimeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
        spinner?.classList.add('hide');
      }, totalDuration);

      const cleanupOnRemove = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.removedNodes.forEach((n) => {
            if (n === container || (n.nodeType === 1 && n.contains(container))) {
              if (intervalId) clearInterval(intervalId);
              clearTimeout(endTimeoutId);
              cleanupOnRemove.disconnect();
            }
          });
        }
      });
      cleanupOnRemove.observe(element.parentElement || document.body, { childList: true, subtree: true });

      const stopOnAiReply = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && n.classList.contains('vfrc-message--ai')) {
              if (intervalId) clearInterval(intervalId);
              clearTimeout(endTimeoutId);
              spinner?.classList.add('hide');
              stopOnAiReply.disconnect();
            }
          });
        }
      });
      stopOnAiReply.observe(document.body, { childList: true, subtree: true });

      element.appendChild(container);
      void container.offsetHeight;
    } catch {}
  }
};
