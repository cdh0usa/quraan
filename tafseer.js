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

// Add loading state
function showSurahsLoading() {
  tafseerContent.innerHTML = '<div class="loading" style="text-align: center; padding: 50px; font-size: 20px;">جاري تحميل السور...</div>';
}

// Show loading initially
showSurahsLoading();

fetch("https://api.alquran.cloud/v1/meta")
  .then((result) => {
    let data = result.json();
    return data;
  })
  .then((data) => {
    // Clear loading
    tafseerContent.innerHTML = '';
    
    let dataRef = data.data.surahs.references;
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
      // console.log(newArr[0])
      mainDiv.addEventListener("click", (e) => {
        tafseerContent.classList.add("remove")
        if (e.target.parentElement.classList.contains("tafseer-content")) {
          heading.innerHTML = e.target.children[0].innerHTML;
          ayat.innerHTML = `عدد الأيات : ( ${dataRef.innerHTML} )`;
          // console.log(newArr.indexOf(e.target))
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
  });
  .catch((error) => {
    console.error('Error loading Quran meta:', error);
    tafseerContent.innerHTML = '<div style="text-align: center; padding: 50px; color: red;">حدث خطأ في تحميل البيانات</div>';
  });
  
function targets(target) {
  target++;
  
  // Show loading for tafseer
  document.querySelector(".aya-container").innerHTML = '<div class="loading" style="text-align: center; padding: 30px;">جاري تحميل التفسير...</div>';
  
  fetch(
    `https://quranenc.com/api/v1/translation/sura/arabic_moyassar/${target}`
  )
    .then((result) => {
      let data = result.json();
      return data;
    })
    .then((data) => {
      // Clear loading
      document.querySelector(".aya-container").innerHTML = '';
      
      for (let i = 0; i < data.result.length; i++) {
        document.querySelector(".aya-container").innerHTML += `
          <div class="aya-tafseer">
            <div class="text">${data.result[i].arabic_text}</div>
            <div class="translation">${data.result[i].translation}</div>
          </div>
        `;
        
        closeBtn.addEventListener("click", () => {
          tafseerContent.classList.remove("remove");
          document.querySelector(".aya-container").innerHTML = "";
        });
      }
    })
    .catch((error) => {
      console.error('Error loading tafseer:', error);
      document.querySelector(".aya-container").innerHTML = '<div style="text-align: center; padding: 30px; color: red;">حدث خطأ في تحميل التفسير</div>';
    });
}

// Add active class to current navigation item
document.querySelectorAll('.nav a').forEach(link => {
  if (link.getAttribute('href') === 'tafseer.html') {
    link.classList.add('active');
  }
});