import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Image, TextInput, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRAYER_CATEGORIES } from '../constants/prayers';
import { PrayerCategory, Prayer } from '../types';
import { colors, commonStyles } from '../constants/styles';
import { StorageUtils } from '../utils/storage';
import { getTimeContext } from '../utils/prayerUtils';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSkeleton from '../components/LoadingSkeleton';

const { width, height } = Dimensions.get('window');

interface GridItem {
  id: string;
  type: 'prayer' | 'category' | 'featured';
  data: Prayer | PrayerCategory;
  section: string;
}

interface SectionData {
  title: string;
  icon: string;
  color: string;
  data: GridItem[];
}

interface PrayersPageProps {
  prayerId?: string;
}

export default function PrayersPage({ prayerId }: PrayersPageProps) {
  const [activeSection, setActiveSection] = useState<'my-library' | 'ust-library'>('my-library');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [recentPrayers, setRecentPrayers] = useState<string[]>([]);
  const [prayerStats, setPrayerStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
  }, []);

  // Handle prayerId prop to automatically select prayer
  useEffect(() => {
    if (prayerId) {
      const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
      const prayer = allPrayers.find(p => p.id === prayerId);
      if (prayer) {
        setSelectedPrayer(prayer);
        setNavigationHistory([prayer.id]);
        // Add to recent prayers
        StorageUtils.addRecentPrayer(prayer.id);
      }
    }
  }, [prayerId]);

  const loadUserData = async () => {
    try {
      const [bookmarksData, recentData, statsData] = await Promise.all([
        StorageUtils.getBookmarks(),
        StorageUtils.getRecentPrayers(),
        StorageUtils.getPrayerStats(),
      ]);
      setBookmarks(bookmarksData);
      setRecentPrayers(recentData);
      setPrayerStats(statsData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (section: 'my-library' | 'ust-library') => {
    setActiveSection(section);
    setSearchQuery(''); // Clear search when switching sections
    setExpandedSection(null); // Reset expanded section when switching
    setSelectedPrayer(null); // Close any open prayer
    setNavigationHistory([]); // Clear navigation history
  };

  const handlePrayerSelect = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setNavigationHistory(prev => [...prev, prayer.id]);
    // Add to recent prayers
    StorageUtils.addRecentPrayer(prayer.id);
  };

  const handleBackPress = () => {
    if (selectedPrayer) {
      // Remove current prayer from history
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      
      if (newHistory.length === 0) {
        // No more history, go back to library view
        setSelectedPrayer(null);
      } else {
        // Go back to previous prayer
        const previousPrayerId = newHistory[newHistory.length - 1];
        const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
        const previousPrayer = allPrayers.find(p => p.id === previousPrayerId);
        if (previousPrayer) {
          setSelectedPrayer(previousPrayer);
        } else {
          setSelectedPrayer(null);
        }
      }
    } else {
      // If no prayer is selected, go back to main screen
      router.push('/main');
    }
  };

  const getTotalItemsForSection = (sectionId: string): number => {
    switch (sectionId) {
      case 'bookmarks':
        return getBookmarkedPrayers().length;
      case 'recent':
        return getRecentPrayersData().length;
      case 'popular':
        return getPopularPrayers().length;
      case 'time-based':
        return getTimeBasedPrayers().length;
      default:
        // For category sections
        const category = PRAYER_CATEGORIES.find(cat => cat.id === sectionId);
        return category ? category.prayers.length : 0;
    }
  };

  const handleSeeAllPress = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null); // Collapse
    } else {
      setExpandedSection(sectionId); // Expand
    }
  };

  const getBookmarkedPrayers = (): Prayer[] => {
    const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
    return allPrayers.filter(prayer => bookmarks.includes(prayer.id));
  };

  const getRecentPrayersData = (): Prayer[] => {
    const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
    return recentPrayers
      .map(id => allPrayers.find(prayer => prayer.id === id))
      .filter(Boolean) as Prayer[];
  };

  const getPopularPrayers = (): Prayer[] => {
    const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
    return allPrayers
      .filter(prayer => prayerStats[prayer.id] > 0)
      .sort((a, b) => (prayerStats[b.id] || 0) - (prayerStats[a.id] || 0))
      .slice(0, 4);
  };

  const getTimeBasedPrayers = (): Prayer[] => {
    const context = getTimeContext();
    const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
    
    if (context.isMorning) {
      return allPrayers.filter(prayer => 
        prayer.title.toLowerCase().includes('morning') ||
        prayer.title.toLowerCase().includes('study') ||
        prayer.id === 'angelus'
      ).slice(0, 4);
    }
    
    if (context.isEvening) {
      return allPrayers.filter(prayer => 
        prayer.title.toLowerCase().includes('evening') ||
        prayer.title.toLowerCase().includes('contrition') ||
        prayer.id === 'guardian-angel'
      ).slice(0, 4);
    }
    
    return [];
  };

  const filterPrayersBySearch = (prayers: Prayer[]): Prayer[] => {
    if (!searchQuery.trim()) return prayers;
    
    const query = searchQuery.toLowerCase();
    return prayers.filter(prayer => 
      prayer.title.toLowerCase().includes(query) ||
      prayer.description?.toLowerCase().includes(query) ||
      prayer.category.toLowerCase().includes(query)
    );
  };

  const getMyLibrarySections = (): SectionData[] => {
    const sections: SectionData[] = [];
    
    if (bookmarks.length > 0) {
      const filteredBookmarks = filterPrayersBySearch(getBookmarkedPrayers());
      if (filteredBookmarks.length > 0) {
        const isExpanded = expandedSection === 'bookmarks';
        const displayPrayers = isExpanded ? filteredBookmarks : filteredBookmarks.slice(0, 4);
        sections.push({
          title: 'My Bookmarks',
          icon: 'bookmark',
          color: colors.yellow,
          data: displayPrayers.map(prayer => ({
            id: prayer.id,
            type: 'prayer' as const,
            data: prayer,
            section: 'bookmarks'
          }))
        });
      }
    }

    if (recentPrayers.length > 0) {
      const filteredRecent = filterPrayersBySearch(getRecentPrayersData());
      if (filteredRecent.length > 0) {
        const isExpanded = expandedSection === 'recent';
        const displayPrayers = isExpanded ? filteredRecent : filteredRecent.slice(0, 4);
        sections.push({
          title: 'Recently Viewed',
          icon: 'time',
          color: colors.primary[600],
          data: displayPrayers.map(prayer => ({
            id: prayer.id,
            type: 'prayer' as const,
            data: prayer,
            section: 'recent'
          }))
        });
      }
    }

    if (getPopularPrayers().length > 0) {
      const filteredPopular = filterPrayersBySearch(getPopularPrayers());
      if (filteredPopular.length > 0) {
        const isExpanded = expandedSection === 'popular';
        const displayPrayers = isExpanded ? filteredPopular : filteredPopular.slice(0, 4);
        sections.push({
          title: 'Most Prayed',
          icon: 'trending-up',
          color: colors.primary[600],
          data: displayPrayers.map(prayer => ({
            id: prayer.id,
            type: 'prayer' as const,
            data: prayer,
            section: 'popular'
          }))
        });
      }
    }

    return sections;
  };

  const getUSTLibrarySections = (): SectionData[] => {
    const sections: SectionData[] = [];
    
    const timeBasedPrayers = getTimeBasedPrayers();
    if (timeBasedPrayers.length > 0) {
      const filteredTimeBased = filterPrayersBySearch(timeBasedPrayers);
      if (filteredTimeBased.length > 0) {
        const isExpanded = expandedSection === 'time-based';
        const displayPrayers = isExpanded ? filteredTimeBased : filteredTimeBased.slice(0, 4);
        sections.push({
          title: 'Perfect for Now',
          icon: 'sunny',
          color: colors.yellow,
          data: displayPrayers.map(prayer => ({
            id: prayer.id,
            type: 'prayer' as const,
            data: prayer,
            section: 'time-based'
          }))
        });
      }
    }

    // Add categories as sections
    PRAYER_CATEGORIES.forEach(category => {
      const filteredPrayers = filterPrayersBySearch(category.prayers);
      if (filteredPrayers.length > 0) {
        const isExpanded = expandedSection === category.id;
        const displayPrayers = isExpanded ? filteredPrayers : filteredPrayers.slice(0, 4);
        sections.push({
          title: category.title,
          icon: category.icon,
          color: colors.primary[600],
          data: displayPrayers.map(prayer => ({
            id: prayer.id,
            type: 'prayer' as const,
            data: prayer,
            section: category.id
          }))
        });
      }
    });

    return sections;
  };

  const renderPrayerCard = ({ item }: { item: GridItem }) => {
    const prayer = item.data as Prayer;
    const isBookmarked = bookmarks.includes(prayer.id);
    const prayerCount = prayerStats[prayer.id] || 0;

    return (
      <View
        style={styles.prayerCard}
      >
        <TouchableOpacity
          onPress={() => handlePrayerSelect(prayer)}
          style={styles.prayerCardTouchable}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[colors.white, colors.primary[50]]}
            style={styles.prayerCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.prayerCardHeader}>
              <View style={styles.prayerCardIcon}>
                <Ionicons 
                  name={isBookmarked ? 'bookmark' : 'book-outline'} 
                  size={16} 
                  color={isBookmarked ? colors.yellow : colors.primary[600]} 
                />
              </View>
              {prayerCount > 0 && (
                <View style={styles.prayerCount}>
                  <Text style={styles.prayerCountText}>{prayerCount}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.prayerCardContent}>
              <Text style={styles.prayerCardTitle} numberOfLines={2}>
                {prayer.title}
              </Text>
              {prayer.description && (
                <Text style={styles.prayerCardDescription} numberOfLines={3}>
                  {prayer.description}
                </Text>
              )}
            </View>

            <View style={styles.prayerCardFooter}>
              <View style={styles.prayerCardMeta}>
                <Ionicons name="time-outline" size={12} color={colors.secondary[500]} />
                <Text style={styles.prayerCardMetaText}>
                  {prayerCount > 0 ? `${prayerCount} times prayed` : 'New prayer'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionData }) => {
    const isExpanded = expandedSection === section.data[0]?.section;
    const totalItems = getTotalItemsForSection(section.data[0]?.section);
    const showSeeAll = totalItems > 4;
    
    return (
      <View
        style={styles.sectionHeader}
      >
        <View style={styles.sectionHeaderContent}>
          <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
            <Ionicons name={section.icon as any} size={20} color={section.color} />
          </View>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
        {showSeeAll && (
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => handleSeeAllPress(section.data[0]?.section)}
          >
            <Text style={styles.seeAllText}>
              {isExpanded ? 'Show Less' : `See All (${totalItems})`}
            </Text>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-forward"} 
              size={16} 
              color={colors.primary[600]} 
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSection = ({ item }: { item: SectionData }) => (
    <View style={styles.sectionContainer}>
      {renderSectionHeader({ section: item })}
      <FlatList
        data={item.data}
        renderItem={renderPrayerCard}
        keyExtractor={(prayerItem) => prayerItem.id}
        horizontal={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.sectionContent}
      />
    </View>
  );

  const renderSearchResults = () => {
    const allPrayers = PRAYER_CATEGORIES.flatMap(category => category.prayers);
    const filteredPrayers = filterPrayersBySearch(allPrayers);
    
    if (filteredPrayers.length === 0) {
      return (
        <View style={styles.searchEmptyState}>
          <Ionicons name="search-outline" size={48} color={colors.secondary[400]} />
          <Text style={styles.searchEmptyTitle}>No prayers found</Text>
          <Text style={styles.searchEmptyDescription}>
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    const isExpanded = expandedSection === 'search';
    const displayPrayers = isExpanded ? filteredPrayers : filteredPrayers.slice(0, 4);
    
    const searchSection: SectionData = {
      title: `Search Results (${filteredPrayers.length})`,
      icon: 'search',
      color: colors.primary[600],
      data: displayPrayers.map(prayer => ({
        id: prayer.id,
        type: 'prayer' as const,
        data: prayer,
        section: 'search'
      }))
    };

    return (
      <View style={styles.searchResultsContainer}>
        <View
          style={styles.sectionHeader}
        >
          <View style={styles.sectionHeaderContent}>
            <View style={[styles.sectionIcon, { backgroundColor: searchSection.color + '20' }]}>
              <Ionicons name={searchSection.icon as any} size={20} color={searchSection.color} />
            </View>
            <Text style={styles.sectionTitle}>{searchSection.title}</Text>
          </View>
          {filteredPrayers.length > 4 && (
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => handleSeeAllPress('search')}
            >
              <Text style={styles.seeAllText}>
                {isExpanded ? 'Show Less' : `See All (${filteredPrayers.length})`}
              </Text>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-forward"} 
                size={16} 
                color={colors.primary[600]} 
              />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          data={searchSection.data}
          renderItem={renderPrayerCard}
          keyExtractor={(item) => item.id}
          horizontal={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.searchResultsContent}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyStateContent,
        ]}
      >
        <View style={styles.emptyStateIcon}>
          <Ionicons name="library-outline" size={64} color={colors.secondary[400]} />
        </View>
        <Text style={styles.emptyStateTitle}>Your Library is Empty</Text>
        <Text style={styles.emptyStateDescription}>
          Start by bookmarking your favorite prayers or exploring the UST Library
        </Text>
        <TouchableOpacity
          onPress={() => setActiveSection('ust-library')}
          style={styles.emptyStateButton}
        >
          <Text style={styles.emptyStateButtonText}>Explore UST Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoadingState = () => <LoadingSkeleton />;

  const renderPrayerDetail = () => {
    if (!selectedPrayer) return null;

    const isBookmarked = bookmarks.includes(selectedPrayer.id);
    const prayerCount = prayerStats[selectedPrayer.id] || 0;

    const handleShare = () => {
      // Share functionality
      console.log('Share prayer:', selectedPrayer.title);
    };

    const handleCopy = () => {
      // Copy to clipboard functionality
      console.log('Copy prayer content');
    };

    return (
      <View style={styles.prayerDetailContainer}>
        <ScrollView style={styles.prayerDetailScrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.prayerDetailCard}>
            <View style={styles.prayerDetailHeader}>
              <View style={styles.prayerDetailHeaderContent}>
                <Text style={styles.prayerDetailTitle}>{selectedPrayer.title}</Text>
                {selectedPrayer.description && (
                  <Text style={styles.prayerDetailSubtitle}>{selectedPrayer.description}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={async () => {
                  if (isBookmarked) {
                    await StorageUtils.removeBookmark(selectedPrayer.id);
                    setBookmarks(prev => prev.filter(id => id !== selectedPrayer.id));
                  } else {
                    await StorageUtils.addBookmark(selectedPrayer.id);
                    setBookmarks(prev => [...prev, selectedPrayer.id]);
                  }
                }}
                style={styles.prayerDetailBookmarkButton}
              >
                <Ionicons 
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                  size={24} 
                  color={isBookmarked ? colors.yellow : colors.primary[600]} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.prayerDetailContent}>
              <View style={styles.prayerDetailMeta}>
                <View style={styles.prayerDetailMetaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.secondary[500]} />
                  <Text style={styles.prayerDetailMetaText}>
                    {prayerCount > 0 ? `Prayed ${prayerCount} times` : 'New prayer'}
                  </Text>
                </View>
                <View style={styles.prayerDetailMetaItem}>
                  <Ionicons name="folder-outline" size={16} color={colors.secondary[500]} />
                  <Text style={styles.prayerDetailMetaText}>
                    {selectedPrayer.category}
                  </Text>
                </View>
              </View>

              <View style={styles.prayerDetailTextContainer}>
                <Text style={styles.prayerDetailText}>{selectedPrayer.content}</Text>
              </View>
            </View>

            <View style={styles.prayerDetailActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={colors.primary[600]} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color={colors.primary[600]} />
                <Text style={styles.actionButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, isBookmarked && styles.saveButton]} 
                onPress={async () => {
                  if (isBookmarked) {
                    await StorageUtils.removeBookmark(selectedPrayer.id);
                    setBookmarks(prev => prev.filter(id => id !== selectedPrayer.id));
                  } else {
                    await StorageUtils.addBookmark(selectedPrayer.id);
                    setBookmarks(prev => [...prev, selectedPrayer.id]);
                  }
                }}
              >
                <Ionicons 
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
                  size={20} 
                  color={isBookmarked ? colors.white : colors.primary[600]} 
                />
                <Text style={[styles.actionButtonText, isBookmarked && styles.saveButtonText]}>
                  {isBookmarked ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const sections = activeSection === 'my-library' ? getMyLibrarySections() : getUSTLibrarySections();

  if (isLoading) {
    return (
      <View style={[commonStyles.container, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prayer Library</Text>
        </View>
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, styles.container]}>
      {/* Header */}
      <View 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {selectedPrayer ? selectedPrayer.title : 'Prayer Library'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {selectedPrayer 
                ? selectedPrayer.category 
                : activeSection === 'my-library' ? 'Your personal collection' : 'UST\'s curated library'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      {!selectedPrayer && (
        <View
          style={styles.searchContainer}
        >
          <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={isSearchFocused ? colors.primary[600] : colors.secondary[500]} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search prayers..."
              placeholderTextColor={colors.secondary[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={colors.secondary[500]} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Section Tabs */}
      {!selectedPrayer && (
        <View style={styles.sectionTabs}>
          <TouchableOpacity
            onPress={() => handleSectionChange('my-library')}
            style={[styles.sectionTab, activeSection === 'my-library' && styles.sectionTabActive]}
          >
            <Ionicons 
              name="library" 
              size={20} 
              color={activeSection === 'my-library' ? colors.white : colors.primary[600]} 
            />
            <Text style={[styles.sectionTabText, activeSection === 'my-library' && styles.sectionTabTextActive]}>
              My Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSectionChange('ust-library')}
            style={[styles.sectionTab, activeSection === 'ust-library' && styles.sectionTabActive]}
          >
            <Ionicons 
              name="school" 
              size={20} 
              color={activeSection === 'ust-library' ? colors.white : colors.primary[600]} 
            />
            <Text style={[styles.sectionTabText, activeSection === 'ust-library' && styles.sectionTabTextActive]}>
              UST Library
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {selectedPrayer ? (
        renderPrayerDetail()
      ) : searchQuery.trim() ? (
        renderSearchResults()
      ) : activeSection === 'my-library' && sections.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sections}
          renderItem={renderSection}
          keyExtractor={(section) => section.title}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainContent}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary[50],
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[800],
  },
  headerSubtitle: {
    color: colors.secondary[600],
    marginTop: 4,
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  searchBarFocused: {
    borderColor: colors.primary[600],
    backgroundColor: colors.white,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.primary[800],
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    gap: 8,
  },
  sectionTabActive: {
    backgroundColor: colors.primary[600],
  },
  sectionTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[600],
  },
  sectionTabTextActive: {
    color: colors.white,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 0,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary[800],
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
    marginRight: 4,
  },
  prayerCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: 4,
  },
  prayerCardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  prayerCardGradient: {
    padding: 16,
    minHeight: 160,
  },
  prayerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  prayerCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerCount: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  prayerCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  prayerCardContent: {
    flex: 1,
  },
  prayerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary[800],
    marginBottom: 8,
    lineHeight: 20,
  },
  prayerCardDescription: {
    color: colors.secondary[600],
    fontSize: 13,
    lineHeight: 18,
  },
  prayerCardFooter: {
    marginTop: 12,
  },
  prayerCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerCardMetaText: {
    fontSize: 12,
    color: colors.secondary[500],
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary[800],
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.secondary[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  searchEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  searchEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary[800],
    marginTop: 16,
    marginBottom: 8,
  },
  searchEmptyDescription: {
    fontSize: 14,
    color: colors.secondary[600],
    textAlign: 'center',
  },
  listFooter: {
    height: 100, // Add some space at the bottom
  },
  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionContent: {
    paddingHorizontal: 0, // No horizontal padding for FlatList
  },
  searchResultsContainer: {
    marginTop: 24,
  },
  searchResultsContent: {
    paddingHorizontal: 0, // No horizontal padding for FlatList
  },
  prayerDetailContainer: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
  },
  prayerDetailScrollView: {
    flex: 1,
  },
  prayerDetailCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  prayerDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  prayerDetailHeaderContent: {
    flex: 1,
  },
  prayerDetailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[800],
    marginBottom: 8,
  },
  prayerDetailSubtitle: {
    fontSize: 16,
    color: colors.secondary[600],
    marginBottom: 16,
  },
  prayerDetailBookmarkButton: {
    padding: 8,
  },
  prayerDetailContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  prayerDetailMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  prayerDetailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerDetailMetaText: {
    fontSize: 14,
    color: colors.secondary[500],
    marginLeft: 8,
  },
  prayerDetailTextContainer: {
    flex: 1,
  },
  prayerDetailText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.primary[800],
  },
  prayerDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  saveButton: {
    backgroundColor: colors.primary[600],
  },
  saveButtonText: {
    color: colors.white,
  },

});
