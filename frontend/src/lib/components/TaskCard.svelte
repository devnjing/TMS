<script>
  import { onMount } from "svelte";
  import {Modal} from "$components";
  import {api} from "$api";
  import {toast} from "svelte-sonner";

  export let taskDetails = [];
  let newNote;
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
    // TODO update owner
    taskDetails.Task_state = newState;
    try {
      const response = await api.post('/api/task/update', {task: taskDetails}, { withCredentials: true });
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
    } else {
      taskDetails.Task_notes = `${taskDetails.Task_notes}\n\n${newNote}` || newNote;

    }
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
    await toggleTaskDetailsModal(); 
  }

  onMount(() => {
    updateColor();
  })
</script>

<Modal bind:showModal={showTaskDetailsModal}>
  <h1>Edit Task</h1>
  <div class="update-task-modal">
    <div>
    <div class="form-group">
      <label for="task-id">Task ID:</label>
      <input type="text" name="task-id" placeholder="Task ID" bind:value={taskDetails.Task_id}/>
    </div>
    <div class="form-group">
      <label for="task-name">Task Name:</label>
      <input type="text" name="task-name" placeholder="Task Name" bind:value={taskDetails.Task_name}/>
    </div>
    <div class="form-group">
      <label for="task-description">Task Description:</label>
      <textarea name="task-description" bind:value={taskDetails.Task_description}></textarea>
    </div>
    <div class="form-group">
      <label for="plan-name">Plan Name:</label>
      <input type="text" name="plan-name" bind:value={taskDetails.Task_plan}/>
    </div>
    <div class="form-group">
      <label for="task-state">Task State:</label>
      <input type="text" name="task-state" bind:value={taskDetails.Task_state}/>
    </div>
    <div class="form-group">
      <label for="task-creator">Task Creator:</label>
      <input type="text" name="task-creator" bind:value={taskDetails.Task_creator}/>
    </div>
    <div class="form-group">
      <label for="task-owner">Task Owner:</label>
      <input type="text" name="task-owner" bind:value={taskDetails.Task_owner}/>
    </div>
    <div class="form-group">
      <label for="task-create-date">Task Create Date:</label>
      <input type="text" name="task-create-date" bind:value={taskDetails.Task_createDate}/>
    </div>
  </div>
  <div class="task-notes">
    <pre class="notes">{taskDetails.Task_notes}</pre>
    <div class="add-notes">
      <textarea class="text-box" bind:value={newNote} placeholder="Comments"/>
    </div>

  </div>
</div>
<div class="modal-buttons">
  {#if taskDetails.Task_state === "Open" && hasPermits.hasOpenPermit}
    <button on:click={() => handleUpdateTask("Todo")} class="promote">Release Task</button>
  {:else if taskDetails.Task_state === "Todo" && hasPermits.hasToDoListPermit}
    <button on:click={() => handleUpdateTask("Doing")} class="promote">Take On</button>
  {:else if taskDetails.Task_state === "Doing" && hasPermits.hasDoingPermit}
    <button on:click={() => handleUpdateTask("Done")} class="promote">To Review</button>
    <button on:click={() => handleUpdateTask("Todo")} class="demote">Forfeit Task</button>
  {:else if taskDetails.Task_state === "Done" && hasPermits.hasDonePermit}
    <button on:click={() => handleUpdateTask("Closed")} class="promote">Approve Task</button>
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
    <div>{taskDetails.Task_id}</div>
    <div>{taskDetails.Task_name}</div>
    <div>{taskDetails.Task_owner}</div>
  </div>
</div>

<style>

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
    text-align: center;
    display: grid;
    grid-template-columns: 1fr 4fr;
  }

  .form-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-group label {
    width: 100px;
    font-weight: bold;
  }

  .form-group input, textarea {
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

  .add-notes button {
    margin-top: 10px;
    background-color: black;
  }

  .promote {
    background-color: green;
    color: white;
  }

  .demote {
    background-color: red;
    color: white;
  }
</style>