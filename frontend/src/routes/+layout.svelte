<script>
  import { page } from '$app/stores';
  import '../app.css';
  import {Navbar} from '$components';
</script>

{#if !$page.url.pathname.endsWith('/login')}
  <Navbar/>
{/if}
<slot />