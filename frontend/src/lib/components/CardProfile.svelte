<script>
  export let username = '';
  export let password = '';
  export let email = '';

  async function updateProfile() {
    // TODO: call api
    console.log('username:', username);
    console.log('password:', password);
    console.log('email:', email);
  }
</script>

<div class="profile-popup">
  <div class="profile-popup-inner">
    <h2>Update Profile</h2>
    <div class="field">
      <label for="username">Username</label>
      <input type="text" id="username" readonly bind:value={username} />
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input type="password" id="password" bind:value={password} />
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" bind:value={email} />
    </div>
    <button on:click={updateProfile}>Update</button>
  </div>
</div>