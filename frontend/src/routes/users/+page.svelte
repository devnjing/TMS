<script>
  import {onMount} from "svelte";
  import {api} from "$api";
  import {GroupTags,Modal} from "$components";
  import FaEdit from "svelte-icons/fa/FaEdit.svelte";
  import {goto} from "$app/navigation";
  import {toast} from "svelte-sonner";

  let users = [];
  let showGroupModal = false;
  let newUser = {
    username: '',
    email: '',
    password: '',
    user_group: [],
    accountStatus: 'active'
  };
  let newPassword;
  let newGroup = "";

  $: editingRow = null;

  async function getUsersWithGroups() {
    try {
		  const response = await api.get('/api/users', { withCredentials: true });
		  return response.data.users;
	  } catch (error) {
		if (error.status === 401) {
			goto('/login');
		}
		  toast.error(error.response.data.error);
	  }
  }

  onMount(async () => {
    users = await getUsersWithGroups();
  })

  async function handleNewUser() {
    // check if fields are empty
    if (!newUser.username || !newUser.password) {
		  toast.error('Username & password are mandatory');
		return;
	  }

    // username input validation
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(newUser.username)) {
      toast.error("Username can only contain letters and numbers");
      return;
    }

    // check if user exists
    const foundUser = users.find(user => user.username === newUser.username);
    if (foundUser) {
      toast.error('Username already exists');
      return;
    }
    // validate password
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[^\da-zA-Z]).{8,10}$/;
    if (!passwordRegex.test(newUser.password)) {
      toast.error("Password must be between 8 and 10 characters and contain at least one letter, one number, and one special character");
      return;
    }
    if (newUser.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(newUser.email)) {
        toast.error("Email is not valid");
        return; 
      }
    }
    try {
      const response = await api.post('/api/users', {user: newUser}, { withCredentials: true });
      toast.success(response.data.success);
    } catch (error) {
      toast.error(error.response.data.error);
      if (error.status === 401) {
        goto('/login');
      }
    }

    users = await getUsersWithGroups();

    // reset form
    newUser = {
      username: '',
      email: '',
      password: '',
      user_group: [],
      accountStatus: 'active'
    }
  }

  function toggleEdit(index) {
    if(editingRow === index) {
      editingRow = null;
    } else {
      editingRow = index;
    }
  }

  function handleDropdownChange(event, index) {
        rows[index].accountStatus = event.target.value;
    }

  async function handleEditUser(user) {
    if (!user.username || !user.password) {
		toast.error('Please fill in all fields');
		return;
	}
	try {
    if(newPassword){
      user.password = newPassword;
    } 
		const response = await api.post('/api/users/update', { user }, { withCredentials: true });
    newPassword = '';
		toast.success(response.data.success);
	} catch (error) {
		if (error.status === 401) {
			goto('/login');
		}
		toast.error(error.response.data.error);
	}
    users = await getUsersWithGroups();
    editingRow = null;
  }

  async function cancelUserChanges() {
    users = await getUsersWithGroups();
  }

  function toggleGroupModal() {
    showGroupModal = !showGroupModal;
  }

  async function handleAddGroup() {
    try {
      const groupRegex = /^[a-zA-Z0-9_]{1,50}$/;
      if (!groupRegex.test(newGroup)) {
        toast.error("Group name must be a maximum of 50 characters, and only consist of letters, numbers, and underscores");
        return;
      }

      const response = await api.post('/api/groups', { newGroup }, { withCredentials: true });
      toast.success(response.data.success);
      newGroup = "";
	  } catch (error) {
      toast.error(error.response.data.error);
      if (error.status === 401) {
        goto('/login');
		  }
	  }
  }
</script>

<Modal bind:showModal={showGroupModal}>
  <div class="add-group-modal">
    <h1>Add Group</h1>
    <div class="add-group-form">    
      <label for="groupname">Group Name:</label>
      <input type="text" bind:value={newGroup} placeholder=""/>
    </div>
    <div class="add-group-buttons">
      <button on:click={handleAddGroup}>Add</button>
      <button on:click={toggleGroupModal}>Cancel</button>
    </div>
  </div>
</Modal>


<div class="container">
  <div class="top-bar">
      <h1>User Management</h1>
      <button class="add-groups" on:click={toggleGroupModal}>+ GROUP</button>
  </div>

  <div class="user-table">
      <table>
        <th class="col1"></th>
          <th class="col2">Name</th>
          <th class="col3">Email</th>
          <th class="col4">Groups</th>
          <th class="col5">Password</th>
          <th class="col6">Status</th>
          <th class="col7">Action</th>
          <th class="col8"></th>
          <tr>
            <td style="border-bottom: none"></td>
            <td><input type="text" name="username" placeholder="Name" bind:value={newUser.username}/></td>
            <td><input type="email" name="email" placeholder="Email" bind:value={newUser.email}/></td>
            <td><GroupTags editTags=true bind:selected={newUser.user_group}/></td>
            <td><input type="password" name="password" placeholder="Password" bind:value={newUser.password}/></td>
            <td>
              <div class="dropdown active">
                <select bind:value={newUser.accountStatus}>
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                </select>
              </div>
            </td>
            <td><button type="submit" on:click={handleNewUser}>Submit</button></td>
            <td style="border-bottom: none"></td>
          </tr>
          {#if users}
          {#each users as user, index}
              <tr>
                {#if editingRow === index}
                <td style="border-bottom: none" class="editing"></td>
                <td class="editing">{user.username}</td>
                <td class="editing"><input type="email" name="email" placeholder="New Email" bind:value={user.email}/></td>
                <td class="editing"><GroupTags editTags={editingRow === index} bind:selected={user.groups}/></td>
                <td class="editing"><input type="password" name="password" placeholder="New Password" bind:value={newPassword}/></td>
                {#if !(user.username === "admin")}
                <td class="editing" contenteditable={editingRow === index}>
                      <div class="dropdown active">
                          <select
                              bind:value={user.accountStatus}
                              on:change={(e) => handleDropdownChange(e, index)}
                          >
                              <option value="active">active</option>
                              <option value="disabled">disabled</option>
                          </select>
                      </div>
                </td>
                  {:else}
                  <td class="editing">{user.accountStatus}</td>
                  {/if}
                <td class="editing">
                  <button class="save-button" on:click={() => {toggleEdit(index); handleEditUser(user)}}>Save Changes</button>
                  <button class="cancel-button" on:click={() => {toggleEdit(index); cancelUserChanges()}}>Cancel</button>
                </td>
                <td class="editing"></td>
                {:else}
                <td style="border-bottom: none"></td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><GroupTags editTags={editingRow === index} bind:selected={user.groups}/></td>
                <td><input  style="max-width: 8ch" readonly type="password" name="password" value="12345678"/></td>
                <td>{user.accountStatus}</td>
                <td><button class="edit-button" on:click={() => toggleEdit(index)}><FaEdit/></button></td>
                {/if}
          {/each}
          {/if}
      </table>
  </div>
</div>

<style>
  .add-group-modal {
    display: flex;
    flex-direction: column;
    width: 500px;
    height: 200px;
    justify-content: center;
    align-items: center;
  }

  .add-group-form {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 10px;
    width: 100%;
    justify-items: center;
    align-items: center;
    margin: 20px;
  }

  .add-group-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: auto;
  }

  .top-bar {
      display: flex;
      justify-content: space-between;
      margin: 50px 100px 20px 100px;
  }


  button {
      padding: 10px;
      color: white;
      background-color: black;
      border: none;
      cursor: pointer;
  }

  button:hover {
      background-color: rgba(0,0,0,0.8);
  }

  button:active {
      background-color: rgba(0,0,0,0.5);
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th {
    background-color: #eff4fa;
    height: 80px;
    text-align: left;
    vertical-align: middle;
    color: #8f9bb3;
  }

  .col1,.col8 {
    width: 5%;
  }



  .col2,.col3,.col4,.col5,.col6 {
    width: 13%;
  }
  
  .col7 {
    width: 15%;
  }

  td {
    position: relative;
    overflow: visible;
    border-bottom: 1px solid #e2e2e2;
    height: 50px;
    max-height: 100px;
    padding: 15px 50px 15px 0px;
  }

  .editing {
    background-color: #f0f0f0;
  }

  .dropdown {
        display: inline-block;
        position: relative;
    }

  .dropdown select {
    width: 100%;
    font-size: medium;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #f9f9f9;
    cursor: pointer;
  }

  .dropdown select:focus {
    outline: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

.dropdown option {
    padding: 10px;
    font-size: 16px;
  }

  .dropdown.active {
      display: block;
  }

  .dropdown option:hover {
    background-color: #f2f2f2;
  }

  .dropdown option:selected {
    background-color: #007bff;
    color: #fff;
  }

  .edit-button{
    background-color: transparent;
    color: #a1a1a1;
    width: 48px;
  }

  .edit-button:hover {
    background-color: transparent;
  }

  .edit-button:active {
    background-color: transparent;
  }


  .cancel-button {
    background-color: white;
    color: black;
    border: 1px solid black;
  }

  .cancel-button:hover {
    background-color: #FF474C;
    color: white;
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

  input[readonly] {
    background-color: transparent;
    border: none;
    outline: none;
    cursor: default;
    box-shadow: none;
  }

  
</style>