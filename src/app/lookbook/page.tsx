'use client';

import React from 'react';
import { useStore } from '../../context/StoreContext';
import { LookbookPage as LookbookComponent } from '../../components/LookbookPage';

export default function Lookbook() {
  const { handleNavigate, setSelectedLook } = useStore();

  return (
    <LookbookComponent
      onNavigate={handleNavigate}
      onOpenLookModal={(look) => setSelectedLook(look)}
    />
  );
}
