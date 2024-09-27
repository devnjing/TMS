<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {api} from "$api";
	import { toast } from "svelte-sonner";
  import {ApplicationCard, Modal} from "$components";

  let applications = [];
  async function getApplications() {
    try {
      const response = await api.get('/api/applications/by-permit', { withCredentials: true });
      return response.data;
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  let groups = [];
  async function getAllGroups() {
    try {
		const response = await api.get('/api/groups', { withCredentials: true });
		groups = response.data;
	  } catch (error) {
		  if (error.status === 401) {
			  goto('/login');
		  }
		  toast.error(error.response.data.error);
	  }
  }

  let showAppModal = false;
  async function toggleAppModal() {
    showAppModal = !showAppModal;
    if(showAppModal){
      getAllGroups();
    }
  }

  let newApp = {      
    App_Acronym: '',
    App_Description: '',
    App_Rnumber: '',
    App_startDate: '',
    App_endDate: '',
    App_permit_Create: '',
    App_permit_Open: '', 
    App_permit_toDoList: '',
    App_permit_Doing: '',
    App_permit_Done: '',
  }
  async function handleCreateApp() {
    try {
      const response = await api.post('/api/applications', {application: newApp}, { withCredentials: true });
      toast.success(response.data.success);
      newApp = {      
        App_Acronym: '',
        App_Description: '',
        App_Rnumber: '',
        App_startDate: '',
        App_endDate: '',
        App_permit_Create: '',
        App_permit_Open: '', 
        App_permit_toDoList: '',
        App_permit_Doing: '',
        App_permit_Done: '',
      }
      applications = await getApplications();
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  function handleCancel(){
    newApp = {      
      App_Acronym: '',
      App_Description: '',
      App_Rnumber: '',
      App_startDate: '',
      App_endDate: '',
      App_permit_Create: '',
      App_permit_Open: '', 
      App_permit_toDoList: '',
      App_permit_Doing: '',
      App_permit_Done: '',
    }
  showAppModal = false;
  }

  let isPL = false;
  async function isInGroup(groupName) {
    try{
      const response = await api.post('/api/user/is-in-group', {group: groupName}, { withCredentials: true });
      return response.data.isInGroup;
    } catch(error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  onMount(async () => {
    applications = await getApplications();
    isPL = await isInGroup('pl');
  })

</script>

<Modal bind:showModal={showAppModal}>
  <div class="create-app-modal">
    <h1>Create Application</h1>
    <div class="form-group">
      <label for="app-acronym">App Acronym:</label>
      <input type="text" name="app-acronym" placeholder="App Acronym" bind:value={newApp.App_Acronym}/>
    </div>
    <div class="form-group">
      <label for="app-rnumber">App R number:</label>
      <input type="text" name="app-rumber" placeholder="App R number" bind:value={newApp.App_Rnumber}/>
    </div>
    <div class="form-group">
      <label for="app-description">App Description:</label>
      <textarea name="app-description" bind:value={newApp.App_Description}/>
    </div>
    <div class="form-group">
      <label for="app-startdate">Start Date:</label>
      <input type="date" name="app-startdate" placeholder="DD/MM/YYYY" bind:value={newApp.App_startDate}/>
    </div>
    <div class="form-group">
      <label for="app-enddate">End Date:</label>
      <input type="date" name="app-enddate" placeholder="DD/MM/YYYY" bind:value={newApp.App_endDate}/>
    </div>
    <div class="form-group">
      <label for="create">Permit Create:</label>
      <select name="create" bind:value={newApp.App_permit_Create}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="open">Permit Open:</label>
      <select name="open" bind:value={newApp.App_permit_Open}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="todo">Permit ToDo:</label>
      <select name="todo" bind:value={newApp.App_permit_toDoList}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="doing">Permit Doing:</label>
      <select name="doing" bind:value={newApp.App_permit_Doing}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="done">Permit Create:</label>
      <select name="done" bind:value={newApp.App_permit_Done}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="modal-buttons">
      <button on:click={handleCreateApp}>Create</button>
      <button on:click={handleCancel}>Cancel</button>
    </div>
  </div>
</Modal>

<div>
  <div class="top-bar">
    <h1>Applications</h1>
    {#if isPL}
    <button class="add-groups" on:click={toggleAppModal}>+ APPLICATION</button>
    {/if}
  </div>
  <div class="applications-container">
    {#each applications as app}
    <ApplicationCard bind:appDetails={app}/>
    {/each}
  </div>
</div>


<style>

  .create-app-modal {
    text-align: center;
  }

  .form-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-group label {
    width: 200px;
    font-weight: bold;
  }

  .form-group input, textarea, select {
    background-color: #ccc;
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    outline: none;
    margin-top: 10px;
  }

  textarea {
    resize: none;
  }

.top-bar {
      display: flex;
      justify-content: space-between;
      margin: 50px 100px 20px 100px;
  }

  .applications-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    justify-content: center;
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

  .modal-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }
</style>