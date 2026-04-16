import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { searchUsers, sendFriendRequest } from '../services/api';

const DEBOUNCE_MS = 400;

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Circle cx="7.5" cy="7.5" r="5.5" stroke="#a1a1aa" strokeWidth="1.75" />
      <Line x1="11.5" y1="11.5" x2="16" y2="16" stroke="#a1a1aa" strokeWidth="1.75" strokeLinecap="round" />
    </Svg>
  );
}

export default function PlayerSearch({ currentUsername }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchUsers(query.trim());
      setResults(res.data ?? []);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, currentUsername]);

  async function handleAdd(username) {
    setSent(prev => ({ ...prev, [username]: 'sending' }));
    const res = await sendFriendRequest(username);
    setSent(prev => ({ ...prev, [username]: res.success ? 'sent' : 'error' }));
  }

  const showDropdown = query.trim().length >= 2;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <SearchIcon />
        <TextInput
          style={styles.input}
          placeholder="Search players..."
          placeholderTextColor="#a1a1aa"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color="#a1a1aa" />}
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {results.length === 0 && !loading ? (
            <Text style={styles.emptyText}>No players found</Text>
          ) : (
            results.map((user, idx) => {
              const state = sent[user.username];
              return (
                <React.Fragment key={user.username}>
                  {idx > 0 && <View style={styles.rowDivider} />}
                  <View style={styles.resultRow}>
                    <View style={styles.avatar} />
                    <Text style={styles.username}>{user.username}</Text>
                    <TouchableOpacity
                      style={[styles.addBtn, state === 'sent' && styles.addBtnSent]}
                      onPress={() => handleAdd(user.username)}
                      disabled={!!state}
                    >
                      <Text style={[styles.addBtnText, state === 'sent' && styles.addBtnTextSent]}>
                        {state === 'sent' ? 'Sent' : state === 'error' ? 'Retry' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </React.Fragment>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#27272a',
    padding: 0,
  },

  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 13,
    color: '#a1a1aa',
    textAlign: 'center',
    paddingVertical: 14,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginHorizontal: 14,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#d4d4d8',
  },
  username: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#27272a',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  addBtnSent: {
    backgroundColor: '#f4f4f5',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  addBtnTextSent: {
    color: '#71717a',
  },
});
