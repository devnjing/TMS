<script>
  import { page } from "$app/stores";
  import {Modal} from "$components";
  import { onMount } from "svelte";
  import {api} from "$api";
  import {goto} from "$app/navigation";
  import {toast} from "svelte-sonner";

  let isAdmin = false;
  let currentUser = {
    username: '',
    email: '',
    password: '',
  };
  let showProfileModal = false;
  let newPassword;

  async function checkIfAdmin () {
    // check if admin
    try {
		  const response = await api.get('/api/user/is-admin', { withCredentials: true });
		  return response.data.isAdmin;
	  } catch (error) {
		  toast.error(error.response.data.error);
	}
  }

  async function getUser(){
  // get user data
  try {
		const response = await api.get('/api/user', { withCredentials: true });
		return response.data.user;
	} catch (error) {
		toast.error(error.response.data.error);
	}
  }

  async function updateProfile() {
    // update profile
    try {
      if (newPassword) {
        currentUser.password = newPassword;
      }
      const response = await api.post('/api/user', { user: currentUser }, { withCredentials: true });
      toast.success(response.data.success);
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }
  
  onMount(async () => {
    isAdmin = await checkIfAdmin();
    currentUser = await getUser();
  })

  async function toggleProfileModal() {
    showProfileModal = !showProfileModal;
    currentUser = await getUser();
  }

  async function handleEditProfile(){
    await updateProfile();
    currentUser = await getUser();
    toggleProfileModal();
  }

  async function handleLogout() {
    try {
      const response = await api.get('/api/logout', { withCredentials: true });
      goto('/login');
    } catch (error) {
      toast.error(error.response.data.error);
    }
  }
</script>
{#if currentUser}
<Modal bind:showModal={showProfileModal}>
  <div class="edit-profile-modal">
    <h1>Edit Profile</h1>
    <div class="edit-profile-form">    
      <label for="username">Username:</label>
      <p name="username" class="username">{currentUser.username}</p>
      <label for="email">Email:</label>
      <input type="email" name="email" bind:value={currentUser.email} placeholder=""/>
      <label for="password">New Password:</label>
      <input type="password" name="password" bind:value={newPassword} placeholder=""/>
    </div>
    <div class="edit-profile-buttons">
      <button on:click={handleEditProfile}>Update</button>
      <button on:click={toggleProfileModal}>Cancel</button>
    </div>
  </div>
</Modal>


<div class="navbar">
  <h1>Hello {currentUser.username}</h1>
  <nav>
    <a href="/applications" class:active={$page.url.pathname.startsWith("/applications")} >Applications</a>
    {#if isAdmin}
      <a href="/users" class:active={$page.url.pathname === "/users"}>User Management</a>
    {/if}
  </nav>
  <div>
    <button on:click={toggleProfileModal}>Edit Profile</button>
    <button on:click={handleLogout}>Logout</button>
  </div>
</div>
{/if}
<style>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 50px 10px 50px;
    background-color: #f8f8f8;
    border-bottom: 1px solid #ccc;
    height: 80px;
    background-color: black;
    color: white;
  }

  nav a {
    color: white;
    text-decoration: none;
    font-size: larger;
    padding: 8px;
  }

  nav a.active {
    text-decoration: underline;
  }

  .navbar button {
    background-color: transparent;
    border: none;
    color: white;
    text-decoration: none;
    padding: 0;
    cursor: pointer;
    font-size: large;
    margin: 5px;
  }

  .edit-profile-modal {
    display: flex;
    flex-direction: column;
    width: 600px;
    height: 300px;
    justify-content: center;
    align-items: center;
  }

  .edit-profile-form {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 10px;
    width: 100%;
    justify-items: center;
    align-items: center;
    margin: 20px;
  }

  .edit-profile-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .edit-profile-buttons button {
    padding: 10px;
      color: white;
      background-color: black;
      border: none;
      cursor: pointer;
  }

  input {
    width: 95%;
    padding: 10px 0px 10px 10px;
    margin: 5px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1)
  }

  input:focus {
    border-color: #aaa;
    box-shadow: 0 0 1px 
    rgba(0,0,0,0.3);
  }

  input:hover {
    border-color: #aaa;
  }

  .username {
    display: flex;
    width: 100%;
    justify-content: left;
    text-align: left;
    margin-left: 20px;
  }

</style>