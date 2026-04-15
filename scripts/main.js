document.addEventListener('DOMContentLoaded', () => {

    // ── 1. DOOR ANIMATION (session-once, no duplicate) ────────────────────
    // Uses JS-created overlay only — no static HTML element needed
    try {
        if (!sessionStorage.getItem('doorOpened')) {
            const doorOverlay = document.createElement('div');
            doorOverlay.className = 'door-overlay';
            doorOverlay.innerHTML = `
                <div class="door door-left"></div>
                <div class="door door-right"></div>
                <div class="door-text">Digital<span>Dustak</span></div>
            `;
            document.body.appendChild(doorOverlay);
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                doorOverlay.classList.add('open');
                setTimeout(() => {
                    if (document.body.contains(doorOverlay)) doorOverlay.remove();
                    document.body.style.overflow = '';
                    sessionStorage.setItem('doorOpened', 'true');
                }, 1200);
            }, 1000);
        }
    } catch (err) {
        console.error("Gate Error:", err);
        document.body.style.overflow = '';
    }

    // ── 2. MOBILE NAV ─────────────────────────────────────────────────────
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // ── 3. SCROLL FADE-IN ANIMATIONS ──────────────────────────────────────
    try {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.01 });

        const animatedEls = document.querySelectorAll('.fade-up');
        animatedEls.forEach(el => observer.observe(el));

        // Failsafe: force visible after 1s
        setTimeout(() => animatedEls.forEach(el => el.classList.add('visible')), 1000);
    } catch (err) {
        document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    }

    // ── 4. CURSOR HUD ─────────────────────────────────────────────────────
    const hudArrow = document.createElement('div');
    const hudRing = document.createElement('div');

    hudArrow.className = 'cursor-hud-arrow';
    hudArrow.innerHTML = `
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,5 L20,5 C32,5 35,15 35,20 C35,25 32,35 20,35 L10,35 Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
            <path d="M10,5 L10,35" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <rect x="18" y="18" width="4" height="4" rx="2" fill="currentColor"/>
        </svg>
    `;
    hudRing.className = 'cursor-hud-ring';
    document.body.appendChild(hudRing);
    document.body.appendChild(hudArrow);

    let mouseX = 0, mouseY = 0;
    let arrowX = 0, arrowY = 0;
    let ringX = 0, ringY = 0;
    let lastX = 0, lastY = 0;
    let arrowAngle = 0, arrowStretch = 1, baseScale = 1;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateHUD() {
        arrowX += (mouseX - arrowX) * 0.2;
        arrowY += (mouseY - arrowY) * 0.2;
        ringX  += (mouseX - ringX)  * 0.1;
        ringY  += (mouseY - ringY)  * 0.1;

        const dx = mouseX - lastX;
        const dy = mouseY - lastY;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist > 2) {
            arrowAngle   = Math.atan2(dy, dx) * (180 / Math.PI);
            arrowStretch = Math.min(1 + dist * 0.08, 2.5);
        } else {
            arrowStretch += (1 - arrowStretch) * 0.1;
        }

        hudArrow.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${arrowAngle}deg) scaleX(${arrowStretch * baseScale}) scaleY(${baseScale})`;
        hudRing.style.transform  = `translate(${ringX}px, ${ringY}px) scale(${baseScale})`;

        lastX = mouseX; lastY = mouseY;
        requestAnimationFrame(animateHUD);
    }
    animateHUD();

    document.querySelectorAll('a, button, .portfolio-item, .card, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => { hudArrow.classList.add('lock-on');    hudRing.classList.add('lock-on');    baseScale = 1.3; });
        el.addEventListener('mouseleave', () => { hudArrow.classList.remove('lock-on'); hudRing.classList.remove('lock-on'); baseScale = 1;   });
    });

    // ── 5. DIGITAL DUST CANVAS ────────────────────────────────────────────
    const canvas = document.getElementById('dust-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseVelocity = 0;
        const particleCount = Math.min(window.innerWidth / 8, 200);
        const mouse = { x: -100, y: -100, radius: 250 };
        let lastMX = 0, lastMY = 0;

        window.addEventListener('mousemove', (e) => {
            const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
            mouseVelocity = Math.sqrt(dx*dx + dy*dy);
            mouse.x = e.clientX; mouse.y = e.clientY;
            lastMX = e.clientX; lastMY = e.clientY;
        });

        class Particle {
            constructor() { this.init(); }
            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = this.baseSize = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5;
                this.density = Math.random() * 25 + 5;
                this.history = [];
            }
            draw() {
                if (this.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) ctx.lineTo(this.history[i].x, this.history[i].y);
                    const a = Math.min(0.6, 0.1 + mouseVelocity * 0.01);
                    ctx.strokeStyle = `rgba(245,124,44,${a})`;
                    ctx.lineWidth = this.size * 0.5;
                    ctx.stroke();
                }
                const a = Math.min(0.8, 0.2 + mouseVelocity * 0.01);
                ctx.fillStyle = `rgba(245,124,44,${a})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            update() {
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > 6) this.history.shift();
                this.x += this.speedX; this.y += this.speedY;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
                const dx = mouse.x - this.x, dy = mouse.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const dirX = (dx / dist) * force * this.density;
                    const dirY = (dy / dist) * force * this.density;
                    if (mouseVelocity > 20) { this.x -= dirX * 0.8; this.y -= dirY * 0.8; }
                    else { this.x += dirX * 0.05; this.y += dirY * 0.05; }
                    this.size = this.baseSize * (1 + force * 2);
                } else {
                    this.size += (this.baseSize - this.size) * 0.1;
                }
            }
        }

        function init() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = Array.from({ length: particleCount }, () => new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            particles.forEach(p => { p.update(); p.draw(); });
            ctx.globalCompositeOperation = 'source-over';
            mouseVelocity *= 0.95;
            requestAnimationFrame(animate);
        }

        const bgVortex = document.querySelector('.bg-vortex');
        let scrollPos = window.pageYOffset, ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const delta = Math.abs(window.pageYOffset - scrollPos);
                    if (bgVortex) {
                        bgVortex.style.setProperty('--vortex-scale', delta > 20 ? '1.05' : '1');
                        bgVortex.style.setProperty('--vortex-opacity', delta > 20 ? '0.1' : '0.05');
                    }
                    scrollPos = window.pageYOffset; ticking = false;
                });
                ticking = true;
            }
        });

        window.addEventListener('resize', init);
        init();
        animate();
    }

    // ── 6. STATS COUNT-UP (fixed: threshold lowered + failsafe) ──────────
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const countUp = (el) => {
        if (el.dataset.counted) return; // prevent double-fire
        el.dataset.counted = 'true';
        const target   = parseInt(el.getAttribute('data-target'));
        const prefix   = el.getAttribute('data-prefix') || '';
        const suffix   = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        let start = null;
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const ease = 1 - Math.pow(2, -10 * progress);
            el.textContent = `${prefix}${Math.floor(ease * target)}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = `${prefix}${target}${suffix}`;
        };
        requestAnimationFrame(step);
    };

    if (statNumbers.length > 0) {
        const statsObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { countUp(entry.target); statsObs.unobserve(entry.target); }
            });
        }, { threshold: 0.1 }); // lowered from 0.5 so it fires earlier

        statNumbers.forEach(s => statsObs.observe(s));

        // Hard failsafe: if still 0 after 3s, fire anyway
        setTimeout(() => statNumbers.forEach(s => countUp(s)), 3000);
    }

    // ── 7. VIDEO HANDLING (YouTube lazy-load + local video modal) ─────────
    const modal = document.getElementById('portfolio-modal') || (() => {
        const m = document.createElement('div');
        m.id = 'portfolio-modal';
        m.innerHTML = `
            <div id="portfolio-modal-backdrop"></div>
            <div id="portfolio-modal-inner">
                <button id="portfolio-modal-close" aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div id="portfolio-modal-content"></div>
            </div>
        `;
        document.body.appendChild(m);
        return m;
    })();

    const modalInner   = document.getElementById('portfolio-modal-inner');
    const modalContent = document.getElementById('portfolio-modal-content');
    const modalClose   = document.getElementById('portfolio-modal-close');
    const modalBackdrop = document.getElementById('portfolio-modal-backdrop');

    function openModal(item) {
        const youtubeId = item.dataset.youtubeId || item.querySelector('[data-youtube-id]')?.dataset.youtubeId;
        const videoSrc  = item.dataset.videoSrc;
        const isVertical = item.classList.contains('vertical');
        modalContent.innerHTML = '';

        if (youtubeId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
            iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;';
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');
            modalContent.appendChild(iframe);
        } else if (videoSrc) {
            const video = document.createElement('video');
            video.src = videoSrc;
            video.controls = true;
            video.autoplay = true;
            video.style.cssText = 'width:100%;height:100%;border-radius:12px;background:#000;';
            modalContent.appendChild(video);
        }

        if (isVertical) {
            modalInner.style.width  = 'min(380px, 90vw)';
            modalInner.style.height = 'min(680px, 90vh)';
        } else {
            modalInner.style.width      = 'min(960px, 95vw)';
            modalInner.style.height     = 'auto';
            modalInner.style.aspectRatio = '16/9';
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const video = modalContent.querySelector('video');
        if (video) { video.pause(); video.src = ''; video.load(); }
        modal.classList.remove('active');
        modalContent.innerHTML = '';
        document.body.style.overflow = '';
        modalInner.style.cssText = '';
    }

    document.querySelectorAll('.portfolio-item, .video-container[data-youtube-id]').forEach(item => {
        item.addEventListener('click', () => openModal(item));
    });

    modalClose?.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
    modalBackdrop?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // ── 8. FOUNDER 3D TILT ────────────────────────────────────────────────
    const founder3D  = document.getElementById('founder-3d');
    const founderImg = founder3D?.querySelector('img');
    if (founder3D && founderImg) {
        founder3D.addEventListener('mousemove', (e) => {
            const r = founder3D.getBoundingClientRect();
            const rotX =  (e.clientY - r.top  - r.height/2) / 10;
            const rotY = -(e.clientX - r.left  - r.width/2)  / 10;
            founderImg.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
        });
        founder3D.addEventListener('mouseleave', () => {
            founderImg.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    // ── 9. AI AGENT (single instance, no duplicate) ───────────────────────
    // Agent widget is already in HTML — we just control it, not create it
    const chatContainer = document.getElementById('celestial-chat-container');
    const chatLauncher  = document.getElementById('chat-launcher');
    const chatWindow    = document.getElementById('chat-window');
    const chatInput     = document.getElementById('chat-input');
    const sendBtn       = document.getElementById('send-msg-btn');
    const chatMessages  = document.getElementById('chat-messages');
    const speechBubble  = document.getElementById('chat-speech-bubble');

    let chatHistory = [];

    // Toggle chat window
    chatLauncher?.addEventListener('click', () => {
        chatWindow?.classList.toggle('active');
        if (chatWindow?.classList.contains('active')) {
            chatInput?.focus();
            speechBubble?.classList.remove('show-bubble');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!chatLauncher?.contains(e.target) && !chatWindow?.contains(e.target)) {
            chatWindow?.classList.remove('active');
        }
    });

    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        
        if (sender === 'bot' && text.includes('[SHOW_IMAGE:developer]')) {
            const cleanText = text.replace('[SHOW_IMAGE:developer]', '').trim();
            div.textContent = cleanText;
            
            const frame = document.createElement('div');
            frame.className = 'dev-image-frame';
            frame.innerHTML = `
                <img src="Senior Video Editor/jahanzeb.jpeg" alt="Muhammad Jahanzeb Asghar" onerror="console.error('Image load failed'); this.onerror=null;">
                <div class="dev-image-label">Senior Video Editor & Developer</div>
            `;
            div.appendChild(frame);
        } else {
            div.textContent = text;
        }
        
        chatMessages?.appendChild(div);
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSendMessage = async () => {
        const text = chatInput?.value.trim();
        if (!text) return;
        chatInput.value = '';
        addMessage(text, 'user');
        chatHistory.push({ role: 'user', content: text });

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'typing';
        typingDiv.textContent = 'Agent is thinking...';
        chatMessages?.appendChild(typingDiv);
        if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const res  = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory })
            });
            const data = await res.json();
            document.getElementById(typingId)?.remove();
            if (data.text) { addMessage(data.text, 'bot'); chatHistory.push({ role: 'assistant', content: data.text }); }
        } catch (err) {
            document.getElementById(typingId)?.remove();
            addMessage("Koshish karein baad mein — internet check karein.", 'bot');
        }
    };

    sendBtn?.addEventListener('click', handleSendMessage);
    chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });

    // ── 10. AGENT FIXED POSITION + IDLE SHAKE ────────────────────────────
    if (chatContainer) {
        const greetings = [
            "Hi! I'm your Digital Dustak Agent.<br>How can I help you?",
            "Ready to scale your brand? Let's talk.",
            "Need a viral hit? I'm your agent.",
            "Main aapki kaise madad kar sakta hoon?",
            "Explore our portfolio to see real results."
        ];

        // Position handled by CSS (bottom: -60px; right: 20px)
        // Show greeting bubble every 8 seconds
        const showGreeting = () => {
            if (!speechBubble || chatWindow?.classList.contains('active')) return;
            speechBubble.innerHTML = greetings[Math.floor(Math.random() * greetings.length)];
            speechBubble.classList.add('show-bubble');
            setTimeout(() => speechBubble.classList.remove('show-bubble'), 4000);
        };

        // Start greeting cycle after 3s
        setTimeout(() => {
            showGreeting();
            setInterval(showGreeting, 8000);
        }, 3000);
    }

});
