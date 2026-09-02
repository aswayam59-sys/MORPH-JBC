/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EventProvider, useEvent } from './context/EventContext';
import { LandingPage } from './components/LandingPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { TeamLogin } from './components/TeamLogin';
import { TeamDashboard } from './components/TeamDashboard';

const MainRouter: React.FC = () => {
  const { currentView } = useEvent();

  switch (currentView) {
    case 'admin-login':
      return <AdminLogin />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'team-login':
      return <TeamLogin />;
    case 'team-dashboard':
      return <TeamDashboard />;
    case 'landing':
    default:
      return <LandingPage />;
  }
};

export default function App() {
  return (
    <EventProvider>
      <MainRouter />
    </EventProvider>
  );
}
