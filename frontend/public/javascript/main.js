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
      // You might want to show an error message to the user here
    }
  });
});
import category_container from "./catagory.js";
import quizedata from "./questionpakege.js";
import QuestionContainer from "./questioncontainer.js";

// Variables for DOM elements
let mainContainer, bgContainer, box, playBtn, quizContainer, resultContainer,flexcontainer;
let index, num, catagotystring;
let menuBtnopen ;
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector(".popup-buttons").addEventListener("click" ,(event)=>{
    event.preventDefault();
    if(event.target.dataset.id==='play-solo'){
      document.querySelector(".popupbox").classList.add("hidden");
    }else if(event.target.dataset.id==='play-dual'){
      location.href='/dule';
    }
  })
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
  flexcontainer=document.querySelector('.flex-container');
  if(!flexcontainer){
    console.error('flexcontainer not found!');
  }
  menuBtnopen=document.getElementById("menu-open-btn");
  if(!menuBtnopen){
    console.error('menuBtn not found!');
  }
 
}
initDOMElements();

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
console.log(mainContainer)
// Usage
const guidelinesSection = createGuidelines();
mainContainer.appendChild(guidelinesSection);

mainContainer.addEventListener("click",(event)=>{
  console.log(event.target)
  if(event.target.dataset.name==="category"){
    chooseCategory()
  }
})
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

  let sub_btn = document.createElement("button");
  sub_btn.textContent = "Submit";
  sub_btn.classList.add("circular-btn");
  sub_btn.setAttribute("style", "width:12rem;align-self:center;color:black;height:3em;color:black");
  sub_btn.setAttribute("data-name", "submit");

  bgContainer.appendChild(sub_btn);

  bgContainer.addEventListener("click", handleBgContainerClick);
}

function handleBgContainerClick(event) {
  console.log(event.target);
  if (event.target.id) {
    catagotystring = event.target.dataset.name;
  }
  if (event.target.dataset.key === "catagory") {
    index = event.target.id;
  }
  if (event.target.dataset.name === "submit") {
    bgContainer.innerHTML = "";
    box.classList.remove("hide");
    flexcontainer.classList.add("hide");
    box.addEventListener("keyup", handleBoxKeyup);
  }
}

function handleBoxKeyup(event) {
  num = Number(event.target.value);
  if (num > 50 || num < 0 || isNaN(num)) {
    alert("Invalid Input");
  } else {
    box.addEventListener("click", handleBoxClick);
  }
}

function handleBoxClick(event) {
  if (event.target.dataset.name === "submit-btn") {
    box.classList.add("hide");
    playBtn.classList.remove("hide");
    playBtn.addEventListener("click", startQuiz);
  }
}
 
function startQuiz() {
  quizContainer.classList.remove("hide");
  playBtn.classList.add("hide");

  async function loadQuiz(num, index) {
    try {
      let data = await quizedata(num, index - 1);
      QuestionContainer(quizContainer, data, resultContainer);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  }

  loadQuiz(num, index);
}
 

 








