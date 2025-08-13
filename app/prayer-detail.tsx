import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRAYER_CATEGORIES } from '../constants/prayers';
import { Prayer } from '../types';
import { colors, commonStyles } from '../constants/styles';
import { StorageUtils } from '../utils/storage';

export default function PrayerDetailPage() {
  const { prayerId } = useLocalSearchParams<{ prayerId: string }>();
  const [prayer, setPrayer] = useState<Prayer | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (prayerId) {
      // Find the prayer in categories
      for (const category of PRAYER_CATEGORIES) {
        const foundPrayer = category.prayers.find(p => p.id === prayerId);
        if (foundPrayer) {
          setPrayer(foundPrayer);
          break;
        }
      }
    }
  }, [prayerId]);

  useEffect(() => {
    if (prayerId) {
      loadBookmarkStatus();
      // Add to recent prayers
      StorageUtils.addRecentPrayer(prayerId);
    }
  }, [prayerId]);

  const loadBookmarkStatus = async () => {
    if (prayerId) {
      const bookmarked = await StorageUtils.isBookmarked(prayerId);
      setIsBookmarked(bookmarked);
    }
  };

  const toggleBookmark = async () => {
    if (!prayerId) return;
    
    if (isBookmarked) {
      await StorageUtils.removeBookmark(prayerId);
      setIsBookmarked(false);
    } else {
      await StorageUtils.addBookmark(prayerId);
      setIsBookmarked(true);
    }
  };

  const markAsPrayed = async () => {
    if (!prayerId) return;
    
    await StorageUtils.incrementPrayerCount(prayerId);
    Alert.alert(
      'Prayer Completed',
      'Thank you for your prayer. May God bless you!',
      [{ text: 'Amen', style: 'default' }]
    );
  };

  if (!prayer) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Prayer not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
                          onPress={() => router.push('/main')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary[600]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {prayer.title}
          </Text>
          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.bookmarkButton}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={isBookmarked ? colors.primary[600] : colors.secondary[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Prayer Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.prayerCard}>
          <Text style={styles.prayerTitle}>
            {prayer.title}
          </Text>
          
          {prayer.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>
                About this prayer:
              </Text>
              <Text style={styles.descriptionText}>
                {prayer.description}
              </Text>
            </View>
          )}

          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              {prayer.content}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={markAsPrayed}
            style={styles.prayedButton}
          >
            <Ionicons name="heart" size={20} color="white" />
            <Text style={styles.buttonText}>Mark as Prayed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.shareButton}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.copyButton}
          >
            <Ionicons name="copy-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Copy</Text>
          </TouchableOpacity>
        </View>

        {/* Related Prayers */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>
            Related Prayers
          </Text>
          <View style={styles.relatedContainer}>
            {PRAYER_CATEGORIES
              .find(cat => cat.id === prayer.category)
              ?.prayers.filter(p => p.id !== prayer.id)
              .slice(0, 3)
              .map(relatedPrayer => (
                <TouchableOpacity
                  key={relatedPrayer.id}
                  onPress={() => router.push(`/prayer-detail?prayerId=${relatedPrayer.id}`)}
                  style={styles.relatedItem}
                >
                  <Text style={styles.relatedItemTitle}>
                    {relatedPrayer.title}
                  </Text>
                  {relatedPrayer.description && (
                    <Text style={styles.relatedItemDescription}>
                      {relatedPrayer.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: colors.secondary[600],
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[800],
    flex: 1,
    textAlign: 'center',
  },
  bookmarkButton: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  prayerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  descriptionCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  descriptionTitle: {
    color: colors.primary[800],
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    color: colors.secondary[700],
  },
  contentCard: {
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    padding: 24,
  },
  contentText: {
    color: colors.secondary[800],
    lineHeight: 28,
    fontSize: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  prayedButton: {
    flex: 1,
    backgroundColor: colors.yellow,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  copyButton: {
    flex: 1,
    backgroundColor: colors.secondary[500],
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    marginTop: 4,
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary[800],
    marginBottom: 12,
  },
  relatedContainer: {
    gap: 8,
  },
  relatedItem: {
    backgroundColor: colors.secondary[50],
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  relatedItemTitle: {
    color: colors.secondary[800],
    fontWeight: '600',
  },
  relatedItemDescription: {
    color: colors.secondary[600],
    fontSize: 14,
    marginTop: 4,
  },
});
