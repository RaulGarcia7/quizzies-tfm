import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUsername } from './Login';
import { useFocusEffect } from '@react-navigation/native';


const API_URL = `url_profile`;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = getUsername();

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}${username}`);
      if (!response.ok) {
        throw new Error('Error fetching profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usamos useFocusEffect para recargar el perfil cada vez que el componente es enfocado
  useFocusEffect(
    useCallback(() => {
      setLoading(true); 
      fetchProfile();  
    }, [username]) 
  );

  return (
    <LinearGradient colors={['#CDF6FF', '#89e3f7']} style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#89e3f7" />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Image
              source={profile.avatar ? { uri: profile.avatar } : require('../assets/Images/profile.png')}
              style={styles.avatar}
            />
            <Text style={styles.username}>{profile.username}</Text>
          </View>
          <View style={styles.profileCard}>
            <Text style={styles.knowledgePoints}>
              Knowledge Points: {profile.knowledgePoints ? profile.knowledgePoints : 'N/A'}
            </Text>
            <Text style={styles.league}>
              League: {profile.league ? profile.league : 'Unknown'}
            </Text>
          </View>
        </>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#d2b16c',
  },
  username: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E6BF35',
    fontFamily: 'Zain-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  profileCard: {
    backgroundColor: '#B4EFF5',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderColor: '#d2b16c',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    width: '90%',
  },
  knowledgePoints: {
    fontSize: 26,
    color: '#083142',
    fontFamily: 'Zain-Regular',
    marginBottom: 20,
  },
  league: {
    fontSize: 26,
    color: '#083142',
    fontFamily: 'Zain-Regular',
  },
});

export default Profile;
