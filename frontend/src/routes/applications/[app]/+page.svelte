<script>
  import {page} from "$app/stores";
  import {Modal} from "$components";

  let appName = $page.params.app;
  let showPlanModal = false;

  let newPlan = {
    appName: appName,
    planName: "",
    startDate: "",
    endDate: "",
    color: []
  }

  function togglePlanModal() {
    showPlanModal = !showPlanModal;
  }

  function handleCreatePlan() {
    console.log("create plan: ", newPlan);
  }
</script>

<Modal bind:showModal={showPlanModal}>
  <div class="create-plan-modal">
    <h1>Create Application</h1>
    <div class="create-plan-form">
      <label for="app-name">App Name:</label>
      <input type="text" name="app-name" placeholder="Name" bind:value={newPlan.appName}/>
      <label for="plan-name" >Plan Name:</label>
      <input type="text" name="plan-name" placeholder="Number" bind:value={newPlan.planName}/>
      <label for="start-date">Start Date:</label>
      <input type="date" name="start-date" placeholder="" bind:value={newPlan.startDate}/>
      <label for="end-date">End Date:</label>
      <input type="date" name="end-date" placeholder="" bind:value={newPlan.endDate}/>
      <label for="color">Color:</label>
      <select bind:value={newPlan.color}>
        <option value="red">red</option>
        <option value="green">green</option>
        <option value="blue">blue</option>
      </select>
    </div>
    <div class="create-app-buttons">
      <button on:click={handleCreatePlan}>Create</button>
      <button on:click={togglePlanModal}>Cancel</button>
    </div>
  </div>
</Modal>

<div>
  <div class="top-bar">
    <h1>Task Management Board: {appName}</h1>
    <button class="add-groups" on:click={togglePlanModal}>+ GROUP</button>
  </div>
  <div class="tasks-container">

  </div>
</div>

<style>
  .top-bar {
      display: flex;
      justify-content: space-between;
      margin: 50px 100px 20px 100px;
  }


  .create-plan-modal {
    display: flex;
    flex-direction: column;
    width: 500px;
    height: 350px;
    align-items: center;
    justify-content: center;
  }

  .create-plan-form {
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

  input {
    width: 95%;
    padding: 5px 0px 5px 5px;
    margin: 5px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1)
  }

  select {
    width: 95%;
  }

  input:focus {
    border-color: #aaa;
    box-shadow: 0 0 1px rgba(0,0,0,0.3);
  }

  input:hover {
    border-color: #aaa;
  }

  .tasks-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
</style>