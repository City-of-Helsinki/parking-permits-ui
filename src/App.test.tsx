import React from 'react';
import { MemoryRouter } from 'react-router';
import App from './App';

it('renders without crashing', () => {
  <MemoryRouter>
    <App />
  </MemoryRouter>;
});
