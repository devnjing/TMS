<script>
  import { page } from "$app/stores";
  import {Modal} from "$components";
  import { onMount } from "svelte";
  import {toast} from "svelte-sonner";
  import {getUser,updateUser,checkAdmin} from "$api";

  let isAdmin = false;

  onMount(async () => {
    isAdmin = await checkAdmin();
    currentUser = await getUser();
  })

  let showProfileModal = false;


  let currentUser = {
    username: '',
    email: '',
    password: '',
  };

  async function toggleProfileModal() {
    showProfileModal = !showProfileModal;
    currentUser = await getUser();
  }

  async function updateUserProfile(){
    const response = await updateUser(currentUser);
    if (response.status === 200) {
      toast.success("Profile updated successfully");
    }
    currentUser = await getUser();
  }
</script>

<Modal bind:showModal={showProfileModal}>
  <div class="edit-profile-modal">
    <h1>Edit Profile</h1>
    <div class="edit-profile-form">    
      <label for="username">Username:</label>
      <input type="text" name="username" bind:value={currentUser.username} readonly/>
      <label for="email">Email:</label>
      <input type="email" name="email" bind:value={currentUser.email} placeholder=""/>
      <label for="password">Password:</label>
      <input type="password" name="password" bind:value={currentUser.password} placeholder=""/>
    </div>
    <div class="edit-profile-buttons">
      <button on:click={updateUserProfile}>Update</button>
      <button on:click={toggleProfileModal}>Cancel</button>
    </div>
  </div>
</Modal>

<div class="navbar">
  <h1>Hello {currentUser.username}</h1>
  <nav>
    <a href="/applications" class:active={$page.url.pathname === "/applications"}>Applications</a>
    {#if isAdmin}
      <a href="/users" class:active={$page.url.pathname === "/users"}>User Management</a>
    {/if}
  </nav>
  <button on:click={toggleProfileModal}>Edit Profile</button>
</div>

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
    text-decoration: underline;
    font-size: large;
  }

  .edit-profile-modal {
    display: flex;
    flex-direction: column;
    width: 500px;
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
    box-shadow: 0 0 1px rgba(0,0,0,0.3);
  }

  input:hover {
    border-color: #aaa;
  }
</style>