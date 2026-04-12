import axios from 'axios'
import ReactDOM from 'react-dom/client'
import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import App from './App'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'


configureDayjs();
configureAxios();
const reactQueryClient = createReactQueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={reactQueryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
function configureDayjs() : void {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.tz.setDefault("Asia/Kolkata");
}

function configureAxios(): void {
 
  axios.defaults.xsrfCookieName = 'Racetik-XSRF-TOKEN';
  axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
  axios.defaults.baseURL = '/api/v1/';
}

function createReactQueryClient(): QueryClient{
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}