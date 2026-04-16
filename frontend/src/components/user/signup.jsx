import { useState } from 'react';
import LeftSection from './utils/leftSection';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isDisabled,setIsDisabled]= useState(false);
  const [userPassword, setUserPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleCreateUserRequest(){
    setIsDisabled(true);
    try {
      const name = firstName + (lastName ? ' ' + lastName : '');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userName:name, userEmail: userEmail, passward: userPassword }),
            credentials: 'include'
        });
        
        // Parse response body once and store it
        const data = await response.json();
        console.log(data);
        
        if (response.ok) {
            login(data.userId);
            navigate('/home');
        } else {
            alert(data.message || "Failed to create account. Please try again.");
            setIsDisabled(false);
        }
    } catch (err) {
        console.error("Signup Error:", err);
        alert("A network error occurred during signup.");
        setIsDisabled(false);
    }
}
 return (
    <div className="min-h-screen bg-[#252431] flex justify-center items-center p-4 sm:p-8 font-sans">
      <div className="max-w-6xl w-full bg-[#1b1a23] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[800px] border border-white/5">
        {/* Left Side: Hero Image Section */}
       <LeftSection/>

        {/* Right Side: Form Section */}
        <div className="md:w-[52%] p-10 sm:p-14 lg:p-20 flex flex-col justify-center">
          <h2 className="text-white text-4xl font-semibold mb-3">Create an account</h2>
          <p className="text-[#8c8c97] text-md mb-10">
            Already have an account? <a href="/login" className="text-[#a492f2] hover:text-[#c4bdf5] underline underline-offset-4 decoration-1 font-medium transition-colors">Log in</a>
          </p>

          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input 
                type="text" 
                placeholder="Fletcher" 
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#2a2935] text-white border border-[#524496] rounded-xl px-5 py-[1.15rem] outline-none focus:border-[#7b5ffd] transition-colors placeholder-[#8c8c97]"
              />
              <input 
                type="text" 
                placeholder="Last name" 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#21202a] text-white border border-transparent rounded-xl px-5 py-[1.15rem] outline-none focus:bg-[#2a2935] focus:border-gray-600 transition-colors placeholder-[#53525e]"
              />
            </div>
            
            <input 
              type="email" 
              placeholder="Email" 
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-[#21202a] text-white border border-transparent rounded-xl px-5 py-[1.15rem] outline-none focus:bg-[#2a2935] focus:border-gray-600 transition-colors placeholder-[#53525e]"
            />
            
            <div className="relative">
              <input 
                type="password" 
                placeholder="Enter your password" 
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full bg-[#21202a] text-white border border-transparent rounded-xl px-5 py-[1.15rem] outline-none focus:bg-[#2a2935] focus:border-gray-600 transition-colors placeholder-[#53525e]"
              />
              <button type="button" className="absolute right-5 top-1/2 transform -translate-y-1/2 text-[#53525e] hover:text-gray-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center pt-2">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  id="terms" 
                  className="peer appearance-none w-5 h-5 rounded-[4px] bg-white border-transparent text-[#7b5ffd] focus:ring-[#7b5ffd] focus:ring-offset-[#1b1a23] cursor-pointer"
                  defaultChecked
                />
                <svg className="absolute w-3 h-3 text-[#1b1a23] pointer-events-none hidden peer-checked:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <label htmlFor="terms" className="ml-3 text-[#d0d0db] text-[0.95rem] cursor-pointer">
                I agree to the <a href="#" className="underline decoration-1 underline-offset-4 text-[#a492f2] hover:text-[#c4bdf5] transition-colors">Terms & Conditions</a>
              </label>
            </div>

            <button 
              type="button" 
              onClick={handleCreateUserRequest}
               style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              className="w-full bg-[#785ef0] hover:bg-[#654ae0] text-white font-medium rounded-xl px-5 py-4 mt-8 transition-colors shadow-lg shadow-[#785ef0]/20"
            >
                {isDisabled ? 'Processing...' : 'Create account'}
            </button>

            {/* <div className="flex items-center my-8">
              <div className="flex-1 border-t border-white/5"></div>
              <span className="px-5 text-[#53525e] text-sm">Or register with</span>
              <div className="flex-1 border-t border-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <button type="button" className="flex items-center justify-center gap-3 bg-transparent border border-white/10 text-[#d0d0db] hover:bg-white/5 hover:border-white/20 rounded-xl px-5 py-[1.1rem] transition-all font-medium">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[1.1rem] h-[1.1rem]" />
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 bg-transparent border border-white/10 text-[#d0d0db] hover:bg-white/5 hover:border-white/20 rounded-xl px-5 py-[1.1rem] transition-all font-medium">
                <svg className="w-[1.2rem] h-[1.2rem] fill-current text-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.365 21.44c-1.343.916-2.733.95-3.953.033-1.076-.8-2.6-1.11-4.22-.046-1.3.843-2.6 1-3.626 0-3.37-3.235-5.322-9.617-2.336-13.633 1.256-1.68 3.12-2.735 5.105-2.756 1.455-.022 2.812.89 3.846.89 1.05 0 2.65-1.07 4.385-.92 1.485.04 2.83.565 3.737 1.776-3.22 1.832-2.67 6.136.6 7.37-1.106 3.033-2.43 5.565-3.54 6.286zm-2.063-14.71c.783-.905 1.29-2.146 1.15-3.41-1.144.045-2.483.716-3.303 1.66-.67.75-1.258 2.03-1.08 3.284 1.272.096 2.45-.63 3.233-1.534z"/></svg>
                Apple
              </button>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
