<script>
  import { onMount } from "svelte";
  import {Modal} from "$components";

  export let taskDetails = [];
  // TODO: get plan color
  let color = "red";
  function updateColor() {
      document.documentElement.style.setProperty('--color', color);
    }

  let showTaskDetailsModal = false;

  function toggleTaskDetailsModal() {
    showTaskDetailsModal = !showTaskDetailsModal;
  }

  onMount(() => {
    updateColor();
  })
</script>

<Modal bind:showModal={showTaskDetailsModal}>
  <div class="task-details-modal">
    <h1>App_Acronym_apprnumber</h1>
  <div class="modal-body">
    <div class="edit-task-form">
        <label for="task-id">Task ID:</label>
        <p>TASKID</p>
        <label for="task-name">Task Name:</label>
        <input type="text" name="task-name" placeholder="Task Name" bind:value={taskDetails.task_name}/>
        <label for="task-description">Task Description:</label>
        <input type="text" name="task-description" placeholder="Task Description" bind:value={taskDetails.task_description}/>
        <label for="task-plan-name">Plan Name:</label>
        <p>{taskDetails.task_plan}</p>
        <label for="task-state">Task State:</label>
        <p>{taskDetails.task_state}</p>
        <label for="task-creator">Task Creator:</label>
        <p>{taskDetails.task_creator}</p>
        <label for="task-owner">Task Owner:</label>
        <p>{taskDetails.task_owner}</p>
        <label for="task-create-date">Task Create Date:</label>
        <p>{taskDetails.task_createDate}</p>
    </div>
    <div class="task-notes">
      <div class="notes">{taskDetails.task_notes}</div>
      <textarea class="add-notes"/>
    </div>
  </div>
  <div class="modal-footer">
    <button>Create Task</button>
    <button on:click={toggleTaskDetailsModal}>Cancel</button>
  </div>
</div>
</Modal>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="task-card" on:click={toggleTaskDetailsModal}>
  <div class="task-card-header">
    <div>appacronym+apprnumber</div>
    <div>{taskDetails.task_name}</div>
    <div>{taskDetails.task_owner}</div>
  </div>
</div>

<style>
  .task-details-modal {
    width: 1000px;
    height: 450px;
    overflow: hidden;
  }

  .task-card {
    background-color: white;
    padding: 20px;
    border-left: 4px solid;
    border-color: var(--color);
    border-radius: 8px;
    margin-top: 10px;
    cursor: pointer;
  }

  .modal-body {
    display: grid;
    grid-template-columns: 1fr 2fr;
  } 

  .edit-task-form {
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 10px;
    width: 100%;
    justify-items: center;
    align-items: center;
    margin: 20px;
  }
  
  .task-notes {
    display: grid;
    grid-template-rows: 3fr 1fr;
    width: 95%;
    height: 95%;
    padding: 15px;
  }

  .notes {
    word-wrap: wrap;
    overflow-y: scroll;
    overflow-x: hidden;
    margin: 20px 0px 10px 10px;
    border: 2px solid black;
    padding: 10px;
  }

  .add-notes {
    margin: 10px 0px 10px 10px;
  }
  .modal-footer {
    display: flex;
    justify-content: center;
    gap: 10px;
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
</style>