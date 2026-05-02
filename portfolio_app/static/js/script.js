let scene, camera, renderer, heroObject, starField;

function initThreeJS() {
    const container = document.getElementById('threejs-container');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#050814', 0.035);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 6.4);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x050814, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x5ce3ff, 0.55);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 1.4, 15);
    pointLight.position.set(4, 2, 3);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x9b6cff, 0.9, 20);
    pointLight2.position.set(-3, -1.2, 2);
    scene.add(pointLight2);

    const geometry = new THREE.IcosahedronGeometry(1.6, 2);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00c6ff,
        emissive: 0x003760,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    heroObject = new THREE.Group();
    heroObject.add(mesh);

    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x22e5ff,
        wireframe: true,
        opacity: 0.55,
        transparent: true
    });
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    wireMesh.scale.set(1.08, 1.08, 1.08);
    heroObject.add(wireMesh);

    scene.add(heroObject);

    createStarField();
    animate();
}

function createStarField() {
    const starCount = 550;
    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 25;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0x4fc3ff,
        size: 0.12,
        transparent: true,
        opacity: 0.92
    });
    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

function animate() {
    requestAnimationFrame(animate);
    heroObject.rotation.y += 0.0045;
    heroObject.rotation.x += 0.0012;
    starField.rotation.y += 0.0004;
    renderer.render(scene, camera);
}

function typeWriter(text, element, speed = 70) {
    let i = 0;
    element.textContent = '';
    const interval = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        if (i === text.length) clearInterval(interval);
    }, speed);
}

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 150; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = `${1 + Math.random() * 3}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDuration = `${10 + Math.random() * 8}s`;
        particle.style.animationDelay = `${-Math.random() * 12}s`;
        particlesContainer.appendChild(particle);
    }
}

function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-copy', {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: 'power3.out'
    });

    gsap.from('#threejs-container', {
        opacity: 0,
        x: 40,
        duration: 1.3,
        ease: 'power3.out'
    });

    gsap.from('.hero-buttons .btn', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9,
        stagger: 0.15
    });

    gsap.utils.toArray('section').forEach(section => {
        gsap.from(section.querySelector('h2'), {
            opacity: 0,
            y: 40,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%'
            }
        });

        gsap.from(section.querySelectorAll('.flip-card, .skill-card, .project-card, .experience-card, .contact-panel, .contact-form'), {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%'
            }
        });
    });
}

async function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/api/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            form.reset();
            gsap.to('#contact-form', { y: -8, duration: 0.25, yoyo: true, repeat: 1 });
            alert('Message sent successfully!');
        } else {
            alert('Unable to send message. Please refresh and try again.');
        }
    } catch (error) {
        console.error('Contact submit error:', error);
        alert('Network error. Check your connection and try again.');
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getCSRFToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : getCookie('csrftoken');
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function handleMouseMove(e) {
    const hero = document.querySelector('.hero-visuals');
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = (e.clientY - rect.top) / rect.height * 2 - 1;
    if (heroObject) {
        gsap.to(heroObject.rotation, { x: y * 0.15, y: x * 0.35, duration: 0.6, ease: 'power2.out' });
    }
}

window.addEventListener('resize', () => {
    const container = document.getElementById('threejs-container');
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    createParticles();
    initGSAP();
    initSmoothScrolling();
    initMobileMenu();

    const typingText = document.getElementById('typing-text');
    // typeWriter('Hi, I\'m Anshika Joshi | Full Stack Developer', typingText);

    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', handleContactForm);

    const hero = document.querySelector('.hero-visuals');
    if (hero) hero.addEventListener('mousemove', handleMouseMove);
});

// Mobile menu toggle
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when link clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}