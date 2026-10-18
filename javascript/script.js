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
        // 5. Framer-Inspired Interactive Swatch Accordion
        // ---------------------------------------------------------------------
        const swatchAccordion = document.getElementById('curriculumSwatchAccordion');
        const swatchTabs = Array.from(document.querySelectorAll('.swatch-tab'));

        if (swatchAccordion) {
            const panels = Array.from(swatchAccordion.querySelectorAll('.swatch-panel'));

            const setActiveLevel = (targetIndex, shouldScroll = false) => {
                if (targetIndex < 0 || targetIndex >= panels.length) return;

                panels.forEach((panel, i) => {
                    const isActive = i === targetIndex;
                    panel.classList.toggle('is-active', isActive);
                    panel.setAttribute('aria-expanded', String(isActive));
                });

                swatchTabs.forEach((tab, i) => {
                    const isActive = i === targetIndex;
                    tab.classList.toggle('active', isActive);
                    tab.setAttribute('aria-selected', String(isActive));
                });

                if (shouldScroll && window.innerWidth <= 860) {
                    const activePanel = panels[targetIndex];
                    if (activePanel) {
                        activePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            };

            // Panel strip / header clicks
            panels.forEach((panel, i) => {
                const strip = panel.querySelector('.swatch-strip');

                const handlePanelActivation = (e) => {
                    // Do not interfere if user clicks an anchor / button inside content
                    if (e.target.closest('a') || e.target.closest('button')) {
                        if (!e.target.closest('.swatch-strip') && !e.target.closest('.swatch-toggle-btn')) {
                            return;
                        }
                    }

                    const isCurrentlyActive = panel.classList.contains('is-active');

                    // On mobile, tapping header of already active panel toggles it
                    if (window.innerWidth <= 860 && isCurrentlyActive && e.target.closest('.swatch-strip')) {
                        panel.classList.remove('is-active');
                        panel.setAttribute('aria-expanded', 'false');
                        swatchTabs.forEach((tab) => {
                            tab.classList.remove('active');
                            tab.setAttribute('aria-selected', 'false');
                        });
                        return;
                    }

                    if (!isCurrentlyActive) {
                        setActiveLevel(i, window.innerWidth <= 860);
                    }
                };

                if (strip) {
                    strip.addEventListener('click', handlePanelActivation);

                    // Accessible keyboard navigation
                    strip.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handlePanelActivation(e);
                        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                            e.preventDefault();
                            const nextIdx = (i + 1) % panels.length;
                            setActiveLevel(nextIdx, window.innerWidth <= 860);
                            panels[nextIdx]?.querySelector('.swatch-strip')?.focus();
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            const prevIdx = (i - 1 + panels.length) % panels.length;
                            setActiveLevel(prevIdx, window.innerWidth <= 860);
                            panels[prevIdx]?.querySelector('.swatch-strip')?.focus();
                        }
                    });
                }

                // If user clicks anywhere on a collapsed panel on desktop, expand it
                panel.addEventListener('click', (e) => {
                    if (!panel.classList.contains('is-active')) {
                        setActiveLevel(i, false);
                    }
                });
            });

            // Quick Filter Tabs (A1, A2, B1, B2)
            swatchTabs.forEach((tab) => {
                tab.addEventListener('click', () => {
                    const targetIdx = parseInt(tab.getAttribute('data-target'), 10);
                    if (!isNaN(targetIdx)) {
                        setActiveLevel(targetIdx, true);
                    }
                });
            });
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

                const name = nameInput ? nameInput.value.trim() : '';
                const phone = phoneInput ? phoneInput.value.trim() : '';

                const message = `Halo, saya ${name}\nNomor WA: ${phone}\nSaya ingin mendaftar bimbingan belajar bahasa Inggris.`;
                const waUrl = `https://wa.me/6282153939543?text=${encodeURIComponent(message)}`;
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
