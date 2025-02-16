let arrayOfCategories = [
 'General Knowledge', 'Entertainment: Books', 'Entertainment: Film', 
    'Entertainment: Music', 'Entertainment: Musicals & Theatres', 'Entertainment: Television', 
    'Entertainment: Video Games', 'Entertainment: Board Games', 'Science & Nature', 
    'Science: Computers', 'Science: Mathematics', 'Mythology', 'Sports', 'Geography', 'History', 
    'Politics', 'Art', 'Celebrities', 'Animals', 'Vehicles', 'Entertainment: Comics', 
    'Science: Gadgets', 'Entertainment: Japanese Anime & Manga', 'Entertainment: Cartoons & Animations'
  ];
  
  let indexTracking = 9;
  
  const category_container = (block) => {
    // Set container styles for flex layout with 3 items per row
    block.style.cssText = `
      display: flex; 
      flex-wrap: wrap; 
      gap: 10px;
      justify-content: space-between;
      color:black;
    `;
  
    for (let ele of arrayOfCategories) {
      indexTracking++;
      
      // Create the btns
      let button = document.createElement("button");
      button.style.cssText = `
        display: flex; 
        flex-direction: row; 
        align-items: center;
        width: 30%; /* Ensures 3 items per row */
        height:3em;
        padding: .5em;
        margin:.5em;
        background-color: black;
        border-radius: 8px;
        transition: transform 0.3s ease, background-color 0.3s ease;
        color:white;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.9rem;
      `;
      button.setAttribute("data-id", `${indexTracking}`);
      button.setAttribute("data-name", ele);
      button.setAttribute("data-key","catagory");
      button.setAttribute("class","catagory-btn");
      button.innerText = ele;

      // Add hover effect for a "cool" style
      button.onmouseover = () => {
        button.style.transform = "scale(1.05)";
        button.style.backgroundColor = "#e0e0e0";
      };
      button.onmouseout = () => {
        button.style.transform = "scale(1)";
        button.style.backgroundColor = "black";
      };

      // Append the button to the block
      block.appendChild(button);
    }
  
    return block;
  };
  
  export default category_container;
  