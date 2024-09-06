<script>
  let users = [];
  let newUser = {name: '', email: '', group: '', password: '', active: false};
  let username = 'test';
  let password = 'test';
  let email = 'test@test.com';


  async function addUser() {
      // TODO: call api
  }

  async function loadUsers() {
    // TODO: call api
  }

  async function updateUser(){
    //TODO: call api
  }

  loadUsers();
</script>

<div class="table-container">
  <div class="table-box">
    <h1>User Management</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Group</th>
          <th>Password</th>
          <th>Active</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class='field'>
            <input type="text" placeholder="Name" bind:value={newUser.name} style="width: 100%">
            </div>
          </td>
          <td>
            <div class='field'>
              <input type="email" placeholder="Email" bind:value={newUser.email} style="width: 100%">
            </div>
          </td>
          <td>
            <div class="field">
              <input type="text" placeholder="Group" bind:value={newUser.group} style="width: 100%">
            </div>
            
          </td>
          <td>
            <div class="field">
              <input type="password" placeholder="Password" bind:value={newUser.password} style="width: 100%">
            </div>
          </td>
          <td>
            <input type="checkbox" bind:group={newUser.active}>
          </td>
          <td><button type="submit" on:click={() => addUser()}>Add</button></td>
        </tr>
        {#each users as user}
          <tr>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.group}</td>
            <td>{user.password}</td>
            <td>{user.active ? 'Yes' : 'No'}</td>
            <td><button type="submit" on:click={() => updateUser()}>Edit</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .table-container {
    width: 100%;
    margin: auto;
  }

  .table-box {
    align-items: center;
    width: 100%;
    margin: auto;
  }

  table {
    border: 0px;
    border-collapse: collapse;
    width: 100%;
  }

  

  th, td {
    padding: 8px;
  }

  th {
    background-color: #B6D0E2;
    color: white;
  }

  .field {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin: 12px;
    background-color: #D3D3D3;
  }

  input[type="text"], input[type="password"], input[type="email"] {
    width: 100%;
    border: none;
    outline: none;
    background-color: #D3D3D3;
  }

</style>