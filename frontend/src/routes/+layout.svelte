<script>
  import { page } from '$app/stores';
  import '../app.css';
  import {Navbar} from '$components';
  import {Toaster} from 'svelte-sonner';

  
</script>

<Toaster position="bottom-right"/>
{#if !$page.url.pathname.endsWith('/login')}
  <Navbar/>
{/if}
<slot />
