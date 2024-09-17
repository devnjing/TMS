<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import {api} from "$api";
	import { toast } from "svelte-sonner";



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
  <h1>Applications</h1>
</div>


<style>
  .applications-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>