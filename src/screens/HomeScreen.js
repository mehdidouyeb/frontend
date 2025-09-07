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
} from "react-native";
import { getStoredUser } from "../utils/storage";
import config from "../config";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";

const HomeScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const { logout } = useAuth();

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await getStoredUser();
            if (userData) {
                setUser(userData);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleUserSelect = (selectedUser) => {
        navigation.navigate("Chat", {
            otherUser: selectedUser,
        });
    };

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

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleUserSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.userSubtext}>Tap to start chatting</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>{config.APP_NAME}</Text>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                {user && (
                    <Text style={styles.subtitle}>Hello, {user.username}!</Text>
                )}
            </View>

            {/* Search Section */}
            <View style={styles.searchSection}>
                <Text style={styles.searchTitle}>Find people to chat with</Text>
                <View style={styles.searchContainer}>
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
                        <ActivityIndicator
                            style={styles.searchLoader}
                            size="small"
                            color="#007AFF"
                        />
                    )}
                </View>
            </View>

            {/* Search Results */}
            <View style={styles.resultsSection}>
                {searchQuery.length > 0 && (
                    <Text style={styles.resultsTitle}>
                        {searchResults.length > 0
                            ? `Found ${searchResults.length} user${searchResults.length !== 1 ? "s" : ""
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
                                <Text style={styles.emptyStateText}>
                                    No users found matching "{searchQuery}"
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Try a different search term
                                </Text>
                            </View>
                        ) : searchQuery.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>
                                    Start typing to search for users
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    Find people to start chatting with
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
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
    },
    header: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
    logoutButton: {
        backgroundColor: "#FF3B30",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    logoutButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    searchSection: {
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    searchTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        backgroundColor: "#f8f8f8",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    searchLoader: {
        position: "absolute",
        right: 16,
    },
    resultsSection: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    userList: {
        flex: 1,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#eee",
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    userAvatarText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    userSubtext: {
        fontSize: 14,
        color: "#666",
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
});

export default HomeScreen;