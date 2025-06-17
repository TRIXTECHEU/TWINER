export const LoadingAnimationExtension = {
  name: 'LoadingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_loadingAnimation' || trace.payload?.name === 'ext_loadingAnimation',
  render: ({ trace, element }) => {
    const payload = trace.payload || {};
    const phase = payload.phase || 'output';
    const lang = 'cs';
    const type = (payload.type || 'SMT').toUpperCase();

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
          KB_WS: [
            'Hledám v databázi Twineru.',
            'Získávám relevantní informace.',
            'Formuluji odpověď.'
          ],
          OTHER: ['Ověřuji vhodnost obsahu.'],
          SWEARS: ['Kontroluji jazykový obsah.'],
          KB: [
            'Získávám informace.',
            'Zpracovávám odpověď.',
            'Formuluji reakci.'
          ]
        },
        all: {
          KB: [
            'Procházím databázi Twineru.',
            'Ověřuji dostupná fakta.',
            'Připravuji odpověď.'
          ],
          KB_WS: [
            'Hledám v databázi Twineru.',
            'Analyzuji webové zdroje.',
            'Ověřuji souvislosti.',
            'Píši odpověď.'
          ]
        }
      }
    };

    try {
      const customDurationSeconds = payload.duration;
      let messages;
      if (phase === 'all' && (type === 'KB' || type === 'KB_WS')) {
        messages = messageSequences[lang]?.all?.[type];
      } else if (phase === 'output') {
        messages = messageSequences[lang]?.output?.[type];
      } else if (phase === 'analysis') {
        messages = messageSequences[lang]?.[phase]?.[type] || messageSequences[lang]?.[phase]?.DEFAULT;
      } else {
        messages = messageSequences[lang]?.[phase];
      }

      if (!messages || messages.length === 0) return;

      let totalDuration;
      if (customDurationSeconds && typeof customDurationSeconds === 'number') {
        totalDuration = customDurationSeconds * 1000;
      } else {
        if (phase === 'analysis') {
          totalDuration = ['KB', 'KB_WS'].includes(type) ? 12000 : 4000;
        } else if (phase === 'output') {
          totalDuration = type === 'KB_WS' ? 23000 : type === 'KB' ? 12000 : 4000;
        } else {
          totalDuration = 3000;
        }
      }

      const messageInterval = totalDuration / messages.length;
      const container = document.createElement('div');
      container.className = 'vfrc-message vfrc-message--extension LoadingAnimation';

      const style = document.createElement('style');
      style.textContent = `
        .vfrc-message.vfrc-message--extension.LoadingAnimation {
          opacity: 1;
          transition: opacity 0.3s ease-out;
          width: 100%;
          display: block;
        }
        .loading-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: #f2f4f8;
          border-radius: 14px;
          font-family: 'Inter', sans-serif;
        }
        .loading-text {
          font-size: 13px;
          font-style: italic;
          color: #333;
          flex: 1;
        }
        .rotating-point-spinner {
          width: 16px;
          height: 16px;
          animation: loading-spinner-spin 0.9s linear infinite;
          position: relative;
        }
        .rotating-point-spinner::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.12);
        }
        .rotating-point-spinner::after {
          content: "";
          width: 5px;
          height: 5px;
          background-color: #696969;
          border-radius: 50%;
          position: absolute;
          top: -1.5px;
          left: calc(50% - 2.5px);
        }
        @keyframes loading-spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      container.appendChild(style);

      const loadingBox = document.createElement('div');
      loadingBox.className = 'loading-box';

      const spinner = document.createElement('div');
      spinner.className = 'rotating-point-spinner';
      loadingBox.appendChild(spinner);

      const textElement = document.createElement('span');
      textElement.className = 'loading-text';
      loadingBox.appendChild(textElement);

      container.appendChild(loadingBox);

      let currentIndex = 0;

      const updateText = (newText) => {
        textElement.textContent = newText;
      };

      updateText(messages[currentIndex]);

      let intervalId = null;
      if (messages.length > 1) {
        intervalId = setInterval(() => {
          if (currentIndex < messages.length - 1) {
            currentIndex++;
            updateText(messages[currentIndex]);
          } else {
            clearInterval(intervalId);
          }
        }, messageInterval);
      }

      const animationTimeoutId = setTimeout(() => {
        clearInterval(intervalId);
        spinner.classList.add('hide');
      }, totalDuration);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node === container || node.contains(container)) {
              clearInterval(intervalId);
              clearTimeout(animationTimeoutId);
              observer.disconnect();
            }
          });
        });
      });

      observer.observe(element.parentElement || document.body, {
        childList: true,
        subtree: true
      });

      if (element) {
        element.appendChild(container);
        void container.offsetHeight;
      }
    } catch (error) {}
  }
};
