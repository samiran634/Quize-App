export default function quizedata(noOfQuestion, catagoryind,mode) {

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
  
  if (catagoryind !== undefined&&catagoryind>0) {
      let URL = `${baseURL}&category=${catagoryind}&difficulty=${mode}`;  
      let data=fetchData(URL);
      console.log(data,catagoryind);
      return data;
  } else {
    let URL=`${baseURL}&difficulty=${mode}`;
      let data=fetchData(URL);
      console.log(data)
      return data;
  }

}
