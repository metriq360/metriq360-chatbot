(function () {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        createChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', createChatbot);
    }

    function createChatbot() {
        if (document.getElementById('metriq360-chatbot-iframe')) return;

        const chatIframe = document.createElement('iframe');

        chatIframe.src = "https://metriq360-chatbot.onrender.com";// BURASI BACKEND (Render) adresi olacak
        chatIframe.id = "metriq360-chatbot-iframe";
        chatIframe.style.cssText = `
            border: none !important;
            position: fixed !important;
            right: 20px !important;
            bottom: 20px !important;
            width: 0px !important;
            height: 0px !important;
            z-index: 9999 !important;
            transition: width 0.3s ease, height 0.3s ease !important;
        `;

        window.addEventListener('message', function (event) {
            if (event.data.action === 'open') {
                chatIframe.style.width = '400px';
                chatIframe.style.maxWidth = '90vw';
                chatIframe.style.height = '750px';
                chatIframe.style.maxHeight = '85vh';
            } else if (event.data.action === 'close') {
                chatIframe.style.width = '0px';
                chatIframe.style.height = '0px';
            }
        });

        document.body.appendChild(chatIframe);
        createLauncher();
    }

    function createLauncher() {
        if (document.getElementById('metriq360-launcher')) return;

        const launcher = document.createElement('div');
        launcher.id = 'metriq360-launcher';
        launcher.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9998 !important;
            cursor: pointer;
        `;

        launcher.innerHTML = `
            <div style="background: linear-gradient(145deg, #ff9b21, #e67e00); color: white; padding: 14px 22px; border-radius: 40px; display: flex; align-items: center; box-shadow: 0 6px 20px rgba(255,140,0, 0.4); gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 26px; height: 26px; fill: white;">
                    <path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 146.3-59.4c26.7 12.8 56.1 19.4 85.7 19.4c141.4 0 256-93.1 256-208S397.4 32 256 32z"/>
                </svg>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 1em; font-weight: bold;">IQ360-BOT</span>
                    <span style="font-size: 0.9em;">Akıllı Danışman</span>
                </div>
            </div>
        `;

        launcher.addEventListener('click', function () {
            const iframe = document.getElementById('metriq360-chatbot-iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ action: 'open' }, '*');
                launcher.style.display = 'none';
            }
        });

        document.body.appendChild(launcher);

        window.addEventListener('message', function (event) {
            if (event.data.action === 'close') {
                launcher.style.display = 'block';
            }
        });
    }
})();
