import './App.css';
import "@fortawesome/fontawesome-svg-core/styles.css";
import React, { useState } from 'react';
import UserAuth from "./Auth.js"
import Dashboard from "./Dashboard"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/it';

const App = () => {
  const [clientId, setClientId] = useState('');

  const handleLogin = uid => {
    console.log(uid)
    setClientId(uid)
  }

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        {<div>
          {clientId ? <Dashboard clientId={clientId} />
            : <UserAuth onLogin={handleLogin} />}
        </div>}
      </LocalizationProvider>
    </div>
  );
};

export default App;
