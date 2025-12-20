// Enhanced Invitation Flow Test Script
// Run this in the browser console to test the complete flow

async function testEnhancedInvitationFlow() {
  console.log('🚀 Testing Enhanced Team Invitation Flow with Temporary Passwords');
  
  const testEmail = 'testinvite@example.com';
  const testRole = 'sales_representative';
  const testOrgName = 'Test Auto Dealership';
  
  try {
    // Step 1: Send invitation
    console.log('\n📧 Step 1: Sending team invitation...');
    const inviteResponse = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        role: testRole,
        organizationName: testOrgName,
        inviterName: 'Test Manager'
      })
    });

    const inviteResult = await inviteResponse.json();
    console.log('📧 Invite result:', inviteResult);

    if (!inviteResult.success) {
      console.error('❌ Failed to send invitation:', inviteResult.message);
      return;
    }

    const { token, tempPassword } = inviteResult;
    console.log('✅ Invitation sent successfully!');
    console.log('🔑 Temporary password:', tempPassword);
    console.log('🎟️ Invite token:', token);

    // Step 2: Test invite verification
    console.log('\n🔍 Step 2: Verifying invitation token...');
    const verifyResponse = await fetch(`/api/team/invite/verify?token=${token}`);
    const verifyResult = await verifyResponse.json();
    console.log('🔍 Verify result:', verifyResult);

    if (!verifyResult.success) {
      console.error('❌ Failed to verify invitation:', verifyResult.message);
      return;
    }

    console.log('✅ Invitation verified successfully!');
    console.log('👤 Email from invite:', verifyResult.invite.email);

    // Step 3: Test temporary password login
    console.log('\n🔐 Step 3: Testing temporary password login...');
    const loginResponse = await fetch('/api/team/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        email: testEmail,
        tempPassword: tempPassword
      })
    });

    const loginResult = await loginResponse.json();
    console.log('🔐 Login result:', loginResult);

    if (!loginResult.success) {
      console.error('❌ Failed to login with temporary password:', loginResult.message);
      return;
    }

    const userId = loginResult.userId;
    console.log('✅ Temporary password login successful!');
    console.log('👤 User ID:', userId);

    // Step 4: Test profile completion
    console.log('\n👤 Step 4: Testing profile completion...');
    const profileResponse = await fetch('/api/team/invite/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        userId: userId,
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-123-4567',
        newPassword: 'NewSecurePassword123!'
      })
    });

    const profileResult = await profileResponse.json();
    console.log('👤 Profile completion result:', profileResult);

    if (!profileResult.success) {
      console.error('❌ Failed to complete profile:', profileResult.message);
      return;
    }

    console.log('✅ Profile completion successful!');
    console.log('🎉 Enhanced invitation flow test completed successfully!');

    // Test URLs for manual testing
    console.log('\n🔗 Manual Testing URLs:');
    console.log('📧 Invite URL:', `${window.location.origin}/tenant-login?subdomain=test&invite=${token}`);
    console.log('👤 Profile Setup URL:', `${window.location.origin}/profile-setup?token=${token}&userId=${userId}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Test with invalid temporary password
async function testInvalidTempPassword() {
  console.log('\n🔒 Testing Invalid Temporary Password Handling...');
  
  // First get a valid token
  const inviteResponse = await fetch('/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'invalid-test@example.com',
      role: 'sales_representative',
      organizationName: 'Test Dealership',
      inviterName: 'Test Manager'
    })
  });

  const inviteResult = await inviteResponse.json();
  if (!inviteResult.success) {
    console.error('Failed to create test invite');
    return;
  }

  // Try with wrong password
  const loginResponse = await fetch('/api/team/invite/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: inviteResult.token,
      email: 'invalid-test@example.com',
      tempPassword: 'WRONGPASSWORD'
    })
  });

  const loginResult = await loginResponse.json();
  console.log('🔒 Invalid password result:', loginResult);
  
  if (!loginResult.success && loginResult.message.includes('Invalid temporary password')) {
    console.log('✅ Invalid password correctly rejected!');
  } else {
    console.error('❌ Invalid password should have been rejected');
  }
}

console.log('Enhanced Invitation Flow Test Functions Ready!');
console.log('Run testEnhancedInvitationFlow() to test the complete flow');
console.log('Run testInvalidTempPassword() to test security validation');