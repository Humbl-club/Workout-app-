# Clerk Authentication Setup for React (Vite)

## Quick Start

Follow the official Clerk React Quickstart: https://clerk.com/docs/quickstarts/react

### 1. Install Clerk React SDK

```bash
npm install @clerk/clerk-react@latest
```

✅ Already installed

### 2. Get Your Clerk Publishable Key

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
2. Select **React** from the framework dropdown
3. Copy your **Publishable Key** (starts with `pk_`)

### 3. Add Environment Variable

Create a `.env.local` file in your project root:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important:** 
- The `VITE_` prefix is **required** for Vite to expose the variable to client-side code
- Use `.env.local` for local development (it's gitignored)
- Never commit real keys to git

### 4. Verify Setup

The app is already configured:
- ✅ `<ClerkProvider>` wraps the app in `index.tsx`
- ✅ Uses `publishableKey` prop (correct)
- ✅ Environment variable is `VITE_CLERK_PUBLISHABLE_KEY` (correct)
- ✅ Error handling if key is missing

### 5. Usage in Components

The app uses Clerk's components:
- `<SignIn>` and `<SignUp>` in `AuthPage.tsx`
- `useUser()` hook to get current user
- `useClerk().signOut()` for signing out

### Example Usage

```typescript
import { useUser, useClerk } from '@clerk/clerk-react';

function MyComponent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return (
    <div>
      <p>Hello, {user.emailAddresses[0].emailAddress}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Next Steps

1. Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`
2. Run `npm run dev`
3. Test sign up/sign in flow

## Resources

- Official Docs: https://clerk.com/docs/quickstarts/react
- Clerk Dashboard: https://dashboard.clerk.com
