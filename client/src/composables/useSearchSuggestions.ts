import { ref, computed } from 'vue';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'suggestion';
}

export function useSearchSuggestions(searchKey: string = 'default') {
  const recentSearches = ref<string[]>([]);
  const suggestions = ref<string[]>([]);
  const showSuggestions = ref(false);
  const selectedIndex = ref(-1);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(`${RECENT_SEARCHES_KEY}_${searchKey}`);
      if (stored) {
        recentSearches.value = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load recent searches:', e);
      recentSearches.value = [];
    }
  };

  // Save recent search
  const saveRecentSearch = (query: string) => {
    if (!query || query.trim().length === 0) return;
    
    const trimmed = query.trim();
    // Remove if already exists
    const index = recentSearches.value.indexOf(trimmed);
    if (index !== -1) {
      recentSearches.value.splice(index, 1);
    }
    
    // Add to beginning
    recentSearches.value.unshift(trimmed);
    
    // Keep only MAX_RECENT_SEARCHES
    if (recentSearches.value.length > MAX_RECENT_SEARCHES) {
      recentSearches.value = recentSearches.value.slice(0, MAX_RECENT_SEARCHES);
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(`${RECENT_SEARCHES_KEY}_${searchKey}`, JSON.stringify(recentSearches.value));
    } catch (e) {
      console.warn('Failed to save recent searches:', e);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    recentSearches.value = [];
    try {
      localStorage.removeItem(`${RECENT_SEARCHES_KEY}_${searchKey}`);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  };

  // Generate suggestions based on current query and available items
  const generateSuggestions = (query: string, items: any[], searchFields: string[] = ['name']) => {
    if (!query || query.trim().length < 2) {
      suggestions.value = [];
      return;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const matches: string[] = [];
    
    // Search in items
    for (const item of items) {
      for (const field of searchFields) {
        const value = item[field];
        if (value && typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          if (lowerValue.includes(lowerQuery) && !matches.includes(value)) {
            matches.push(value);
            if (matches.length >= 5) break; // Limit to 5 suggestions
          }
        }
      }
      if (matches.length >= 5) break;
    }
    
    suggestions.value = matches.slice(0, 5);
  };

  // Combined suggestions (recent + autocomplete)
  const allSuggestions = computed(() => {
    const result: SearchSuggestion[] = [];
    
    // Add recent searches (if query is empty or matches)
    if (recentSearches.value.length > 0) {
      recentSearches.value.forEach(search => {
        result.push({ text: search, type: 'recent' });
      });
    }
    
    // Add autocomplete suggestions
    suggestions.value.forEach(suggestion => {
      // Don't duplicate if already in recent
      if (!recentSearches.value.includes(suggestion)) {
        result.push({ text: suggestion, type: 'suggestion' });
      }
    });
    
    return result;
  });

  // Initialize
  loadRecentSearches();

  return {
    recentSearches,
    suggestions,
    showSuggestions,
    selectedIndex,
    allSuggestions,
    loadRecentSearches,
    saveRecentSearch,
    clearRecentSearches,
    generateSuggestions,
  };
}

