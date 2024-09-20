<script>
  import {api} from '$api';
  import {toast} from 'svelte-sonner';
  import {goto} from '$app/navigation';
  
  let username;
  let password;

  async function handleLogin () {
    try {
      if (!username || !password) return toast.error('Please provide username and password');
      const response = await api.post(
        '/api/login',
        { username, password },
        { withCredentials: true }
      );
      goto('/applications');
    } catch (error) {
      if (error.status === 401) {
        goto('/login');
      }
      toast.error(error.response.data.error);
    }
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>LOGIN</h1>
    <form on:submit|preventDefault={handleLogin}>      
        <input type="text" id="username" bind:value={username} placeholder="Username" />
        <input type="password" id="password" bind:value={password}  placeholder="Password"/>
        <button type="submit">Login</button>
    </form>
  </div>
</div>

<style>

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  h1 {
    font-weight: 1000;
    text-align: center;
  }

  .login-box {
    align-items: center;
    padding: 20px;
    width: 350px;
  }

  input {
    box-sizing: border-box;
    background-color: #eee;
    width: 100%;
    padding: 10px 0px 10px 10px;
    margin-top: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  input:focus {
    border-color: #aaa;
    box-shadow: 0 0 1px rgba(0,0,0,0.3);
  }

  input:hover {
    border-color: #aaa;
  }

  button[type="submit"] {
    margin-top: 15px;
    width: 100%;
    background-color: #000000;
    color: #fff;
    padding: 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
</style>