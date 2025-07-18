import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import theme from 'themes/default.theme';
import GlobalStyles from 'themes/global.style';
import AuthProvider from 'context/AuthProvider';
import ChatProvider from 'context/ChatProvider';
import AppRoutes from './router';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';

const App = () => (
  <ThemeProvider theme={theme}>
    <ConfigProvider theme={{ hashed: false }}>
      <React.Fragment>
        <GlobalStyles />
        <BrowserRouter>
          <AuthProvider>
            <ChatProvider>
              <AppRoutes />
            </ChatProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.Fragment>
    </ConfigProvider>
  </ThemeProvider>
);
const root = createRoot(document.getElementById('root'));
root.render(<App />);
