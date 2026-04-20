import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './AppLayout';
import { ContainerDetailScreen } from './screens/ContainerDetailScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { ProjectDetailScreen } from './screens/ProjectDetailScreen';
import { ProjectsListScreen } from './screens/ProjectsListScreen';
import { StorageUnitDetailScreen } from './screens/StorageUnitDetailScreen';

import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="storage-units/:id" element={<StorageUnitDetailScreen />} />
        <Route path="containers/:id" element={<ContainerDetailScreen />} />
        <Route path="items/:id" element={<ItemDetailScreen />} />
        <Route path="projects" element={<ProjectsListScreen />} />
        <Route path="projects/:id" element={<ProjectDetailScreen />} />
        <Route
          path="order"
          element={<PlaceholderScreen title="Order list">Phase 6.</PlaceholderScreen>}
        />
        <Route
          path="settings"
          element={<PlaceholderScreen title="Settings">Phase 9.</PlaceholderScreen>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
