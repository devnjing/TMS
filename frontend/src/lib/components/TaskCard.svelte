<script>
  import { onMount } from "svelte";
  import {Modal} from "$components";
  import {api} from "$api";
  import {toast} from "svelte-sonner";  
  import {goto} from "$app/navigation";


  export let taskDetails = [];
  let newNote;

  async function getTaskDetails() {
    try {
      const response = await api.post("/api/task/details", {taskId:taskDetails.Task_id} ,{ withCredentials: true });
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  // for button disable
  let planIsChanged = false;
  function planUpdate () {
    if (currentPlan !== taskDetails.Task_plan)
      planIsChanged = true;
    else {
      planIsChanged = false;
    }
  }

  let taskColor = "white";
  async function updateColor(){
    if(taskDetails.Task_plan == null){
      return;
    }
    try {
      const response = await api.post('/api/plan/color', {Plan_MVP_name: taskDetails.Task_plan}, { withCredentials: true });
      taskColor = response.data;
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  let currentUsername;
  async function getUsername() {
    try {
      const response = await api.get('/api/user/username', { withCredentials: true });
      return response.data.username;
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  let showTaskDetailsModal = false;
  async function toggleTaskDetailsModal() {
    showTaskDetailsModal = !showTaskDetailsModal;
    await checkPermits();
    taskDetails = await getTaskDetails();
    plans = await getPlans();
    console.log(plans);
  }

  async function handleUpdateTask(newState) {
    taskDetails.Task_state = newState;
    taskDetails.newNote = newNote;
    taskDetails.Task_plan = currentPlan;
    taskDetails.Task_owner = currentUsername;
    if(taskDetails.Task_plan === "") {
      taskDetails.Task_plan = null
    }
    try {
      let response = await api.post('/api/task/update', {task: taskDetails}, { withCredentials: true });
      toast.success(response.data.success);
      taskDetails = await getTaskDetails();

    } catch(error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function handleSaveTask(){
    taskDetails.newNote = newNote;
    taskDetails.Task_plan = currentPlan;
    try{
      const response = await api.post('/api/task/update', {task: taskDetails}, { withCredentials: true });
      toast.success(response.data.success);
      newNote = "";
      taskDetails = await getTaskDetails();
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }

  }

  let hasPermits = {
    hasCreatePermit: false,
    hasOpenPermit: false,
    hasToDoListPermit: false,
    hasDoingPermit: false,
    hasDonePermit: false
  }
  async function checkPermits() {
    try {
      const response = await api.post('/api/task/permits', {App_Acronym: taskDetails.Task_app_Acronym}, { withCredentials: true });
      hasPermits = response.data;
    } catch(error) {
      console.log(error);
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  const tempDetails = {
    taskName: taskDetails.Task_name,
    taskDescription: taskDetails.Task_description,
    taskPlan: taskDetails.Task_plan,
    taskNotes: taskDetails.Task_notes,

  };
  async function handleCancel() {
    taskDetails.Task_notes = tempDetails.taskNotes;
    taskDetails.Task_plan = tempDetails.taskPlan;
    currentPlan = tempDetails.taskPlan;
    newNote = "";
    planIsChanged = false;
    showTaskDetailsModal = false;
  }

  let plans = [];
  let currentPlan = taskDetails.Task_plan;
  async function getPlans() {
    try{
      const response = await api.post('/api/plans', {App_Acronym: taskDetails.Task_app_Acronym}, {withCredentials: true})
      return response.data.planNames;
    } catch(error) {
      if(error.status === 401){
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  onMount(async () => {
    updateColor();
    plans = await getPlans();
    currentUsername = await getUsername();
  })
</script>

<Modal bind:showModal={showTaskDetailsModal}> 
  <h1>Edit Task</h1>
  <div class="update-task-modal">
    <div class="task-details">
    <div class="readonly-group">
      <label for="task-id">Task ID:</label>
      <p>{taskDetails.Task_id}</p>
    </div>
      <div class="readonly-group">
        <label for="task-name">Task Name:</label>
        <p>{taskDetails.Task_name}</p>
      </div>
      <div class="readonly-group">
        <label for="task-description">Task Description:</label>
        {#if taskDetails.Task_description === null}
          <p>No Description</p>
          {:else}
          <pre>{taskDetails.Task_description}</pre>
        {/if}
      </div>
      {#if (hasPermits.hasDonePermit && taskDetails.Task_state === "Done") || (hasPermits.hasOpenPermit && taskDetails.Task_state === "Open")}
      <div class="form-group">
        <label for="plan-name">Plan Name:</label>
        <select name="plan-name" bind:value={currentPlan} on:change={planUpdate}>
          <option></option>
          {#each plans as plan}
            <option>{plan}</option>
          {/each}
        </select>
      </div>
      {:else}
      <div class="readonly-group">
        <label for="plan-name">Plan Name:</label>
        {#if taskDetails.Task_plan !== null}
        <p>{taskDetails.Task_plan}</p>
        {:else}
        <p>No Plan</p>
        {/if}
      </div>
      {/if}

    <div class="readonly-group">
      <label for="task-state">Task State:</label>
      <p>{taskDetails.Task_state}</p>
    </div>
    <div class="readonly-group">
      <label for="task-creator">Task Creator:</label>
      <p>{taskDetails.Task_creator}</p>
    </div>
    <div class="readonly-group">
      <label for="task-owner">Task Owner:</label>
      <p>{taskDetails.Task_owner}</p>
    </div>
    <div class="readonly-group">
      <label for="task-create-date">Task Create Date:</label>
      <p>{taskDetails.Task_createDate}</p>
    </div>
  </div>
  <div class="task-notes">
    {#if taskDetails.Task_notes === null || taskDetails.Task_notes === ""}
      <pre class="notes">No Notes Added</pre>
    {:else}
      <pre class="notes">{taskDetails.Task_notes}</pre>
    {/if}
    {#if (taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit) || (taskDetails.Task_state === "Todo" && hasPermits.hasToDoListPermit) || (taskDetails.Task_state === "Doing" && hasPermits.hasDoingPermit) || (taskDetails.Task_state === "Done" && hasPermits.hasDonePermit)}
    <div class="add-notes">
      <textarea class="text-box" bind:value={newNote} placeholder="Comments" />
    </div>
    {/if}

  </div>
</div>
<div class="modal-buttons">
  {#if taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit}
    <button on:click={() => handleUpdateTask("Todo")} class="promote" >Release Task</button>
  {:else if taskDetails.Task_state === "Todo" && hasPermits.hasToDoListPermit}
    <button on:click={() => handleUpdateTask("Doing")} class="promote" >Take On</button>
  {:else if taskDetails.Task_state === "Doing" && hasPermits.hasDoingPermit}
    <button on:click={() => handleUpdateTask("Done") } class="promote" >To Review</button>
    <button on:click={() => handleUpdateTask("Todo")} class="demote">Forfeit Task</button>
  {:else if taskDetails.Task_state === "Done" && hasPermits.hasDonePermit}
    <button on:click={() => handleUpdateTask("Closed")} class="promote" disabled={planIsChanged}>Approve Task</button>
    <button on:click={() => handleUpdateTask("Doing")} class="demote">Reject Task</button>
  {/if}
  {#if (taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit) || (taskDetails.Task_state === "Todo" && hasPermits.hasToDoListPermit) || (taskDetails.Task_state === "Doing" && hasPermits.hasDoingPermit) || (taskDetails.Task_state === "Done" && hasPermits.hasDonePermit)}
  <button on:click={handleSaveTask} disabled={planIsChanged}>Save</button>
  {/if}
  <button on:click={handleCancel}>Cancel</button>

</div>
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="task-card" on:click={toggleTaskDetailsModal} style={`border-color: ${taskColor}`}>
  <div class="task-card-header">
    <div><b>{taskDetails.Task_id}</b></div>
    <div class="task-name">{taskDetails.Task_name}</div>
    <div class="task-owner">{taskDetails.Task_owner}</div>
  </div>
</div>

<style>
  .task-name {
    margin-top: 10px;
  }
  .task-owner {
    border-radius: 5px;
    background-color: #0095ff;
    color: white;
    width: fit-content;
    padding: 5px;
    margin-top: 10px;
  }

  .task-card {
    background-color: white;
    padding: 20px;
    border-left: 4px solid;
    border-radius: 8px;
    margin-top: 10px;
    cursor: pointer;
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

  textarea {
    resize: none;
  }

  .update-task-modal {
    text-align: left;
    display: grid;
    grid-template-columns: 1fr 4fr;
    height: 500px;
  }

  .form-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-group label {
    width: 150px;
    font-weight: bold;
  }

  .form-group select {
    background-color: #ccc;
    width: 200px;
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
  
  .task-notes {
    display: grid;
    grid-template-rows: 3fr 1fr;
    width: 700px;
    height: 95%;
    padding: 15px;
  }

  .notes {
    width: 97%;
    max-height: 320px;
    word-wrap: wrap;
    overflow: auto;
    border: 2px solid black;
    padding: 10px;
    text-align: left;
  }

  .add-notes {
    display: flex;
    width: 100%;
  }
  
  .text-box {
    width: 100%;
    padding: 10px;
  }

  .promote {
    background-color: green;
    color: white;
  }

  .demote {
    background-color: red;
    color: white;
  }

  .task-details {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .readonly-group {
    display: flex;
    margin-top: 10px;
    text-align: left;
  }

  .readonly-group label {
    width: 150px;
    font-weight: bold;
  }

  button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.readonly-group pre {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

</style>