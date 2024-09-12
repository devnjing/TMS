<script>
  import {onMount} from "svelte";
  import {getUsersWithGroups, updateUser, createUser, createGroup} from "$api";
  import {GroupTags,Modal} from "$components";

  let users = [];
  let showGroupModal = false;

  function toggleGroupModal() {
    showGroupModal = !showGroupModal;
  }

  onMount(async () => {
      users = await getUsersWithGroups();
  })


  $: editingRow = null;

  let newUser = {
    username: '',
    email: '',
    password: '',
    user_group: [],
    accountStatus: 'active'
  };
  let newGroup = "";

  async function submitForm() {
    await createUser(newUser);
    users = await getUsersWithGroups();
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

  async function saveChanges(user) {
    await updateUser(user);
  }

  async function cancelChanges() {
    //cancel (refresh data?)
    users = await getUsersWithGroups();
  }

  async function submitGroup() {
    console.log("newgroup", newGroup);
    await createGroup(newGroup);
    newGroup = "";
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
      <button on:click={submitGroup}>Add</button>
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
        <th></th>
          <th>Name</th>
          <th>Email</th>
          <th>Groups</th>
          <th>Password</th>
          <th>Status</th>
          <th>Action</th>
          <th></th>
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
            <td><button type="submit" on:click={submitForm}>Submit</button></td>
            <td style="border-bottom: none"></td>
          </tr>
          {#each users as user, index}
              <tr>
                {#if editingRow === index}
                <td style="border-bottom: none" class="editing"></td>
                <td class="editing">{user.username}</td>
                <td class="editing"><input type="email" name="email" placeholder="Email" bind:value={user.email}/></td>
                <td class="editing"><GroupTags editTags={editingRow === index} bind:selected={user.groups}/></td>
                <td class="editing"><input type="password" name="password" placeholder="Password" bind:value={user.password}/></td>
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
                <td class="editing">
                  <button class="save-button" on:click={() => {toggleEdit(index); saveChanges(user)}}>Save Changes</button>
                  <button class="cancel-button" on:click={() => {toggleEdit(index); cancelChanges()}}>Cancel</button>
                </td>
                <td class="editing"></td>
                {:else}
                <td style="border-bottom: none"></td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td><GroupTags editTags={editingRow === index} bind:selected={user.groups}/></td>
                <td><input readonly type="password" name="password" placeholder="Password" bind:value={user.password}/></td>
                <td>{user.accountStatus}</td>
                <td><button class="edit-button" on:click={() => toggleEdit(index)}>Edit</button></td>
                {/if}
          {/each}
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

  th, td {  
    width: 200px;
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