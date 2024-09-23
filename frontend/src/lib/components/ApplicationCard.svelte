<script>
import {goto} from "$app/navigation";
import {onMount} from "svelte";
import FaEdit from "svelte-icons/fa/FaEdit.svelte";
import {Modal} from "$components";
import {api} from "$api";
import {toast} from "svelte-sonner";

export let appDetails = [];
let showAppModal = false;
let groups = [];

const handleEnterApp = () => {
  goto(`/applications/${appDetails.App_Acronym}`);
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
    let tempStartDate = appDetails.App_startDate;
    let tempEndDate = appDetails.App_endDate;
    appDetails.App_startDate = startDateHtml;
    appDetails.App_endDate = endDateHtml;
    try {
      const response = await api.post('/api/application/update', {application: appDetails}, { withCredentials: true });
      toast.success(response.data.success);
      appDetails.App_startDate = tempStartDate;
      appDetails.App_endDate = tempEndDate;
    } catch(error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  function convertDateFormat(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  let startDateHtml, endDateHtml;

  onMount(() => {
    startDateHtml = convertDateFormat(appDetails.App_startDate);
    endDateHtml = convertDateFormat(appDetails.App_endDate);
  })

</script>

<Modal bind:showModal={showAppModal}>
  <div class="create-app-modal">
    <h1>Edit Application</h1>
    <div class="form-group">
      <label for="app-acronym">App Acronym:</label>
      <input type="text" name="app-acronym" placeholder="App Acronym" bind:value={appDetails.App_Acronym}/>
    </div>
    <div class="form-group">
      <label for="app-rnumber">App R number:</label>
      <input type="text" name="app-rumber" placeholder="App R number" bind:value={appDetails.App_Rnumber}/>
    </div>
    <div class="form-group">
      <label for="app-rnumber">App R number:</label>
      <input type="text" name="app-rumber" placeholder="App R number" bind:value={appDetails.App_Rnumber}/>
    </div>
    <div class="form-group">
      <label for="app-description">App Description:</label>
      <textarea name="app-description" bind:value={appDetails.App_Description}/>
    </div>
    <div class="form-group">
      <label for="app-startdate">Start Date:</label>
      <input type="date" name="app-startdate" placeholder="DD/MM/YYYY" bind:value={startDateHtml}/>
    </div>
    <div class="form-group">
      <label for="app-enddate">End Date:</label>
      <input type="date" name="app-enddate" placeholder="DD/MM/YYYY" bind:value={endDateHtml}/>
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
      <button on:click={handleEditApp}>Create</button>
      <button on:click={toggleAppModal}>Cancel</button>
    </div>
  </div>
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="application-card" on:click={handleEnterApp}>
  <div class="card-title">
    <h1>{appDetails.App_Acronym}</h1>
    <button on:click|stopPropagation={toggleAppModal} class="edit-button"><FaEdit/></button>
  </div>

  <p><b>App Description</b> {appDetails.App_Description}</p>
  <p><b>Start Date</b> {appDetails.App_startDate}</p>
  <p><b>End Date</b> {appDetails.App_endDate}</p>
</div>

<style>
.application-card {
  width: 650px;
  height: 200px;
  padding: 20px;
  margin: 10px;
  background-color: #eee;
}
.application-card:hover {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.1);
}
p {
  margin-top: 10px;
}

.edit-button{
    background-color: transparent;
    border: none;
    color: #a1a1a1;
    width: 48px;
    cursor: pointer;
  }

.card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    width: 500px;
    height: 650px;
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
</style>