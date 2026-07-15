export const SEARCH_FIELD_MIN_WIDTH = 240;
export const SEARCH_LAYOUT_GAP = 8;
export const SEARCH_ACTIONS_WIDTH = 248;

export const calculateSearchColumns = (containerWidth: number, maxColumns: number, fieldCount: number) => {
  const limit = Math.max(1, Math.min(Math.floor(maxColumns), Math.max(1, fieldCount)));
  if (!containerWidth) return limit;

  const availableWidth = containerWidth - SEARCH_ACTIONS_WIDTH - SEARCH_LAYOUT_GAP;
  const columns = Math.floor((availableWidth + SEARCH_LAYOUT_GAP) / (SEARCH_FIELD_MIN_WIDTH + SEARCH_LAYOUT_GAP));
  return Math.min(limit, Math.max(1, columns));
};
