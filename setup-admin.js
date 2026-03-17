const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and service role key
const supabaseUrl = 'https://euhnreksknsggkvjvcvi.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // You need to get this from Supabase dashboard

async function setupAdmin(email) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // First, get the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.log(`User with email ${email} not found. Please sign up first.`);
      return;
    }

    // Add admin role to the user
    const { data, error } = await supabase
      .from('user_roles')
      .upsert([
        { 
          user_id: user.id, 
          role: 'admin' 
        }
      ]);

    if (error) {
      console.error('Error adding admin role:', error);
    } else {
      console.log(`✅ Admin role added to ${email}`);
      console.log('You can now access admin panel at: http://localhost:8080/admin');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Usage: node setup-admin.js your-email@example.com
const email = process.argv[2];
if (!email) {
  console.log('Usage: node setup-admin.js your-email@example.com');
  process.exit(1);
}

setupAdmin(email);
