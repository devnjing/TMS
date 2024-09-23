<script>
  import {page} from "$app/stores";
  import {Modal, TaskCard} from "$components";
  import {onMount} from "svelte";
  import {toast} from "svelte-sonner";
  import {api} from '$api';
  import {goto} from "$app/navigation";
  
  let App_Acronym = $page.params.app;
  let showPlanModal = false;
  let showAddTaskModal = false;
  let tasks = [];
  let appDetails = {};
  let plans = [];
  let currentUser;
  let currentUsername;

  $: currentTaskId = appDetails.App_Acronym + "_" + appDetails.App_Rnumber;


  let newPlan = {
    Plan_MVP_name: "",
    Plan_app_Acronym: App_Acronym,
    Plan_startDate: "",
    Plan_endDate: "",
    Plan_color: "",
  }

  let createDate;
  let newTask = {
      Task_id: "",
      Task_plan: "",
      Task_app_Acronym: "",
      Task_name: "",
      task_description: "",
      Task_notes: "",
      Task_state: "Open",
      Task_creator: "Current User",
      Task_owner: "Current User",
      Task_createDate: "",
    }

  function togglePlanModal() {
    showPlanModal = !showPlanModal;
  }

  function currentDate () {
    const today = new Date();
    const date = today.getDate() + "/" + (today.getMonth()+1).toString().padStart(2, '0') + "/" + today.getFullYear();
    return date;
  }

  async function toggleAddTaskModal() {
    plans = await getPlans();
    appDetails = await getApplication();
    createDate = currentDate();
    currentUser = await getUser();
    currentUsername = currentUser.username;
    showAddTaskModal = !showAddTaskModal;
  }

  async function handleCreatePlan() {
    try {
      const response = await api.post('/api/plan', {plan: newPlan}, { withCredentials: true });
      toast.success(response.data.success);
      newPlan = {
        Plan_MVP_name: "",
        Plan_app_Acronym: App_Acronym,
        Plan_startDate: "",
        Plan_endDate: "",
        Plan_color: "",
      }
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function handleAddTask() {
    newTask.Task_id = currentTaskId;
    newTask.Task_app_Acronym = App_Acronym;
    newTask.Task_state = "Open";
    newTask.Task_creator = currentUsername;
    newTask.Task_owner = currentUsername;
    newTask.Task_createDate = createDate;
    console.log(newTask);
    try {
      const response = await api.post('/api/task', {task: newTask}, { withCredentials: true });
      toast.success(response.data.success);
      newTask = {
        Task_id: "",
        Task_plan: "",
        Task_app_Acronym: "",
        Task_name: "",
        task_description: "",
        Task_notes: "",
        Task_state: "Open",
        Task_creator: "Current User",
        Task_owner: "Current User",
        Task_createDate: "",
      }
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function getApplication() {
    try {
      const response = await api.post('/api/application', {App_Acronym}, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log(error);
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function getPlans() {
    try{
      const response = await api.post('/api/plans', {App_Acronym}, {withCredentials: true})
      console.log(response.data);
      return response.data.planNames;
    } catch(error) {
      if(error.status === 401){
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }

  async function getUser(){
  // get user data
    try {
      const response = await api.get('/api/user', { withCredentials: true });
      return response.data.user;
    } catch (error) {
      toast.error(error.response.data.error);
    }
  }

  async function getTasks() {
    try {
      const response = await api.post('/api/tasks', {App_Acronym}, { withCredentials: true });
      return response.data;
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }


  onMount(async () => {
    // get app details
    appDetails = await getApplication();
    tasks = await getTasks();
  })

</script>

<Modal bind:showModal={showPlanModal}>
  <div class="create-plan-modal">
    <h1>Create Plan</h1>
    <div class="form-group">
      <label for="app-acronym">App Acronym:</label>
      <input type="text" name="app-acronym" placeholder="App Acronym" bind:value={newPlan.Plan_app_Acronym}/>
    </div>
    <div class="form-group">
      <label for="plan-name">Plan MVP Name:</label>
      <input type="text" name="plan-name" placeholder="Plan MVP Name" bind:value={newPlan.Plan_MVP_name}/>
    </div>
    <div class="form-group">
      <label for="start-date">Start Date:</label>
      <input type="date" name="start-date" placeholder="DD/MM/YYYY" bind:value={newPlan.Plan_startDate}/>
    </div>
    <div class="form-group">
      <label for="end-date">End Date:</label>
      <input type="date" name="end-date" placeholder="DD/MM/YYYY" bind:value={newPlan.Plan_endDate}/>
    </div>
    <div class="form-group">
      <label for="color">Color:</label>
      <input type="color" name="color" bind:value={newPlan.Plan_color}/>
    </div>
    <div class="modal-buttons">
      <button on:click={handleCreatePlan}>Create</button>
      <button on:click={togglePlanModal}>Cancel</button>
    </div>
  </div>
</Modal>

<Modal bind:showModal={showAddTaskModal}>
  <h1>Create Task</h1>
  <div class="add-task-modal">
    <div>
    <div class="form-group">
      <label for="task-id">Task ID:</label>
      <input type="text" name="task-id" placeholder="Task ID" bind:value={currentTaskId}/>
    </div>
    <div class="form-group">
      <label for="task-name">Task Name:</label>
      <input type="text" name="task-name" placeholder="Task Name" bind:value={newTask.Task_name}/>
    </div>
    <div class="form-group">
      <label for="task-description">Task Description:</label>
      <textarea name="task-description" bind:value={newTask.task_description}></textarea>
    </div>
    <div class="form-group">
      <label for="plan-name">Plan Name:</label>
      <select name="plan-name" bind:value={newTask.Task_plan}>
        {#each plans as plan}
          <option>{plan}</option>
        {/each}
      </select>
    </div>
    <div class="form-group">
      <label for="task-state">Task State:</label>
      <input type="text" name="task-state" bind:value={newTask.Task_state}/>
    </div>
    <div class="form-group">
      <label for="task-creator">Task Creator:</label>
      <input type="text" name="task-creator" bind:value={currentUsername}/>
    </div>
    <div class="form-group">
      <label for="task-owner">Task Owner:</label>
      <input type="text" name="task-owner" bind:value={currentUsername}/>
    </div>
    <div class="form-group">
      <label for="task-create-date">Task Create Date:</label>
      <input type="text" name="task-create-date" bind:value={createDate}/>
    </div>
  </div>
  <div class="task-notes">
    <div class="notes">{newTask.Task_notes}</div>
    <div class="add-notes">
      <textarea class="text-box"/>
      <button>Add Note</button>
    </div>

  </div>
</div>
<div class="modal-buttons">
  <button on:click={handleAddTask}>Create Task</button>
  <button on:click={toggleAddTaskModal}>Cancel</button>
</div>
</Modal>



<div>
  <div class="top-bar">
    <h1>Task Management Board: {App_Acronym}</h1>
    <button class="add-groups" on:click={togglePlanModal}>+ PLAN</button>
  </div>
  <div class="tasks-container">
    <div class="state-container">
      <div class="state-header">
        <h3>Open</h3>
        <button class="add-task" on:click={toggleAddTaskModal}>+ TASK</button>
      </div>
      {#each tasks as task}
      {#if task.Task_state === "Open"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Todo</h3>
      </div>
      {#each tasks as task}
      {#if task.Task_state === "Todo"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Doing</h3>
      </div>
      {#each tasks as task}
      {#if task.Task_state === "Doing"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Done</h3>
      </div>
      {#each tasks as task}
      {#if task.Task_state === "Done"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Closed</h3>
      </div>
      {#each tasks as task}
      {#if task.Task_state === "Closed"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>

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
    text-align: center;
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

  .tasks-container {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    text-align: left;
  }

  .state-container {
    display: flex;
    flex-direction: column;
    background-color: #eee;
    margin: 10px;
    padding: 10px;
    min-height: 80vh;
  }

  .add-task {
    font-size: x-small;
  }

  .state-header {
    display: flex;
    justify-content: space-between;
    height: 30px;
  }

  .add-task-modal {
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

  .form-group input, select, textarea {
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

  .form-group input[type="color"] {
    padding: 2px;
  }

  textarea {
    resize: none;
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
</style>