window.addEventListener('load', function () {
  // Check if the database is fully loaded
  async function checkDatabaseLoaded() {
    // This is a placeholder. You should implement a real check here.
    return await fetch('/database-status')
  }

  checkDatabaseLoaded().then((isLoaded) => {
    if (isLoaded) {
      document.querySelector('.overlay').style.display = 'none';
    } else {
      console.error('Database failed to load');
      alert("database not loaded");
    }
  });
});
import category_container from "./catagory.js";
import quizedata from "./questionpakege.js";
import QuestionContainer from "./questioncontainer.js";
// Variables for DOM elements
let mainContainer, bgContainer, box, playBtn, quizContainer, resultContainer,diffcontainer;
let index, num,catagotystring;
let menuBtnopen,level="easy" ;
window.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in by checking for popup element
  const popup = document.querySelector(".popupbox");
  const isLoggedIn = popup !== null;

  if (isLoggedIn) {
    const toggleBtn = document.getElementById("popupToggleBtn");
    
    document.querySelector(".popup-buttons").addEventListener("click", (event) => {
      event.preventDefault();
      if (event.target.dataset.id === 'play-solo' || event.target.closest('[data-id="play-solo"]')) {
        // Slide out to the left
        popup.classList.add("slide-out");
        
        // After animation completes, hide popup and show toggle button
        setTimeout(() => {
          popup.style.display = "none";
          toggleBtn.style.display = "flex";
        }, 400);
        
        // Scroll to content section
        document.querySelector('.content-section').scrollIntoView({ behavior: 'smooth' });
        
      } else if (event.target.dataset.id === 'play-dule' || event.target.closest('[data-id="play-dule"]')) {
        location.href = `/loby`;
      }
    });
    
    // Toggle button click handler
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        popup.style.display = "flex";
        popup.classList.remove("slide-out");
        popup.classList.add("slide-in");
        toggleBtn.style.display = "none";
        
        // Remove slide-in class after animation
        setTimeout(() => {
          popup.classList.remove("slide-in");
        }, 400);
      });
    }
  }

  initDOMElements();

  if (mainContainer && bgContainer && playBtn && quizContainer && resultContainer) {
    // All elements are initialized and ready
    console.log("All elements are present.");
  } else {
    console.error('One or more DOM elements are missing.');
  }
});

function initDOMElements() {
  mainContainer = document.querySelector('.rules');
  if (!mainContainer) {
    console.error('Main container not found!');
  }

  bgContainer = document.querySelector('.big-container');
  if (!bgContainer) {
    console.error('Background container not found!');
  }

  box = document.querySelector('#modal');
  if (!box) {
    console.error('Box element not found!');
  }

  playBtn = document.querySelector('.play-btn');
  if (!playBtn) {
    console.error('Play button not found!');
  }

  quizContainer = document.querySelector('.quiz');
  if (!quizContainer) {
    console.error('Quiz container not found!');
  }

  resultContainer = document.querySelector('.result');
  if (!resultContainer) {
    console.error('Result container not found!');
  }
  diffcontainer=document.querySelector('.flex-container');
  if(!diffcontainer){
    console.error('flexcontainer not found!');
  }
  menuBtnopen=document.getElementById("menu-open-btn");
  if(!menuBtnopen){
    console.error('menuBtn not found!');
  }
 
}
initDOMElements();
//makeing guidlines
function createGuidelines() {
  const guidelinesContainer = document.createElement('div');
  guidelinesContainer.className = 'rules container';

  const title = document.createElement('h2');
  title.className = 'd-flex rule-title';
  title.style.justifyContent = 'center';
  title.textContent = 'Guidelines';

  const rulesList = document.createElement('ul');
  rulesList.className = 'rules-list';

  const rules = [
    'Questions are Multiple Choice Questions.',
    'There are at most 50 questions that can be chosen from a category.',
    'You can attempt each question only once.',
    'Each question carries one mark. -0.5 will be awarded for each incorrect attempt.',
    'You can only choose any one of all the categories or all categories.',
    'Don\'t plagiarize. Try to answer on your own.',
    'You can take the quiz multiple times.',
    'Never refresh the main page while taking part in the quiz.'
  ];

  rules.forEach(rule => {
    const li = document.createElement('li');
    li.className = 'rule-point';
    li.textContent = rule;
    rulesList.appendChild(li);
  });

  const button = document.createElement('button');
  button.className = 'd-flex cursor gap circular-btn';
  button.style.justifyContent = 'center';
 

  const buttonText = document.createElement('h3');
  buttonText.className = 'circular-btn';
  buttonText.textContent = 'Choose category';
  buttonText.setAttribute("data-name","category");

  button.appendChild(buttonText);

  guidelinesContainer.appendChild(title);
  guidelinesContainer.appendChild(rulesList);
  guidelinesContainer.appendChild(button);

  return guidelinesContainer;
}
 
const guidelinesSection = createGuidelines();
mainContainer.appendChild(guidelinesSection);

mainContainer.addEventListener("click",(event)=>{
  console.log(event.target)
  if(event.target.dataset.name==="category"){
    chooseCategory()
  }
})
//for small devices
menuBtnopen.addEventListener("click", () => {
 
  menuBtnopen.classList.toggle("hide");
  const navbar = document.querySelector('.navbar');
  const navbarLinks = document.querySelector('.navbar-links');

  if (navbar.classList.contains('hide')) {
    navbar.classList.remove('hide');
    navbar.style.display = 'flex';
    navbar.style.flexDirection = 'column';
    navbar.style.position = 'fixed';
    navbar.style.top = '0';
    navbar.style.left = '0';
    navbar.style.width = '100%';
    navbar.style.height = '100vh';
    navbar.style.backgroundColor = '#334155';
    navbar.style.zIndex = '1000';

    navbarLinks.style.display = 'flex';
    navbarLinks.style.flexDirection = 'column';
    navbarLinks.style.alignItems = 'center';
    navbarLinks.style.justifyContent = 'center';
    navbarLinks.style.height = '100%';
  } else {
    navbar.classList.add('hide');
    navbar.style.display = 'none';
  }
});
 
function chooseCategory() {
  mainContainer.classList.add("hide");

  let categoryListContainer = document.createElement("div");
  categoryListContainer.setAttribute("style", "display:flex");

  bgContainer.appendChild(category_container(categoryListContainer));

  bgContainer.addEventListener("click", handleBgContainerClick);
}

function handleBgContainerClick(event) {
  console.log(event.target);
  if (event.target.id) {
     catagotystring = event.target.dataset.name;
  }
  if (event.target.dataset.key === "catagory") {
    index = event.target.dataset.id-1;
    console.log("index value",index);
    bgContainer.innerHTML = "";
    createDeficultyInputContainer();
  
  }
}

function handleBoxClick(event) {
  let inputBox=document.querySelector(".inputbox")  ;
  console.log(inputBox)
  if (event.target.dataset.name === "submit-btn") {
    const inputValue =  Number(inputBox.value);
    console.log(inputValue)
    if (inputValue > 50 || inputValue < 1 || isNaN(inputValue)) {
      alert("Invalid Input: Please enter a number between 1 and 50.");
    } else {
      num=inputValue;
      box.classList.add("hide");
      playBtn.classList.remove("hide");
      setTimeout(() => {
        startQuiz();
      }, 3000);
    }
  }
}

function startQuiz() {
  quizContainer.classList.remove("hide");
  playBtn.classList.add("hide");

  async function loadQuiz(num, index,mode) {
    try {
      let data = await quizedata(num, index - 1,mode);
     

      if (!Array.isArray(data) || !data.length || !data[0].hasOwnProperty('category')) {
        throw new Error('Invalid data structure: Expected an array of objects with a category property.');
      }
      QuestionContainer(quizContainer, data, resultContainer);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      alert('Failed to load quiz data. Please try again later.'); // Notify user of the error
    }
  }

  loadQuiz(num, index,level);
}
function createDeficultyInputContainer(){
   
    if(!diffcontainer){
      console.error('deficultyContainer not found!');
    }else{
     const items=[
      {
        text:"easy",
        subtitle:"don't worry about it, all are chilld level questions",
        Image:"/assects/level1.gif"
      },
      {
        text:"medium",
        subtitle:"If you feel like big boy than come and try to answer",
        Image:"/assects/level2.gif"
      },
      {
        text:"hard",
        subtitle:"At your own risk buddy. those questions are pritty unpredicted",
         Image:"/assects/level3.gif"
      }
     ];
     
     // Create navigation wrapper
     const navWrapper = document.createElement('div');
     navWrapper.className = 'difficulty-nav';
     
     // Create container for cards
     const cardsContainer = document.createElement('div');
     cardsContainer.className = 'deficulty-container';
     cardsContainer.id = 'difficulty-cards-container';
     
     items.forEach((item)=> {
       createCard(cardsContainer, item.text, item.subtitle, item.Image);
     });
     
     // Create left arrow
     const leftArrow = document.createElement('button');
     leftArrow.className = 'difficulty-arrow left';
     leftArrow.innerHTML = '&#8249;';
     leftArrow.setAttribute('aria-label', 'Previous difficulty level');
     leftArrow.onclick = () => scrollDifficulty('left');
     
     // Create right arrow
     const rightArrow = document.createElement('button');
     rightArrow.className = 'difficulty-arrow right';
     rightArrow.innerHTML = '&#8250;';
     rightArrow.setAttribute('aria-label', 'Next difficulty level');
     rightArrow.onclick = () => scrollDifficulty('right');
     
     // Create dots indicator
     const dotsContainer = document.createElement('div');
     dotsContainer.className = 'difficulty-dots';
     dotsContainer.id = 'difficulty-dots';
     
     items.forEach((item, idx) => {
       const dot = document.createElement('button');
       dot.className = `difficulty-dot ${idx === 0 ? 'active' : ''}`;
       dot.setAttribute('aria-label', `Go to ${item.text} difficulty`);
       dot.onclick = () => scrollToCard(idx);
       dotsContainer.appendChild(dot);
     });
     
     navWrapper.appendChild(leftArrow);
     navWrapper.appendChild(cardsContainer);
     navWrapper.appendChild(rightArrow);
     
     diffcontainer.appendChild(navWrapper);
     diffcontainer.appendChild(dotsContainer);
     
     // Initialize carousel
     initDifficultyCarousel();
  }
}

let currentDifficultyIndex = 0;
const totalDifficulties = 3;

function scrollDifficulty(direction) {
  const container = document.getElementById('difficulty-cards-container');
  if (!container) return;
  
  const cards = container.querySelectorAll('.card-container');
  if (cards.length === 0) return;
  
  if (direction === 'left') {
    currentDifficultyIndex = Math.max(0, currentDifficultyIndex - 1);
  } else {
    currentDifficultyIndex = Math.min(cards.length - 1, currentDifficultyIndex + 1);
  }
  
  scrollToCard(currentDifficultyIndex);
}

function scrollToCard(index) {
  const container = document.getElementById('difficulty-cards-container');
  if (!container) return;
  
  const cards = container.querySelectorAll('.card-container');
  if (cards.length === 0 || index >= cards.length) return;
  
  currentDifficultyIndex = index;
  
  // Scroll to the card
  cards[index].scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  });
  
  // Update dots
  updateDots();
  
  // Update arrow states
  updateArrows();
}

function updateDots() {
  const dots = document.querySelectorAll('.difficulty-dot');
  dots.forEach((dot, idx) => {
    if (idx === currentDifficultyIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

function updateArrows() {
  const leftArrow = document.querySelector('.difficulty-arrow.left');
  const rightArrow = document.querySelector('.difficulty-arrow.right');
  
  if (leftArrow) {
    if (currentDifficultyIndex === 0) {
      leftArrow.classList.add('disabled');
    } else {
      leftArrow.classList.remove('disabled');
    }
  }
  
  if (rightArrow) {
    if (currentDifficultyIndex === totalDifficulties - 1) {
      rightArrow.classList.add('disabled');
    } else {
      rightArrow.classList.remove('disabled');
    }
  }
}

function initDifficultyCarousel() {
  const container = document.getElementById('difficulty-cards-container');
  if (!container) return;
  
  // Add scroll event listener to update dots on manual scroll
  let scrollTimeout;
  container.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const cards = container.querySelectorAll('.card-container');
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      });
      
      if (closestIndex !== currentDifficultyIndex) {
        currentDifficultyIndex = closestIndex;
        updateDots();
        updateArrows();
      }
    }, 100);
  });
  
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (diffcontainer && !diffcontainer.classList.contains('hide')) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollDifficulty('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollDifficulty('right');
      }
    }
  });
  
  // Add touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  container.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  container.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      // Swipe left
      scrollDifficulty('right');
    } else if (touchEndX - touchStartX > swipeThreshold) {
      // Swipe right
      scrollDifficulty('left');
    }
  }
  
  // Initialize arrow states
  updateArrows();
}

function handleDifficultyClick(event){
  console.log(event);
    level=event.target.dataset.key;
    if(level){
    diffcontainer.classList.add("hide");
    box.classList.remove("hide");
    box.addEventListener("click", handleBoxClick);
     console.log(level);
    }else{
      alert("please touch the buttons carefully!!!")
    }
}

function createCard(container ,Title ,subTitle,Image) {
  const cardContainer = document.createElement("div");
  cardContainer.className = "card-container";
  

  const img = document.createElement("img");
  img.className = "card-image";
  img.src =  Image;
  img.alt = "gif missing for you";

  const cardContent = document.createElement("div");
  cardContent.className = "card-content";

  const title = document.createElement("h5");
  title.className = "card-title";
  title.textContent =  Title;

  const subtitle = document.createElement("p");
  subtitle.className = "card-subtitle";
  subtitle.textContent =  subTitle;

  const button = document.createElement("button");
  button.className = "card-button";
  button.dataset.key=Title;
  button.addEventListener("click",  handleDifficultyClick);
  button.textContent = "Go for it";

 

 
   
 
  cardContent.appendChild(title);
  cardContent.appendChild(subtitle);
  cardContent.appendChild(button);
  cardContainer.appendChild(img);
  cardContainer.appendChild(cardContent);

  container.appendChild(cardContainer);
}

 
