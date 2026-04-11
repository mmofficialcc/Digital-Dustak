document.addEventListener('DOMContentLoaded', () => {
    // Door Opening Animation
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
            document.body.style.overflow = 'hidden'; // Stop scroll

            setTimeout(() => {
                doorOverlay.classList.add('open');
                setTimeout(() => {
                    if(document.body.contains(doorOverlay)) doorOverlay.remove();
                    document.body.style.overflow = '';
                    sessionStorage.setItem('doorOpened', 'true');
                }, 1200);
            }, 1000);
        }
    } catch (err) {
        console.error("Gate Overlay Error:", err);
        document.body.style.overflow = ''; // Failsafe unlock
    }

    // Mobile Navigation Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Scroll Animations (Intersection Observer)
    try {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.01 // Trigger as soon as a single pixel is visible
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.fade-up');
        animatedElements.forEach(el => observer.observe(el));
        
        // Failsafe: ensure everything becomes visible quickly so page isn't empty
        setTimeout(() => {
            animatedElements.forEach(el => el.classList.add('visible'));
        }, 1000);
    } catch (err) {
        console.error("Observer Error", err);
        document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    }

    // High-Velocity HUD Arrow (Arrow Illusion)
    const cursorDot = document.createElement('div');
    const hudArrow = document.createElement('div');
    const hudRing = document.createElement('div');
    
    // Removed cursor dot visual per request, keep element to avoid breaking logic
    cursorDot.style.display = 'none'; 
    
    hudArrow.className = 'cursor-hud-arrow';
    hudArrow.innerHTML = `
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Custom 'D' Door Logo -->
            <path d="M10,5 L20,5 C32,5 35,15 35,20 C35,25 32,35 20,35 L10,35 Z" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
            <path d="M10,5 L10,35" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            <rect x="18" y="18" width="4" height="4" rx="2" fill="currentColor"/>
        </svg>
    `;
    hudRing.className = 'cursor-hud-ring';
    
    [hudRing, hudArrow, cursorDot].forEach(el => document.body.appendChild(el));
 
    let mouseX = 0, mouseY = 0;
    let arrowX = 0, arrowY = 0;
    let ringX = 0, ringY = 0;
    let lastX = 0, lastY = 0;
    let arrowAngle = 0, arrowStretch = 1;
    let baseScale = 1;
 
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) scale(${baseScale})`;
    });
 
    function animateHUD() {
        // Physics-based following
        arrowX += (mouseX - arrowX) * 0.2;
        arrowY += (mouseY - arrowY) * 0.2;
        ringX += (mouseX - ringX) * 0.1;
        ringY += (mouseY - ringY) * 0.1;
        
        const dx = mouseX - lastX;
        const dy = mouseY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Dynamic orientation & stretching
        if (distance > 2) {
            const targetAngle = Math.atan2(dy, dx) * (180 / Math.PI);
            arrowAngle = targetAngle;
            arrowStretch = Math.min(1 + distance * 0.08, 2.5);
        } else {
            arrowStretch += (1 - arrowStretch) * 0.1;
        }
 
        hudArrow.style.transform = `translate(${arrowX}px, ${arrowY}px) rotate(${arrowAngle}deg) scaleX(${arrowStretch * baseScale}) scaleY(${baseScale})`;
        hudRing.style.transform = `translate(${ringX}px, ${ringY}px) scale(${baseScale})`;
        
        lastX = mouseX;
        lastY = mouseY;
        requestAnimationFrame(animateHUD);
    }
    animateHUD();
 
    // Interactive Lock-on
    const interactiveElements = document.querySelectorAll('a, button, .portfolio-item, .card, .founder-section, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            hudArrow.classList.add('lock-on');
            hudRing.classList.add('lock-on');
            baseScale = 1.5;
        });
        el.addEventListener('mouseleave', () => {
            hudArrow.classList.remove('lock-on');
            hudRing.classList.remove('lock-on');
            baseScale = 1;
        });
    });

    // ── Video Handling (YouTube Lazy-loading) ────────────────────────────────
    function loadYouTubeVideo(container) {
        if (container.classList.contains('active')) return;
        
        const videoId = container.dataset.youtubeId;
        if (!videoId) return;

        const iframe = document.createElement('iframe');
        // Simple, robust embed URL
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        // referrerPolicy can help with Error 153 in some local environments
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.style.cssText = 'width:100%; height:100%; border:none;';
        
        container.innerHTML = '';
        container.appendChild(iframe);
        container.classList.add('active');
    }

    // Initialize placeholders
    document.querySelectorAll('.video-container').forEach(container => {
        const videoId = container.dataset.youtubeId;
        
        if (videoId) {
            const placeholder = container.querySelector('.video-placeholder');
            if (placeholder) {
                // Set background from YouTube if local one is missing or just for fallback
                placeholder.style.backgroundImage = `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`;
            }
        }
        
        container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            loadYouTubeVideo(container);
        });
    });


    // ── Portfolio Lightbox Modal ──────────────────────────────────────────────
    // Build the modal once and reuse it
    const modal = document.createElement('div');
    modal.id = 'portfolio-modal';
    modal.innerHTML = `
        <div id="portfolio-modal-backdrop"></div>
        <div id="portfolio-modal-inner">
            <button id="portfolio-modal-close" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
            <div id="portfolio-modal-content"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalInner   = document.getElementById('portfolio-modal-inner');
    const modalContent = document.getElementById('portfolio-modal-content');
    const modalClose   = document.getElementById('portfolio-modal-close');
    const modalBackdrop = document.getElementById('portfolio-modal-backdrop');

    let activeModalVideo = null;

    function openModal(item) {
        const youtubeId = item.dataset.youtubeId;
        const img       = item.querySelector('img');
        const isVertical = item.classList.contains('vertical');

        modalContent.innerHTML = '';

        if (youtubeId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
            iframe.style.cssText = 'width:100%;height:100%;border:none;border-radius:12px;';
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            iframe.setAttribute('allowfullscreen', 'true');
            modalContent.appendChild(iframe);
        } else if (img) {
            const image = document.createElement('img');
            image.src = img.src;
            image.alt = img.alt || '';
            image.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:12px;display:block;';
            modalContent.appendChild(image);
        }


        // Size the modal based on orientation
        if (isVertical) {
            // 9:16 portrait — tall & narrow
            modalInner.style.width  = 'min(380px, 90vw)';
            modalInner.style.height = 'min(680px, 90vh)';
            modalInner.dataset.orient = 'vertical';
        } else {
            // 16:9 landscape — wide
            modalInner.style.width  = 'min(960px, 95vw)';
            modalInner.style.height = 'auto';
            modalInner.style.aspectRatio = '16/9';
            modalInner.dataset.orient = 'landscape';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (activeModalVideo) { activeModalVideo.pause(); activeModalVideo = null; }
        modal.classList.remove('active');
        modalContent.innerHTML = '';
        document.body.style.overflow = '';
        // Reset sizing
        modalInner.style.width = '';
        modalInner.style.height = '';
        modalInner.style.aspectRatio = '';
    }

    // Wire up portfolio items
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', () => openModal(item));
    });

    modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });


    // 3D Tilt for Founder Portrait
    const founder3D = document.getElementById('founder-3d');
    const founderImg = founder3D ? founder3D.querySelector('img') : null;

    if (founder3D && founderImg) {
        founder3D.addEventListener('mousemove', (e) => {
            const rect = founder3D.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            founderImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        founder3D.addEventListener('mouseleave', () => {
            founderImg.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }

    // High-Performance Digital Dust & Cursor Trail
    const canvas = document.getElementById('dust-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseVelocity = 0;
        const particleCount = Math.min(window.innerWidth / 8, 200);
        const mouse = { x: -100, y: -100, radius: 250 };
        
        let lastMouseX = 0;
        let lastMouseY = 0;

        window.addEventListener('mousemove', (e) => {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            mouseVelocity = Math.sqrt(dx * dx + dy * dy);
            
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        class Particle {
            constructor() {
                this.init();
            }

            init() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.baseSize = this.size;
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5;
                this.density = (Math.random() * 25) + 5;
                this.history = [];
                this.maxHistory = 6;
            }

            draw() {
                ctx.beginPath();
                // Trail effect
                if (this.history.length > 1) {
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                }
                
                const alpha = Math.min(0.6, 0.1 + (mouseVelocity * 0.01));
                ctx.strokeStyle = `rgba(245, 124, 44, ${alpha})`;
                ctx.lineWidth = this.size * 0.5;
                ctx.stroke();

                // Core
                ctx.fillStyle = `rgba(245, 124, 44, ${alpha + 0.2})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update() {
                this.history.push({x: this.x, y: this.y});
                if (this.history.length > this.maxHistory) this.history.shift();

                this.x += this.speedX;
                this.y += this.speedY;

                // Screen Wrap
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Mouse Interaction
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = (dx / distance) * force * this.density;
                    const directionY = (dy / distance) * force * this.density;
                    
                    if (mouseVelocity > 20) {
                        // Explosion on fast move
                        this.x -= directionX * 0.8;
                        this.y -= directionY * 0.8;
                    } else {
                        // Attraction on slow move
                        this.x += directionX * 0.05;
                        this.y += directionY * 0.05;
                    }
                    this.size = this.baseSize * (1 + force * 2);
                } else {
                    this.size += (this.baseSize - this.size) * 0.1;
                }
            }
        }

        function init() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Additive blending for "Glow"
            ctx.globalCompositeOperation = 'lighter';
            
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            
            ctx.globalCompositeOperation = 'source-over';
            
            // Mouse Velocity Decay
            mouseVelocity *= 0.95;
            requestAnimationFrame(animate);
        }

    // Background Vortex Interaction - Optimized with RAF throttling
    const bgVortex = document.querySelector('.bg-vortex');
    let scrollPos = window.pageYOffset;
    let vortexScale = 1;
    let vortexOpacity = 0.05;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;
                const scrollDelta = Math.abs(currentScroll - scrollPos);
                
                // Pulse on high speed scroll
                if (scrollDelta > 20) {
                    vortexScale = 1.05;
                    vortexOpacity = 0.1;
                } else {
                    vortexScale = 1;
                    vortexOpacity = 0.05;
                }
                
                if (bgVortex) {
                    bgVortex.style.setProperty('--vortex-scale', vortexScale);
                    bgVortex.style.setProperty('--vortex-opacity', vortexOpacity);
                    bgVortex.style.setProperty('--vortex-speed', (20 - Math.min(scrollDelta * 0.1, 15)) + 's');
                }
                
                scrollPos = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });

    // Pulse on click
    window.addEventListener('mousedown', () => {
        if (bgVortex) {
            bgVortex.style.setProperty('--vortex-scale', '1.15');
            bgVortex.style.setProperty('--vortex-opacity', '0.15');
            setTimeout(() => {
                bgVortex.style.setProperty('--vortex-scale', '1');
                bgVortex.style.setProperty('--vortex-opacity', '0.05');
            }, 600);
        }
    });

    window.addEventListener('resize', init);
    init();
    animate();

    // Stats Count Up Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserverOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const countUp = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing function: easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentCount = Math.floor(easeProgress * target);
            
            el.textContent = `${prefix}${currentCount}${suffix}`;
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = `${prefix}${target}${suffix}`;
            }
        };
        window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, statsObserverOptions);

    statNumbers.forEach(stat => statsObserver.observe(stat));

    // ── AI Celestial Agent Logic ───────────────────────────────────────────
    const chatLauncher = document.getElementById('chat-launcher');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-msg-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Message History for Claude
    let chatHistory = [];

    // Toggle Chat
    chatLauncher?.addEventListener('click', () => {
        chatWindow?.classList.toggle('active');
        if (chatWindow?.classList.contains('active')) {
            chatInput?.focus();
        }
    });

    // Close chat if clicking outside
    document.addEventListener('click', (e) => {
        if (!chatLauncher?.contains(e.target) && !chatWindow?.contains(e.target)) {
            chatWindow?.classList.remove('active');
        }
    });

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.textContent = text;
        chatMessages?.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const handleSendMessage = async () => {
        const text = chatInput?.value.trim();
        if (!text) return;

        // Clear input
        chatInput.value = '';
        
        // Add User Message
        addMessage(text, 'user');
        chatHistory.push({ role: 'user', content: text });

        // Add Typing Indicator
        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'typing';
        typingDiv.textContent = 'Agent is thinking...';
        chatMessages?.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Call our Netlify Function (The Secure Bridge)
            const response = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory })
            });

            const data = await response.json();
            
            // Remove Typing Indicator
            document.getElementById(typingId)?.remove();

            if (data.text) {
                addMessage(data.text, 'bot');
                chatHistory.push({ role: 'assistant', content: data.text });
            } else if (data.error) {
                addMessage("I'm having a little trouble connecting. Please ensure the API Key is set in Netlify settings.", 'bot');
                console.error('AI Error:', data.error);
            }
        } catch (error) {
            document.getElementById(typingId)?.remove();
            addMessage("Koshish karein ke internet theek ho, ya baad mein try karein.", 'bot');
            console.error('Chat Error:', error);
        }
    };

    // Event Listeners for sending
    sendBtn?.addEventListener('click', handleSendMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // ── Autonomous Wandering Logic ─────────────────────────────────────────
    const chatContainer = document.getElementById('celestial-chat-container');
    const speechBubble = document.getElementById('chat-speech-bubble');
    
    // Greetings to cycle through when paused
    const greetings = [
        "Hi! I'm your Digital Dustak Agent.<br>How can I help you?",
        "Ready to scale your brand? Let's talk.",
        "Need a viral hit? I'm your agent.",
        "Main aapki madad kaise kar sakta hoon?",
        "Explore our portfolio to see real results."
    ];

    if (chatContainer && chatLauncher) {
        let isWandering = true;
        
        // Stop wandering if chat is open to avoid annoyances
        chatLauncher.addEventListener('click', () => {
            if (chatWindow?.classList.contains('active')) {
                isWandering = false;
                speechBubble?.classList.remove('show-bubble'); // hide bubble if chat opens
            } else {
                isWandering = true;
                wanderLoop(); // resume
            }
        });

        // Function to move to a random position in the bottom 40% of the screen
        const moveRobot = () => {
            if (!isWandering) return;
            
            // Safe bounds (respecting the 180px size)
            const maxX = window.innerWidth - 200;
            const minX = 20;
            // Limit to bottom 40%
            const maxY = window.innerHeight - 200;
            const minY = window.innerHeight * 0.6; 

            // Calculate new position
            const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

            // Apply translation (hardware accelerated)
            chatContainer.style.transform = `translate(${randomX}px, ${randomY}px)`;
        };

        const showGreeting = () => {
            if (!isWandering || !speechBubble) return;
            try {
                const randomText = greetings[Math.floor(Math.random() * greetings.length)];
                speechBubble.innerHTML = randomText;
                speechBubble.classList.add('show-bubble');
                setTimeout(() => {
                    speechBubble.classList.remove('show-bubble');
                }, 4000);
            } catch(e) {}
        };

        const wanderLoop = () => {
            if (!isWandering) return;
            
            moveRobot();
            
            // Wait for movement to finish (4s css transition), then maybe greet, then wait before next move
            setTimeout(() => {
                // 50% chance to greet when stopped
                if (Math.random() > 0.5) showGreeting();
                
                // Wait while stopped (between 3 to 6 seconds)
                const pauseTime = Math.floor(Math.random() * 3000) + 3000;
                
                setTimeout(() => {
                    wanderLoop(); // Go again
                }, pauseTime);
                
            }, 4000); // matches CSS transition time
        };

        // Start Initial Position (bottom right corner immediately without animation)
        chatContainer.style.transition = 'none';
        chatContainer.style.transform = `translate(${window.innerWidth - 200}px, ${window.innerHeight - 200}px)`;
        
        // Start Loop after a short delay
        setTimeout(() => {
            chatContainer.style.transition = 'transform 4s ease-in-out';
            wanderLoop();
        }, 1500);
    }
});
