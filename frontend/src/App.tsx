// import { ChakraProvider } from '@chakra-ui/react';
// import Home from './pages/Home';

// const App: React.FC = () => {
//   return (
//     <ChakraProvider>
//       <Home />
//     </ChakraProvider>
//   );
// };

// export default App;

import React from 'react';
// import logo from './logo.svg';
import './App.css';


// const App: React.FC = () => {
//     return <div>Hello, World!</div>;
// };

// export default App;

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
