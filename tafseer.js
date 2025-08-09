let menu = document.querySelector(".menu");
let close = document.querySelector(".close");
let ul = document.querySelector(".header .container .nav ul");
let upBtn = document.querySelector(".up");
let tafseerContent = document.querySelector(".tafseer-content");
let contentTafseer = document.querySelector(".content-tafseer");
let closeBtn = document.querySelector(".closebtn i");
let heading = document.querySelector(".closebtn h2");
let ayat = document.querySelector(".ayat");

let textAya = document.querySelector(".aya-tafseer .text");
let ayaTranslation = document.querySelector(".aya-tafseer .translation");

let newArr = [];
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

// Show loading initially
showLoading(tafseerContent, 'جاري تحميل السور...');

fetch("https://api.alquran.cloud/v1/meta")
  .then((result) => {
    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }
    return result.json();
  })
  .then((data) => {
    hideLoading(tafseerContent);
    
    if (!data.data || !data.data.surahs || !data.data.surahs.references) {
      throw new Error('لا توجد بيانات متاحة');
    }
    
    let dataRef = data.data.surahs.references;
    tafseerContent.innerHTML = '';
    
    for (let i = 0; i < data.data.surahs.references.length; i++) {
      let mainDiv = document.createElement("div");
      mainDiv.classList.add("main-div-tafseer");
      let firstDiv = document.createElement("div");
      firstDiv.classList.add("first-div-tafseer");
      let secondDiv = document.createElement("div");
      secondDiv.classList.add("second-div-tafseer");
      let firstDivText = document.createTextNode(
        data.data.surahs.references[i].name
      );
      let secondDivText = document.createTextNode(
        data.data.surahs.references[i].englishName
      );
      let dataRef = document.createElement("div");
      dataRef.classList.add("data-ref", "datarefcontent");
      let dataRefText = document.createTextNode(
        data.data.surahs.references[i].numberOfAyahs
      );
      dataRef.appendChild(dataRefText);
      firstDiv.appendChild(firstDivText);
      secondDiv.appendChild(secondDivText);
      mainDiv.appendChild(firstDiv);
      mainDiv.appendChild(secondDiv);
      mainDiv.appendChild(dataRef);
      tafseerContent.appendChild(mainDiv);
      
      mainDiv.addEventListener("click", () => {
        contentTafseer.classList.add("left");
      });
      closeBtn.addEventListener("click", () => {
        contentTafseer.classList.remove("left");
      });

      newArr.push(mainDiv);
      
      mainDiv.addEventListener("click", (e) => {
        tafseerContent.classList.add("remove");
        if (e.target.parentElement.classList.contains("tafseer-content")) {
          heading.innerHTML = e.target.children[0].innerHTML;
          ayat.innerHTML = `عدد الأيات : ( ${dataRef.innerHTML} )`;
          targets(newArr.indexOf(e.target));
        } else if (
          e.target.parentElement.classList.contains("main-div-tafseer")
        ) {
          heading.innerHTML = e.target.parentElement.children[0].innerHTML;
          ayat.innerHTML = `عدد الأيات : ( ${dataRef.innerHTML} )`;
          targets(newArr.indexOf(e.target.parentElement));
        }
      });
    }
  })
  .catch((error) => {
    console.error('Error loading Quran meta:', error);
    showError(tafseerContent, 'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.');
  });
  
function targets(target) {
  target++;
  
  const ayaContainer = document.querySelector(".aya-container");
  showLoading(ayaContainer, 'جاري تحميل التفسير...');
  
  fetch(`https://quranenc.com/api/v1/translation/sura/arabic_moyassar/${target}`)
    .then((result) => {
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`);
      }
      return result.json();
    })
    .then((data) => {
      if (!data.result || data.result.length === 0) {
        throw new Error('لا يوجد تفسير متاح');
      }
      
      ayaContainer.innerHTML = '';
      for (let i = 0; i < data.result.length; i++) {
        ayaContainer.innerHTML += `
          <div class="aya-tafseer">
            <div class="text">${data.result[i].arabic_text}</div>
            <div class="translation">${data.result[i].translation}</div>
          </div>
        `;
      }
      
      closeBtn.addEventListener("click", () => {
        tafseerContent.classList.remove("remove");
        ayaContainer.innerHTML = "";
      });
    })
    .catch((error) => {
      console.error('Error loading tafseer:', error);
      showError(ayaContainer, 'حدث خطأ في تحميل التفسير. يرجى المحاولة مرة أخرى.');
    });
}

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'tafseer.html') {
    link.classList.add('active');
  }
});

// Add keyboard navigation for closing modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (contentTafseer.classList.contains('left')) {
      closeBtn.click();
    }
  }
});

// Add click outside to close modal
contentTafseer.addEventListener('click', function(e) {
  if (e.target === contentTafseer) {
    closeBtn.click();
  }
});

// Prevent modal content clicks from closing modal
document.querySelector('.closebtn').addEventListener('click', function(e) {
  e.stopPropagation();
});

// Add loading animation for better UX
function addLoadingAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    .loading-spinner {
      animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

addLoadingAnimation();