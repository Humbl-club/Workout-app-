/**
 * Set Admin Role for Clerk User
 *
 * This script sets the admin role in Clerk's publicMetadata for a user by email.
 *
 * Usage: npx tsx scripts/setAdminRole.ts <email>
 * Example: npx tsx scripts/setAdminRole.ts contact@lazy.space
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('❌ Error: CLERK_SECRET_KEY not found in environment variables');
  console.log('\nPlease add CLERK_SECRET_KEY to your .env.local file');
  console.log('Get it from: https://dashboard.clerk.com → API Keys → Secret keys');
  process.exit(1);
}

const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Email address required');
  console.log('\nUsage: npx tsx scripts/setAdminRole.ts <email>');
  console.log('Example: npx tsx scripts/setAdminRole.ts contact@lazy.space');
  process.exit(1);
}

async function setAdminRole(userEmail: string) {
  try {
    console.log(`🔍 Looking up user: ${userEmail}...`);

    // Step 1: Get user by email
    const usersResponse = await fetch(
      `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(userEmail)}`,
      {
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!usersResponse.ok) {
      const error = await usersResponse.text();
      throw new Error(`Failed to fetch user: ${usersResponse.status} - ${error}`);
    }

    const users = await usersResponse.json();

    if (!users || users.length === 0) {
      throw new Error(`User not found with email: ${userEmail}`);
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.id}`);
    console.log(`   Name: ${user.first_name || ''} ${user.last_name || ''}`);
    console.log(`   Email: ${user.email_addresses[0]?.email_address}`);

    // Step 2: Update publicMetadata with admin role
    console.log('\n🔧 Setting admin role...');

    const updateResponse = await fetch(
      `https://api.clerk.com/v1/users/${user.id}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: {
            ...user.public_metadata,
            role: 'admin',
          },
        }),
      }
    );

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update user: ${updateResponse.status} - ${error}`);
    }

    const updatedUser = await updateResponse.json();

    console.log('\n✅ SUCCESS! Admin role set.');
    console.log('\nPublic Metadata:');
    console.log(JSON.stringify(updatedUser.public_metadata, null, 2));
    console.log('\n🎉 User can now access admin dashboard at: http://localhost:3000#admin');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
setAdminRole(email);
