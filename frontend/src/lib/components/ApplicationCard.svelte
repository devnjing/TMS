<script>
import {goto} from "$app/navigation";
import {onMount} from "svelte";
import FaEdit from "svelte-icons/fa/FaEdit.svelte";
import {Modal} from "$components";
import {api} from "$api";
import {toast} from "svelte-sonner";
import {selectedApp} from "../../stores/appData";

export let appDetails = [];
let showAppModal = false;
let groups = [];
let startDateFormatted, endDateFormatted;
export let currentUser;

const handleEnterApp = () => {
  selectedApp.set(appDetails.App_Acronym);
  goto('/applications/tasks');
}

async function toggleAppModal() {
    showAppModal = !showAppModal;
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

  async function handleEditApp() {
    try {
      const response = await api.post('/api/application/update', {application: appDetails}, { withCredentials: true });
      toast.success(response.data.success);
      showAppModal = false;
      await getAppDetails();
      startDateFormatted = formatDate(appDetails.App_startDate);
      endDateFormatted = formatDate(appDetails.App_endDate);

    } catch(error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function getAppDetails(){
    try {
      const response = await api.post('/api/application', {App_Acronym: appDetails.App_Acronym}, { withCredentials: true });
      appDetails = response.data;
    } catch(error){
      if(error.status === 401){
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function handleCancel(){
    await toggleAppModal();
     await getAppDetails();
  }

  function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  onMount(() => {
    startDateFormatted = formatDate(appDetails.App_startDate);
    endDateFormatted = formatDate(appDetails.App_endDate);
  })

</script>
<Modal bind:showModal={showAppModal}>
  <div class="create-app-modal">
    <h1>Edit Application</h1>
    <div class="form-group">
      <label for="app-acronym">App Acronym:</label>
      <p>{appDetails.App_Acronym}</p>
    </div>
    <div class="form-group">
      <label for="app-rnumber">App R number:</label>
      <p>{appDetails.App_Rnumber}</p>
    </div>
    <div class="form-group">
      <label for="app-description">App Description:</label>
      <textarea name="app-description" bind:value={appDetails.App_Description}/>
    </div>
    <div class="form-group">
      <label for="app-startdate">Start Date:</label>
      <input type="date" name="app-startdate" bind:value={appDetails.App_startDate}/>
    </div>
    <div class="form-group">
      <label for="app-enddate">End Date:</label>
      <input type="date" name="app-enddate" bind:value={appDetails.App_endDate}/>
    </div>
    <div class="form-group">
      <label for="create">Permit Create:</label>
      <select name="create" bind:value={appDetails.App_permit_Create}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="open">Permit Open:</label>
      <select name="open" bind:value={appDetails.App_permit_Open}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="todo">Permit ToDo:</label>
      <select name="todo" bind:value={appDetails.App_permit_toDoList}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="doing">Permit Doing:</label>
      <select name="doing" bind:value={appDetails.App_permit_Doing}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="done">Permit Create:</label>
      <select name="done" bind:value={appDetails.App_permit_Done}>
        {#each groups as group}
          <option value={group}>{group}</option>
        {/each}
      </select>
    </div>
    <div class="modal-buttons">
      <button on:click={handleEditApp}>Save</button>
      <button on:click={handleCancel}>Cancel</button>
    </div>
  </div>
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="application-card" on:click={handleEnterApp}>
<div class="group">
  <h3>App Acronym:</h3>
  <p>{appDetails.App_Acronym}</p>
</div>
<div class="group">
  <h3>App Description:</h3>
  <pre>{appDetails.App_Description}</pre>
</div>
<div class="group">
  <h3>Start Date:</h3>
  <p>{startDateFormatted}</p>
</div>
<div class="group">
  <h3>End Date:</h3>
  <p>{endDateFormatted}</p>
</div>
{#if currentUser.groups.includes("pl")}
<div class='edit-icon'>
  <button class="edit-button" on:click|stopPropagation={toggleAppModal}><FaEdit/></button>
</div>
{/if}

</div>

<style>
  .application-card {
    width: 90%;
    height: 70%;
    background-color: #e0e0e0;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    margin: 20px;
  }

  .group {
    display: flex;
    align-items: top;
    width: 100%;
    margin-bottom: 20px;
  }

  .group h3 {
    width: 200px;
    margin-right: 10px;
  }
  .group p {
    width: 100%;
  }

  .group pre {
    overflow-y: scroll;
    overflow-x: hidden;
    min-height: 100px;
    max-height: 100px;
    width: 100%;
    border: 1px solid #ccc;
    padding: 10px;
    text-wrap: wrap;
  }

  .application-card:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.1);
  }


  button {
      padding: 10px;
      color: white;
      background-color: black;
      border: none;
      cursor: pointer;
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
    resize: none;
    width: 500px;
    height: 100px;
  }

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

  .modal-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }

  .edit-button {
    background-color: transparent;
    color: #a1a1a1;
    width: 48px;
  }
  .edit-icon {
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>