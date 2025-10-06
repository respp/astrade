# AsTrade NFT Rewards System

A comprehensive NFT rewards system built on Starknet using Cairo and OpenZeppelin Contracts. This system allows you to mint ERC721 NFTs as rewards for user achievements in your trading application.

## Features

### 🏆 Achievement-Based Rewards
- Mint unique NFTs for different user achievements
- Track user achievement progress
- Support for multiple achievement types
- Batch minting for multiple users

### 🔐 Secure Access Control
- Role-based access control using OpenZeppelin AccessControl
- Separate roles for minting and managing rewards
- Admin-only functions for system management

### 🎨 ERC721 Standard Compliance
- Full ERC721 implementation with metadata support
- Standard NFT transfer and approval mechanisms
- Token URI generation for metadata linking

### 📊 Achievement Tracking
- Track individual user achievements
- Query achievement counts and history
- Metadata storage for achievement descriptions

## Contract Architecture

### Core Components

1. **ERC721Component**: Handles all NFT functionality
2. **AccessControlComponent**: Manages role-based permissions
3. **SRC5Component**: Provides interface introspection support

### Storage Structure

```cairo
struct Storage {
    // ERC721 storage
    erc721: ERC721Component::Storage,
    src5: SRC5Component::Storage,
    accesscontrol: AccessControlComponent::Storage,
    
    // Reward system specific storage
    total_rewards_minted: u256,
    user_achievements: Map<ContractAddress, Array<felt252>>,
    achievement_metadata: Map<felt252, ByteArray>,
    next_token_id: u256,
}
```

## Usage

### Deployment

```cairo
// Deploy the contract
let admin = your_admin_address;
let base_uri = "https://api.astrade.com/nft/";
let contract = NFTRewards::deploy(admin, base_uri);
```

### Minting Rewards

```cairo
// Mint a reward NFT for a user achievement
let user = user_address;
let achievement_type = 1; // First trade achievement
dispatcher.mint_reward_nft(user, achievement_type);
```

### Batch Minting

```cairo
// Mint rewards for multiple users at once
let recipients = array![user1, user2, user3];
let achievement_types = array![1, 2, 3]; // Different achievements
dispatcher.batch_mint_rewards(recipients, achievement_types);
```

### Querying User Achievements

```cairo
// Get user's achievement count
let achievement_count = dispatcher.get_achievement_count(user);

// Get all user achievements
let achievements = dispatcher.get_user_achievements(user);

// Get total rewards minted
let total_rewards = dispatcher.get_total_rewards_minted();
```

## Achievement Types

The system supports custom achievement types. Here are some suggested types for a trading app:

```cairo
const ACHIEVEMENT_FIRST_TRADE: felt252 = 1;
const ACHIEVEMENT_10_TRADES: felt252 = 2;
const ACHIEVEMENT_100_TRADES: felt252 = 3;
const ACHIEVEMENT_DAILY_STREAK: felt252 = 4;
const ACHIEVEMENT_WEEKLY_STREAK: felt252 = 5;
const ACHIEVEMENT_PROFIT_MAKER: felt252 = 6;
const ACHIEVEMENT_VOLUME_TRADER: felt252 = 7;
```

## Access Control Roles

### MINTER_ROLE
- Can mint reward NFTs
- Can perform batch minting operations

### REWARD_MANAGER_ROLE
- Can add and update achievement metadata
- Can manage reward system configuration

### DEFAULT_ADMIN_ROLE
- Can grant and revoke other roles
- Has all administrative privileges

## Events

The contract emits several events for tracking:

### RewardMinted
```cairo
struct RewardMinted {
    recipient: ContractAddress,
    token_id: u256,
    achievement_type: felt252,
}
```

### AchievementAdded
```cairo
struct AchievementAdded {
    user: ContractAddress,
    achievement_type: felt252,
    metadata: ByteArray,
}
```

## Testing

Run the comprehensive test suite:

```bash
scarb test
```

The test suite covers:
- Contract deployment and initialization
- NFT minting and transfer functionality
- Achievement tracking and querying
- Access control and role management
- Batch operations
- Error handling and edge cases

## Integration with Your App

### Frontend Integration

1. **Connect to Contract**: Use the contract address and ABI to connect your frontend
2. **Listen for Events**: Monitor `RewardMinted` events for real-time updates
3. **Query Achievements**: Use view functions to display user progress
4. **Mint Rewards**: Call minting functions when users achieve milestones

### Backend Integration

1. **Achievement Detection**: Monitor user actions for achievement triggers
2. **Batch Processing**: Use batch minting for efficient reward distribution
3. **Metadata Management**: Store and update achievement descriptions
4. **Analytics**: Track reward distribution and user engagement

## Security Considerations

- Only authorized addresses can mint NFTs
- Role-based access control prevents unauthorized operations
- Safe transfer mechanisms protect against token loss
- Events provide transparent audit trail

## Development

### Prerequisites

- Cairo 2.9.4+
- Scarb 2.9.4+
- Starknet Foundry for testing

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd AsTrade-contracts

# Install dependencies
scarb build

# Run tests
scarb test
```

### Building

```bash
# Build the contract
scarb build

# Build with Sierra output
scarb build --target starknet-contract
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For questions and support, please open an issue on GitHub or contact the development team.
