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
      gap: 15px;
      justify-content: center;
      color: white;
      padding: 1rem;
    `;
  
    for (let ele of arrayOfCategories) {
      indexTracking++;
      
      // Create the btns
      let button = document.createElement("button");
      button.style.cssText = `
        display: flex; 
        flex-direction: row; 
        align-items: center;
        justify-content: center;
        width: calc(33.333% - 10px);
        min-width: 200px;
        height: 3.5em;
        padding: 1em;
        margin: 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        transition: all 0.3s ease;
        color: #fff;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.95rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      `;
      button.setAttribute("data-id", `${indexTracking}`);
      button.setAttribute("data-name", ele);
      button.setAttribute("data-key","catagory");
      button.setAttribute("class","catagory-btn");
      button.innerText = ele;

      // Add hover effect for glassmorphism style
      button.onmouseover = () => {
        button.style.transform = "translateY(-3px)";
        button.style.background = "rgba(255, 255, 255, 0.2)";
        button.style.borderColor = "rgba(255, 255, 255, 0.4)";
        button.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
      };
      button.onmouseout = () => {
        button.style.transform = "translateY(0)";
        button.style.background = "rgba(255, 255, 255, 0.1)";
        button.style.borderColor = "rgba(255, 255, 255, 0.2)";
        button.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
      };

      // Append the button to the block
      block.appendChild(button);
    }
  
    return block;
  };
  
  export default category_container;
  