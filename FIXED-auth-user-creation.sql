// FIXED: Create auth user FIRST, then use same ID in public.users
// This fixes the FK constraint violation in tenant_memberships

    if (existing) {
      console.log("❌ [REGISTER] User already exists:", emailNorm);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // 🔧 FIX: Create Supabase Auth user FIRST to get canonical user ID
    console.log("🔐 [REGISTER] Creating Supabase Auth user...");
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password: password,
      email_confirm: true // mark confirmed to avoid verify step
    });

    if (createErr && createErr.status !== 422 /* user already exists */) {
      console.error("❌ [REGISTER] createUser failed:", createErr);
      return NextResponse.json(
        { error: "Authentication setup failed. Please try again." },
        { status: 500 }
      );
    }

    let authUserId = created?.user?.id;

    // If user already existed, get their ID
    if (!authUserId) {
      const { data: existing, error } = await supabaseAdmin.auth.admin.getUserByEmail(emailNorm);
      if (error || !existing?.user?.id) {
        console.error("❌ [REGISTER] Auth user lookup failed:", error);
        return NextResponse.json(
          { error: "Authentication lookup failed. Please try again." },
          { status: 500 }
        );
      }
      authUserId = existing.user.id;
    }

    console.log("✅ [REGISTER] Auth user established with ID:", authUserId);

    // --- Hash password for public.users
    console.log("🔐 [REGISTER] Hashing password…");
    const password_hash = await hash(password, 10);
    
    // --- Generate security fields for complete user setup
    console.log("🔧 [REGISTER] Generating security fields...");
    const totp_secret = speakeasy.generateSecret({
      name: `GhostCRM (${emailNorm})`,
      issuer: 'GhostCRM'
    }).base32;
    const jwt_token = crypto.randomUUID(); // Placeholder token field

    // 🔧 FIX: Insert into public.users using auth user ID (no tenant_id yet)
    console.log("💾 [REGISTER] Inserting user into public.users with auth ID…");
    const insertResult = await supabaseAdmin
      .from("users")
      .upsert({
        id: authUserId, // 🎯 KEY FIX: Use auth user ID to maintain consistency
        email: emailNorm,
        password_hash,
        role: "owner",
        first_name: firstName ?? "",
        last_name: lastName ?? "",
        company_name: companyName ?? "",
        totp_secret: totp_secret,
        webauthn_credentials: [], // Empty array for new users (jsonb column)
        jwt_token: jwt_token,
        organization_id: null, // Will be set after organization creation
        tenant_id: null // 🔧 FIX: Will be set to organization_id (not random UUID)
      }, { onConflict: "id" })
      .select("id,email,role,tenant_id,totp_secret,webauthn_credentials,jwt_token")
      .single();