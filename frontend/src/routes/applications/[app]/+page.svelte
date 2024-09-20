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

  let newPlan = {
    Plan_MVP_name: "",
    Plan_app_Acronym: App_Acronym,
    Plan_startDate: "",
    Plan_endDate: "",
    Plan_color: "",
  }

  let newTask = [
    {
      Task_id: "",
      Task_plan: "",
      Task_app_Acronym: "",
      Task_name: "",
      task_description: "",
      Task_Notes: "",
      Task_state: "",
      Task_creator: "",
      Task_owner: "",
      Task_createDate: "",
    }
  ]

  async function togglePlanModal() {
    showPlanModal = !showPlanModal;
    plans = await getPlans();
  }

  function toggleAddTaskModal() {
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
      const response = await api.post('/api/plans',{withCredentials: true})
      return response.data;
    } catch(error) {
      if(error.status === 401){
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }


  onMount(async () => {
    // get app details
    appDetails = await getApplication();
    // add plan

  })

</script>

<Modal bind:showModal={showPlanModal}>
  <div class="create-plan-modal">
    <h1>Create Application</h1>
    <div class="create-plan-form">
      <label for="app-name">App Name:</label>
      <input readonly type="text" name="app-name" placeholder="Name" bind:value={newPlan.Plan_app_Acronym}/>
      <label for="plan-name" >Plan Name:</label>
      <input type="text" name="plan-name" placeholder="Text" bind:value={newPlan.Plan_MVP_name}/>
      <label for="start-date">Start Date:</label>
      <input type="date" name="start-date" placeholder="" bind:value={newPlan.Plan_startDate}/>
      <label for="end-date">End Date:</label>
      <input type="date" name="end-date" placeholder="" bind:value={newPlan.Plan_endDate}/>
      <label for="color">Color:</label>
      <select bind:value={newPlan.Plan_color}>
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

<Modal bind:showModal={showAddTaskModal}>
  <div class="task-details-modal">
    <h1>App_Acronym_apprnumber</h1>
  <div class="modal-body">
    <div class="edit-task-form">
        <label for="task-id">Task ID:</label>
        <p>TASKID</p>
        <label for="task-name">Task Name:</label>
        <input type="text" name="task-name" placeholder="Task Name" bind:value={newTask.Task_name}/>
        <label for="task-description">Task Description:</label>
        <input type="text" name="task-description" placeholder="Task Description" bind:value={newTask.Task_description}/>
        <label for="task-plan-name">Plan Name:</label>
        <p>{newTask.Task_plan}</p>
        <label for="task-state">Task State:</label>
        <p>{newTask.Task_state}</p>
        <label for="task-creator">Task Creator:</label>
        <p>{newTask.Task_creator}</p>
        <label for="task-owner">Task Owner:</label>
        <p>{newTask.Task_owner}</p>
        <label for="task-create-date">Task Create Date:</label>
        <p>{newTask.Task_createDate}</p>
    </div>
    <div class="task-notes">
      <div class="notes">{newTask.ask_notes}</div>
      <textarea class="add-notes"/>
    </div>
  </div>
  <div class="modal-footer">
    <button>Create Task</button>
    <button on:click={toggleAddTaskModal}>Cancel</button>
  </div>
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
      {#if task.task_state === "Open"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Todo</h3>
      </div>
      {#each tasks as task}
      {#if task.task_state === "Todo"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Doing</h3>
      </div>
      {#each tasks as task}
      {#if task.task_state === "Doing"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Done</h3>
      </div>
      {#each tasks as task}
      {#if task.task_state === "Done"}
        <TaskCard bind:taskDetails={task}/>
      {/if}
      {/each}
    </div>
    <div class="state-container">
      <div class="state-header">
        <h3>Closed</h3>
      </div>
      {#each tasks as task}
      {#if task.task_state === "Closed"}
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
    text-align: left;
  }

  .state-container {
    display: flex;
    flex-direction: column;
    background-color: #eee;
    margin: 10px;
    padding: 10px;
    min-height: 430px;
  }

  .add-task {
    font-size: x-small;
  }

  .state-header {
    display: flex;
    justify-content: space-between;
    height: 30px;
  }
</style>