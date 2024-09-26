<script>
  import { onMount } from "svelte";
  import {Modal} from "$components";
  import {api} from "$api";
  import {toast} from "svelte-sonner";

  export let taskDetails = [];
  export let currentUser;
  let newNote;
  let plans = [];
  let planIsChanged = false;
  let newPlan = taskDetails.Task_plan;

  function planUpdate () {
    if (newPlan !== taskDetails.Task_plan)
      planIsChanged = true;
    else {
      planIsChanged = false;
    }
  }

  const tempDetails = {
    taskName: taskDetails.Task_name,
    taskDescription: taskDetails.Task_description,
    taskPlan: taskDetails.Task_plan,
    taskNotes: taskDetails.Task_notes,

  };
  let taskColor = "white";
  let showTaskDetailsModal = false;
  let hasPermits = {
    hasCreatePermit: false,
    hasOpenPermit: false,
    hasToDoListPermit: false,
    hasDoingPermit: false,
    hasDonePermit: false
  }

  async function updateColor(){
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

  async function toggleTaskDetailsModal() {
    showTaskDetailsModal = !showTaskDetailsModal;
    await checkPermits();
  }

  async function handleUpdateTask(newState = taskDetails.Task_state) {
    taskDetails.Task_state = newState;
    if (taskDetails.Task_notes === "" || taskDetails.Task_notes === null) {
      taskDetails.Task_notes = newNote;
    } else if (!(newNote === "" || newNote === null || newNote === undefined)) {
      taskDetails.Task_notes = `${taskDetails.Task_notes}\n\n${newNote}`;
    }
    taskDetails.Task_plan = newPlan;
    console.log("before try");
    try {
      let response;
      if(taskDetails.Task_state === "Done") {
        console.log("done");
        response = await api.post('/api/task/update-with-email', {task: taskDetails}, { withCredentials: true });
      } else {
        console.log("rest");
        response = await api.post('/api/task/update', {task: taskDetails}, { withCredentials: true });
      }
      toast.success(response.data.success);
    } catch(error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function handleSaveTask(){
    if(taskDetails.Task_notes === "" || taskDetails.Task_notes === null){
      taskDetails.Task_notes = newNote;
    } else if (!(newNote === "")) {
      taskDetails.Task_notes = `${taskDetails.Task_notes}\n\n${newNote}`;
    }
    taskDetails.Task_owner = currentUser.username;
    taskDetails.Task_plan = newPlan;
    try{
      const response = await api.post('/api/task/update', {task: taskDetails}, { withCredentials: true });
      toast.success(response.data.success);
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
    newNote = "";
    await toggleTaskDetailsModal();
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

  async function handleCancel() {
    taskDetails.Task_notes = tempDetails.taskNotes;
    taskDetails.Task_name = tempDetails.taskName;
    taskDetails.Task_description = tempDetails.taskDescription;
    taskDetails.Task_plan = tempDetails.taskPlan;
    newPlan = tempDetails.taskPlan;
    await toggleTaskDetailsModal(); 
  }

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
    {#if taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit}
    <div class="form-group">
      <label for="task-name">Task Name:</label>
      <input type="text" name="task-name" placeholder="Task Name" bind:value={taskDetails.Task_name}/>
    </div>
      {:else}
      <div class="readonly-group">
        <label for="task-name">Task Name:</label>
        <p>{taskDetails.Task_name}</p>
      </div>
      {/if}
      {#if taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit}
    <div class="form-group">
      <label for="task-description">Task Description:</label>
      <textarea name="task-description" bind:value={taskDetails.Task_description}></textarea>
    </div>
      {:else}
      <div class="readonly-group">
        <label for="task-description">Task Description:</label>
        {#if taskDetails.Task_description === null}
          <p>No Description</p>
          {:else}
          <pre>{taskDetails.Task_description}</pre>
        {/if}
      </div>
      {/if}
      {#if (taskDetails.Task_state === "Open" || taskDetails.Task_state === "Done") && hasPermits.hasOpenPermit}
      <div class="form-group">
        <label for="plan-name">Plan Name:</label>
        <select name="plan-name" bind:value={newPlan} on:change={planUpdate}>
          {#each plans as plan}
            <option>{plan}</option>
          {/each}
        </select>
      </div>
      {:else}
      <div class="readonly-group">
        <label for="plan-name">Plan Name:</label>
        <p>{taskDetails.Task_plan}</p>
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
    {#if taskDetails.Task_notes === null}
      <pre class="notes">No Notes Added</pre>
    {:else}
      <pre class="notes">{taskDetails.Task_notes}</pre>
    {/if}
    {#if taskDetails.Task_state !== "Closed"}
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
  {#if taskDetails.Task_state !== "Closed"}
    <button on:click={handleSaveTask}>Save</button>
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

  input {
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

  .form-group input, textarea, select {
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
</style>