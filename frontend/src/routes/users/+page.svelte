<script>
  import {onMount} from "svelte";
  import {getUsersWithGroups, updateUser} from "$api";
  import {GroupTags} from "$components";

  let users = [];


  onMount(async () => {
      users = await getUsersWithGroups();
  })

  function openGroupModal(){
      alert("open group modal");
      //TODO: create group modal
  }

  $: editingRow = null;



  function toggleEdit(index) {
    if(editingRow === index) {
      editingRow = null;
    } else {
      editingRow = index;
    }
    console.log(editingRow);
  }

  function handleDropdownChange(event, index) {
        rows[index].accountStatus = event.target.value;
    }

  async function saveChanges(user) {
    //TODO: api call to send changes to backend
    await updateUser(user);
  }

  async function cancelChanges() {
    //TODO: cancel (refresh data?)
    users = await getUsersWithGroups();
  }

  async function addUser(){
    //TODO: add user
    users = await getUsersWithGroups();
  }
  
</script>

<div class="container">
  <div class="top-bar">
      <h1>User Management</h1>
      <button class="add-groups" on:click={openGroupModal}>+ GROUP</button>
  </div>

  <div class="user-table">
      <table>
          <th>Name</th>
          <th>Email</th>
          <th>Groups</th>
          <th>Password</th>
          <th>Status</th>
          <th>Action</th>
          {#each users as user, index (user.username)}
              <tr>
                  <td>{user.username}</td>
                  <td contenteditable={editingRow === index} class="editable">{user.email}</td>
                  <td><GroupTags editTags={editingRow === index} bind:selected={user.groups}/></td>
                  <td contenteditable={editingRow === index} class="editable">{user.password}</td>
                  <td contenteditable={editingRow === index}>
                    <!-- Display dropdown only if the row is in edit mode -->
                    {#if editingRow === index}
                        <div class="dropdown active">
                            <select
                                bind:value={user.accountStatus}
                                on:change={(e) => handleDropdownChange(e, index)}
                            >
                                <option value="active">active</option>
                                <option value="disabled">disabled</option>
                            </select>
                        </div>
                    {:else}
                        {user.accountStatus}
                    {/if}
                </td>
                <td>
                  {#if editingRow === index}
                    <button class="save-button" on:click={() => {toggleEdit(index); saveChanges(user)}}>Save Changes</button>
                    <button class="cancel-button" on:click={() => {toggleEdit(index); cancelChanges()}}>Cancel</button>
                  {:else}
                    <button class="edit-button" on:click={() => toggleEdit(index)}>Edit</button>
                  {/if}
                </td>
          {/each}
      </table>
  </div>
</div>

<style>
  .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: auto;
  }

  .top-bar {
      display: flex;
      justify-content: space-between;
      margin: 20px;
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
    background-color: lightblue;
  }

  th, td {
    padding: 8px;
    text-align: left;
    width: 200px;
    
  }
  
  td {
    position: relative;
    overflow: visible;
    border: solid 1px transparent;
  }

  td[contenteditable="true"] {
    background-color: #f0f0f0;
    border: solid 1px black;
  }


  .editable {
    position: relative;
   
  }

  .dropdown {
        display: none;
        position: relative;
        background-color: white;
    }

    select {
      width: 100%;
      font-size: medium;
    }

    .dropdown.active {
        display: block;
    }

    .dropdown option:hover {
      background-color: #ccc;
    }
  
</style>