import React from 'react';
import ReactDOM from 'react-dom/client';
import { TrainingRoute } from './TrainingRoute';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <TrainingRoute />
    </React.StrictMode>
  );
}

