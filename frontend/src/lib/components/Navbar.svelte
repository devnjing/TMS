<script>

  export let links = [{
    href: '/users',
    text: 'User Management',
  }];
</script>

<nav>
  <a href="/">Home</a>
  {#each links as link}
    <a href={link.href}>{link.text}</a>
  {/each}
</nav>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #333;
    color: white;
  }

  nav a {
    color: white;
    text-decoration: none;
    margin-right: 1rem;
  }

  nav a:hover {
    color: #ccc;
  }
</style>
