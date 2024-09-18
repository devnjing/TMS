<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {api} from "$api";
	import { toast } from "svelte-sonner";
  import {ApplicationCard} from "$components";
  

  // todo: replace with data from database
  let applications = [
    {
      App_Acronym: 'App1',
      App_Description: 'Application 1 eeeeeeeeeeeeee',
      App_Rnumber: '1000',
      App_startDate: '2022-01-01',
      App_endDate: '2022-12-31',
      App_permit_Create: ["admin", "pl"],
      APp_permit_Open: ["admin", "pl"], 
      App_permit_toDoList: ["admin", "pl"],
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
      APp_permit_Open: ["admin", "pl"], 
      App_permit_toDoList: ["admin", "pl"],
      App_permit_Doing: ["admin", "pl"],
      App_permit_Done: ["admin", "pl"],
    },
  ]
  

  onMount(async () => {
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
</script>

<div class="applications-container">
  {#each applications as app}
  <ApplicationCard bind:appDetails={app} on:click={() => goto(`/applications/${app.App_Acronym}`)}/>
  {/each}
</div>


<style>
  .applications-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
</style>