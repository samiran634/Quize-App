export default function quizedata(noOfQuestion, catagoryind) {

  if (noOfQuestion === 0) noOfQuestion = 10;

  async function fetchData(URL) {
      try {
        const response = await fetch(URL); 
        // Parse the response as JSON
        const data = await response.json();  
       
        return data.results;
    
      } catch (err) {
        console.error(err);
      }
  }

  let baseURL = `https://opentdb.com/api.php?amount=${noOfQuestion}`;
  
  if (catagoryind !== undefined) {
      let URL = `${baseURL}&category=${catagoryind}`;  // Correct 'catagory' to 'category'
      let data=fetchData(URL);
      return data;
  } else {
      let data=fetchData(baseURL);
      return data;
  }

}
