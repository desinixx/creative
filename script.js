document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HERO IMAGE SEQUENCE ANIMATION ---
    const canvas = document.getElementById("hero-canvas");
    const impactBg = document.querySelector('.impact-bg');

    if (canvas) {
        const context = canvas.getContext("2d");
        const frameCount = 210;
        
        // Set fixed canvas resolution
        canvas.width = 1920;
        canvas.height = 1080;

        const currentFrame = index => (
            `public/images/herosection/ezgif-frame-${index.toString().padStart(3, '0')}.png`
        );

        const images = [];
        const heroSequenceSection = document.getElementById("hero-sequence");
        
        // Text overlays
        const text1 = document.getElementById("text-frame-1");
        const text2 = document.getElementById("text-frame-2");
        const text3 = document.getElementById("text-frame-3");
        const scrollIndicator = document.getElementById("hero-scroll-indicator");

        // Preload all images
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            images.push(img);
        }

        // Draw first frame when loaded
        images[0].onload = render;

        function render() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            const img = images[sequenceState.frameIndex];
            if(!img || !img.complete) return;
            
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.max(hRatio, vRatio);
            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;  
            
            context.drawImage(img, 0, 0, img.width, img.height,
                              centerShift_x, centerShift_y, img.width * ratio, img.height * ratio); 
        }

        let sequenceState = { frameIndex: 0 };

        window.addEventListener('scroll', () => {
            const rect = heroSequenceSection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height - window.innerHeight; 
            
            if (sectionTop <= 0 && sectionTop >= -sectionHeight) {
                // inside the hero sequence
                const scrollProgress = Math.abs(sectionTop) / sectionHeight;
                
                // Calculate frame index
                const frameIndex = Math.min(
                    frameCount - 1,
                    Math.floor(scrollProgress * frameCount)
                );
                
                if (sequenceState.frameIndex !== frameIndex) {
                    sequenceState.frameIndex = frameIndex;
                    requestAnimationFrame(render);
                }

                // Handle Text Overlays
                if (scrollProgress > 0.02) scrollIndicator.classList.add('hide');
                else scrollIndicator.classList.remove('hide');

                if (scrollProgress >= 0 && scrollProgress < 0.25) {
                    text1.className = 'hero-text-overlay active';
                } else if (scrollProgress >= 0.25) {
                    text1.className = 'hero-text-overlay hidden-up';
                } else {
                    text1.className = 'hero-text-overlay hidden-down';
                }

                if (scrollProgress >= 0.35 && scrollProgress < 0.6) {
                    text2.className = 'hero-text-overlay active';
                } else if (scrollProgress >= 0.6) {
                    text2.className = 'hero-text-overlay hidden-up';
                } else {
                    text2.className = 'hero-text-overlay hidden-down';
                }

                if (scrollProgress >= 0.7 && scrollProgress < 0.95) {
                    text3.className = 'hero-text-overlay active';
                } else if (scrollProgress >= 0.95) {
                    text3.className = 'hero-text-overlay hidden-up';
                } else {
                    text3.className = 'hero-text-overlay hidden-down';
                }
            }
            
            // Impact section background parallax
            if (impactBg) {
                const impactRect = impactBg.getBoundingClientRect();
                if(impactRect.top < window.innerHeight && impactRect.bottom > 0) {
                    impactBg.style.transform = `translateY(${(window.innerHeight - impactRect.top) * 0.1}px)`;
                }
            }
        });
    }

    // --- 2. INTERSECTION OBSERVER FOR REVEAL ANIMATIONS ---
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target); 
            } else {
                // If we want them to hide when scrolling back up (Apple style)
                entry.target.classList.remove('reveal-visible');
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        el.classList.add('reveal-hidden');
        
        // Handle custom directions
        const dir = el.getAttribute('data-reveal');
        if (dir === 'left') {
            el.style.transform = 'translateX(-40px)';
        } else if (dir === 'right') {
            el.style.transform = 'translateX(40px)';
        }
        
        revealObserver.observe(el);
    });

    // --- 3. STICKY DETAIL SCROLL LOGIC ---
    const stickySection = document.querySelector('.sticky-detail-section');
    const stickyItems = document.querySelectorAll('.sticky-item');
    const stickyJersey = document.getElementById('sticky-jersey');

    if (stickySection && stickyItems.length > 0) {
        window.addEventListener('scroll', () => {
            const rect = stickySection.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height - window.innerHeight; // Scrollable distance
            
            if (sectionTop <= 0 && sectionTop >= -sectionHeight) {
                // We are inside the sticky section
                const scrollProgress = Math.abs(sectionTop) / sectionHeight;
                
                // Determine which item is active based on progress (0 to 1)
                const activeIndex = Math.min(
                    Math.floor(scrollProgress * stickyItems.length), 
                    stickyItems.length - 1
                );
                
                stickyItems.forEach((item, index) => {
                    if (index === activeIndex) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });

                // Animate the jersey based on scroll
                if(stickyJersey) {
                    const rotation = scrollProgress * 10; // Slight rotation
                    const scale = 1 + (scrollProgress * 0.1);
                    stickyJersey.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
                }
            }
        });
    }

    // --- 4. ANIMATED PRICE COUNTER ---
    const priceCounter = document.getElementById('price-counter');
    const priceSection = document.querySelector('.price-section');
    let counted = false;

    if (priceCounter && priceSection) {
        const priceObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                counted = true;
                animateValue(priceCounter, 0, 599, 1500);
            } else if (!entries[0].isIntersecting) {
                // Reset if they scroll away (optional)
                counted = false;
                priceCounter.textContent = '0';
            }
        }, { threshold: 0.5 });
        
        priceObserver.observe(priceSection);
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Easing out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = end; // Ensure final value is exact
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- 5. LIVE CUSTOMIZATION LOGIC ---
    const liveName = document.getElementById('live-name-input');
    const liveNumber = document.getElementById('live-number-input');
    const mockupName = document.getElementById('mockup-name');
    const mockupNumber = document.getElementById('mockup-number');
    const badgeToggle = document.getElementById('badge-toggle');
    const mockupBadge = document.getElementById('mockup-badge');

    if (liveName && mockupName) {
        liveName.addEventListener('input', (e) => {
            mockupName.textContent = e.target.value.toUpperCase() || 'NAME';
        });
    }

    if (liveNumber && mockupNumber) {
        liveNumber.addEventListener('input', (e) => {
            let val = e.target.value;
            if (val.length > 2) val = val.slice(0,2);
            e.target.value = val;
            mockupNumber.textContent = val || '00';
        });
    }

    if (badgeToggle && mockupBadge) {
        badgeToggle.addEventListener('change', (e) => {
            if(e.target.checked) {
                mockupBadge.classList.add('visible');
            } else {
                mockupBadge.classList.remove('visible');
            }
        });
    }
});
