<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {api} from "$api";
	import { toast } from "svelte-sonner";
  import {ApplicationCard, Modal, GroupTags} from "$components";


  let applications = [
    {
      App_Acronym: 'App1',
      App_Description: 'Application 1 eeeeeeeeeeeeee',
      App_Rnumber: '1000',
      App_startDate: '2022-01-01',
      App_endDate: '2022-12-31',
      App_permit_Create: ["admin", "pl"],
      App_permit_Open: ["admin", "pl"], 
      App_permit_toDo: ["admin", "pl"],
      App_permit_Doing: ["admin", "pl"],
      App_permit_Done: ["admin", "pl"],
    },
    {
      App_Acronym: 'App2',
      App_Description: 'Application 2 aaaaaaaaaaaaaaaaaaa',
      App_Rnumber: '100',
      App_startDate: '2022-01-01',
      App_endDate: '2022-12-31',
      App_permit_Create: ["admin", "pl"],
      App_permit_Open: ["admin", "pl"], 
      App_permit_toDo: ["admin", "pl"],
      App_permit_Doing: ["admin", "pl"],
      App_permit_Done: ["admin", "pl"],
    },
  ]
  let newApp = {      
    App_Acronym: '',
    App_Description: '',
    App_Rnumber: '',
    App_startDate: '',
    App_endDate: '',
    App_permit_Create: [],
    App_permit_Open: [], 
    App_permit_toDo: [],
    App_permit_Doing: [],
    App_permit_Done: [],
  }
  let selectedApp;
  let showAppModal = false;

  onMount(async () => {
    // todo: API call to get all apps
    try {
      const response = await api.get('/api/user/status', { withCredentials: true });
      if (response.data.accountStatus !== 'active') {
        goto('/login');
      }
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  })

  function handleEnterApp () {
    goto(`/applications/${selectedApp}`);
  }

  function toggleAppModal() {
    showAppModal = !showAppModal;
  }

  function handleCreateApp() {
    //TODO api to create app
    console.log("create app");
    newApp = {      
    App_Acronym: '',
    App_Description: '',
    App_Rnumber: '',
    App_startDate: '',
    App_endDate: '',
    App_permit_Create: [],
    App_permit_Open: [], 
    App_permit_toDo: [],
    App_permit_Doing: [],
    App_permit_Done: [],
  }
  }


</script>
<Modal bind:showModal={showAppModal}>
  <div class="create-app-modal">
    <h1>Create Application</h1>
    <div class="create-app-form">
      <label for="app-acronym">App Acronym:</label>
      <input type="text" name="app-acronym" placeholder="Name" bind:value={newApp.App_Acronym}/>
      <label for="app-r-number" >App R-Number:</label>
      <input type="text" name="app-r-number" placeholder="Number" bind:value={newApp.App_Rnumber}/>
      <label for="app-description">App Description:</label>
      <textarea name="app-description" placeholder="" bind:value={newApp.App_Description}/>
      <label for="start-date">Start Date:</label>
      <input type="date" name="start-date" placeholder="" bind:value={newApp.App_startDate}/>
      <label for="end-date">End Date:</label>
      <input type="date" name="end-date" placeholder="" bind:value={newApp.App_endDate}/>
    </div>
    <h2>Task Permissions</h2>
    <div class="create-app-form">      
      <label for="create">Create:</label>
      <GroupTags name="create"editTags=true bind:selected={newApp.App_permit_Create}/>
      <label for="open">Open:</label>
      <GroupTags name="open"editTags=true bind:selected={newApp.App_permit_Open}/>
      <label for="todo">ToDo:</label>
      <GroupTags name="todo"editTags=true bind:selected={newApp.App_permit_toDo}/>
      <label for="doing">Doing:</label>
      <GroupTags name="doing"editTags=true bind:selected={newApp.App_permit_Doing}/>
      <label for="done">Done:</label>
      <GroupTags name="done"editTags=true bind:selected={newApp.App_permit_Done}/>
    </div>
    <div class="create-app-buttons">
      <button on:click={handleCreateApp}>Create</button>
      <button on:click={toggleAppModal}>Cancel</button>
    </div>
  </div>
</Modal>

<div>
  <div class="top-bar">
    <h1>User Management</h1>
    <button class="add-groups" on:click={toggleAppModal}>+ GROUP</button>
  </div>
  <div class="applications-container">
    {#each applications as app}
    <ApplicationCard bind:appDetails={app}/>
    {/each}
  </div>
</div>


<style>

.top-bar {
      display: flex;
      justify-content: space-between;
      margin: 50px 100px 20px 100px;
  }

  .applications-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    justify-items: center;
  }

  .create-app-modal {
    display: flex;
    flex-direction: column;
    width: 700px;
    height: 600px;
    align-items: center;
  }

  .create-app-form {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 5px;
    width: 100%;
    justify-items: center;
    align-items: center;
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

  .create-app-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  input {
    width: 95%;
    padding: 5px 0px 5px 5px;
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
  textarea {
    width: 535px;
    height: 50px;
  }
</style>