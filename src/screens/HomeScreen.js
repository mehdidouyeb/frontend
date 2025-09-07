/**
 * Home Screen
 * Purpose: Main screen after login - will have user search in Phase 4
 * Why: Separates home functionality from authentication screens
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { getStoredUser } from "../utils/storage";
import config from "../config";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { logout } = useAuth();

  /**
   * Load user data when component mounts
   */
  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Load stored user data
   */
  const loadUserData = async () => {
    try {
      const userData = await getStoredUser();
      if (userData) {
        setUser(userData);
      } else {
        // No user data, logout (will trigger navigation to Auth stack)
        logout();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user search
   */
  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await apiService.searchUsers(query.trim());
      setSearchResults(response.users || []);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Search Error", error.message);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Handle search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /**
   * Handle user selection (navigate to chat)
   */
  const handleUserSelect = (selectedUser) => {
    navigation.navigate("Chat", {
      otherUser: selectedUser,
    });
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  /**
   * Render user search result item
   */
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.userItemContent}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userSubtext}>Tap to start chatting</Text>
        </View>
        <View style={styles.chatIcon}>
          <Text style={styles.chatIconText}>💬</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#2d5016" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
          <Text style={styles.loadingText}>Loading your chat...</Text>
          <Text style={styles.loadingSubtext}>Setting up your experience</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d5016" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{config.APP_NAME}</Text>
              <View style={styles.titleUnderline} />
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          {user && (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.usernameText}>{user.username}!</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchHeader}>
          <Text style={styles.searchTitle}>🔍 Find people to chat with</Text>
          <Text style={styles.searchSubtitle}>
            Connect with friends and start conversations
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[
                styles.searchInput,
                searchQuery.length > 0 && styles.searchInputFocused,
              ]}
              placeholder="Search by username..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && (
              <View style={styles.searchLoaderContainer}>
                <ActivityIndicator size="small" color="#d4af37" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsSection}>
        {searchQuery.length > 0 && (
          <Text style={styles.resultsTitle}>
            {searchResults.length > 0
              ? `Found ${searchResults.length} user${
                  searchResults.length !== 1 ? "s" : ""
                }`
              : searching
              ? "Searching..."
              : "No users found"}
          </Text>
        )}

        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.userList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery.length > 0 && !searching ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Text style={styles.emptyStateEmoji}>😔</Text>
                </View>
                <Text style={styles.emptyStateText}>
                  No users found matching "{searchQuery}"
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Try a different search term or check spelling
                </Text>
              </View>
            ) : searchQuery.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIcon}>
                  <Text style={styles.emptyStateEmoji}>👥</Text>
                </View>
                <Text style={styles.emptyStateText}>Ready to connect?</Text>
                <Text style={styles.emptyStateSubtext}>
                  Start typing to search for users and begin chatting
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5dc",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#2d5016",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#f5f5dc",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 1,
  },
  loadingSubtext: {
    fontSize: 18,
    color: "rgba(245, 245, 220, 0.8)",
    textAlign: "center",
    fontStyle: "italic",
  },
  header: {
    backgroundColor: "#2d5016",
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: "#8b7355",
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#f5f5dc",
    letterSpacing: 2,
    textShadowColor: "#8b7355",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#d4af37",
    borderRadius: 2,
    marginTop: 8,
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: "rgba(245, 245, 220, 0.9)",
    marginBottom: 4,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#d4af37",
    textShadowColor: "#2d5016",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    backgroundColor: "rgba(139, 115, 85, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#d4af37",
    shadowColor: "#8b7355",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButtonText: {
    color: "#f5f5dc",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  searchSection: {
    backgroundColor: "#f5f5dc",
    paddingHorizontal: 28,
    paddingVertical: 28,
    marginTop: -12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 4,
    borderTopColor: "#8b7355",
    shadowColor: "#2d5016",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  searchHeader: {
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2d5016",
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: "#8b7355",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchSubtitle: {
    fontSize: 18,
    color: "#8b7355",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    position: "relative",
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 18,
    borderWidth: 3,
    borderColor: "#8b7355",
    color: "#2d5016",
    shadowColor: "#2d5016",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputFocused: {
    borderColor: "#d4af37",
    backgroundColor: "#fefefe",
    shadowColor: "#d4af37",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchLoaderContainer: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    backgroundColor: "#f5f5dc",
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 20,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
    textShadowColor: "#8b7355",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#8b7355",
    shadowColor: "#2d5016",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2d5016",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 3,
    borderColor: "#d4af37",
    shadowColor: "#2d5016",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  userAvatarText: {
    color: "#d4af37",
    fontSize: 24,
    fontWeight: "900",
    textShadowColor: "#2d5016",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2d5016",
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: "#8b7355",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  userSubtext: {
    fontSize: 16,
    color: "#8b7355",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f5f5dc",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#d4af37",
    shadowColor: "#8b7355",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatIconText: {
    fontSize: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 3,
    borderColor: "#d4af37",
    shadowColor: "#2d5016",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d5016",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: "#8b7355",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  emptyStateSubtext: {
    fontSize: 18,
    color: "#8b7355",
    textAlign: "center",
    lineHeight: 28,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
