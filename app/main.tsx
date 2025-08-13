import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Vibration } from 'react-native';
import { colors } from '../constants/styles';
import Navbar from '../components/Navbar';
import HomePage from './home';
import PrayersPage from './prayers';
import RemindersPage from './reminders';
import AccountPage from './account';
import { StorageUtils } from '../utils/storage';
import { useLocalSearchParams } from 'expo-router';

type TabType = 'home' | 'prayers' | 'reminders' | 'account';

export default function MainScreen() {
  const params = useLocalSearchParams<{ tab?: string; prayerId?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showOverlayInstruction, setShowOverlayInstruction] = useState(false);
  const [showFeatureOverlay, setShowFeatureOverlay] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<string[]>([]);

  const handleTabPress = async (tab: TabType) => {
    if (activeTab === tab) {
      // User is already on this tab, provide haptic feedback
      Vibration.vibrate(50); // Short vibration
      return;
    }
    
    // Navigate to new tab
    setActiveTab(tab);
    
    // Mark tab as visited
    await StorageUtils.markTabVisited(tab);
    
    // Update visited tabs state
    const updatedVisitedTabs = await StorageUtils.getVisitedTabs();
    setVisitedTabs(updatedVisitedTabs);
    
    // Check if we should show feature overlay for this tab
    const shouldShowOverlay = await shouldShowFeatureOverlayForTab(tab);
    if (shouldShowOverlay) {
      setShowFeatureOverlay(true);
    }
  };

  const shouldShowFeatureOverlayForTab = async (tab: TabType): Promise<boolean> => {
    const isOnboardingCompleted = await StorageUtils.isOnboardingCompleted();
    const hasSeenInstruction = await StorageUtils.hasSeenNavInstruction();
    const hasSeenFeatureOverlay = await StorageUtils.hasSeenFeatureOverlay();
    const visitedTabs = await StorageUtils.getVisitedTabs();
    
    // Show overlay if onboarding completed, nav instruction seen, feature overlay not seen, and tab not visited
    return isOnboardingCompleted && hasSeenInstruction && !hasSeenFeatureOverlay && !visitedTabs.includes(tab);
  };

  // Check if user should see overlay instruction
  useEffect(() => {
    const checkOverlayInstruction = async () => {
      const isOnboardingCompleted = await StorageUtils.isOnboardingCompleted();
      const hasSeenInstruction = await StorageUtils.hasSeenNavInstruction();
      let visitedTabs = await StorageUtils.getVisitedTabs();
      
      // Ensure home tab is marked as visited since user starts there
      if (!visitedTabs.includes('home')) {
        await StorageUtils.markTabVisited('home');
        visitedTabs = await StorageUtils.getVisitedTabs();
      }
      
      setVisitedTabs(visitedTabs);
      
      // Show nav instruction if onboarding is completed AND user hasn't seen the instruction yet
      if (isOnboardingCompleted && !hasSeenInstruction) {
        setShowOverlayInstruction(true);
      }
      // Note: Feature overlay will be shown when user interacts with navbar trigger
    };

    checkOverlayInstruction();
  }, []);

  // Handle URL parameters for tab and prayer selection
  useEffect(() => {
    if (params.tab && ['home', 'prayers', 'reminders', 'account'].includes(params.tab)) {
      setActiveTab(params.tab as TabType);
    }
  }, [params.tab]);

  // Monitor visited tabs and auto-dismiss when all are visited
  useEffect(() => {
    const allTabs = ['home', 'prayers', 'reminders', 'account'];
    const allVisited = allTabs.every(tab => visitedTabs.includes(tab));
    
    console.log('Visited tabs:', visitedTabs);
    console.log('All visited:', allVisited);
    console.log('Show feature overlay:', showFeatureOverlay);
    
    if (allVisited && showFeatureOverlay) {
      console.log('Triggering tutorial completion...');
      // Wait 1 second, then hide both navbar and feature overlay together
      setTimeout(() => {
        console.log('Hiding feature overlay...');
        // Hide feature overlay with animation first
        setShowFeatureOverlay(false);
        // Mark tutorial as complete
        handleTutorialComplete();
      }, 1000);
    }
  }, [visitedTabs, showFeatureOverlay]);

  const handleOverlayDismiss = async () => {
    setShowOverlayInstruction(false);
    // Mark that the user has seen the instruction
    await StorageUtils.markNavInstructionSeen();
  };

  const handleFeatureOverlayDismiss = async () => {
    setShowFeatureOverlay(false);
  };

  const handleTutorialComplete = async () => {
    console.log('handleTutorialComplete called');
    // Mark that the user has seen the feature overlay permanently
    await StorageUtils.markFeatureOverlaySeen();
    
    // Transition to normal mode - no more overlays
    setShowOverlayInstruction(false);
    
    // Hide navbar after a short delay to allow overlay animation to complete
    setTimeout(() => {
      console.log('Calling handleNavbarTutorialComplete...');
      // Trigger navbar hide by calling the tutorial complete callback
      handleNavbarTutorialComplete();
    }, 300);
  };

  const handleNavbarTutorialComplete = () => {
    // This will be called by the Navbar component when it hides
    // The navbar will hide itself when tutorial completes
    // We need to trigger the navbar's hide function
  };

  const handleShowFeatureOverlay = async () => {
    const isOnboardingCompleted = await StorageUtils.isOnboardingCompleted();
    const hasSeenInstruction = await StorageUtils.hasSeenNavInstruction();
    const hasSeenFeatureOverlay = await StorageUtils.hasSeenFeatureOverlay();
    
    // Show feature overlay if onboarding is completed, nav instruction has been seen, and feature overlay hasn't been seen
    if (isOnboardingCompleted && hasSeenInstruction && !hasSeenFeatureOverlay) {
      setShowFeatureOverlay(true);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'prayers':
        return <PrayersPage prayerId={params.prayerId} />;
      case 'reminders':
        return <RemindersPage />;
      case 'account':
        return <AccountPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      
      <Navbar 
        activeTab={activeTab} 
        onTabPress={handleTabPress} 
        showOverlayInstruction={showOverlayInstruction}
        onOverlayDismiss={handleOverlayDismiss}
        showFeatureOverlay={showFeatureOverlay}
        onFeatureOverlayDismiss={handleFeatureOverlayDismiss}
        onShowFeatureOverlay={handleShowFeatureOverlay}
        onTutorialComplete={handleNavbarTutorialComplete}
        visitedTabs={visitedTabs}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
});
