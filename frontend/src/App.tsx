import { useState } from 'react'
import './App.css'
import SearchBar from './SearchBar';
import Table from './Table';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

const App: React.FC = () => {
    const [totalResults, setTotalResults] = useState(0);
    // const [results, setResults] = useState<{ [key: string]: any }>({});
    const [results, setResults] = useState<any[]>([]); // Use an array for "documents"

    const handleSearch = async (query: string) => {

        // Send the query to the backend
        const response = await fetch(`/api/search?keywords=${encodeURIComponent(query)}`);
        const data = await response.json();

        // Set the message from the backend
        setTotalResults(data.total || 0);
        setResults(data.message || []);
    };

    
    return (
        <div style={{ padding: "2rem" }}>
            <h1>ClassDore Search</h1>

            <div style={{ width: "100%" }}>

                <SearchBar onSearch={handleSearch} placeholder="Search for something..."/>

                <p> {totalResults} total results </p>

                <Table data={results}/>

                {/* <ul>
                    {results.map((result: any, index: Key | null | undefined) => (
                        <li key={index}>
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                        </li>
                    ))}
                </ul> */}
            </div>
        </div>
    );


    // // Mock data to search
    // const data = ["React", "Vite", "TypeScript", "Frontend", "JavaScript", "Backend"];

    // const handleSearch = (query: string) => {
    //     // Filter data based on the query
    //     const filteredResults = data.filter(item =>
    //         item.toLowerCase().includes(query.toLowerCase())
    //     );
    //     setResults(filteredResults);
    // };
};

export default App;

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
