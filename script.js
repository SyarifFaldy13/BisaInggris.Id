<script>
/**
 * BIsaInggris.Id - Vanilla JavaScript untuk Website Les Privat Bahasa Inggris
 * Fitur: 
 * 1. Hover effect pada box neon cyan
 * 2. Form kontak → WhatsApp otomatis
 * 3. Animasi testimoni bergerak kiri-ke-kanan (infinite, smooth)
 */

// 1. TAMBAHKAN EFEK HOVER PADA SEMUA BOX NEON CYAN
document.addEventListener('DOMContentLoaded', () => {
    const neonBoxes = document.querySelectorAll('.neon-box, .program-card, .contact-box, .about-box, .testimonial-card');
    
    neonBoxes.forEach(box => {
        // Tambahkan event saat mouse masuk
        box.addEventListener('mouseenter', () => {
            box.style.boxShadow = '0 0 40px rgba(62, 254, 255, 0.8)';
            box.style.transform = 'scale(1.02)';
            box.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
        });

        // Kembalikan saat mouse keluar
        box.addEventListener('mouseleave', () => {
            box.style.boxShadow = '0 0 30px rgba(62, 254, 255, 0.3)';
            box.style.transform = 'scale(1)';
        });
    });

    // 2. FORM KONTAK → WHATSAPP OTOMATIS
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Ambil nilai form
            const name = document.getElementById('name')?.value.trim();
            const phone = document.getElementById('phone')?.value.trim();
            const program = document.getElementById('programSelect')?.value;

            // Validasi
            if (!name || !phone || !program) {
                alert('⚠️ Semua field wajib diisi!');
                return;
            }

            // Format pesan
            const message = `Halo BisaInggris!%0A%0A` +
                            `Nama: ${name}%0A` +
                            `No. WhatsApp: ${phone}%0A` +
                            `Level yang diminati: ${program}%0A%0A` +
                            `Saya ingin mendaftar les privat.`;

            // Buka WhatsApp
            const whatsappUrl = `https://wa.me/6289516291556?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // 3. ANIMASI TESTIMONI BERGERAK (INFINITE SCROLL)
    const testimonialContainer = document.querySelector('.testimonial-box');
    if (testimonialContainer) {
        const originalContent = testimonialContainer.innerHTML;
        const width = testimonialContainer.scrollWidth;
        const viewportWidth = window.innerWidth;

        // Duplikasi konten agar animasi seamless
        testimonialContainer.innerHTML += originalContent + originalContent;

        // Atur animasi via CSS jika belum ada
        const style = document.createElement('style');
        style.textContent = `
            .testimonial-box {
                display: flex !important;
                flex-wrap: nowrap !important;
                overflow: hidden !important;
                gap: 24px !important;
                animation: scrollTestimonials 30s linear infinite;
            }
            .testimonial-box:hover {
                animation-play-state: paused;
            }
            @keyframes scrollTestimonials {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-${width}px)); }
            }
            .testimonial-card {
                flex: 0 0 auto !important;
                min-width: 280px !important;
            }
        `;
        document.head.appendChild(style);
    }
});
</script>

