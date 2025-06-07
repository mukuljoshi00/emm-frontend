import React from 'react';
import AppRouter from './AppRouter';
import './app.css';

const App: React.FC = () => {
    return (
        <div style={{ height: '100%', width: '100%' }}>
            <AppRouter />
        </div>
    );
};

export default App;