let menu = document.querySelector(".menu");
let close = document.querySelector(".close");
let ul = document.querySelector(".header .container .nav ul");
let upBtn = document.querySelector(".up");
let next = document.querySelector(".next");
let nextBtn = document.querySelector(".number-container .nextbtn");

let nextDone = document.querySelector(".nextDone");
let prevDone = document.querySelector(".prevDone");
let prev = document.querySelector(".prev");
let prevBtn = document.querySelector(".prevbtn");

let numOne = document.querySelector(".num-one");
let numberOne = document.querySelector(".numberOne");

let paragraphContent = document.querySelector(".paragraph-para");
let numTwo = document.querySelector(".num-two");
let tasbiha = document.querySelector(".tasbiha-container .tasbiha");
let countTasbiha = document.querySelector(".tasbiha-container .count");
let discription = document.querySelector(".tasabieh-contentet .discription");
let tasabiehCount = document.querySelector(".tasabieh-count");
let index = 0;
let count = 0;
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

// Show initial loading states
showLoading(document.querySelector(".hadis-content"), 'جاري تحميل الأذكار...');
showLoading(document.querySelector(".tasabieh-contentet"), 'جاري تحميل التسابيح...');

fetch("https://www.hisnmuslim.com/api/ar/27.json")
  .then((result) => {
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return result.json();
  })
  .then((data) => {
    hideLoading(document.querySelector(".hadis-content"));
    
    const azkarData = data[Object.keys(data)];
    if (!azkarData || azkarData.length === 0) {
      throw new Error('لا توجد بيانات متاحة');
    }
    
    document.querySelector(".hadis-content").innerHTML = azkarData[index].ARABIC_TEXT;
    numTwo.innerHTML = azkarData.length;

    next.addEventListener("click", () => {
      if (index < azkarData.length - 1) {
        index++;
        document.querySelector(".hadis-content").innerHTML = azkarData[index].ARABIC_TEXT;
        numOne.innerHTML = index + 1;
      }
      
      if (index === azkarData.length - 1) {
        next.classList.add("solid");
      }
      if (index > 0) {
        prev.classList.remove("solid");
      }
    });
    
    prev.addEventListener("click", () => {
      if (index > 0) {
        index--;
        document.querySelector(".hadis-content").innerHTML = azkarData[index].ARABIC_TEXT;
        numOne.innerHTML = index + 1;
      }
      
      if (index < azkarData.length - 1) {
        next.classList.remove("solid");
      }
      if (index === 0) {
        prev.classList.add("solid");
      }
    });
  })
  .catch((error) => {
    console.error('Error loading azkar:', error);
    showError(document.querySelector(".hadis-content"), 'حدث خطأ في تحميل الأذكار. يرجى المحاولة مرة أخرى.');
  });

fetch("https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json")
  .then((result) => {
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return result.json();
  })
  .then((data) => {
    hideLoading(document.querySelector(".tasabieh-contentet"));
    
    const tasabiehData = data.تسابيح;
    if (!tasabiehData || tasabiehData.length === 0) {
      throw new Error('لا توجد بيانات متاحة');
    }
    
    tasbiha.innerHTML = tasabiehData[count].content;
    countTasbiha.innerHTML = `${tasabiehData[count].count} مرة`;
    discription.innerHTML = tasabiehData[count].description;
    tasabiehCount.innerHTML = tasabiehData.length;
    
    nextBtn.addEventListener("click", () => {
      if (count < tasabiehData.length - 1) {
        count++;
        tasbiha.innerHTML = tasabiehData[count].content;
        countTasbiha.innerHTML = `${tasabiehData[count].count} مرة`;
        discription.innerHTML = tasabiehData[count].description;
        numberOne.innerHTML = count + 1;
      }
      
      if (count === tasabiehData.length - 1) {
        nextBtn.classList.add("solid");
      }
      if (count > 0) {
        prevBtn.classList.remove("solid");
      }
    });
    
    prevBtn.addEventListener("click", () => {
      if (count > 0) {
        count--;
        tasbiha.innerHTML = tasabiehData[count].content;
        countTasbiha.innerHTML = `${tasabiehData[count].count} مرة`;
        discription.innerHTML = tasabiehData[count].description;
        numberOne.innerHTML = count + 1;
      }
      
      if (count < tasabiehData.length - 1) {
        nextBtn.classList.remove("solid");
      }
      if (count === 0) {
        prevBtn.classList.add("solid");
      }
    });
  })
  .catch((error) => {
    console.error('Error loading tasabieh:', error);
    showError(document.querySelector(".tasabieh-contentet"), 'حدث خطأ في تحميل التسابيح. يرجى المحاولة مرة أخرى.');
  });

window.addEventListener('load', function() {
  prevBtn.classList.add("solid");
  prev.classList.add("solid");
});

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'azkar.html') {
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
