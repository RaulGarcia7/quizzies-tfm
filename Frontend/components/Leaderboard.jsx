import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getUsername } from './Login';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'url_aqui';
const API_URL_follow = 'url_aqui';
const API_URL_unfollow = 'url_aqui';

const Leaderboard = () => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [currentLeague, setCurrentLeague] = useState('');
  const [followingPlayers, setFollowingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentPlayer = getUsername();

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}${currentPlayer}`);
      if (!response.ok) {
        throw new Error('Error fetching leaderboard');
      }
      const data = await response.json();
      setAllPlayers(data.sortedPlayers);
      setCurrentLeague(data.currentLeague);
      setFollowingPlayers(data.followingPlayers);
      console.log(data);
      console.log(data.followingPlayers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchLeaderboard();

      return () => {
      };
    }, [currentPlayer])
  );

    const filteredPlayers = showFollowing
    ? [...followingPlayers, ...(allPlayers.filter(player => player.username === currentPlayer) || [])]
    : allPlayers;

  const handleFollow = async (player) => {
    try {
      const response = await fetch(API_URL_follow, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      });
      if (!response.ok) {
        throw new Error('Error al seguir al jugador');
      }
      const data = await response.json();
      if (data.success) {
        console.log(`Ahora sigues a ${player.username}`);
        fetchLeaderboard();
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error siguiendo al jugador:', error);
    }
  };

  const handleUnfollow = async (player) => {
    try {
        const response = await fetch(API_URL_unfollow, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Error al dejar de seguir al jugador');
        }
        const data = await response.json();
        if (data.success) {
            console.log(`Has dejado de seguir a ${player.username}`);
            fetchLeaderboard();
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Error dejando de seguir al jugador:', error);
    }
  };

  const renderItem = ({ item, index }) => {
    const isFollowing = followingPlayers.some(followingPlayer => followingPlayer.username === item.username);
    const isCurrentPlayer = item.username === currentPlayer;

    return (
        <View style={[styles.playerContainer, isCurrentPlayer && styles.currentPlayer]}>
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={styles.details}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.knowledgePoints}>{item.knowledgePoints} pts</Text>
            </View>
            
            {!isCurrentPlayer && (
                <TouchableOpacity 
                    style={styles.plusButton} 
                    onPress={() => isFollowing ? handleUnfollow(item) : handleFollow(item)} 
                  >
                    <Ionicons 
                        name={isFollowing ? "checkmark" : "add"} 
                        size={24} 
                        color="#083142"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{showFollowing ? 'Jugadores Seguidos' : `${currentLeague} League`}</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mostrar Solo Seguidores</Text>
        <Switch
          value={showFollowing}
          onValueChange={setShowFollowing}
        />
      </View>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#d2b16c" />
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          renderItem={renderItem}
          keyExtractor={(item) => item.username}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#89e3f7',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F3D7A2',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Zain-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 18,
    color: '#083142',
    marginRight: 10,
    fontFamily: 'Zain-Regular',
  },
  playerContainer: {
    flexDirection: 'row',
    backgroundColor: '#B4EFF5',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderColor: '#d2b16c',
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  currentPlayer: {
    backgroundColor: '#CDF6FF',
    borderWidth: 3,
    borderColor: '#d2b16c',
  },
  rank: {
    fontSize: 22,
    color: '#BDA77C',
    fontFamily: 'Zain-Regular',
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#083142',
    fontFamily: 'Zain-Regular',
  },
  knowledgePoints: {
    fontSize: 18,
    color: '#083142',
    fontFamily: 'Zain-Regular',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

export default Leaderboard;