let menu = document.querySelector(".menu");
let close = document.querySelector(".close");
let ul = document.querySelector(".header .container .nav ul");
let next = document.querySelector(".next");
let prev = document.querySelector(".prev");
let numOne = document.querySelector(".num-one");
let numTwo = document.querySelector(".num-two");
let index = 0;
let installBtn = document.getElementById('installBtn');
let deferredPrompt;

// Add error handling and loading states
function showError(element, message) {
  element.innerHTML = `<div class="error-message" style="color: #ef4444; padding: 20px; text-align: center; font-weight: 600;">${message}</div>`;
}

function showLoading(element, message = 'جاري التحميل...') {
  element.innerHTML = `<div class="loading" style="padding: 40px; text-align: center; font-weight: 600;">${message}</div>`;
}

function hideLoading(element) {
  element.classList.remove('loading');
}

menu.addEventListener("click", () => {
  ul.classList.add("active");
});

close.addEventListener("click", () => {
  ul.classList.remove("active");
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// PWA Install functionality
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'flex';
  installBtn.classList.add('show');
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    installBtn.style.display = 'none';
  }
});

window.addEventListener('appinstalled', () => {
  installBtn.style.display = 'none';
  console.log('PWA was installed');
});

// Show loading initially
showLoading(document.querySelector(".hadis-content"), 'جاري تحميل الأحاديث...');

fetch("https://hadis-api-id.vercel.app/hadith/abu-dawud?page=2&limit=300")
  .then((result) => {
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return result.json();
  })
  .then((data) => {
    hideLoading();
    
    if (!data.items || data.items.length === 0) {
      throw new Error('لا توجد أحاديث متاحة');
    }
    
    const hadisData = data.items;
    document.querySelector(".hadis-content").innerHTML = hadisData[index].arab;
    numTwo.innerHTML = hadisData.length;

    next.addEventListener("click", () => {
      if (index < hadisData.length - 1) {
        index++;
        document.querySelector(".hadis-content").innerHTML = hadisData[index].arab;
        numOne.innerHTML = index + 1;
      }
      
      if (index === hadisData.length - 1) {
        next.classList.add("solid");
      }
      if (index > 0) {
        prev.classList.remove("solid");
      }
    });
    
    prev.addEventListener("click", () => {
      if (index > 0) {
        index--;
        document.querySelector(".hadis-content").innerHTML = hadisData[index].arab;
        numOne.innerHTML = index + 1;
      }
      
      if (index < hadisData.length - 1) {
        next.classList.remove("solid");
      }
      if (index === 0) {
        prev.classList.add("solid");
      }
    });
  })
  .catch((error) => {
    console.error('Error loading hadis:', error);
    showError(document.querySelector(".hadis-content"), 'حدث خطأ في تحميل الأحاديث. يرجى المحاولة مرة أخرى.');
  });

window.addEventListener('load', function() {
  prev.classList.add("solid");
});

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'hadis.html') {
    link.classList.add('active');
  }
});

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault();
    if (e.key === 'ArrowRight') {
      if (!next.classList.contains('solid')) {
        next.click();
      }
    } else {
      if (!prev.classList.contains('solid')) {
        prev.click();
      }
    }
  }
});

// Add touch gestures for mobile
let startX = 0;
let endX = 0;

document.addEventListener('touchstart', function(e) {
  startX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
  endX = e.changedTouches[0].screenX;
  handleGesture();
});

function handleGesture() {
  const threshold = 50;
  if (endX < startX - threshold) {
    // Swipe left - next
    if (!next.classList.contains('solid')) {
      next.click();
    }
  }
  if (endX > startX + threshold) {
    // Swipe right - previous
    if (!prev.classList.contains('solid')) {
      prev.click();
    }
  }
}
