// ==========================================================================
// Maleeha Nadeem — portfolio interactions
// Vanilla JS only. Every feature checks prefers-reduced-motion / feature
// support and no-ops gracefully when unsupported.
// ==========================================================================

(function () {
    "use strict";

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------------------------------------------------------------
       Auto-hide navbar on scroll down, reveal on scroll up
    --------------------------------------------------------------------- */
    (function navAutoHide() {
        var header = document.querySelector(".navbar");
        if (!header) return;

        var lastScroll = window.pageYOffset;
        var ticking = false;
        var DELTA = 8;

        function update() {
            var currentScroll = window.pageYOffset;
            var diff = currentScroll - lastScroll;

            if (currentScroll <= 0) {
                header.classList.remove("header-hidden");
            } else if (Math.abs(diff) > DELTA) {
                header.classList.toggle("header-hidden", diff > 0);
                lastScroll = currentScroll;
            }
            ticking = false;
        }

        window.addEventListener("scroll", function () {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ---------------------------------------------------------------------
       Close mobile drawer when a nav link is tapped
    --------------------------------------------------------------------- */
    (function drawerAutoClose() {
        var toggle = document.getElementById("drawerToggle");
        if (!toggle) return;
        document.querySelectorAll(".nav-menu a").forEach(function (link) {
            link.addEventListener("click", function () { toggle.checked = false; });
        });
    })();

    /* ---------------------------------------------------------------------
       Scroll reveal (IntersectionObserver)
    --------------------------------------------------------------------- */
    (function scrollReveal() {
        var targets = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-grid");
        if (!targets.length) return;

        if (reducedMotion || !("IntersectionObserver" in window)) {
            targets.forEach(function (el) { el.classList.add("in-view"); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

        targets.forEach(function (el) { io.observe(el); });
    })();

    /* ---------------------------------------------------------------------
       Hero mouse parallax (desktop only, subtle)
    --------------------------------------------------------------------- */
    (function heroParallax() {
        var visual = document.querySelector(".hero-visual");
        if (!visual || reducedMotion) return;
        if (window.matchMedia("(hover: none)").matches) return;

        var blobs = visual.querySelectorAll(".blob");
        var frame = visual.querySelector(".avatar-frame");

        window.addEventListener("mousemove", function (e) {
            var rect = visual.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX - cx) / rect.width;
            var dy = (e.clientY - cy) / rect.height;

            blobs.forEach(function (b, i) {
                var strength = i === 0 ? 14 : -18;
                b.style.transform = "translate(" + (dx * strength) + "px," + (dy * strength) + "px)";
            });
            if (frame) {
                frame.style.transform = "translate(" + (dx * 8) + "px," + (dy * 8) + "px)";
            }
        }, { passive: true });
    })();

    /* ---------------------------------------------------------------------
       Constellation background (canvas, lightweight)
    --------------------------------------------------------------------- */
    (function constellation() {
        var canvas = document.getElementById("constellation");
        if (!canvas || reducedMotion) return;

        var ctx = canvas.getContext("2d");
        var w, h, particles;
        var DPR = Math.min(window.devicePixelRatio || 1, 2);
        var running = true;

        function isSmall() { return window.innerWidth < 640; }

        function resize() {
            w = canvas.width = window.innerWidth * DPR;
            h = canvas.height = window.innerHeight * DPR;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            var count = isSmall() ? 22 : 46;
            particles = [];
            for (var i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.25 * DPR,
                    vy: (Math.random() - 0.5) * 0.25 * DPR,
                    r: (Math.random() * 1.4 + 0.6) * DPR
                });
            }
        }

        function step() {
            if (!running) return;
            ctx.clearRect(0, 0, w, h);
            var linkDist = 130 * DPR;

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(180, 170, 255, 0.55)";
                ctx.fill();

                for (var j = i + 1; j < particles.length; j++) {
                    var q = particles[j];
                    var dx = p.x - q.x, dy = p.y - q.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < linkDist) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = "rgba(140, 123, 255," + (0.12 * (1 - dist / linkDist)) + ")";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(step);
        }

        resize();
        step();

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        document.addEventListener("visibilitychange", function () {
            running = !document.hidden;
            if (running) step();
        });
    })();

    /* ---------------------------------------------------------------------
       Project filter buttons
    --------------------------------------------------------------------- */
    (function projectFilter() {
        var bar = document.querySelector(".filter-bar");
        if (!bar) return;
        var buttons = bar.querySelectorAll(".filter-btn");
        var cards = document.querySelectorAll("[data-cat]");

        bar.addEventListener("click", function (e) {
            var btn = e.target.closest(".filter-btn");
            if (!btn) return;
            buttons.forEach(function (b) { b.classList.remove("active"); });
            btn.classList.add("active");
            var filter = btn.getAttribute("data-filter");

            cards.forEach(function (card) {
                var cats = card.getAttribute("data-cat").split(" ");
                var show = filter === "all" || cats.indexOf(filter) !== -1;
                card.classList.toggle("is-hidden", !show);
            });
        });
    })();

    /* ---------------------------------------------------------------------
       Coverflow carousel (featured projects) — 3D center-focused carousel
       with arrows, dots, drag/swipe, keyboard nav and gentle autoplay.
    --------------------------------------------------------------------- */
    (function coverflow() {
        var groups = document.querySelectorAll("[data-coverflow]");
        if (!groups.length) return;

        groups.forEach(function (root) {
            var stage = root.querySelector(".coverflow-stage");
            var items = Array.prototype.slice.call(root.querySelectorAll(".coverflow-item"));
            if (!stage || !items.length) return;

            var prevBtn = root.querySelector(".coverflow-arrow.prev");
            var nextBtn = root.querySelector(".coverflow-arrow.next");
            var dotsWrap = root.querySelector(".coverflow-dots");
            var current = Math.floor((items.length - 1) / 2);
            var AUTOPLAY_MS = 5500;
            var autoplayTimer = null;
            var dots = [];

            if (dotsWrap) {
                items.forEach(function (_, i) {
                    var d = document.createElement("button");
                    d.type = "button";
                    d.className = "coverflow-dot";
                    d.setAttribute("aria-label", "Go to project " + (i + 1));
                    d.addEventListener("click", function () { goTo(i); restartAutoplay(); });
                    dotsWrap.appendChild(d);
                    dots.push(d);
                });
            }

            function isSmallScreen() { return window.innerWidth < 640; }

            function getStep() {
                var w = stage.clientWidth || window.innerWidth;
                return Math.max(120, Math.min(230, w * 0.26));
            }

            function render() {
                var step = getStep();
                var angle = isSmallScreen() ? 22 : 38;

                items.forEach(function (item, i) {
                    var offset = i - current;
                    var abs = Math.abs(offset);
                    var visible = abs <= 3;
                    var scale = Math.max(0.62, 1 - abs * 0.14);

                    item.style.zIndex = String(100 - abs * 10);
                    item.style.opacity = visible ? String(Math.max(0.18, 1 - abs * 0.28)) : "0";
                    item.style.pointerEvents = visible ? "auto" : "none";
                    item.style.transform = "translate(-50%,-50%) translateX(" + (offset * step) +
                        "px) rotateY(" + (offset * -angle) + "deg) scale(" + scale + ")";
                    item.classList.toggle("is-current", offset === 0);
                });

                dots.forEach(function (d, i) { d.classList.toggle("active", i === current); });
                if (prevBtn) prevBtn.disabled = current === 0;
                if (nextBtn) nextBtn.disabled = current === items.length - 1;
            }

            function goTo(i) {
                current = Math.max(0, Math.min(items.length - 1, i));
                render();
            }

            if (prevBtn) prevBtn.addEventListener("click", function () { goTo(current - 1); restartAutoplay(); });
            if (nextBtn) nextBtn.addEventListener("click", function () { goTo(current + 1); restartAutoplay(); });

            items.forEach(function (item, i) {
                item.addEventListener("click", function (e) {
                    if (i !== current) {
                        e.preventDefault();
                        goTo(i);
                        restartAutoplay();
                    }
                });
            });

            stage.setAttribute("tabindex", "0");
            stage.setAttribute("role", "region");
            stage.setAttribute("aria-roledescription", "carousel");
            stage.addEventListener("keydown", function (e) {
                if (e.key === "ArrowLeft") { goTo(current - 1); restartAutoplay(); }
                if (e.key === "ArrowRight") { goTo(current + 1); restartAutoplay(); }
            });

            var dragging = false, startX = 0, dragDx = 0, justDragged = false;

            stage.addEventListener("pointerdown", function (e) {
                dragging = true;
                dragDx = 0;
                startX = e.clientX;
                stopAutoplay();
            });

            window.addEventListener("pointermove", function (e) {
                if (!dragging) return;
                dragDx = e.clientX - startX;
            });

            window.addEventListener("pointerup", function () {
                if (!dragging) return;
                dragging = false;
                if (Math.abs(dragDx) > 40) {
                    justDragged = true;
                    goTo(dragDx < 0 ? current + 1 : current - 1);
                    setTimeout(function () { justDragged = false; }, 50);
                }
                restartAutoplay();
            });

            root.addEventListener("click", function (e) {
                if (justDragged) { e.preventDefault(); e.stopPropagation(); }
            }, true);

            function stopAutoplay() {
                if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
            }

            function restartAutoplay() {
                stopAutoplay();
                if (reducedMotion || items.length < 2) return;
                autoplayTimer = setInterval(function () {
                    goTo(current >= items.length - 1 ? 0 : current + 1);
                }, AUTOPLAY_MS);
            }

            root.addEventListener("mouseenter", stopAutoplay);
            root.addEventListener("mouseleave", restartAutoplay);
            root.addEventListener("focusin", stopAutoplay);
            root.addEventListener("focusout", restartAutoplay);

            window.addEventListener("resize", render);

            render();
            restartAutoplay();
        });
    })();

    /* ---------------------------------------------------------------------
       Contact form — client-side only (no backend). Validates, then opens
       the visitor's email client with a prefilled message so submissions
       actually reach the inbox.
    --------------------------------------------------------------------- */
    (function contactForm() {
        var form = document.querySelector(".contact-form");
        if (!form) return;
        var status = form.querySelector(".form-status");
        var destination = "maleehanadeem777@gmail.com";

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var data = {};
            form.querySelectorAll("input, textarea").forEach(function (field) {
                var key = field.placeholder || field.name || "field";
                data[key] = field.value;
            });

            var subject = data["Subject"] ? data["Subject"] : "Portfolio contact from " + (data["Full Name"] || data["Your Full Name"] || "");
            var bodyLines = [];
            Object.keys(data).forEach(function (key) {
                if (key !== "Subject") bodyLines.push(key + ": " + data[key]);
            });

            var mailto = "mailto:" + destination +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(bodyLines.join("\n"));

            window.location.href = mailto;

            if (status) {
                status.textContent = "Opening your email app with this message pre-filled — hit send there to reach me.";
                status.classList.add("show");
            }
            form.reset();
        });
    })();

    /* ---------------------------------------------------------------------
       Back to top button
    --------------------------------------------------------------------- */
    (function backToTop() {
        var btn = document.getElementById("backToTop");
        if (!btn) return;
        window.addEventListener("scroll", function () {
            btn.style.display = window.pageYOffset > 500 ? "flex" : "none";
        }, { passive: true });
        btn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        });
    })();

    /* ---------------------------------------------------------------------
       Footer year
    --------------------------------------------------------------------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

})();
