interface UserProfile {
  address: string;
  username?: string;
  ensName?: string;
  level: number;
  xp: number;
  totalPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  streak: number;
  maxStreak: number;
  achievements: Achievement[];
  assets: UserAsset[];
  joinedAt: number;
  lastActive: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
  points: number;
}

interface UserAsset {
  type: 'token' | 'nft' | 'badge';
  name: string;
  symbol?: string;
  balance: string;
  value?: number;
  contractAddress?: string;
  tokenId?: string;
  imageUrl?: string;
}

interface GameResult {
  score: number;
  accuracy: number;
  questionsAnswered: number;
  timeBonus: number;
  xpEarned: number;
  pointsEarned: number;
  achievements?: Achievement[];
}

class UserProfileManager {
  private profiles: Map<string, UserProfile> = new Map();
  private readonly STORAGE_KEY = 'whale_game_profiles';
  private readonly XP_PER_LEVEL = 1000;

  constructor() {
    this.loadProfiles();
  }

  // Load profiles from localStorage
  private loadProfiles(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          this.profiles = new Map(Object.entries(data));
        }
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }

  // Save profiles to localStorage
  private saveProfiles(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const data = Object.fromEntries(this.profiles);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }

  // Create new user profile
  public createProfile(address: string, ensName?: string): UserProfile {
    const profile: UserProfile = {
      address: address.toLowerCase(),
      username: ensName || this.generateUsername(),
      ensName,
      level: 1,
      xp: 0,
      totalPoints: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      streak: 0,
      maxStreak: 0,
      achievements: [],
      assets: [],
      joinedAt: Date.now(),
      lastActive: Date.now()
    };

    this.profiles.set(address.toLowerCase(), profile);
    this.saveProfiles();
    
    console.log('✅ New user profile created:', profile);
    return profile;
  }

  // Get user profile or create if doesn't exist
  public getProfile(address: string): UserProfile {
    const key = address.toLowerCase();
    let profile = this.profiles.get(key);
    
    if (!profile) {
      profile = this.createProfile(address);
    }
    
    // Update last active
    profile.lastActive = Date.now();
    this.saveProfiles();
    
    return profile;
  }

  // Update profile after game completion
  public updateAfterGame(address: string, gameResult: GameResult): UserProfile {
    const profile = this.getProfile(address);
    
    // Update game stats
    profile.gamesPlayed++;
    profile.totalPoints += gameResult.pointsEarned;
    profile.xp += gameResult.xpEarned;
    
    // Update win/loss
    if (gameResult.accuracy >= 60) { // 60% accuracy = win
      profile.gamesWon++;
      profile.streak++;
      profile.maxStreak = Math.max(profile.maxStreak, profile.streak);
    } else {
      profile.streak = 0;
    }
    
    profile.winRate = (profile.gamesWon / profile.gamesPlayed) * 100;
    
    // Check for level up
    const newLevel = Math.floor(profile.xp / this.XP_PER_LEVEL) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      this.checkLevelUpRewards(profile);
    }
    
    // Check for achievements
    this.checkAchievements(profile, gameResult);
    
    this.profiles.set(address.toLowerCase(), profile);
    this.saveProfiles();
    
    return profile;
  }

  // Check and award achievements
  private checkAchievements(profile: UserProfile, gameResult: GameResult): void {
    const newAchievements: Achievement[] = [];

    // First Game Achievement
    if (profile.gamesPlayed === 1) {
      newAchievements.push(this.createAchievement(
        'first_game',
        'First Steps',
        'Complete your first whale trivia game',
        '🎮',
        'common',
        100
      ));
    }

    // Perfect Game Achievement
    if (gameResult.accuracy === 100) {
      newAchievements.push(this.createAchievement(
        'perfect_game',
        'Whale Expert',
        'Get 100% accuracy in a game',
        '🎯',
        'rare',
        500
      ));
    }

    // Win Streak Achievements
    if (profile.streak === 5) {
      newAchievements.push(this.createAchievement(
        'streak_5',
        'On Fire',
        'Win 5 games in a row',
        '🔥',
        'rare',
        300
      ));
    }
    
    if (profile.streak === 10) {
      newAchievements.push(this.createAchievement(
        'streak_10',
        'Unstoppable',
        'Win 10 games in a row',
        '⚡',
        'epic',
        750
      ));
    }

    // Level Achievements
    if (profile.level === 5) {
      newAchievements.push(this.createAchievement(
        'level_5',
        'Rising Star',
        'Reach level 5',
        '⭐',
        'rare',
        400
      ));
    }

    if (profile.level === 10) {
      newAchievements.push(this.createAchievement(
        'level_10',
        'Whale Hunter',
        'Reach level 10',
        '🐋',
        'epic',
        1000
      ));
    }

    // Points Achievements
    if (profile.totalPoints >= 10000) {
      newAchievements.push(this.createAchievement(
        'points_10k',
        'Point Collector',
        'Earn 10,000 total points',
        '💎',
        'epic',
        600
      ));
    }

    // Add new achievements
    newAchievements.forEach(achievement => {
      if (!profile.achievements.find(a => a.id === achievement.id)) {
        profile.achievements.push(achievement);
        profile.totalPoints += achievement.points;
        console.log('🏆 Achievement unlocked:', achievement.name);
      }
    });
  }

  // Create achievement object
  private createAchievement(
    id: string,
    name: string,
    description: string,
    icon: string,
    rarity: Achievement['rarity'],
    points: number
  ): Achievement {
    return {
      id,
      name,
      description,
      icon,
      rarity,
      unlockedAt: Date.now(),
      points
    };
  }

  // Check for level up rewards
  private checkLevelUpRewards(profile: UserProfile): void {
    const level = profile.level;
    
    // Award tokens/NFTs based on level
    if (level === 2) {
      this.addAsset(profile, {
        type: 'token',
        name: 'Whale Tokens',
        symbol: 'WHALE',
        balance: '100',
        value: 50
      });
    }
    
    if (level === 5) {
      this.addAsset(profile, {
        type: 'nft',
        name: 'Rookie Detective Badge',
        balance: '1',
        imageUrl: '/nft-detective-rookie.png'
      });
    }
    
    if (level === 10) {
      this.addAsset(profile, {
        type: 'nft',
        name: 'Whale Hunter NFT',
        balance: '1',
        imageUrl: '/nft-whale-hunter.png'
      });
    }
  }

  // Add asset to user profile
  private addAsset(profile: UserProfile, asset: UserAsset): void {
    const existing = profile.assets.find(a => 
      a.name === asset.name && a.type === asset.type
    );
    
    if (existing) {
      // Increase balance if asset already exists
      const currentBalance = parseFloat(existing.balance);
      const newBalance = parseFloat(asset.balance);
      existing.balance = (currentBalance + newBalance).toString();
    } else {
      profile.assets.push(asset);
    }
  }

  // Generate random username
  private generateUsername(): string {
    const adjectives = ['Swift', 'Clever', 'Bold', 'Sharp', 'Wise', 'Quick', 'Brave', 'Smart'];
    const nouns = ['Hunter', 'Detective', 'Tracker', 'Scholar', 'Explorer', 'Seeker', 'Finder'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adj}${noun}${number}`;
  }

  // Get leaderboard data
  public getLeaderboard(limit: number = 25): UserProfile[] {
    return Array.from(this.profiles.values())
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }

  // Update username
  public updateUsername(address: string, username: string): void {
    const profile = this.getProfile(address);
    profile.username = username;
    this.saveProfiles();
  }

  // Add points (for rewards claiming)
  public addPoints(address: string, points: number): UserProfile {
    const profile = this.getProfile(address);
    profile.totalPoints += points;
    
    // Check for level up
    const newLevel = Math.floor(profile.xp / this.XP_PER_LEVEL) + 1;
    if (newLevel > profile.level) {
      profile.level = newLevel;
      this.checkLevelUpRewards(profile);
    }
    
    this.saveProfiles();
    return profile;
  }

  // Claim reward
  public claimReward(address: string, rewardType: string, amount: number): boolean {
    const profile = this.getProfile(address);
    
    if (profile.totalPoints < amount) {
      return false; // Not enough points
    }
    
    profile.totalPoints -= amount;
    
    // Add the claimed reward as an asset
    let asset: UserAsset;
    
    switch (rewardType) {
      case 'eth':
        asset = {
          type: 'token',
          name: 'Ethereum',
          symbol: 'ETH',
          balance: (amount / 1000).toString(), // 1000 points = 0.001 ETH
          value: amount
        };
        break;
      case 'whale':
        asset = {
          type: 'token',
          name: 'Whale Tokens',
          symbol: 'WHALE',
          balance: amount.toString(),
          value: amount * 0.5
        };
        break;
      case 'nft':
        asset = {
          type: 'nft',
          name: 'Whale Detective NFT',
          balance: '1',
          imageUrl: '/nft-detective.png'
        };
        break;
      default:
        return false;
    }
    
    this.addAsset(profile, asset);
    this.saveProfiles();
    
    console.log('✅ Reward claimed:', rewardType, amount);
    return true;
  }

  // Clear all data (for testing)
  public clearAllData(): void {
    this.profiles.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ All user data cleared');
  }
}

// Export singleton instance
export const userProfileManager = new UserProfileManager();

// Export types
export type { UserProfile, Achievement, UserAsset, GameResult }; 