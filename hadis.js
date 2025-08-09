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

// Add loading state
function showLoading() {
  document.querySelector(".hadis-content").classList.add('loading');
  document.querySelector(".hadis-content").innerHTML = 'جاري تحميل الأحاديث...';
}

function hideLoading() {
  document.querySelector(".hadis-content").classList.remove('loading');
}

// Show loading initially
showLoading();

fetch("https://hadis-api-id.vercel.app/hadith/abu-dawud?page=2&limit=300")
  .then((result) => {
    let data = result.json();
    return data;
  })
  .then((data) => {
    hideLoading();
    document.querySelector(".hadis-content").innerHTML = data.items[index].arab;
    numTwo.innerHTML = data.items.length;

    next.addEventListener("click", () => {
      document.querySelector(".hadis-content").innerHTML =
        data.items[++index].arab;
      numOne.innerHTML++;
      if (index == data.items.length - 1) {
        next.classList.add("solid");
      }
      if (index > 0) {
        prev.classList.remove("solid")
      }
    });
    prev.addEventListener("click", () => {
      document.querySelector(".hadis-content").innerHTML =
        data.items[--index].arab;
      --numOne.innerHTML;
      if (index < data.items.length - 1) {
        next.classList.remove("solid");
      }
      if (index == 0) {
        prev.classList.add("solid")
      }
    });
  });
  .catch((error) => {
    console.error('Error loading hadis:', error);
    document.querySelector(".hadis-content").innerHTML = 'حدث خطأ في تحميل الأحاديث';
  });


window.onload = function() {
  prev.classList.add("solid");
}

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'hadis.html') {
    link.classList.add('active');
  }
});