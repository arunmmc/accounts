// src/main.jsx
import React, { useEffect } from 'react'; // Import useEffect for AOS initialization
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Redux imports
import { Provider } from 'react-redux';
import { store } from './redux/store';

// AOS imports
import AOS from 'aos';
import 'aos/dist/aos.css'; // Make sure this path is correct

// A wrapper component to handle AOS initialization
// This ensures AOS.init() runs once after the component mounts
const RootWrapper = () => {
  useEffect(() => {
    AOS.init({
      // Global settings for AOS (these are the same settings you provided)
      disable: false,
      startEvent: 'DOMContentLoaded',
      initClassName: 'aos-init',
      animatedClassName: 'aos-animate',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
      offset: 120,
      delay: 0,
      duration: 400,
      easing: 'ease-in-out', // Changed to a common easing for better compatibility
      once: false,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
    AOS.refresh(); // Important for dynamically loaded content
  }, []); // Empty dependency array ensures it runs only once on mount

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RootWrapper /> {/* Use the wrapper component */}
    </Provider>
  </React.StrictMode>,
);