import './App.css'
import { createBrowserRouter, redirect } from 'react-router-dom'
import RootLayout from './components/layouts/RootLayout'
import HomePage from './components/pages/landing'
import Login from './components/user/login'
import SignUp from './components/user/signup'
import RankTable from './components/pages/ranktable'
import Home from './components/pages/homePage'
import Duel from './components/pages/Duel/duel'
import ProfilePage from './components/pages/profilePage'
import { authStore } from './context/authStore';
import UpdateProfileForm from './components/user/editProfile'
import PublicProfilePage from './components/pages/publicProfilePage'

// Example 1: Fetch trivia categories for rank table
const rankTableLoader = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/players?page=1`);
    const data = await response.json();
    return { categories: data.trivia_categories };
  } catch (error) {
    console.error('Failed to load categories:', error);
    return { categories: [] };
  }
};

const fetchUserDataLoader = async ({ params }) => { // 1. Destructure params from arguments
  try {
    const userId = params.userId; // 2. Extract userId from params
    if (!userId) throw "User ID is missing";

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile?userId=${userId}`, {
      credentials: "include"
    });

    // You should probably check if response is okay
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return { data };
  } catch (e) {
    console.error(e);
    return null;
  }
};


// Called on /login and /signup: checks if user already has a valid cookie session
const whoAmILoader = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/whoami`, {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json(); // { user: userId }
      authStore.setUser(data.user); // cache in module store

      return redirect('/home');
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Called on /home, /duel etc: reads from module store — NO API call
const protectedLoader = () => {
  const userId = authStore.userId;
  if (userId) {
    return { user: userId };
  }
  return redirect('/login');
};


export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    hydrateFallbackElement: <div className="min-h-screen bg-slate-950" />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <Login />,
        loader: whoAmILoader,
      },
      {
        path: 'signup',
        element: <SignUp />,
        loader: whoAmILoader,
      },
      {
        path: 'home',
        element: <Home />,
        loader: protectedLoader,
      },
      {
        path: 'ranktable',
        element: <RankTable />,
        loader: rankTableLoader,
      },
      {
        path: 'duel',
        element: <Duel />,
        loader: protectedLoader,
      },
      {
        path: 'profile/:userId',
        element: <ProfilePage />,
        loader: fetchUserDataLoader
      },
      {
        path: 'editProfile/:userId',
        element: <UpdateProfileForm />
      },
      {
        path: 'publicprofile/:userEmail',
        element: <PublicProfilePage />
      }
    ],
  },
]);
