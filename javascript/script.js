/**
 * BIsaInggris.Id - Unified High-Performance Interactive Script
 * - Zero layout thrashing
 * - Viewport-aware animations (0% idle CPU/battery usage)
 * - Accessible navigation and form controls
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        // Enable progressive section reveals
        document.documentElement.classList.add('js-reveal');

        // ---------------------------------------------------------------------
        // 1. Mobile Menu & Cyberpunk Glow Effect
        // ---------------------------------------------------------------------
        const menuBtn = document.getElementById('menuBtn');
        const navMenu = document.getElementById('navMenu');

        if (menuBtn && navMenu) {
            const toggleMenu = (open) => {
                const shouldOpen = typeof open === 'boolean' ? open : !navMenu.classList.contains('show');
                navMenu.classList.toggle('show', shouldOpen);
                navMenu.classList.toggle('nav-glow-effect', shouldOpen);
                menuBtn.setAttribute('aria-expanded', String(shouldOpen));
            };

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });

            // Close on link click
            navMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => toggleMenu(false));
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuBtn.contains(e.target) && navMenu.classList.contains('show')) {
                    toggleMenu(false);
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navMenu.classList.contains('show')) {
                    toggleMenu(false);
                }
            });
        }

        // ---------------------------------------------------------------------
        // 2. Performant Section Reveal (IntersectionObserver)
        // ---------------------------------------------------------------------
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const sections = document.querySelectorAll('section');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            sections.forEach((s) => s.classList.add('section-visible'));
        } else {
            const sectionObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            });

            sections.forEach((s) => sectionObserver.observe(s));
        }

        // ---------------------------------------------------------------------
        // 3. Active Nav Link Highlighting (Scroll Spy via IntersectionObserver)
        // ---------------------------------------------------------------------
        const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
        if (navLinks.length && 'IntersectionObserver' in window) {
            const linkMap = new Map();
            navLinks.forEach((link) => {
                const targetId = link.getAttribute('href').slice(1);
                const targetElem = document.getElementById(targetId);
                if (targetElem) linkMap.set(targetElem, link);
            });

            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const link = linkMap.get(entry.target);
                    if (link) {
                        if (entry.isIntersecting) {
                            navLinks.forEach((l) => l.classList.remove('is-active'));
                            link.classList.add('is-active');
                        }
                    }
                });
            }, {
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0
            });

            linkMap.forEach((_, sectionElem) => navObserver.observe(sectionElem));
        }

        // ---------------------------------------------------------------------
        // 4. Scroll Reveal Text (Word-by-Word Progressive Illumination)
        // ---------------------------------------------------------------------
        if (!prefersReducedMotion) {
            const wrapWordsInNode = (node, wordList) => {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const tokens = text.split(/(\s+)/);
                    if (tokens.length <= 1 && text.trim() === '') return;

                    const fragment = document.createDocumentFragment();
                    tokens.forEach((token) => {
                        if (/^\s+$/.test(token)) {
                            fragment.appendChild(document.createTextNode(token));
                        } else if (token.length > 0) {
                            const span = document.createElement('span');
                            span.className = 'reveal-word';
                            span.textContent = token;
                            fragment.appendChild(span);
                            wordList.push(span);
                        }
                    });
                    node.parentNode.replaceChild(fragment, node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList.contains('reveal-word')) return;
                    Array.from(node.childNodes).forEach((child) => wrapWordsInNode(child, wordList));
                }
            };

            const revealItems = [];
            document.querySelectorAll('[data-scroll-reveal="words"]').forEach((el) => {
                const wordSpans = [];
                wrapWordsInNode(el, wordSpans);
                if (wordSpans.length > 0) {
                    revealItems.push({
                        el,
                        words: wordSpans,
                        isNearViewport: false
                    });
                }
            });

            if (revealItems.length > 0) {
                const updateItem = (item) => {
                    const rect = item.el.getBoundingClientRect();
                    const windowH = window.innerHeight;

                    // Progress mapping:
                    // Starts illuminating when top enters 92% of screen height
                    // Fully illuminated by the time top reaches 48% of screen height
                    const startY = windowH * 0.92;
                    const endY = windowH * 0.48;
                    const progress = Math.max(0, Math.min(1, (startY - rect.top) / (startY - endY)));

                    const count = item.words.length;
                    const revealedCount = Math.floor(progress * count);

                    for (let i = 0; i < count; i++) {
                        if (i < revealedCount) {
                            item.words[i].classList.add('is-revealed');
                        } else {
                            item.words[i].classList.remove('is-revealed');
                        }
                    }
                };

                // Track intersection to completely eliminate CPU overhead for offscreen elements
                if ('IntersectionObserver' in window) {
                    const revealObserver = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            const match = revealItems.find((item) => item.el === entry.target);
                            if (match) {
                                match.isNearViewport = entry.isIntersecting;
                                if (entry.isIntersecting) {
                                    updateItem(match);
                                }
                            }
                        });
                    }, {
                        rootMargin: '20% 0px 20% 0px'
                    });

                    revealItems.forEach((item) => revealObserver.observe(item.el));
                } else {
                    revealItems.forEach((item) => { item.isNearViewport = true; });
                }

                let scrollScheduled = false;
                const onScrollReveal = () => {
                    if (!scrollScheduled) {
                        scrollScheduled = true;
                        requestAnimationFrame(() => {
                            revealItems.forEach((item) => {
                                if (item.isNearViewport) {
                                    updateItem(item);
                                }
                            });
                            scrollScheduled = false;
                        });
                    }
                };

                window.addEventListener('scroll', onScrollReveal, { passive: true });
                window.addEventListener('resize', onScrollReveal, { passive: true });
                // Initial update
                onScrollReveal();
            }
        }

        // ---------------------------------------------------------------------
        // 5. Interactive Single-Level Curriculum Slider (Seamless Infinite Wrap)
        // ---------------------------------------------------------------------
        const curriculumTrack = document.getElementById('curriculumTrack');
        const currPrevBtn = document.getElementById('currPrevBtn');
        const currNextBtn = document.getElementById('currNextBtn');
        const currTabs = Array.from(document.querySelectorAll('.curriculum-tab'));
        const currDots = Array.from(document.querySelectorAll('.curr-dot'));

        if (curriculumTrack) {
            const originalSlides = Array.from(curriculumTrack.children);
            const totalSlides = originalSlides.length; // 4 levels: A1, A2, B1, B2

            // Build infinite wrap clones: [B2_clone] [A1] [A2] [B1] [B2] [A1_clone]
            const firstClone = originalSlides[0].cloneNode(true);
            const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
            firstClone.setAttribute('aria-hidden', 'true');
            lastClone.setAttribute('aria-hidden', 'true');
            firstClone.removeAttribute('id');
            lastClone.removeAttribute('id');

            curriculumTrack.appendChild(firstClone);
            curriculumTrack.insertBefore(lastClone, originalSlides[0]);

            let currentIndex = 1; // Start at first original slide (A1)
            let isTransitioning = false;
            const transitionStyle = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

            // Position initially at A1 without animation
            curriculumTrack.style.transition = 'none';
            curriculumTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            void curriculumTrack.offsetWidth;
            curriculumTrack.style.transition = transitionStyle;

            const updateIndicators = (logicalIdx) => {
                currTabs.forEach((tab, i) => {
                    const isActive = i === logicalIdx;
                    tab.classList.toggle('active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                });

                currDots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === logicalIdx);
                });
            };

            const moveToSlide = (targetIndex, animate = true) => {
                if (isTransitioning) return;
                isTransitioning = true;
                currentIndex = targetIndex;

                if (prefersReducedMotion || !animate) {
                    curriculumTrack.style.transition = 'none';
                } else {
                    curriculumTrack.style.transition = transitionStyle;
                }

                curriculumTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

                // Calculate logical index for indicators (0: A1, 1: A2, 2: B1, 3: B2)
                let logicalIdx = (currentIndex - 1) % totalSlides;
                if (logicalIdx < 0) logicalIdx += totalSlides;
                updateIndicators(logicalIdx);

                if (prefersReducedMotion || !animate) {
                    isTransitioning = false;
                }
            };

            // Seamless teleport when transitioning past boundaries
            curriculumTrack.addEventListener('transitionend', (e) => {
                if (e.target !== curriculumTrack || e.propertyName !== 'transform') return;
                isTransitioning = false;

                // Slid forward past B2 into A1_clone (index 5) -> instantly snap to original A1 (index 1)
                if (currentIndex === totalSlides + 1) {
                    curriculumTrack.style.transition = 'none';
                    currentIndex = 1;
                    curriculumTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
                    void curriculumTrack.offsetWidth;
                    curriculumTrack.style.transition = transitionStyle;
                }
                // Slid backward past A1 into B2_clone (index 0) -> instantly snap to original B2 (index 4)
                else if (currentIndex === 0) {
                    curriculumTrack.style.transition = 'none';
                    currentIndex = totalSlides;
                    curriculumTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
                    void curriculumTrack.offsetWidth;
                    curriculumTrack.style.transition = transitionStyle;
                }
            });

            // Right arrow button (slide to next level naturally)
            if (currNextBtn) {
                currNextBtn.addEventListener('click', () => {
                    moveToSlide(currentIndex + 1);
                });
            }

            // Left arrow button (slide to previous level naturally)
            if (currPrevBtn) {
                currPrevBtn.addEventListener('click', () => {
                    moveToSlide(currentIndex - 1);
                });
            }

            // Tab button clicks (A1, A2, B1, B2)
            currTabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    if (isTransitioning) return;
                    const targetLogical = parseInt(tab.getAttribute('data-index'), 10);
                    if (isNaN(targetLogical)) return;

                    // If at B2 and user clicks A1, slide forward to A1_clone for natural rightward slide
                    if (currentIndex === totalSlides && targetLogical === 0) {
                        moveToSlide(totalSlides + 1);
                    }
                    // If at A1 and user clicks B2, slide backward to B2_clone for natural leftward slide
                    else if (currentIndex === 1 && targetLogical === totalSlides - 1) {
                        moveToSlide(0);
                    } else {
                        moveToSlide(targetLogical + 1);
                    }
                });
            });

            // Indicator dot clicks
            currDots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    if (isTransitioning) return;
                    const targetLogical = parseInt(dot.getAttribute('data-index'), 10);
                    if (isNaN(targetLogical)) return;

                    if (currentIndex === totalSlides && targetLogical === 0) {
                        moveToSlide(totalSlides + 1);
                    } else if (currentIndex === 1 && targetLogical === totalSlides - 1) {
                        moveToSlide(0);
                    } else {
                        moveToSlide(targetLogical + 1);
                    }
                });
            });

            // Touch Swipe Support for Mobile
            let touchStartX = 0;
            let touchStartY = 0;
            curriculumTrack.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            curriculumTrack.addEventListener('touchend', (e) => {
                if (isTransitioning) return;
                const diffX = e.changedTouches[0].clientX - touchStartX;
                const diffY = e.changedTouches[0].clientY - touchStartY;
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX < 0) {
                        moveToSlide(currentIndex + 1);
                    } else {
                        moveToSlide(currentIndex - 1);
                    }
                }
            }, { passive: true });
        }

        // ---------------------------------------------------------------------
        // 6. Viewport-Aware Infinite Testimonial Slider
        // ---------------------------------------------------------------------
        const testimonialSection = document.getElementById('testimoni');
        const track = testimonialSection ? testimonialSection.querySelector('.testimonial-track') : null;

        if (testimonialSection && track && !prefersReducedMotion) {
            let speed = 90; // Pixels per second
            let pos = 0;
            let singleWidth = 0;
            let lastTime = 0;
            let animationFrameId = null;
            let isPaused = false;
            let isVisible = false;

            const calculateBounds = () => {
                // Total scrollWidth / 2 gives width of one complete set of cards
                singleWidth = track.scrollWidth / 2 || 0;
                if (pos === 0 && singleWidth > 0) {
                    pos = -singleWidth;
                    track.style.transform = `translateX(${pos}px)`;
                }
            };

            const wrapPosition = (p) => {
                if (!singleWidth) return p;
                while (p >= 0) p -= singleWidth;
                while (p < -singleWidth) p += singleWidth;
                return p;
            };

            const tick = (now) => {
                if (!isVisible) {
                    animationFrameId = null;
                    return;
                }

                if (!lastTime) lastTime = now;
                const dt = Math.min((now - lastTime) / 1000, 0.1); // Clamp to prevent jump after backgrounding
                lastTime = now;

                if (!isPaused && singleWidth > 0) {
                    pos += speed * dt;
                    pos = wrapPosition(pos);
                    track.style.transform = `translateX(${pos}px)`;
                }

                animationFrameId = requestAnimationFrame(tick);
            };

            const startLoop = () => {
                if (!animationFrameId && isVisible) {
                    lastTime = 0;
                    animationFrameId = requestAnimationFrame(tick);
                }
            };

            const stopLoop = () => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            };

            // Pause on hover or focus for reading accessibility
            track.addEventListener('mouseenter', () => { isPaused = true; });
            track.addEventListener('mouseleave', () => { isPaused = false; });
            track.addEventListener('focusin', () => { isPaused = true; });
            track.addEventListener('focusout', () => { isPaused = false; });

            // Prev / Next button controls
            const prevBtn = testimonialSection.querySelector('.testimonial-nav-prev');
            const nextBtn = testimonialSection.querySelector('.testimonial-nav-next');
            const step = () => (singleWidth > 0 ? singleWidth / 6 : 340);

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    pos -= step();
                    pos = wrapPosition(pos);
                    track.style.transform = `translateX(${pos}px)`;
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    pos += step();
                    pos = wrapPosition(pos);
                    track.style.transform = `translateX(${pos}px)`;
                });
            }

            // Only run ticker when testimonials are visible in viewport (0% battery drain off-screen)
            if ('IntersectionObserver' in window) {
                const sliderObserver = new IntersectionObserver((entries) => {
                    entries.forEach((entry) => {
                        isVisible = entry.isIntersecting;
                        if (isVisible) {
                            calculateBounds();
                            startLoop();
                        } else {
                            stopLoop();
                        }
                    });
                }, { threshold: 0.05 });

                sliderObserver.observe(testimonialSection);
            } else {
                isVisible = true;
                startLoop();
            }

            window.addEventListener('resize', calculateBounds, { passive: true });
            window.addEventListener('load', calculateBounds);
            calculateBounds();
        }

        // ---------------------------------------------------------------------
        // 7. WhatsApp Contact Form Redirect
        // ---------------------------------------------------------------------
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = contactForm.querySelector('#name');
                const phoneInput = contactForm.querySelector('#phone');
                const programInput = contactForm.querySelector('#programSelect');

                const name = nameInput ? nameInput.value.trim() : '';
                const phone = phoneInput ? phoneInput.value.trim() : '';
                const program = programInput ? programInput.value.trim() : '';

                const message = `Halo, saya ${name}\nProgram yang dipilih: ${program}\nNomor WA: ${phone}`;
                const waUrl = `https://wa.me/6289516291556?text=${encodeURIComponent(message)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
            });
        }

        // ---------------------------------------------------------------------
        // 8. Interactive Dot Matrix Background (Whole Website)
        // ---------------------------------------------------------------------
        const canvas = document.getElementById('dots-bg');
        if (canvas) {
            const ctx = canvas.getContext('2d', { alpha: true });
            let width = 0;
            let height = 0;
            let dpr = 1;
            const spacing = 32; // Distance between dots in px
            const baseRadius = 1.2;
            const interactionRadius = 150;
            const interactionRadiusSq = interactionRadius * interactionRadius;

            const mouse = {
                x: -9999,
                y: -9999,
                targetX: -9999,
                targetY: -9999,
                active: false
            };

            const resizeCanvas = () => {
                dpr = Math.min(window.devicePixelRatio || 1, 2);
                width = window.innerWidth;
                height = window.innerHeight;
                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                if (prefersReducedMotion) {
                    drawStaticDots();
                }
            };

            const drawStaticDots = () => {
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.beginPath();
                for (let x = spacing / 2; x < width; x += spacing) {
                    for (let y = spacing / 2; y < height; y += spacing) {
                        ctx.moveTo(x + baseRadius, y);
                        ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
                    }
                }
                ctx.fill();
            };

            if (prefersReducedMotion) {
                resizeCanvas();
                window.addEventListener('resize', resizeCanvas, { passive: true });
            } else {
                let animationId = null;
                let isTabActive = !document.hidden;

                // Track mouse position smoothly across the window
                window.addEventListener('pointermove', (e) => {
                    mouse.targetX = e.clientX;
                    mouse.targetY = e.clientY;
                    mouse.active = true;
                }, { passive: true });

                window.addEventListener('pointerleave', () => {
                    mouse.active = false;
                });

                document.addEventListener('visibilitychange', () => {
                    isTabActive = !document.hidden;
                    if (isTabActive) {
                        renderLoop();
                    } else if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                });

                const renderLoop = () => {
                    if (!isTabActive) return;

                    // Smooth mouse interpolation (lerp)
                    if (mouse.active) {
                        mouse.x += (mouse.targetX - mouse.x) * 0.15;
                        mouse.y += (mouse.targetY - mouse.y) * 0.15;
                    } else {
                        mouse.x = -9999;
                        mouse.y = -9999;
                    }

                    ctx.clearRect(0, 0, width, height);

                    // Batch 1: Standard ambient background dots (single GPU draw call)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
                    ctx.beginPath();

                    // Store active dots that need custom glowing highlight
                    const activeDots = [];

                    for (let x = spacing / 2; x < width; x += spacing) {
                        for (let y = spacing / 2; y < height; y += spacing) {
                            const dx = x - mouse.x;
                            const dy = y - mouse.y;
                            const distSq = dx * dx + dy * dy;

                            if (mouse.active && distSq < interactionRadiusSq) {
                                activeDots.push({ x, y, distSq, dx, dy });
                            } else {
                                ctx.moveTo(x + baseRadius, y);
                                ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
                            }
                        }
                    }
                    ctx.fill();

                    // Batch 2: Render interactive glowing dots near the cursor
                    for (let i = 0; i < activeDots.length; i++) {
                        const dot = activeDots[i];
                        const dist = Math.sqrt(dot.distSq);
                        const factor = 1 - dist / interactionRadius; // 1 at cursor center, 0 at edge

                        // Gentle magnetic repulsion/pull effect
                        const offsetX = (dot.dx / (dist || 1)) * factor * 3;
                        const offsetY = (dot.dy / (dist || 1)) * factor * 3;
                        const posX = dot.x + offsetX;
                        const posY = dot.y + offsetY;

                        const radius = baseRadius + factor * 2.2;
                        const alpha = 0.12 + factor * 0.55;

                        ctx.fillStyle = `rgba(0, 0, 0, ${alpha.toFixed(3)})`;
                        ctx.beginPath();
                        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    animationId = requestAnimationFrame(renderLoop);
                };

                resizeCanvas();
                window.addEventListener('resize', resizeCanvas, { passive: true });
                renderLoop();
            }
        }
    });
})();
