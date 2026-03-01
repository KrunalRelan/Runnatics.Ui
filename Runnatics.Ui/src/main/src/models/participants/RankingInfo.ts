// Ranking information model

export interface RankingInfo {
  overallRank: number | null;
  totalParticipants: number | null;
  overallPercentage: number | null;
  genderRank: number | null;
  totalInGender: number | null;
  genderPercentage: number | null;
  categoryRank: number | null;
  totalInCategory: number | null;
  categoryPercentage: number | null;
  allCategoriesRank: number | null;
  totalAllCategories: number | null;
  allCategoriesPercentage: number | null;
}
