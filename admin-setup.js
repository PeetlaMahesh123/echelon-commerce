const { createClient } = require('@supabase/supabase-js');

// Your project details
const supabaseUrl = 'https://euhnreksknsggkvjvcvi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aG5yZWtza25zZ2drdmp2Y3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NDY3MzksImV4cCI6MjA4OTIyMjczOX0.eM5vYS-AlBKoYKRZhoJzW8PvylJ2hZpI5EbJn-68v3U';

async function setupAdmin(email, password) {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('🔐 Signing in...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (signInError) {
            console.error('❌ Login failed:', signInError.message);
            return;
        }

        console.log('✅ Logged in as:', signInData.user.email);
        console.log('👤 User ID:', signInData.user.id);

        console.log('🔧 Adding admin role...');
        const { data, error } = await supabase
            .from('user_roles')
            .insert([{ 
                user_id: signInData.user.id, 
                role: 'admin' 
            }]);

        if (error) {
            console.error('❌ Failed to add admin role:', error.message);
            console.log('\n📋 SQL to run manually:');
            console.log(`INSERT INTO user_roles (user_id, role) VALUES ('${signInData.user.id}', 'admin') ON CONFLICT (user_id, role) DO NOTHING;`);
            console.log('\n🌐 Dashboard: https://supabase.com/dashboard/project/euhnreksknsggkvjvcvi');
        } else {
            console.log('✅ Admin role added successfully!');
            console.log('🚀 You can now access: http://localhost:8080/admin');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Usage: node admin-setup.js your-email@example.com your-password
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node admin-setup.js your-email@example.com your-password');
} else {
    setupAdmin(email, password);
}
