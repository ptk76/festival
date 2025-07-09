import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import DataBase from "./db/db";
import DataBaseFacade, { DataBaseFacadeContext } from "./db/db_facade";

document.body.style.margin = '0px';
document.body.style.fontFamily = 'system-ui';
document.body.style.userSelect = 'none';

DataBase.getInstance().then((db: DataBase) => {
  const dbFacade = new DataBaseFacade(db);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <DataBaseFacadeContext value={dbFacade}>
        <App />
      </DataBaseFacadeContext>
    </StrictMode>,
  )
}).catch((error) => {
  console.error("Failed to initialize database:", error);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <div>Error: {error.message}</div>
    </StrictMode>,
  );
})
