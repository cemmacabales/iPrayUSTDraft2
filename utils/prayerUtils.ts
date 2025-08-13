import { Prayer, PrayerCategory } from '../types';
import { PRAYER_CATEGORIES } from '../constants/prayers';

export interface PrayerOfTheDay {
  prayer: Prayer;
  reason: string;
  category: string;
}

// Get all prayers from all categories
export const getAllPrayers = (): Prayer[] => {
  return PRAYER_CATEGORIES.flatMap(category => 
    category.prayers.map(prayer => ({
      ...prayer,
      category: category.id
    }))
  );
};

// Get prayers by category
const getPrayersByCategory = (categoryId: string): Prayer[] => {
  const category = PRAYER_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.prayers : [];
};

// Get current time-based context
export const getTimeContext = () => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  return {
    hour,
    dayOfWeek,
    isMorning: hour >= 6 && hour < 12,
    isAfternoon: hour >= 12 && hour < 18,
    isEvening: hour >= 18 || hour < 6,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
  };
};

// Get prayer of the day based on various factors
export const getPrayerOfTheDay = (): PrayerOfTheDay => {
  const context = getTimeContext();
  const allPrayers = getAllPrayers();
  
  // Time-based prayer selection
  if (context.isMorning) {
    const morningPrayers = allPrayers.filter(prayer => 
      prayer.id === 'before-study' || 
      prayer.id === 'guardian-angel' ||
      prayer.id === 'morning-prayer'
    );
    
    if (morningPrayers.length > 0) {
      const selectedPrayer = morningPrayers[Math.floor(Math.random() * morningPrayers.length)];
      return {
        prayer: selectedPrayer,
        reason: 'Perfect for starting your day with prayer',
        category: selectedPrayer.category
      };
    }
  }
  
  if (context.isEvening) {
    const eveningPrayers = allPrayers.filter(prayer => 
      prayer.id === 'angelus' || 
      prayer.id === 'guardian-angel'
    );
    
    if (eveningPrayers.length > 0) {
      const selectedPrayer = eveningPrayers[Math.floor(Math.random() * eveningPrayers.length)];
      return {
        prayer: selectedPrayer,
        reason: 'A peaceful prayer to end your day',
        category: selectedPrayer.category
      };
    }
  }
  
  // Day-of-week based selection
  if (context.dayOfWeek === 1) { // Monday
    const mondayPrayers = allPrayers.filter(prayer => 
      prayer.id === 'before-study' || 
      prayer.id === 'guardian-angel'
    );
    
    if (mondayPrayers.length > 0) {
      const selectedPrayer = mondayPrayers[Math.floor(Math.random() * mondayPrayers.length)];
      return {
        prayer: selectedPrayer,
        reason: 'Start your week with spiritual guidance',
        category: selectedPrayer.category
      };
    }
  }
  
  if (context.dayOfWeek === 5) { // Friday
    const fridayPrayers = allPrayers.filter(prayer => 
      prayer.id === 'st-michael' || 
      prayer.id === 'act-contrition'
    );
    
    if (fridayPrayers.length > 0) {
      const selectedPrayer = fridayPrayers[Math.floor(Math.random() * fridayPrayers.length)];
      return {
        prayer: selectedPrayer,
        reason: 'Reflect and prepare for the weekend',
        category: selectedPrayer.category
      };
    }
  }
  
  if (context.dayOfWeek === 0) { // Sunday
    const sundayPrayers = allPrayers.filter(prayer => 
      prayer.id === 'rosary-intro' || 
      prayer.id === 'sacred-heart'
    );
    
    if (sundayPrayers.length > 0) {
      const selectedPrayer = sundayPrayers[Math.floor(Math.random() * sundayPrayers.length)];
      return {
        prayer: selectedPrayer,
        reason: 'Sunday is perfect for deeper devotion',
        category: selectedPrayer.category
      };
    }
  }
  
  // Fallback: rotate through different categories based on day
  const categoryRotation = [
    'devotional',
    'protection', 
    'consecrations',
    'marian',
    'other'
  ];
  
  const categoryIndex = context.dayOfWeek % categoryRotation.length;
  const selectedCategory = categoryRotation[categoryIndex];
  const categoryPrayers = getPrayersByCategory(selectedCategory);
  
  if (categoryPrayers.length > 0) {
    const selectedPrayer = categoryPrayers[Math.floor(Math.random() * categoryPrayers.length)];
    const category = PRAYER_CATEGORIES.find(cat => cat.id === selectedCategory);
    
    return {
      prayer: selectedPrayer,
      reason: `Featured ${category?.title.toLowerCase()} prayer`,
      category: selectedCategory
    };
  }
  
  // Ultimate fallback
  const fallbackPrayer = allPrayers[Math.floor(Math.random() * allPrayers.length)];
  return {
    prayer: fallbackPrayer,
    reason: 'A prayer for your spiritual journey',
    category: fallbackPrayer.category
  };
};

// Get contextual subtitle based on prayer and time
export const getPrayerSubtitle = (prayer: Prayer, reason: string): string => {
  const context = getTimeContext();
  
  switch (prayer.id) {
    case 'angelus':
      return 'Traditional prayer at 6am, noon, 6pm';
    case 'before-study':
      return 'Perfect for students before classes';
    case 'before-exams':
      return 'Find peace and clarity before tests';
    case 'guardian-angel':
      return 'Seek protection and guidance';
    case 'st-michael':
      return 'Powerful protection against evil';
    case 'rosary-intro':
      return 'Meditation on the life of Christ';
    case 'sacred-heart':
      return 'Complete consecration to Jesus';
    case 'immaculate-heart':
      return 'Consecration to Mary\'s heart';
    default:
      return reason;
  }
};

// Get appropriate icon for prayer
export const getPrayerIcon = (prayer: Prayer): string => {
  switch (prayer.id) {
    case 'angelus':
      return 'heart';
    case 'before-study':
    case 'before-exams':
      return 'school';
    case 'guardian-angel':
      return 'shield';
    case 'st-michael':
      return 'flash';
    case 'rosary-intro':
      return 'rose';
    case 'sacred-heart':
    case 'immaculate-heart':
      return 'heart-circle';
    case 'act-contrition':
      return 'refresh';
    case 'dominican-blessing':
      return 'star';
    default:
      return 'book';
  }
};
