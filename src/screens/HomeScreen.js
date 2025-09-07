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
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
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
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
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
              style={styles.searchInput}
              placeholder="Search by username..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && (
              <View style={styles.searchLoaderContainer}>
                <ActivityIndicator size="small" color="#667eea" />
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
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  header: {
    backgroundColor: "#667eea",
    paddingBottom: 20,
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
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    marginTop: 4,
  },
  welcomeContainer: {
    marginTop: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  searchSection: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchHeader: {
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: 6,
  },
  searchSubtitle: {
    fontSize: 16,
    color: "#718096",
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
    backgroundColor: "#f7fafc",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    color: "#2d3748",
  },
  searchLoaderContainer: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  userList: {
    flex: 1,
  },
  userItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  userItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  userAvatarText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 4,
  },
  userSubtext: {
    fontSize: 14,
    color: "#718096",
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  chatIconText: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default HomeScreen;
