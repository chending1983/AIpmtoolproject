// Enhanced Pages JavaScript - Jingtuo Alumina Website
// 统一的子页面交互效果

document.addEventListener('DOMContentLoaded', function() {
    // 1. Header滚动效果
    initHeaderScroll();
    
    // 2. 滚动显示动画
    initScrollReveal();
    
    // 3. 平滑滚动
    initSmoothScroll();
    
    // 4. 导航高亮
    initActiveNav();
});

// Header滚动效果
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    const scrollThreshold = 50;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // 添加/移除scrolled类
        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// 滚动显示动画
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal, [data-reveal]');
    
    if (revealElements.length === 0) return;
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 导航高亮
function initActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath) {
            // 移除所有active类
            link.classList.remove('active');
            
            // 检查是否匹配当前页面
            if (currentPath.includes(linkPath.replace('./', '').replace('.html', '')) ||
                (currentPath.endsWith('/') && linkPath.includes('index'))) {
                link.classList.add('active');
            }
        }
    });
}

// 按钮点击波纹效果
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// 添加波纹动画样式
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 为所有按钮添加波纹效果
document.querySelectorAll('.btn, .btn-primary-enhanced, .btn-secondary-enhanced').forEach(button => {
    button.addEventListener('click', function(e) {
        createRipple(e, this);
    });
});
