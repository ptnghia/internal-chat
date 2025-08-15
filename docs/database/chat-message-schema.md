# 💬 Chat & Message Database Schema

## 📋 Overview

Thiết kế database schema cho hệ thống Chat và Message của Internal Chat App, hỗ trợ real-time messaging, chat rooms, reactions, threads và moderation.

## 🗄️ Database Tables

### 1. **chats** - Bảng chat rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | NOT NULL | Chat room name |
| description | String | NULLABLE | Chat description |
| type | String | DEFAULT 'group' | Chat type |
| isPrivate | Boolean | DEFAULT false | Private chat flag |
| isArchived | Boolean | DEFAULT false | Archive status |
| avatar | String | NULLABLE | Chat room avatar URL |
| color | String | NULLABLE | Chat room color |
| departmentId | String | NULLABLE, FOREIGN KEY | Department association |
| teamId | String | NULLABLE, FOREIGN KEY | Team association |
| maxMembers | Int | NULLABLE | Maximum members limit |
| allowGuests | Boolean | DEFAULT false | Allow guest users |
| messageRetentionDays | Int | NULLABLE | Auto-delete messages |
| allowFileSharing | Boolean | DEFAULT true | File sharing permission |
| allowReactions | Boolean | DEFAULT true | Message reactions |
| allowThreads | Boolean | DEFAULT true | Thread replies |
| requireApproval | Boolean | DEFAULT false | Message moderation |
| mutedUntil | DateTime | NULLABLE | Chat mute status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| lastMessageAt | DateTime | NULLABLE | Last message timestamp |
| createdBy | String | NULLABLE | Creator user ID |
| updatedBy | String | NULLABLE | Last updater user ID |

### 2. **chat_members** - Bảng thành viên chat

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| chatId | String | FOREIGN KEY, NOT NULL | Reference to chats.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| role | String | DEFAULT 'member' | Member role |
| isActive | Boolean | DEFAULT true | Membership status |
| isMuted | Boolean | DEFAULT false | User mute status |
| mutedUntil | DateTime | NULLABLE | Mute expiration |
| canInvite | Boolean | DEFAULT false | Invite permission |
| canKick | Boolean | DEFAULT false | Kick permission |
| canPin | Boolean | DEFAULT false | Pin message permission |
| canModerate | Boolean | DEFAULT false | Moderation permission |
| joinedAt | DateTime | DEFAULT now() | Join timestamp |
| leftAt | DateTime | NULLABLE | Leave timestamp |
| invitedBy | String | NULLABLE | Inviter user ID |
| lastReadAt | DateTime | NULLABLE | Last read timestamp |
| lastReadMessageId | String | NULLABLE, FOREIGN KEY | Last read message |
| notificationsEnabled | Boolean | DEFAULT true | Notification setting |
| mentionNotifications | Boolean | DEFAULT true | Mention notification |

**Unique Constraint**: (chatId, userId)

### 3. **messages** - Bảng tin nhắn

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| chatId | String | FOREIGN KEY, NOT NULL | Reference to chats.id |
| senderId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| content | String | NULLABLE | Message content |
| type | String | DEFAULT 'text' | Message type |
| isEdited | Boolean | DEFAULT false | Edit status |
| isDeleted | Boolean | DEFAULT false | Delete status |
| isPinned | Boolean | DEFAULT false | Pin status |
| replyToId | String | NULLABLE, FOREIGN KEY | Reply to message ID |
| threadId | String | NULLABLE | Thread identifier |
| systemData | Json | NULLABLE | System message data |
| mentions | String[] | ARRAY | Mentioned user IDs |
| attachments | Json | NULLABLE | File attachments |
| deliveredAt | DateTime | NULLABLE | Delivery timestamp |
| readBy | Json | NULLABLE | Read status tracking |
| isApproved | Boolean | DEFAULT true | Approval status |
| approvedBy | String | NULLABLE | Approver user ID |
| approvedAt | DateTime | NULLABLE | Approval timestamp |
| flaggedBy | String[] | ARRAY | Users who flagged |
| flagReason | String | NULLABLE | Flag reason |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |
| editedAt | DateTime | NULLABLE | Edit timestamp |
| deletedAt | DateTime | NULLABLE | Delete timestamp |

### 4. **message_reactions** - Bảng reactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| messageId | String | FOREIGN KEY, NOT NULL | Reference to messages.id |
| userId | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| emoji | String | NOT NULL | Emoji unicode/shortcode |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |

**Unique Constraint**: (messageId, userId, emoji)

### 5. **pinned_messages** - Bảng tin nhắn được pin

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| chatId | String | FOREIGN KEY, NOT NULL | Reference to chats.id |
| messageId | String | FOREIGN KEY, NOT NULL | Reference to messages.id |
| pinnedBy | String | FOREIGN KEY, NOT NULL | Reference to users.id |
| pinnedAt | DateTime | DEFAULT now() | Pin timestamp |
| reason | String | NULLABLE | Pin reason |

**Unique Constraint**: (chatId, messageId)

### 6. **message_types** - Bảng loại tin nhắn

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PRIMARY KEY, CUID | Unique identifier |
| name | String | UNIQUE, NOT NULL | Type name |
| displayName | String | NOT NULL | Display name |
| description | String | NULLABLE | Type description |
| icon | String | NULLABLE | Type icon |
| color | String | NULLABLE | Type color |
| isSystem | Boolean | DEFAULT false | System type flag |
| isActive | Boolean | DEFAULT true | Type status |
| allowReactions | Boolean | DEFAULT true | Allow reactions |
| allowReplies | Boolean | DEFAULT true | Allow replies |
| allowEditing | Boolean | DEFAULT true | Allow editing |
| allowDeleting | Boolean | DEFAULT true | Allow deleting |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

## 🔗 Relationships

### Chat Relationships
- **Chat** ↔ **Department** (Many-to-One, optional)
- **Chat** ↔ **Team** (Many-to-One, optional)
- **Chat** ↔ **ChatMember** (One-to-Many)
- **Chat** ↔ **Message** (One-to-Many)
- **Chat** ↔ **PinnedMessage** (One-to-Many)

### Message Relationships
- **Message** ↔ **Chat** (Many-to-One)
- **Message** ↔ **User** (Sender, Many-to-One)
- **Message** ↔ **Message** (Reply, Self-referencing)
- **Message** ↔ **MessageReaction** (One-to-Many)
- **Message** ↔ **PinnedMessage** (One-to-Many)

### User Relationships
- **User** ↔ **ChatMember** (One-to-Many)
- **User** ↔ **Message** (One-to-Many)
- **User** ↔ **MessageReaction** (One-to-Many)
- **User** ↔ **PinnedMessage** (One-to-Many)

## 💬 Chat Types

### 1. **Direct Chat** (`direct`)
- Private 1-on-1 conversation
- No department/team association
- Limited to 2 members

### 2. **Group Chat** (`group`)
- Multi-user group conversation
- No department/team association
- Custom member list

### 3. **Department Chat** (`department`)
- Department-wide communication
- Associated with specific department
- All department members auto-joined

### 4. **Team Chat** (`team`)
- Team-specific communication
- Associated with specific team
- All team members auto-joined

### 5. **Announcement Chat** (`announcement`)
- Company-wide announcements
- Restricted posting permissions
- All users can read

## 📝 Message Types

### 1. **Text Message** (`text`) 💬
- Regular text content
- Supports markdown formatting
- Allows all interactions

### 2. **Image Message** (`image`) 🖼️
- Image attachments
- Thumbnail generation
- No content editing

### 3. **File Message** (`file`) 📎
- File attachments
- Download tracking
- No content editing

### 4. **System Message** (`system`) ⚙️
- Auto-generated messages
- User join/leave notifications
- No user interactions

### 5. **Announcement** (`announcement`) 📢
- Important announcements
- Highlighted display
- Enhanced permissions

## 🎭 Member Roles

### Chat Member Roles
- **member**: Regular chat participant
- **admin**: Chat administrator with full permissions
- **moderator**: Limited moderation capabilities

### Member Permissions
- **canInvite**: Add new members to chat
- **canKick**: Remove members from chat
- **canPin**: Pin/unpin messages
- **canModerate**: Moderate messages and members

## 🚀 Default Data

### Default Chats Created
- **General** - Company-wide announcements
- **Random** - Casual conversations
- **Department Chats** - One per department (7 chats)
- **IT Team Chats** - One per IT team (4 chats)

### Message Types
- **text**, **image**, **file**, **system**, **announcement**
- Each with specific permissions and display settings

### Admin Setup
- Admin user added to all chats as admin
- Welcome message in General chat
- Welcome message pinned automatically

## 🔧 Advanced Features

### Threading Support
- **threadId**: Group related messages
- **replyToId**: Direct message replies
- Nested conversation structure

### Message Moderation
- **requireApproval**: Messages need approval
- **flaggedBy**: User reporting system
- **isApproved**: Moderation status

### Read Status Tracking
- **lastReadAt**: User's last read time
- **lastReadMessageId**: Last read message
- **readBy**: JSON tracking who read message

### Rich Content Support
- **mentions**: Array of mentioned user IDs
- **attachments**: JSON metadata for files
- **systemData**: Structured data for system messages

### Auto-cleanup
- **messageRetentionDays**: Auto-delete old messages
- **isDeleted**: Soft delete support
- **deletedAt**: Deletion timestamp

## 🚀 Usage Examples

### Create Group Chat
```typescript
const chat = await prisma.chat.create({
  data: {
    name: 'Project Alpha',
    description: 'Discussion for Project Alpha',
    type: 'group',
    isPrivate: false,
    allowFileSharing: true,
    createdBy: userId,
    chatMembers: {
      create: [
        { userId: userId, role: 'admin', canInvite: true, canModerate: true },
        { userId: memberId1, role: 'member' },
        { userId: memberId2, role: 'member' }
      ]
    }
  }
});
```

### Send Message with Reply
```typescript
const message = await prisma.message.create({
  data: {
    chatId: chatId,
    senderId: userId,
    content: 'Thanks for the update!',
    type: 'text',
    replyToId: originalMessageId,
    mentions: [mentionedUserId]
  }
});
```

### Add Reaction
```typescript
await prisma.messageReaction.create({
  data: {
    messageId: messageId,
    userId: userId,
    emoji: '👍'
  }
});
```

### Pin Message
```typescript
await prisma.pinnedMessage.create({
  data: {
    chatId: chatId,
    messageId: messageId,
    pinnedBy: userId,
    reason: 'Important announcement'
  }
});
```

## 🔧 Migration Commands

```bash
# Generate Prisma client
cd backend && npm run db:generate

# Push schema changes
cd backend && npm run db:push

# Seed with chats and message types
cd backend && npm run db:seed

# View in Prisma Studio
cd backend && npm run db:studio
```

## 📝 Notes

### Real-time Features Ready
- ✅ Message broadcasting structure
- ✅ Typing indicators support
- ✅ User presence tracking
- ✅ Read status synchronization

### Scalability Considerations
- ✅ Efficient indexing on chatId, senderId
- ✅ Pagination support for messages
- ✅ Soft delete for message history
- ✅ JSON fields for flexible metadata

### Security Features
- ✅ Role-based permissions
- ✅ Message moderation system
- ✅ User muting capabilities
- ✅ Content flagging system

---

**Created**: 2025-01-15  
**Status**: ✅ Implemented  
**Next**: Task Management Schema (Task 3.4)
