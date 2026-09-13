'use client';

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AboutPage as AboutComponent } from '../../components/AboutPage';

export default function About() {
  const { handleNavigate } = useStore();

  return <AboutComponent onNavigate={handleNavigate} />;
}
