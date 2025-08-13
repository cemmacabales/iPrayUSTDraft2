import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/styles';
import { StorageUtils } from '../utils/storage';

export default function AccountPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Mock user data - in a real app, this would come from user authentication
  const [userData, setUserData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    studentNumber: '2021-12345',
    email: 'john.doe@ust.edu.ph',
    password: 'password123'
  });

  const [editData, setEditData] = useState({
    firstName: userData.firstName,
    lastName: userData.lastName,
    studentNumber: userData.studentNumber,
    email: userData.email,
    password: userData.password
  });

  const handleEditProfile = () => {
    if (isEditMode) {
      // Save changes
      setUserData(editData);
      setIsEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } else {
      // Enter edit mode
      setEditData(userData);
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditData(userData);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      // Reset onboarding status so user goes through onboarding again
      await StorageUtils.resetOnboardingStatus();
      setShowLogoutModal(false);
      router.replace('/onboarding');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleBookmarks = () => {
    // Navigate to bookmarks page or show bookmarked prayers
    Alert.alert('Bookmarks', 'This will show your bookmarked prayers');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with User Profile */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image source={require('../assets/pfpph.png')} style={styles.profileImage} />
        </View>
        <Text style={styles.userName}>{userData.firstName} {userData.lastName}</Text>
        <Text style={styles.userEmail}>{userData.email}</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        
        {!isEditMode ? (
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.secondary[600]} />
              <Text style={styles.infoLabel}>First Name:</Text>
              <Text style={styles.infoValue}>{userData.firstName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.secondary[600]} />
              <Text style={styles.infoLabel}>Last Name:</Text>
              <Text style={styles.infoValue}>{userData.lastName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="card" size={20} color={colors.secondary[600]} />
              <Text style={styles.infoLabel}>Student Number:</Text>
              <Text style={styles.infoValue}>{userData.studentNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={colors.secondary[600]} />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="lock-closed" size={20} color={colors.secondary[600]} />
              <Text style={styles.infoLabel}>Password:</Text>
              <Text style={styles.infoValue}>••••••••</Text>
            </View>
          </View>
        ) : (
          <View style={styles.editForm}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={colors.secondary[600]} />
              <TextInput
                style={styles.textInput}
                value={editData.firstName}
                onChangeText={(text) => setEditData({...editData, firstName: text})}
                placeholder="Enter your first name"
                placeholderTextColor={colors.secondary[400]}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={colors.secondary[600]} />
              <TextInput
                style={styles.textInput}
                value={editData.lastName}
                onChangeText={(text) => setEditData({...editData, lastName: text})}
                placeholder="Enter your last name"
                placeholderTextColor={colors.secondary[400]}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color={colors.secondary[600]} />
              <TextInput
                style={styles.textInput}
                value={editData.studentNumber}
                onChangeText={(text) => setEditData({...editData, studentNumber: text})}
                placeholder="Enter your student number"
                placeholderTextColor={colors.secondary[400]}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={colors.secondary[600]} />
              <TextInput
                style={styles.textInput}
                value={editData.email}
                onChangeText={(text) => setEditData({...editData, email: text})}
                placeholder="Enter your email"
                placeholderTextColor={colors.secondary[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={colors.secondary[600]} />
              <TextInput
                style={styles.textInput}
                value={editData.password}
                onChangeText={(text) => setEditData({...editData, password: text})}
                placeholder="Enter your password"
                placeholderTextColor={colors.secondary[400]}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.secondary[600]} 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          {!isEditMode ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="create" size={20} color={colors.white} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleEditProfile}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                <Ionicons name="close" size={20} color={colors.white} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Bookmarks Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.bookmarksButton} onPress={handleBookmarks}>
          <View style={styles.buttonContent}>
            <Ionicons name="bookmark" size={24} color={colors.yellow} />
            <Text style={styles.bookmarksButtonText}>My Bookmarks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.secondary[400]} />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
                         <View style={styles.modalHeader}>
               <Ionicons name="warning" size={32} color="#EF4444" />
               <Text style={styles.modalTitle}>Confirm Logout</Text>
             </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to logout? You will need to go through the onboarding process again.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>No, Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={confirmLogout}
              >
                <Text style={styles.modalConfirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: colors.yellow,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.white,
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
    resizeMode: 'cover',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.black,
    opacity: 0.7,
  },
  section: {
    marginHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  profileInfo: {
    backgroundColor: colors.secondary[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    color: colors.secondary[700],
    flex: 1,
  },
  editForm: {
    backgroundColor: colors.secondary[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellow,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
     saveButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#10B981',
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     flex: 1,
     justifyContent: 'center',
   },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary[400],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  bookmarksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary[100],
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarksButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginLeft: 12,
  },
     logoutButton: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#EF4444',
     paddingVertical: 16,
     paddingHorizontal: 20,
     borderRadius: 12,
     justifyContent: 'center',
   },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.secondary[600],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    backgroundColor: colors.secondary[300],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
     modalConfirmButton: {
     backgroundColor: '#EF4444',
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     minWidth: 100,
   },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});
