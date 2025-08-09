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

// Add loading states
function showLoading(element) {
  element.classList.add('loading');
  element.innerHTML = 'جاري التحميل...';
}

function hideLoading(element) {
  element.classList.remove('loading');
}

fetch("https://www.hisnmuslim.com/api/ar/27.json")
  .then((result) => {
    let data = result.json();
    return data;
  })
  .then((data) => {
    hideLoading(document.querySelector(".hadis-content"));
    document.querySelector(".hadis-content").innerHTML =
      data[Object.keys(data)][index].ARABIC_TEXT;
    numTwo.innerHTML = data[Object.keys(data)].length;

    next.addEventListener("click", () => {
      document.querySelector(".hadis-content").innerHTML =
        data[Object.keys(data)][++index].ARABIC_TEXT;
      numOne.innerHTML++;
      if (index == data[Object.keys(data)].length - 1) {
        next.classList.add("solid");
      }
      if (index > 0) {
        prev.classList.remove("solid")
      }
    });
    prev.addEventListener("click", () => {
      document.querySelector(".hadis-content").innerHTML =
        data[Object.keys(data)][--index].ARABIC_TEXT;
      --numOne.innerHTML;
      if (index < data[Object.keys(data)].length - 1) {
        next.classList.remove("solid");
      }
      if (index == 0) {
        prev.classList.add("solid")
      }
    });
  });
  .catch((error) => {
    console.error('Error loading azkar:', error);
    document.querySelector(".hadis-content").innerHTML = 'حدث خطأ في تحميل الأذكار';
  });

fetch(
  "https://raw.githubusercontent.com/nawafalqari/azkar-api/56df51279ab6eb86dc2f6202c7de26c8948331c1/azkar.json"
)
  .then((result) => {
    let data = result.json();
    return data;
  })
  .then((data) => {
    hideLoading(document.querySelector(".tasabieh-contentet"));
    tasbiha.innerHTML = data.تسابيح[count].content;
    countTasbiha.innerHTML = `${data.تسابيح[count].count} مرة`;
    discription.innerHTML = data.تسابيح[count].description;
    tasabiehCount.innerHTML = data.تسابيح.length;
    nextBtn.addEventListener("click", () => {
      tasbiha.innerHTML = data.تسابيح[++count].content;

      countTasbiha.innerHTML = `${data.تسابيح[count].count} مرة`;
      discription.innerHTML = data.تسابيح[count].description;
      numberOne.innerHTML++;
      if (count == data.تسابيح.length - 1) {
        nextBtn.classList.add("solid");
      }
      if (count > 0) {
        prevBtn.classList.remove("solid")
      }
    });
    prevBtn.addEventListener("click", () => {
      tasbiha.innerHTML = data.تسابيح[--count].content;
      countTasbiha.innerHTML = `${data.تسابيح[count].count} مرة`;
      discription.innerHTML = data.تسابيح[count].description;
      numberOne.innerHTML--;
      if (count < data.تسابيح.length - 1) {
        nextBtn.classList.remove("solid");
      }
      if (count == 0) {
        prevBtn.classList.add("solid")
      }
    });
  });
  .catch((error) => {
    console.error('Error loading tasabieh:', error);
    document.querySelector(".tasabieh-contentet").innerHTML = 'حدث خطأ في تحميل التسابيح';
  });

window.onload = function() {
  prevBtn.classList.add("solid");
  prev.classList.add("solid");
  
  // Show loading states initially
  showLoading(document.querySelector(".hadis-content"));
  showLoading(document.querySelector(".tasabieh-contentet"));
}

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'azkar.html') {
    link.classList.add('active');
  }
});