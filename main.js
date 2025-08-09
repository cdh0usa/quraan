let menu = document.querySelector(".menu");
let close = document.querySelector(".close");
let ul = document.querySelector(".header .container .nav ul");
let upBtn = document.querySelector(".up");
let input = document.querySelector("input");
let search = document.querySelector(".search");
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

window.onscroll = function () {
  if (scrollY >= 200) {
    upBtn.classList.add("right");
  } else {
    upBtn.classList.remove("right");
  }
};

upBtn.addEventListener("click", () => {
  scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

// Prayer time notifications
function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }
}

// Request notification permission on page load
window.addEventListener('load', () => {
  setTimeout(requestNotificationPermission, 3000);
});

// Enhanced search functionality with loading state
search.addEventListener("click", () => {
  if (input.value === "") {
    showError(document.querySelector(".result"), "ادخل اسم المدينة");
    clearPrayerTimes();
    setTimeout(() => {
      document.querySelector(".result").innerHTML = ``;
    }, 1500);
  } else {
    showLoading(document.querySelector(".result"), 'جاري البحث...');
    
    document.querySelector(".namecity").innerHTML = input.value;
    
    fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(input.value)}`)
      .then((result) => {
        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }
        return result.json();
      })
      .then((data) => {
        if (!data.data || !data.data.timings) {
          throw new Error('لا توجد بيانات متاحة');
        }
        
        document.querySelector(".result").innerHTML = ``;
        
        const timings = data.data.timings;
        document.querySelector(".fagr").innerHTML = timings.Fajr || '--:--';
        document.querySelector(".sunrise").innerHTML = timings.Sunrise || '--:--';
        document.querySelector(".dohr").innerHTML = timings.Dhuhr || '--:--';
        document.querySelector(".asr").innerHTML = timings.Asr || '--:--';
        document.querySelector(".maghreb").innerHTML = timings.Maghrib || '--:--';
        document.querySelector(".isha").innerHTML = timings.Isha || '--:--';
        
        // Schedule prayer notifications
        schedulePrayerNotifications(timings);
      })
      .catch((error) => {
        console.error('Error loading prayer times:', error);
        showError(document.querySelector(".result"), 'المدينة غير موجودة أو حدث خطأ. حاول مرة أخرى');
        document.querySelector(".namecity").innerHTML = "";
        clearPrayerTimes();
        setTimeout(() => {
          document.querySelector(".result").innerHTML = ``;
        }, 1500);
      });
    input.value = "";
  }
});

function clearPrayerTimes() {
  document.querySelector(".fagr").innerHTML = "";
  document.querySelector(".sunrise").innerHTML = "";
  document.querySelector(".dohr").innerHTML = "";
  document.querySelector(".asr").innerHTML = "";
  document.querySelector(".maghreb").innerHTML = "";
  document.querySelector(".isha").innerHTML = "";
}

// Schedule prayer notifications
function schedulePrayerNotifications(timings) {
  if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
    const prayers = [
      { name: 'الفجر', time: timings.Fajr },
      { name: 'الظهر', time: timings.Dhuhr },
      { name: 'العصر', time: timings.Asr },
      { name: 'المغرب', time: timings.Maghrib },
      { name: 'العشاء', time: timings.Isha }
    ];
    
    prayers.forEach(prayer => {
      const [hours, minutes] = prayer.time.split(':');
      if (!hours || !minutes) {
        console.warn(`Invalid prayer time format: ${prayer.time}`);
        return;
      }
      
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const now = new Date();
      const timeUntilPrayer = prayerTime.getTime() - now.getTime();
      
      if (timeUntilPrayer > 0) {
        // Clear any existing timeout for this prayer
        if (window.prayerTimeouts && window.prayerTimeouts[prayer.name]) {
          clearTimeout(window.prayerTimeouts[prayer.name]);
        }
        setTimeout(() => {
          navigator.serviceWorker.ready.then(registration => {
            registration.active.postMessage({
              type: 'PRAYER_NOTIFICATION',
              prayer: prayer.name
            });
          });
        }, timeUntilPrayer);
      }
    });
  }
}

document.addEventListener('keyup', function(e) {
  if (e.key == "Enter") {
    search.click();
  }
});

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add active class to current navigation item
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// Add input validation
input.addEventListener('input', function(e) {
  const value = e.target.value.trim();
  if (value.length > 50) {
    e.target.value = value.substring(0, 50);
  }
});

// Add auto-complete functionality (basic)
const commonCities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الطائف',
  'القاهرة', 'الإسكندرية', 'الجيزة', 'شبرا الخيمة', 'بورسعيد', 'السويس',
  'دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة',
  'الكويت', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير',
  'الدوحة', 'الريان', 'الوكرة', 'أم صلال', 'الخور', 'الشمال',
  'المنامة', 'المحرق', 'الرفاع', 'مدينة حمد', 'مدينة عيسى', 'سترة'
];

// Add year update
function updateYear() {
  const currentYear = new Date().getFullYear();
  const yearElement = document.querySelector('.year');
  if (yearElement) {
    yearElement.textContent = currentYear;
  }
}

// Update year on page load
window.addEventListener('load', updateYear);

// Update year every minute (in case page stays open past midnight on New Year's Eve)
setInterval(updateYear, 60000);
