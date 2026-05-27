# Database Schema Design

## Tables

### `profiles`
- `id` (uuid, primary key, references auth.users)
- `phone` (text, unique)
- `full_name` (text)
- `avatar_url` (text, optional)
- `role` (user_role enum: 'user', 'runner', 'admin')
- `trust_level` (trust_level enum: 'new', 'verified', 'trusted')
- `rating` (numeric, default 0)
- `completion_count` (int, default 0)
- `created_at` (timestamp with time zone)

### `tasks`
- `id` (uuid, primary key)
- `creator_id` (uuid, references profiles.id)
- `runner_id` (uuid, references profiles.id, optional)
- `title` (text)
- `description` (text)
- `category` (text)
- `price` (numeric)
- `status` (task_status enum: 'posted', 'accepted', 'in-progress', 'completed', 'closed', 'disputed')
- `otp` (text, optional) - generated on acceptance
- `location_start` (text, optional)
- `location_end` (text, optional)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### `transactions`
- `id` (uuid, primary key)
- `task_id` (uuid, references tasks.id)
- `amount` (numeric)
- `status` (transaction_status enum: 'pending', 'escrow', 'released', 'refunded')
- `created_at` (timestamp with time zone)

### `chats`
- `id` (uuid, primary key)
- `task_id` (uuid, references tasks.id)
- `created_at` (timestamp with time zone)

### `messages`
- `id` (uuid, primary key)
- `chat_id` (uuid, references chats.id)
- `sender_id` (uuid, references profiles.id)
- `content` (text)
- `created_at` (timestamp with time zone)

## Security Rules (RLS)
- Profiles: Read access for authenticated users. Update access for owner only.
- Tasks: 
    - Read: Everyone (authenticated).
    - Create: Authenticated users.
    - Update: Creator or Runner (depending on status).
- Transactions: Read/Write via Edge Functions only (mostly).
- Chats/Messages: Access only if user is Creator or Runner of the associated Task.
