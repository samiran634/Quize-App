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
      
      // Create the input container
      let input_container = document.createElement("div");
      input_container.style.cssText = `
        display: flex; 
        flex-direction: row; 
        align-items: center;
        width: 30%; /* Ensures 3 items per row */
        height:3em;
        padding: .5 em;
        margin:.5em;
        background-color: black;
        border-radius: 8px;
        transition: transform 0.3s ease, background-color 0.3s ease;
        color:white;
      `;
      
      // Add hover effect for a "cool" style
      input_container.onmouseover = () => {
        input_container.style.transform = "scale(1.05)";
        input_container.style.backgroundColor = "#e0e0e0";
      };
      input_container.onmouseout = () => {
        input_container.style.transform = "scale(1)";
        input_container.style.backgroundColor = "black";
      };
  
      // Create the input element
      let input = document.createElement("input");
      input.setAttribute("id", `${indexTracking}`);
      input.setAttribute("data-id", `${indexTracking}`);
      input.setAttribute("data-name", ele);
      input.setAttribute("type", "radio");
      input.setAttribute("data-key","catagory");
      // Create the label element
      let label = document.createElement("label");
      label.setAttribute("for", `${indexTracking}`);
      label.setAttribute("data-id", `${indexTracking}`);
      label.setAttribute("data-name", ele);
      label.setAttribute("data-key","catagory");
      label.style.cssText = `
        cursor: pointer; 
        margin-left: 10px; 
        font-weight: bold;
        font-size: 0.9rem;
      `;
      label.innerText = ele;
  
      // Append the input and label to the input container
      input_container.appendChild(input);
      input_container.appendChild(label);
  
      // Append the input container to the block
      block.appendChild(input_container);
    }
  
    return block;
  };
  
  export default category_container;
  