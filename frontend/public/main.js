window.addEventListener('load', function () {
  document.getElementById('spinner').style.display = 'none';
});

import category_container from "../catagory.js";
let btn = document.querySelector(".circular-btn")
let bg_container = document.querySelector(".big-container")
let mainconteiner = document.querySelector(".container")
let quizContainer = document.querySelector(".quiz");
import quizedata from "./questionpakege.js";
let play_btn = document.querySelector(".play-btn")

console.log(btn);
let catagotystring = "Any Catagory";
let index;
let num = 0;
let box = document.querySelector("#modal");
btn.addEventListener("click", (event) => {

  console.log(event)
  mainconteiner.classList.add("hide");

  // Create the category list container
  let categoryListContainer = document.createElement("div");
  categoryListContainer.setAttribute("style", "display:flex");

  // Append the dynamically generated category list to bg_container
  bg_container.appendChild(category_container(categoryListContainer));

  // Create the submit button
  let sub_btn = document.createElement("button");
  sub_btn.textContent = "Submit";
  sub_btn.classList.add("circular-btn");
  sub_btn.setAttribute("style", "width:12rem;align-self:center;color:black;height:3em;color:black");
  sub_btn.setAttribute("data-name", "submit");

  // Append the button to bg_container
  bg_container.appendChild(sub_btn);

  bg_container.addEventListener("click", (event) => {
    console.log(event.target);
    if (event.target.id) {
      catagotystring = event.target.dataset.name;
      console.log(catagotystring)
    }
    if (event.target.dataset.key === "catagory") {
      index = event.target.id;
    }
    if (event.target.dataset.name === "submit") {
      bg_container.innerHTML = ""
      box.classList.remove("hide")
    }
  })

});


box.addEventListener("keyup", (event) => {
  num = Number(event.target.value);
  console.log(typeof num)
  if (num > 50 || num < 0 || typeof num !== "number") {
    alert("Invalid Input");
  }
  else {
    box.addEventListener("click", (event) => {
      console.log(event.target);
      if (event.target.dataset.name === "submit-btn") {
        box.classList.add("hide");
        play_btn.classList.remove("hide")
        play_btn.addEventListener("click", () => {
          quizContainer.classList.remove("hide")
          play_btn.classList.add("hide");
          quizedata(num, index);
        })

      }
    })

  }


})








