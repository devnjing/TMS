<script>
  import { page } from '$app/stores';
  import '../app.css';
  import {Navbar} from '$components';
  import {Toaster} from 'svelte-sonner';
</script>

<Toaster style="z-index: 9999 !important;" position="bottom-right" richColors/>
{#if !$page.url.pathname.endsWith('/login')}
  <Navbar/>
{/if}
<slot />
