import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ConfigProvider } from 'antd';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#045ff3',
        },
      }}
    >
      <App />
    </ConfigProvider>
);
