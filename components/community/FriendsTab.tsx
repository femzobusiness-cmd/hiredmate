'use client';

import { getInitials } from '@/lib/community';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type FriendUser = {
  userId: string;
  name: string;
  specialty: string | null;
  rankTitle: string;
  totalXp: number;
  currentStreak: number;
  friendshipId?: string;
  friendshipStatus?: string | null;
};

type FriendsTabProps = {
  onToast: (message: string) => void;
};

export function FriendsTab({ onToast }: FriendsTabProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [incoming, setIncoming] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    const res = await fetch('/api/community/friends');
    const data = await res.json();
    if (res.ok) {
      setFriends(data.friends || []);
      setIncoming(data.incoming || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(
        `/api/community/users/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.users || []);
        const pending = new Set<string>();
        for (const user of data.users || []) {
          if (user.friendshipStatus === 'pending') {
            pending.add(user.userId);
          }
        }
        setSentIds((prev) => {
          const next = new Set(prev);
          pending.forEach((id) => next.add(id));
          return next;
        });
      }
      setSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const sendRequest = async (receiverId: string) => {
    const res = await fetch('/api/community/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', receiverId }),
    });
    if (res.ok) {
      setSentIds((prev) => new Set(prev).add(receiverId));
    }
  };

  const respond = async (friendshipId: string, action: 'accept' | 'decline') => {
    const res = await fetch('/api/community/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, friendshipId }),
    });
    if (res.ok) {
      await loadFriends();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nurses by name..."
          className="w-full rounded-pill border border-[#7C5CBF]/20 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#7C5CBF]"
        />
      </div>

      {searching && (
        <p className="text-center text-sm text-gray-500">Searching...</p>
      )}

      {searchResults.length > 0 && (
        <motion.div className="space-y-3">
          {searchResults.map((user) => {
            const sent =
              sentIds.has(user.userId) || user.friendshipStatus === 'pending';
            const isFriend = user.friendshipStatus === 'accepted';

            return (
              <motion.div
                key={user.userId}
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_rgba(124,92,191,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#7C5CBF] text-sm font-bold text-white">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#1a1a2e]">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.specialty || 'General Nursing'}
                  </p>
                </div>
                {isFriend ? (
                  <span className="text-xs font-semibold text-[#00C6B2]">Friends ✓</span>
                ) : (
                  <button
                    type="button"
                    disabled={sent}
                    onClick={() => sendRequest(user.userId)}
                    className={cn(
                      'rounded-pill px-4 py-2 text-xs font-bold text-white shadow-md',
                      sent
                        ? 'bg-gray-300'
                        : 'bg-gradient-to-r from-[#7C5CBF] to-[#9B7FD4]'
                    )}
                  >
                    {sent ? 'Sent ✓' : 'Add Friend'}
                  </button>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {incoming.length > 0 && (
        <section>
          <h3 className="mb-4 text-lg font-bold text-[#1a1a2e]">
            Friend Requests 🔔
          </h3>
          <div className="space-y-3">
            {incoming.map((user) => (
              <motion.div
                key={user.friendshipId}
                className="flex flex-wrap items-center gap-3 rounded-[20px] bg-white p-4 shadow-sm"
              >
                <motion.div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7C5CBF] text-sm font-bold text-white">
                  {getInitials(user.name)}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.specialty}</p>
                </div>
                <button
                  type="button"
                  onClick={() => respond(user.friendshipId!, 'accept')}
                  className="rounded-pill bg-[#00C6B2] px-4 py-2 text-xs font-bold text-white"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => respond(user.friendshipId!, 'decline')}
                  className="rounded-pill border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Decline
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-4 text-lg font-bold text-[#1a1a2e]">My Friends</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading friends...</p>
        ) : friends.length === 0 ? (
          <p className="rounded-[20px] bg-white p-8 text-center text-gray-500 shadow-sm">
            No friends yet — search above to connect with other nurses 🩺
          </p>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <motion.div
                key={friend.userId}
                whileHover={{ y: -2 }}
                className="rounded-[20px] bg-white p-5 shadow-[0_4px_20px_rgba(124,92,191,0.08)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5CBF] font-bold text-white">
                    {getInitials(friend.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#1a1a2e]">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.specialty}</p>
                    <span className="mt-2 inline-block rounded-pill bg-[#7C5CBF]/10 px-3 py-1 text-xs font-bold text-[#7C5CBF]">
                      {friend.rankTitle}
                    </span>
                    <p className="mt-2 text-sm text-gray-600">
                      {friend.totalXp.toLocaleString()} XP · 🔥 {friend.currentStreak}{' '}
                      streak
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/battle';
                  }}
                  className="mt-4 w-full rounded-pill border-2 border-[#7C5CBF] py-2.5 text-sm font-bold text-[#7C5CBF]"
                >
                  Challenge →
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
