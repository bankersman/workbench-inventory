import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './AppLayout';
import { BomLineCreateScreen } from './screens/BomLineCreateScreen';
import { BomLineEditScreen } from './screens/BomLineEditScreen';
import { CategoryCreateScreen } from './screens/CategoryCreateScreen';
import { CategoryEditScreen } from './screens/CategoryEditScreen';
import { ContainerCreateScreen } from './screens/ContainerCreateScreen';
import { ContainerDetailScreen } from './screens/ContainerDetailScreen';
import { ContainerEditScreen } from './screens/ContainerEditScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ItemAdjustScreen } from './screens/ItemAdjustScreen';
import { ItemCreateScreen } from './screens/ItemCreateScreen';
import { ItemDetailScreen } from './screens/ItemDetailScreen';
import { ItemEditScreen } from './screens/ItemEditScreen';
import { ItemsListScreen } from './screens/ItemsListScreen';
import { OrderListScreen } from './screens/OrderListScreen';
import { ProjectCreateScreen } from './screens/ProjectCreateScreen';
import { ProjectDetailScreen } from './screens/ProjectDetailScreen';
import { ProjectEditScreen } from './screens/ProjectEditScreen';
import { ProjectsListScreen } from './screens/ProjectsListScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { StorageUnitCreateScreen } from './screens/StorageUnitCreateScreen';
import { StorageUnitDetailScreen } from './screens/StorageUnitDetailScreen';
import { StorageUnitEditScreen } from './screens/StorageUnitEditScreen';

import './App.css';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="inventory/new" element={<StorageUnitCreateScreen />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="storage-units/:id/containers/new" element={<ContainerCreateScreen />} />
        <Route path="storage-units/:id/edit" element={<StorageUnitEditScreen />} />
        <Route path="storage-units/:id" element={<StorageUnitDetailScreen />} />
        <Route path="containers/:id/edit" element={<ContainerEditScreen />} />
        <Route path="containers/:id" element={<ContainerDetailScreen />} />
        <Route path="items/new" element={<ItemCreateScreen />} />
        <Route path="items/:id/edit" element={<ItemEditScreen />} />
        <Route path="items/:id/adjust" element={<ItemAdjustScreen />} />
        <Route path="items/:id" element={<ItemDetailScreen />} />
        <Route path="items" element={<ItemsListScreen />} />
        <Route path="projects/new" element={<ProjectCreateScreen />} />
        <Route path="projects/:id/bom/new" element={<BomLineCreateScreen />} />
        <Route path="projects/:id/bom/:lineId/edit" element={<BomLineEditScreen />} />
        <Route path="projects/:id/edit" element={<ProjectEditScreen />} />
        <Route path="projects/:id" element={<ProjectDetailScreen />} />
        <Route path="projects" element={<ProjectsListScreen />} />
        <Route path="order" element={<OrderListScreen />} />
        <Route path="settings/categories/new" element={<CategoryCreateScreen />} />
        <Route path="settings/categories/:categoryId/edit" element={<CategoryEditScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
