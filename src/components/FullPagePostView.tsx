'use client';

import React from 'react';
import { VacancyDetailPage } from './VacancyDetailPage';
import { VacancyItem, LanguageMode } from '../types';

interface FullPagePostViewProps {
  vacancy: VacancyItem;
  onBack: () => void;
  lang: LanguageMode;
  allVacancies: VacancyItem[];
  onSelectOtherVacancy: (item: VacancyItem) => void;
  isAdmin?: boolean;
  onSelectCategory?: (category: string) => void;
  onSearchKeyword?: (keyword: string) => void;
}

export const FullPagePostView: React.FC<FullPagePostViewProps> = (props) => {
  return <VacancyDetailPage {...props} />;
};

export default FullPagePostView;
