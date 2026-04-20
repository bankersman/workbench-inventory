import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './AppLayout';
import { ContainerDetailScreen } from './screens/ContainerDetailScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { OrderListScreen } from './screens/OrderListScreen';
import { SettingsScreen } from './screens/SettingsScreen';
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
        <Route path="order" element={<OrderListScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
