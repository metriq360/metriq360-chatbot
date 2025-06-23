(function() {
    // Systeme.io gibi platformların, sayfa tamamen yüklenmeden
    // işlem yapmaya çalışan script'leri engellememesi için bir güvenlik önlemi.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        createChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', createChatbot);
    }

    function createChatbot() {
        // Zaten varsa bir daha ekleme
        if (document.getElementById('metriq360-chatbot-iframe')) {
            return;
        }

        // 1. Bir iframe elementi oluştur
        const chatIframe = document.createElement('iframe');

        // 2. iframe'in kaynağını (bizim chatbot'un adresi) belirle
        chatIframe.src = "https://metriq360.github.io/metriq360-chatbot/";
        
        // 3. iframe'e bir kimlik ver
        chatIframe.id = "metriq360-chatbot-iframe";

        // 4. ÇERÇEVEYİ YOK EDEN VE POZİSYON AYARLAYAN SİHİRLİ STİLLER
        chatIframe.style.cssText = `
            border: none !important; 
            position: fixed !important; 
            right: 20px !important; 
            bottom: 20px !important; 
            width: 0px !important; /* Başlangıçta görünmez */
            height: 0px !important; /* Başlangıçta görünmez */
            z-index: 9999 !important;
            transition: width 0.3s ease, height 0.3s ease !important;
        `;
        
        // Bu kod, iframe'in içindeki chatbot'tan gelen "açıl/kapan" mesajlarını dinler.
        window.addEventListener('message', function(event) {
            if (event.data.action === 'open') {
                chatIframe.style.width = '400px !important';
                chatIframe.style.maxWidth = '90vw !important';
                chatIframe.style.height = '750px !important';
                chatIframe.style.maxHeight = '85vh !important';
            } else if (event.data.action === 'close') {
                chatIframe.style.width = '0px !important';
                chatIframe.style.height = '0px !important';
            }
        });

        // Oluşturduğun iframe'i sayfanın sonuna ekle
        document.body.appendChild(chatIframe);
        
        // Başlatma butonunu ayrıca oluştur
        createLauncher();
    }

    function createLauncher() {
        if (document.getElementById('metriq360-launcher')) {
            return;
        }

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
            <div style="width: auto; height: auto; background: linear-gradient(145deg, #ff9b21, #e67e00); color: white; padding: 14px 22px; border-radius: 40px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(255,140,0, 0.4); transition: all 0.3s ease; text-align: center; border: none; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 26px; height: 26px; fill: white;"><path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 146.3-59.4c26.7 12.8 56.1 19.4 85.7 19.4c141.4 0 256-93.1 256-208S397.4 32 256 32z"/></svg>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <span style="font-size: 1em; font-weight: 700; line-height: 1.2; letter-spacing: 0.5px;">IQ360-BOT</span>
                    <span style="font-size: 0.9em; font-weight: 500; opacity: 0.9; margin-top: 2px;">Akıllı Danışman</span>
                </div>
            </div>
        `;
        
        launcher.addEventListener('click', function() {
            const iframe = document.getElementById('metriq360-chatbot-iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ action: 'open' }, '*');
                launcher.style.display = 'none';
            }
        });
        
        document.body.appendChild(launcher);
        
         window.addEventListener('message', function(event) {
            if (event.data.action === 'close') {
               launcher.style.display = 'block';
            }
        });
    }
})();
</script>
